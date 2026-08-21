import { Router, type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { dataDir, getDb } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { getVisibleProjectId, type VisibleProjectRow } from '../services/projects.js';
import { runExtraction } from '../services/extraction.js';
import {
  buildProjectWorkbook,
  exportFilename,
  parseResultData,
  type ExportDocument,
  type ExportProject,
} from '../services/export.js';

const router = Router();

router.use(requireAuth);

const UPLOAD_LIMIT_MB = 25;
const MAX_FILES = 25;
const ALLOWED_EXT = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.docx', '.txt']);
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type DocumentStatus = 'pending' | 'processing' | 'success' | 'error';

interface DocumentRow {
  id: number;
  project_id: number;
  filename: string;
  original_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_by: number | null;
  uploaded_by_username: string | null;
  status: DocumentStatus;
  created_at: string;
  result_status: DocumentStatus | null;
  result_data: string | null;
  result_model: string | null;
  result_error: string | null;
  result_started_at: string | null;
  result_processed_at: string | null;
}

function uploadsDir(projectId: number): string {
  return path.join(dataDir, 'uploads', String(projectId));
}

function sanitizeName(name: string): string {
  return (name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file');
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = uploadsDir(Number(req.params.projectId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sanitizeName(base)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: UPLOAD_LIMIT_MB * 1024 * 1024, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // The extension is the real gate — mimetype is client-supplied, so also accept
    // octet-stream (some clients send it for perfectly valid PDFs/DOCX).
    const mimeOk = ALLOWED_MIME.has(file.mimetype) || file.mimetype === 'application/octet-stream';
    if (!ALLOWED_EXT.has(ext) || !mimeOk) {
      cb(new HttpError(400, `Unsupported file type: ${ext || file.mimetype}. Use PDF, PNG, JPG, WEBP, DOCX, or TXT.`));
      return;
    }
    cb(null, true);
  },
});

const DOCUMENT_SELECT = `
  SELECT d.*, u.username AS uploaded_by_username,
    r.status AS result_status, r.extracted_data AS result_data, r.model AS result_model,
    r.error AS result_error, r.started_at AS result_started_at, r.processed_at AS result_processed_at
  FROM documents d
  LEFT JOIN users u ON u.id = d.uploaded_by
  LEFT JOIN extraction_results r ON r.document_id = d.id
`;

function getDocument(id: number): DocumentRow | undefined {
  return getDb().prepare(`${DOCUMENT_SELECT} WHERE d.id = ?`).get(id) as DocumentRow | undefined;
}

function serializeDocument(row: DocumentRow) {
  return {
    id: row.id,
    projectId: row.project_id,
    filename: row.filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    status: row.status,
    uploadedBy: row.uploaded_by,
    uploadedByUsername: row.uploaded_by_username,
    createdAt: row.created_at,
    result: row.result_status
      ? {
          status: row.result_status,
          extractedData: parseResultData(row.result_data),
          model: row.result_model,
          error: row.result_error,
          startedAt: row.result_started_at,
          processedAt: row.result_processed_at,
        }
      : null,
  };
}

/** Resolves the project for :projectId routes and enforces visibility. */
function loadVisibleProject(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.projectId);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  const project = getVisibleProjectId(id, req.user!.id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.locals.project = project;
  next();
}

// Upload one or more documents to a project
router.post('/projects/:projectId/documents', loadVisibleProject, (req, res) => {
  upload.array('files', MAX_FILES)(req, res, (err: unknown) => {
    if (err) {
      // Remove any files already written to disk by a partially-failed batch
      const written = (req.files as Express.Multer.File[] | undefined) ?? [];
      for (const f of written) fs.rmSync(f.path, { force: true });

      if (err instanceof multer.MulterError) {
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? `File too large (max ${UPLOAD_LIMIT_MB} MB)`
            : err.code === 'LIMIT_FILE_COUNT'
              ? `Too many files at once (max ${MAX_FILES})`
              : `Upload failed: ${err.message}`;
        res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: message });
        return;
      }
      res.status(err instanceof HttpError ? err.status : 400).json({
        error: err instanceof Error ? err.message : 'Upload failed',
      });
      return;
    }

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
      res.status(400).json({ error: 'No files selected' });
      return;
    }

    const projectId = (res.locals.project as VisibleProjectRow).id;
    const db = getDb();
    const insert = db.prepare(
      'INSERT INTO documents (project_id, filename, original_path, mime_type, size_bytes, uploaded_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    const created: DocumentRow[] = [];
    try {
      for (const f of files) {
        const info = insert.run(projectId, f.originalname, f.path, f.mimetype, f.size, req.user!.id, 'pending');
        created.push(getDocument(Number(info.lastInsertRowid))!);
      }
    } catch (err) {
      // Keep the disk in sync: remove files we could not record.
      for (const f of files) fs.rmSync(f.path, { force: true });
      throw err;
    }
    res.status(201).json({ documents: created.map(serializeDocument) });
  });
});

