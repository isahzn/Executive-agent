# Doc Processor

Upload documents (PDF, images, DOCX, TXT) → extract structured data with AI
(OpenRouter) → review in a results table → export to a formatted Excel workbook.

**Stack:** React 19 + Vite · Express · SQLite (better-sqlite3) · OpenRouter · ExcelJS

## Quick start (development)

```sh
npm install
cp .env.example .env      # add your OPENROUTER_API_KEY + a JWT_SECRET
npm run dev               # frontend on :3000, backend on :5000
```

Open http://localhost:3000 and sign in with **demo / demo1234** (demo accounts
are seeded on first run). Use the gear icon in the topbar to paste your
OpenRouter key — in-app settings win over `.env`.

## What's inside

| Area | Details |
|---|---|
| **Projects** | Public/private visibility, CRUD, clone, pre-seeded Invoice/Receipt/Contract templates with realistic sample data |
| **Uploads** | Drag & drop, per-file progress, PDF/PNG/JPG/WEBP/DOCX/TXT, 25MB × 25 files |
| **Extraction** | Background AI extraction with live status, retry, model picker, test-connection |
| **Export** | Styled .xlsx (bold headers, auto-width, 3 sheets) with a preview modal |
| **UX** | Dark mode, analytics dashboard, one-click demo data, keyboard-accessible, responsive |

## Building for production

```sh
npm ci
npm run build          # backend → backend/dist, frontend → frontend/dist
node backend/dist/index.js   # serves API + frontend on :5000
```

## Deploying

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Docker Compose (one
container + data volume) and bare-metal (systemd + nginx) instructions, env
var reference, backups, and a production checklist.
