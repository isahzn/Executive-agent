import { getDb } from '../db/index.js';
import { extractWithOpenRouter, getApiKey, getModel, isoNow } from './openrouter.js';

interface DocRow {
  id: number;
  project_id: number;
  original_path: string;
  filename: string;
  mime_type: string | null;
  status: string;
  extraction_fields: string;
}

function parseFields(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((f): f is string => typeof f === 'string') : [];
  } catch {
    return [];
  }
}

function fail(documentId: number, message: string): void {
  const db = getDb();
  db.prepare("UPDATE documents SET status = 'error' WHERE id = ?").run(documentId);
  db.prepare(
    "UPDATE extraction_results SET status = 'error', error = ?, processed_at = ? WHERE document_id = ?",
  ).run(message, isoNow(), documentId);
}

/** Recover documents left in 'processing' by a crash or restart. Runs at startup. */
export function resetStuckDocuments(): void {
  const db = getDb();
  const { changes } = db
    .prepare("UPDATE documents SET status = 'pending' WHERE status = 'processing'")
    .run();
  if (changes > 0) console.log(`[db] reset ${changes} stuck document(s) to pending`);
}

/** Extracts data from one document and persists the result. Safe to run in the background. */
export async function runExtraction(documentId: number): Promise<void> {
  const db = getDb();
  const doc = db
    .prepare(
      `SELECT d.id, d.project_id, d.original_path, d.filename, d.mime_type, d.status, p.extraction_fields
       FROM documents d
       JOIN projects p ON p.id = d.project_id
       WHERE d.id = ?`,
    )
    .get(documentId) as DocRow | undefined;
  if (!doc) return;

  // Never extract the same document twice at once.
  if (doc.status === 'processing') return;

  const fields = parseFields(doc.extraction_fields);

  // Mark as processing (the documents table allows 'processing';
  // extraction_results.status only carries final states, so it stays 'pending').
  db.prepare("UPDATE documents SET status = 'processing' WHERE id = ?").run(documentId);
  db.prepare(
    "INSERT OR IGNORE INTO extraction_results (document_id, status, extracted_data, started_at) VALUES (?, 'pending', '{}', ?)",
  ).run(documentId, isoNow());
  // (Re-)set started_at and clear any stale result so API consumers never see
  // a previous run's error while this attempt is still in flight.
  db.prepare(
    "UPDATE extraction_results SET status = 'pending', error = NULL, started_at = ? WHERE document_id = ?",
  ).run(isoNow(), documentId);

  const apiKey = getApiKey();
  if (!apiKey) {
    fail(documentId, 'OpenRouter API key not configured. Add one in Settings.');
    return;
  }

  const model = getModel();
  try {
    const data = await extractWithOpenRouter({
      filePath: doc.original_path,
      filename: doc.filename,
      mimeType: doc.mime_type,
      fields,
      apiKey,
      model,
    });
    db.prepare("UPDATE documents SET status = 'success' WHERE id = ?").run(documentId);
    db.prepare(
      "UPDATE extraction_results SET status = 'success', extracted_data = ?, model = ?, error = NULL, processed_at = ? WHERE document_id = ?",
    ).run(JSON.stringify(data), model, isoNow(), documentId);
  } catch (err) {
    fail(documentId, err instanceof Error ? err.message : 'Extraction failed. Try again?');
  }
}
