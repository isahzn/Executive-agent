import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { dataDir, getDb } from './index.js';

export const DEMO_ACCOUNTS = ['demo', 'alice', 'bob', 'carol', 'dave'];
export const DEMO_PASSWORD = 'demo1234';

/** Creates demo accounts only when the users table is empty. */
export function seedDemoUsers(): void {
  const db = getDb();
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number };
  if (c > 0) return;

  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const insert = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  for (const username of DEMO_ACCOUNTS) {
    insert.run(username, hash);
  }
  console.log(`[seed] created ${DEMO_ACCOUNTS.length} demo accounts (password: ${DEMO_PASSWORD})`);
}

interface TemplateProject {
  name: string;
  description: string;
  fields: string[];
  templateType: string;
}

const TEMPLATE_PROJECTS: TemplateProject[] = [
  {
    name: 'Invoice Extraction',
    description: 'Extract key details from supplier invoices: invoice number, vendor, totals, and due dates.',
    fields: ['Invoice number', 'Vendor name', 'Total amount', 'Due date', 'Currency'],
    templateType: 'invoice',
  },
  {
    name: 'Receipt Processing',
    description: 'Capture the date, merchant, total, and category from purchase receipts for expense tracking.',
    fields: ['Date', 'Merchant', 'Total', 'Category', 'Payment method'],
    templateType: 'receipt',
  },
  {
    name: 'Contract Analysis',
    description: 'Pull the parties, effective date, term length, and renewal terms from contracts and agreements.',
    fields: ['Parties involved', 'Effective date', 'Term length', 'Renewal terms', 'Governing law'],
    templateType: 'contract',
  },
];

/** Seeds the three demo template projects once, tracked via a settings flag so
 * that deleting every project does not resurrect them on restart. */
export function seedTemplateProjects(): void {
  const db = getDb();
  const flag = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get('templates_seeded') as { value: string } | undefined;
  if (flag) return;

  const { c } = db.prepare('SELECT COUNT(*) AS c FROM projects').get() as { c: number };
  if (c > 0) {
    // Projects already exist (e.g. upgraded install) — just record the flag.
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('templates_seeded', '1');
    return;
  }

  const owner =
    (db.prepare('SELECT id FROM users WHERE username = ?').get('demo') as { id: number } | undefined) ??
    (db.prepare('SELECT id FROM users ORDER BY id LIMIT 1').get() as { id: number } | undefined);
  if (!owner) return;

  const insert = db.prepare(
    'INSERT INTO projects (name, description, extraction_fields, visibility, owner_id, template_type) VALUES (?, ?, ?, ?, ?, ?)',
  );
  for (const t of TEMPLATE_PROJECTS) {
    insert.run(t.name, t.description, JSON.stringify(t.fields), 'public', owner.id, t.templateType);
  }
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('templates_seeded', '1');
  console.log(`[seed] created ${TEMPLATE_PROJECTS.length} template projects`);
}

interface SampleDoc {
  filename: string;
  data: Record<string, string>;
}

// Realistic-looking sample documents + extraction results so the demo tables
// are populated before any real extraction runs.
const SAMPLE_DOCS: Record<string, SampleDoc[]> = {
  invoice: [
    {
      filename: 'acme-invoice-2024-0382.pdf',
      data: {
        'Invoice number': 'INV-2024-0382',
        'Vendor name': 'Acme Supplies Co.',
        'Total amount': '1,245.80',
        'Due date': '2024-11-15',
        Currency: 'USD',
      },
    },
    {
      filename: 'northwind-invoice-0091.pdf',
      data: {
        'Invoice number': 'INV-2024-0091',
        'Vendor name': 'Northwind Traders',
        'Total amount': '6,540.00',
        'Due date': '2024-12-02',
        Currency: 'USD',
      },
    },
  ],
  receipt: [
    {
      filename: 'whole-foods-receipt-2024-06-12.jpg',
      data: {
        Date: '2024-06-12',
        Merchant: 'Whole Foods Market',
        Total: '86.42',
        Category: 'Groceries',
        'Payment method': 'Credit card',
      },
    },
    {
      filename: 'starbucks-receipt-2024-06-15.jpg',
      data: {
        Date: '2024-06-15',
        Merchant: 'Starbucks',
        Total: '12.35',
        Category: 'Food & drink',
        'Payment method': 'Credit card',
      },
    },
  ],
  contract: [
    {
      filename: 'merger-agreement-2024.pdf',
      data: {
        'Parties involved': 'Acme Corp & Globex Inc.',
        'Effective date': '2024-07-01',
        'Term length': '3 years',
        'Renewal terms': 'Automatic renewal, 90-day notice',
        'Governing law': 'Delaware law',
      },
    },
    {
      filename: 'vendor-msa-2024.pdf',
      data: {
        'Parties involved': 'Acme Corp & Northwind Traders',
        'Effective date': '2024-04-15',
        'Term length': '12 months',
        'Renewal terms': 'Manual renewal',
        'Governing law': 'New York law',
      },
    },
  ],
};

