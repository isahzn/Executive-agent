import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runMigrations } from './migrations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Root folder for the SQLite DB and uploaded files (override with DATA_DIR). */
export const dataDir = process.env.DATA_DIR ?? path.resolve(__dirname, '../../data');

let db: Database.Database | null = null;

/** Opens (once) the SQLite database at ./data/app.db and applies migrations. */
export function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    db = new Database(path.join(dataDir, 'app.db'));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
