import type Database from 'better-sqlite3';

interface Migration {
  id: number;
  name: string;
  up: string;
}

// Append-only. Never edit an applied migration — add a new one instead.
const migrations: Migration[] = [
  {
    id: 1,
    name: 'create_users',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
  {
    id: 2,
    name: 'create_projects',
    up: `
      CREATE TABLE IF NOT EXISTS projects (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        name             TEXT NOT NULL,
        description      TEXT NOT NULL DEFAULT '',
        extraction_fields TEXT NOT NULL DEFAULT '[]',
        visibility       TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
        owner_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
        template_type    TEXT,
        created_at       TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_projects_visibility ON projects(visibility);
      CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
    `,
  },
  {
    id: 3,
    name: 'create_documents',
    up: `
      CREATE TABLE IF NOT EXISTS documents (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        filename    TEXT NOT NULL,
        original_path TEXT NOT NULL,
        mime_type   TEXT,
        size_bytes  INTEGER,
        uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'error')),
        created_at  TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
    `,
  },
  {
    id: 4,
    name: 'create_extraction_results',
    up: `
      CREATE TABLE IF NOT EXISTS extraction_results (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id   INTEGER NOT NULL UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
        extracted_data TEXT NOT NULL DEFAULT '{}',
        status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error')),
        model         TEXT,
        error         TEXT,
        processed_at  TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_extraction_results_document ON extraction_results(document_id);
    `,
  },
  {
    id: 5,
    name: 'create_settings',
    up: `
      CREATE TABLE IF NOT EXISTS settings (
        key        TEXT PRIMARY KEY,
        value      TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
  {
    id: 6,
    name: 'add_started_at_to_extraction_results',
    up: `
      ALTER TABLE extraction_results ADD COLUMN started_at TEXT;
    `,
  },
];

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         INTEGER PRIMARY KEY,
      name       TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    (db.prepare('SELECT id FROM schema_migrations').all() as { id: number }[]).map((r) => r.id),
  );

  const apply = db.transaction((m: Migration) => {
    db.exec(m.up);
    db.prepare('INSERT INTO schema_migrations (id, name) VALUES (?, ?)').run(m.id, m.name);
  });

  for (const migration of migrations) {
    if (!applied.has(migration.id)) {
      apply(migration);
      console.log(`[db] applied migration ${migration.id}: ${migration.name}`);
    }
  }
}