/**
 * Seeds 2 sample documents with filled-in results into every template project
 * owned by the seed user that currently has zero documents. Idempotent — safe
 * to call any number of times, and used both at startup (flag-gated) and by
 * the demo-data button.
 *
 * Scoped to the seed user's own projects so that one user clicking "Load
 * sample data" never injects documents into another user's private clones
 * (clones inherit template_type but are owned by the cloner).
 * Returns the number of documents created.
 */
export function seedSampleDocumentsIfMissing(): number {
  const db = getDb();
  const demo =
    (db.prepare('SELECT id FROM users WHERE username = ?').get('demo') as { id: number } | undefined) ??
    (db.prepare('SELECT id FROM users ORDER BY id LIMIT 1').get() as { id: number } | undefined);
  if (!demo) return 0;

  const projects = db.prepare(
    'SELECT p.id, p.template_type FROM projects p WHERE p.template_type IS NOT NULL AND p.owner_id = ?',
  ).all(demo.id) as { id: number; template_type: string | null }[];
  const hasDocs = db.prepare('SELECT COUNT(*) AS c FROM documents WHERE project_id = ?');

  const insertDoc = db.prepare(
    'INSERT INTO documents (project_id, filename, original_path, mime_type, size_bytes, uploaded_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const insertResult = db.prepare(
    "INSERT INTO extraction_results (document_id, status, extracted_data, model, error, started_at, processed_at) VALUES (?, 'success', ?, 'sample-data', NULL, ?, ?)",
  );

  const uploadsRoot = path.resolve(dataDir, 'uploads');
  let count = 0;
  for (const project of projects) {
    const samples = project.template_type ? SAMPLE_DOCS[project.template_type] : undefined;
    if (!samples) continue;
    if ((hasDocs.get(project.id) as { c: number }).c > 0) continue; // never duplicate

    const dir = path.join(uploadsRoot, String(project.id));
    fs.mkdirSync(dir, { recursive: true });
    for (const s of samples) {
      const filePath = path.join(dir, `sample-${s.filename}`);
      fs.writeFileSync(filePath, `Sample document content for ${s.filename}\n`);
      const info = insertDoc.run(
        project.id,
        s.filename,
        filePath,
        'application/pdf',
        fs.statSync(filePath).size,
        demo.id,
        'success',
      );
      const now = new Date().toISOString();
      insertResult.run(Number(info.lastInsertRowid), JSON.stringify(s.data), now, now);
      count++;
    }
  }
  return count;
}

/** Seeds sample data once, tracked via a settings flag. The flag is written
 * only after a successful seed, so a failed attempt retries on the next boot. */
export function seedSampleData(): void {
  const db = getDb();
  const flag = db.prepare('SELECT value FROM settings WHERE key = ?').get('sample_data_seeded') as
    | { value: string }
    | undefined;
  if (flag) return;
  const count = seedSampleDocumentsIfMissing();
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('sample_data_seeded', '1');
  if (count > 0) console.log(`[seed] created ${count} sample documents with extraction results`);
}