// List documents in a project
router.get('/projects/:projectId/documents', loadVisibleProject, (_req, res) => {
  const projectId = (res.locals.project as VisibleProjectRow).id;
  const rows = getDb()
    .prepare(`${DOCUMENT_SELECT} WHERE d.project_id = ? ORDER BY d.created_at DESC, d.id DESC`)
    .all(projectId) as DocumentRow[];
  res.json({ documents: rows.map(serializeDocument) });
});

// Trigger (re-)extraction for a single document. Runs in the background;
// clients poll the document list for status changes.
router.post('/documents/:id/extract', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  const doc = getDocument(id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  if (!getVisibleProjectId(doc.project_id, req.user!.id)) {
    res.status(403).json({ error: 'You do not have access to this project' });
    return;
  }

  void runExtraction(id);
  res.status(202).json({ ok: true });
});

// Trigger extraction for every pending/failed document in a project.
router.post('/projects/:projectId/extract-all', loadVisibleProject, (_req, res) => {
  const projectId = (res.locals.project as VisibleProjectRow).id;
  const docs = getDb()
    .prepare("SELECT id FROM documents WHERE project_id = ? AND status IN ('pending', 'error')")
    .all(projectId) as { id: number }[];
  for (const d of docs) void runExtraction(d.id);
  res.status(202).json({ ok: true, queued: docs.length });
});

// Export the project's extracted data as a formatted .xlsx workbook
router.get('/projects/:projectId/export', loadVisibleProject, async (_req, res, next) => {
  try {
    const projectId = (res.locals.project as VisibleProjectRow).id;
    const db = getDb();

    const project = db
      .prepare(
        `SELECT p.id, p.name, p.description, p.extraction_fields, p.visibility, u.username AS owner_username,
                p.created_at, p.updated_at,
                (SELECT COUNT(*) FROM documents d WHERE d.project_id = p.id) AS document_count
         FROM projects p
         LEFT JOIN users u ON u.id = p.owner_id
         WHERE p.id = ?`,
      )
      .get(projectId) as
      | {
          id: number;
          name: string;
          description: string;
          extraction_fields: string;
          visibility: 'public' | 'private';
          owner_username: string | null;
          created_at: string;
          updated_at: string;
          document_count: number;
        }
      | undefined;
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    let fields: string[] = [];
    try {
      const parsed = JSON.parse(project.extraction_fields) as unknown;
      fields = Array.isArray(parsed) ? parsed.filter((f): f is string => typeof f === 'string') : [];
    } catch {
      // malformed fields — export with no field columns
    }

    const raw = db
      .prepare(
        `SELECT d.filename, d.status, u.username AS uploaded_by_username, d.created_at,
                r.status AS result_status, r.extracted_data AS result_data,
                r.model AS result_model, r.error AS result_error
         FROM documents d
         LEFT JOIN users u ON u.id = d.uploaded_by
         LEFT JOIN extraction_results r ON r.document_id = d.id
         WHERE d.project_id = ?
         ORDER BY d.created_at DESC, d.id DESC`,
      )
      .all(projectId) as {
      filename: string;
      status: string;
      uploaded_by_username: string | null;
      created_at: string;
      result_status: string | null;
      result_data: string | null;
      result_model: string | null;
      result_error: string | null;
    }[];
    const rows: ExportDocument[] = raw.map((r) => ({
      filename: r.filename,
      status: r.status,
      uploadedByUsername: r.uploaded_by_username,
      createdAt: r.created_at,
      resultStatus: r.result_status,
      resultData: r.result_data,
      resultModel: r.result_model,
      resultError: r.result_error,
    }));

    const exportProject: ExportProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      extractionFields: fields,
      visibility: project.visibility,
      ownerUsername: project.owner_username,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      documentCount: Number(project.document_count ?? 0),
    };

    const workbook = buildProjectWorkbook(exportProject, rows);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${exportFilename(project.name)}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    // If the response already started streaming, we can't send a JSON error
    // anymore — just tear the connection down so Express isn't left with an
    // unhandled "headers already sent" failure.
    if (res.headersSent) {
      res.destroy();
      return;
    }
    next(err);
  }
});

// Delete a document (uploader or project owner)
router.delete('/documents/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  const doc = getDocument(id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const project = getDb().prepare('SELECT owner_id FROM projects WHERE id = ?').get(doc.project_id) as
    | { owner_id: number | null }
    | undefined;
  const isOwner = project?.owner_id === req.user!.id;
  const isUploader = doc.uploaded_by === req.user!.id;
  if (!isOwner && !isUploader) {
    res.status(403).json({ error: 'You can only delete documents you uploaded (or own the project)' });
    return;
  }

  fs.rmSync(doc.original_path, { force: true });
  getDb().prepare('DELETE FROM documents WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
