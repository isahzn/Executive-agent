import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { dataDir, getDb } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Every project route requires an authenticated user
router.use(requireAuth);

export type Visibility = 'public' | 'private';

interface ProjectRow {
  id: number;
  name: string;
  description: string;
  extraction_fields: string;
  visibility: Visibility;
  owner_id: number | null;
  owner_username: string | null;
  template_type: string | null;
  created_at: string;
  updated_at: string;
  document_count: number;
}

const PROJECT_SELECT = `
  SELECT p.*, u.username AS owner_username,
    (SELECT COUNT(*) FROM documents d WHERE d.project_id = p.id) AS document_count
  FROM projects p
  LEFT JOIN users u ON u.id = p.owner_id
`;

function parseFields(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((f): f is string => typeof f === 'string') : [];
  } catch {
    return [];
  }
}

function serializeProject(row: ProjectRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    extractionFields: parseFields(row.extraction_fields),
    visibility: row.visibility,
    ownerId: row.owner_id,
    ownerUsername: row.owner_username,
    templateType: row.template_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    documentCount: Number(row.document_count ?? 0),
  };
}

function projectId(params: { id?: string }): number | null {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Fetch a project the user is allowed to see (public, or owned by them). */
function getVisibleProject(id: number, userId: number): ProjectRow | undefined {
  return getDb()
    .prepare(`${PROJECT_SELECT} WHERE p.id = ? AND (p.visibility = 'public' OR p.owner_id = ?)`)
    .get(id, userId) as ProjectRow | undefined;
}

function parseProjectInput(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const extractionFields = Array.isArray(body.extractionFields)
    ? (body.extractionFields as unknown[])
        .filter((f): f is string => typeof f === 'string' && f.trim().length > 0)
        .map((f) => f.trim())
    : [];
  const visibility: Visibility = body.visibility === 'private' ? 'private' : 'public';
  const templateType =
    typeof body.templateType === 'string' && body.templateType ? (body.templateType as string) : null;
  return { name, description, extractionFields, visibility, templateType };
}

// List every project the user can see (public + their own private)
router.get('/', (req, res) => {
  const rows = getDb()
    .prepare(
      `${PROJECT_SELECT} WHERE p.visibility = 'public' OR p.owner_id = ? ORDER BY p.updated_at DESC, p.id DESC`,
    )
    .all(req.user!.id) as ProjectRow[];
  res.json({ projects: rows.map(serializeProject) });
});

// Create a project
router.post('/', (req, res) => {
  const { name, description, extractionFields, visibility, templateType } = parseProjectInput(
    (req.body ?? {}) as Record<string, unknown>,
  );
  if (!name) {
    res.status(400).json({ error: 'Project name is required' });
    return;
  }

  const info = getDb()
    .prepare(
      'INSERT INTO projects (name, description, extraction_fields, visibility, owner_id, template_type) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(name, description, JSON.stringify(extractionFields), visibility, req.user!.id, templateType);

  const project = getVisibleProject(Number(info.lastInsertRowid), req.user!.id);
  res.status(201).json({ project: project ? serializeProject(project) : null });
});

// Get a single project
router.get('/:id', (req, res) => {
  const id = projectId(req.params);
  const project = id ? getVisibleProject(id, req.user!.id) : undefined;
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json({ project: serializeProject(project) });
});

// Update a project (owner only)
router.put('/:id', (req, res) => {
  const id = projectId(req.params);
  const existing = id ? getVisibleProject(id, req.user!.id) : undefined;
  if (!existing) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  if (existing.owner_id !== req.user!.id) {
    res.status(403).json({ error: 'Only the project owner can edit this project' });
    return;
  }

  const { name, description, extractionFields, visibility } = parseProjectInput(
    (req.body ?? {}) as Record<string, unknown>,
  );
  if (!name) {
    res.status(400).json({ error: 'Project name is required' });
    return;
  }

  getDb()
    .prepare(
      "UPDATE projects SET name = ?, description = ?, extraction_fields = ?, visibility = ?, updated_at = datetime('now') WHERE id = ?",
    )
    .run(name, description, JSON.stringify(extractionFields), visibility, existing.id);

  const updated = getVisibleProject(existing.id, req.user!.id)!;
  res.json({ project: serializeProject(updated) });
});

// Delete a project (owner only). Documents/results cascade via foreign keys.
router.delete('/:id', (req, res) => {
  const id = projectId(req.params);
  const existing = id ? getVisibleProject(id, req.user!.id) : undefined;
  if (!existing) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  if (existing.owner_id !== req.user!.id) {
    res.status(403).json({ error: 'Only the project owner can delete this project' });
    return;
  }

  // Delete the row first, then the uploads dir: if the DELETE ever failed,
  // the worst case is a benign leftover folder (force: true tolerates it)
  // rather than live document rows pointing at deleted files.
  getDb().prepare('DELETE FROM projects WHERE id = ?').run(existing.id);
  fs.rmSync(path.join(dataDir, 'uploads', String(existing.id)), { recursive: true, force: true });
  res.json({ ok: true });
});

// Clone a visible project into the caller's private workspace
router.post('/:id/clone', (req, res) => {
  const id = projectId(req.params);
  const source = id ? getVisibleProject(id, req.user!.id) : undefined;
  if (!source) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  const info = getDb()
    .prepare(
      'INSERT INTO projects (name, description, extraction_fields, visibility, owner_id, template_type) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(
      `${source.name} (copy)`,
      source.description,
      source.extraction_fields,
      'private',
      req.user!.id,
      source.template_type,
    );

  const created = getVisibleProject(Number(info.lastInsertRowid), req.user!.id)!;
  res.status(201).json({ project: serializeProject(created) });
});

export default router;
