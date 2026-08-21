import { getDb } from '../db/index.js';

export interface VisibleProjectRow {
  id: number;
  owner_id: number | null;
}

/**
 * Single source of truth for the visibility rule:
 * a project is visible to a user if it is public, or they own it.
 */
export function getVisibleProjectId(projectId: number, userId: number): VisibleProjectRow | undefined {
  return getDb()
    .prepare("SELECT id, owner_id FROM projects WHERE id = ? AND (visibility = 'public' OR owner_id = ?)")
    .get(projectId, userId) as VisibleProjectRow | undefined;
}
