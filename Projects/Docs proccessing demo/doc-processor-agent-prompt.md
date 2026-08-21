# Document Processing Web App - Build Prompt

## How to Use This Prompt with Claude Code

### Setup
1. **Open Claude Code** (Claude Code Desktop app or via `claude code` command in terminal)
2. **Create a new project folder**:
   ```bash
   mkdir doc-processor
   cd doc-processor
   ```
3. **Copy this entire prompt** and paste it into Claude Code's chat
4. Claude will:
   - Ask clarifying questions if needed
   - Generate the full project structure
   - Create all necessary files (React components, Express routes, database schema, Docker configs, etc.)
   - Run `npm install` and set up dependencies automatically
   - Provide step-by-step instructions to run it locally

### Workflow
- Claude Code will build files incrementally — you'll see a file tree in the sidebar
- Click any file to view/edit it
- Use the integrated terminal to run `npm run dev` once setup is complete
- Test locally on `http://localhost:3000` before deploying

### VPS Deployment
Once local testing passes:
1. Claude will generate deployment instructions
2. Follow the Dockerfile + docker-compose setup
3. Copy files to your VPS
4. Run `docker-compose up` and configure Nginx
5. Your app runs on your domain

### Key Commands (Claude will provide these)
```bash
npm run dev          # Local development (frontend + backend)
npm run build        # Production build
npm run test         # Run tests
docker-compose up    # Deploy on VPS
```

---

## The Prompt

You are an expert full-stack developer. Build a complete, production-ready web application for document processing and data extraction. This is a demo for a client but should be polished and deployable.

## Core Requirements

### 1. Architecture & Tech Stack
- **Frontend**: React with TypeScript
- **Backend**: Node.js + Express
- **Database**: SQLite (local) or PostgreSQL (production)
- **File Storage**: Local filesystem
- **AI Processing**: OpenRouter API (user provides their API key)
- **Export**: Excel (.xlsx) files via SheetJS
- **Deployment**: Docker + systemd service for VPS, localhost dev server included

### 2. Multi-Tenant User System

**Accounts & Organization**
- Support up to 20 company employees (accounts)
- Each employee has:
  - Username + secure password (bcrypt hashing)
  - Personal workspace
  - Access to all projects (shared company-wide, or isolated per user — your choice, but note in implementation)
  - Login/logout system with JWT or session tokens
  - Persistent authentication across sessions

**Database Schema** (at minimum):
- `users` table: id, username, password_hash, created_at
- `projects` table: id, user_id, name, description, extraction_fields, created_at
- `documents` table: id, project_id, filename, original_path, upload_at
- `extraction_results` table: id, document_id, extracted_data (JSON), status, processed_at

### 3. Project & Extraction Management

**Projects**
- User creates a project with:
  - Project name
  - Description of what data to extract
  - Custom extraction fields (user types free-form description, e.g., "invoice number, total amount, vendor name, due date")
  - One prompt per project (stored, reusable across all documents in that project)
- Projects persist in the database
- List all projects on dashboard
- Edit/delete projects

**Extraction Workflow**
1. User selects a project
2. User uploads one or more documents (PDFs, images, Word docs — OpenRouter can handle these)
3. For each document:
   - Send to OpenRouter API with the project's extraction prompt
   - Extract structured data according to the fields specified
   - Store results in `extraction_results` table
   - Show processing status (pending, success, error) in real-time
4. Display extracted data in a table (one row per document)

### 4. File Upload & Processing

**Upload Interface**
- Simple drag-and-drop or file picker
- Support multiple files in one upload batch
- Show upload progress + file count
- Display extracted data as soon as processing completes (real-time updates via polling or WebSocket — polling is fine for MVP)
- Show error messages if a document fails

**Supported Formats** (OpenRouter handles):
- PDF (text and scanned/image-based)
- PNG, JPG, JPEG (images of documents)
- DOCX (Word documents)
- Images with text (OpenRouter's vision model can OCR)

### 5. Excel Export

**Export Feature**
- "Download as Excel" button on extraction results
- Filename format: `{project_name}_{timestamp}.xlsx`
- Columns: Document filename, then one column per extraction field
- One row per uploaded document
- Formatted nicely (headers bold, auto-width columns)
- Include a metadata sheet with: project name, fields extracted, export date, total documents

### 6. UI/UX

**Pages/Views**
1. **Login** — Simple form, remember user
2. **Dashboard** — List of projects, quick stats (total documents processed this week, etc.)
3. **Project Detail** — 
   - Project info (name, description, extraction fields)
   - Edit button
   - Upload files section (drop zone)
   - Results table (extracted data, sortable by filename)
   - Download Excel button
   - Processing status indicator
4. **Create/Edit Project** — Form for project name, description, and extraction fields

**Design**
- Clean, minimal, professional (this is a client demo)
- Responsive (works on mobile + desktop)
- Dark mode optional but nice-to-have
- Status indicators: pending (⏳), success (✓), error (✗)
- Keyboard shortcuts for power users (Ctrl+U to upload, etc. — optional)

### 7. API Integration (OpenRouter)

**Setup**
- User provides their OpenRouter API key in settings or via environment variable
- Store encrypted (or in `.env` for local dev, secrets manager for production)
- Test connection on first use

**API Call Structure**
- For each document:
  1. Read file (convert to base64 if image/PDF)
  2. Build prompt: "Extract the following from this document: {user_fields}\n\nDocument content: {file_content}"
  3. Send to OpenRouter (use `claude-opus-4-8` or similar; user can configure model)
  4. Parse response JSON
  5. Store in database

**Error Handling**
- Rate limiting: Implement exponential backoff
- API key validation on startup
- Clear error messages if API fails
- Retry logic for transient failures

### 8. Database & Persistence

**Local Dev** (SQLite)
- Auto-create at startup if missing
- File: `./data/app.db`

**Production** (PostgreSQL or SQLite)
- Connection string from environment variable
- Migrations auto-run at startup
- Backups strategy: user's responsibility, but code should support pg_dump / sqlite3 backups

### 9. Deployment

**Local Development**
```bash
npm install
npm run dev
# Runs on http://localhost:3000 (frontend) and :5000 (backend)
```

**VPS Deployment (Docker + systemd)**
1. **Dockerfile**:
   - Node.js base image
   - Install dependencies
   - Build React frontend
   - Serve static files from Express backend
   - Expose port (default 3000)

2. **docker-compose.yml** (optional but recommended):
   - Web app service
   - Database service (PostgreSQL if using PG)
   - Volume mounts for data persistence
   - Environment variables from `.env`

3. **Systemd Service** (`doc-processor.service`):
   - `ExecStart: docker-compose -f /app/docker-compose.yml up`
   - Auto-restart on failure
   - Logging to journalctl

4. **Nginx Reverse Proxy** (optional):
   - Listen on :80/:443 (SSL recommended)
   - Forward to app container on :3000
   - Config template provided

5. **Environment Setup**:
   - `.env.example` file with all required vars
   - User copies to `.env` and fills in:
     - `OPENROUTER_API_KEY` (or users provide per-account)
     - `DATABASE_URL` (postgres://... or sqlite:...)
     - `JWT_SECRET` (random string for session tokens)
     - `PORT` (default 3000)

### 10. File Structure

```
doc-processor/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── CreateProject.tsx
│   │   │   └── FileUpload.tsx
│   │   ├── pages/
│   │   ├── api.ts (fetch wrappers)
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts (or CRA setup)
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── projects.ts
│   │   │   └── documents.ts
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── services/
│   │   │   ├── openrouter.ts
│   │   │   ├── extraction.ts
│   │   │   └── excel.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── doc-processor.service
├── nginx.conf.example
├── .env.example
└── README.md
```

### 11. Key Features Checklist

- [ ] User registration & login (demo mode: auto-create 20 accounts or manual signup)
- [ ] Create/edit/delete projects
- [ ] Drag-and-drop file upload (single or batch)
- [ ] Real-time processing status
- [ ] Extracted data displayed in sortable table
- [ ] Excel export with formatting
- [ ] OpenRouter API integration with error handling
- [ ] Database persistence (SQLite for dev, PG for prod)
- [ ] Docker deployment ready
- [ ] Systemd service config
- [ ] Nginx reverse proxy example
- [ ] `.env.example` with all required variables
- [ ] README with setup & deployment instructions

### 12. Bonus / Nice-to-Have

- Dark mode toggle
- Project templates (common extraction scenarios: invoices, receipts, contracts)
- Bulk upload with progress bar
- Search/filter extracted data
- User profile settings (API key management, preferences)
- Admin panel to manage accounts (company admin user)
- Email notifications on batch completion
- CSV export option (in addition to Excel)
- Field mapping / custom column names in Excel export
- Validation rules for extracted data (e.g., "amount must be numeric")

### 13. Testing & Quality

- Unit tests for API routes (Jest or Vitest)
- Integration test for upload → extraction → export flow
- Error scenarios: invalid API key, failed extraction, file too large
- Load test: upload 50 documents, verify all process correctly

### 14. Documentation

- **README.md**: Quick start, local dev, VPS deployment, troubleshooting
- **ARCHITECTURE.md**: System design, data flow, API endpoints
- **API.md**: Full endpoint docs (if not using Swagger/OpenAPI)
- **DEPLOYMENT.md**: Step-by-step VPS setup, SSL, monitoring

## Output Deliverables

1. Full source code (frontend + backend)
2. Dockerfile + docker-compose.yml
3. Systemd service file
4. Nginx config template
5. Migration scripts (if PG)
6. `.env.example`
7. README with quick-start instructions
8. A working demo running on localhost (port 3000)

## Success Criteria

- App runs locally with `npm install && npm run dev`
- User can log in, create a project, upload a document, and download Excel export
- Deployment instructions are clear enough for someone to run on a VPS in <30 minutes
- Code is clean, well-commented, and follows TypeScript best practices
- No hardcoded secrets or API keys
- Proper error handling and user feedback throughout

## Demo Polish & Client Experience

### Visual Design (Critical for Demo Impact)
- **Color system**: One primary color (blue/teal), white backgrounds, high contrast. Consistent throughout.
- **Dark mode**: Include toggle in settings — clients love this, expect it in modern apps.
- **Typography**: Use 1-2 font families max. System fonts (SF Pro, Segoe UI, -apple-system) load fast. Large, readable headings.
- **Spacing**: Generous padding and margins. Cramped UI = unpolished. Aim for 16-24px gaps between sections.
- **Hover states**: All buttons, links, cards have smooth hover effects (color shift, subtle shadow, cursor pointer).
- **Visual hierarchy**: Use size, weight, and color to guide user through workflow (large CTA buttons, subtle secondary actions).

### UX Polish
- **Onboarding**: 3-step walkthrough on first load (Create project → Upload doc → Download Excel). Can be dismissed. Shows them the flow immediately.
- **Empty states**: Don't show blank tables. Show helpful illustration + "Upload your first document" CTA with highlighted drag zone.
- **Real-time feedback**: Show extraction progress per-document:
  - ⏳ Extracting invoice #123...
  - ✓ Complete in 3.2s
  - ✗ Failed (with retry button)
- **Instant button feedback**: Buttons respond immediately (no 500ms lag). Loading states for async actions.
- **Friendly error messages**: No tech jargon. "Something went wrong. Try again?" instead of "500 Internal Server Error".
- **Loading animations**: Subtle spinners/skeleton screens during extraction, not jarring.

### Demo-Specific Features

**Sample Projects (Pre-Built)**
- App includes 3 template projects out-of-the-box:
  - **Invoice Extraction**: Extract invoice number, vendor, total amount, due date (with 2 sample results already filled in)
  - **Receipt Processing**: Extract date, merchant, total, category (with sample data)
  - **Contract Analysis**: Extract parties, effective date, term length (with sample data)
- Users can clone these templates or delete them and start fresh
- Sample data is realistic (real invoice/receipt images, not placeholder text)

**One-Click Demo**
- "Try with sample invoice" button on dashboard
- Uploads a pre-built test PDF + extracts immediately (simulated 3-4s extraction)
- Shows results in table, then prompts "Download as Excel" to complete the flow
- This lets clients see the full end-to-end experience in <30 seconds

**Dashboard Analytics**
- Show real metrics even with sample data:
  - Total documents processed (updates as they upload)
  - Total extraction fields defined
  - This month's uploads (bar chart or count)
  - Average extraction time (in seconds)
  - Quick stats cards with icons (file icon for docs, chart icon for fields, etc.)
- These metrics make the app feel "real" and mature

**Project Cards**
- Each project displays as an attractive card showing:
  - Project icon (invoice, receipt, document — auto-assigned by type)
  - Project name
  - Brief description (1 line)
  - Number of documents uploaded
  - Last modified date ("Updated 2 hours ago")
  - Edit/delete/view buttons
  - Hover state with slight shadow lift

**Excel Export Preview**
- Before downloading, show a preview modal with:
  - Column headers (name, extraction fields, metadata)
  - First 3 rows of sample data
  - Formatting preview (bold headers, auto-width columns)
  - This sells the feature visually

**Responsive Design**
- Works perfectly on desktop (primary), tablet (secondary), and mobile (nice-to-have)
- Sidebar navigation collapses on mobile
- Upload zone stays prominent on all sizes
- Tables scroll horizontally on small screens

### Performance (Demo Expectations)
- **Page load**: <2 seconds
- **Sample data loads instantly**: Pre-bundled with app (no API call)
- **One-click demo extraction**: Simulated 3-4s response (feels realistic, not instant)
- **Batch uploads**: If uploading 5 documents, all extract in parallel (show 5 progress bars, not 1 spinner)
- **No console errors**: Zero warnings, zero errors when DevTools open
- **Smooth animations**: CSS transitions, not janky

### Visual Polish Checklist
- [ ] Consistent color palette throughout (primary + neutrals only)
- [ ] Dark mode toggle works flawlessly
- [ ] All buttons have hover/active/disabled states
- [ ] Icons match (use a single icon set, e.g., Tabler or Feather)
- [ ] Typography is crisp and readable (16px+ body, 24px+ headings)
- [ ] Spacing is consistent (8px grid: 8, 16, 24, 32px gaps)
- [ ] Sample project cards look polished with real icons
- [ ] Dashboard shows 4-5 metrics/stats cards
- [ ] One-click demo button is prominent on first load
- [ ] Excel export shows a preview modal before download
- [ ] Loading spinners are subtle, not garish
- [ ] Mobile responsive (test on iPhone/iPad)
- [ ] Favicon set, page title correct ("Doc Processor" or branding)

## Implementation Phases (Build in Order)

### Phase 1: Foundation (Auth + Dashboard)
**Goal**: User can log in and see a basic dashboard
- [ ] Express backend setup with TypeScript + middleware
- [ ] React frontend boilerplate with routing
- [ ] SQLite database initialization
- [ ] User registration & login (bcrypt hashing, JWT tokens)
- [ ] Login page (email/password form, remember me checkbox)
- [ ] Dashboard page (stub, empty for now)
- [ ] Protected routes (redirect to login if not authenticated)
- [ ] Test: Can create account, log in, see dashboard

**Deliverable**: User can register, log in, log out. Dashboard is blank but functional.

---

### Phase 2: Projects CRUD
**Goal**: Users can create, edit, view, and delete projects
- [ ] Projects table in database (id, user_id, name, description, extraction_fields)
- [ ] Create Project form (project name, description, extraction field list)
- [ ] Project list page (card view with project name, description, # of docs)
- [ ] Edit Project page (modify name, description, fields)
- [ ] Delete Project (confirmation modal)
- [ ] Sample projects seeded at first login (Invoice, Receipt, Contract templates)
- [ ] Test: Create a project, edit it, delete it, verify sample projects load

**Deliverable**: Full project management. User can create/edit/delete. 3 sample projects appear on first login.

---

### Phase 3: File Upload & Storage
**Goal**: Users can upload documents and see them listed
- [ ] File upload endpoint (POST /api/documents/upload)
- [ ] Drag-and-drop upload UI component
- [ ] Store files locally (/uploads folder or cloud storage)
- [ ] Documents table in database (id, project_id, filename, path, status, uploaded_at)
- [ ] Display uploaded files in a table (Project Detail view)
- [ ] Progress bar during upload (visual feedback)
- [ ] Error handling (file too large, unsupported format)
- [ ] Test: Upload PDF, image, DOCX. Verify files stored and listed.

**Deliverable**: Users can upload 1+ documents per project. Files are stored and listed.

---

### Phase 4: OpenRouter API Integration
**Goal**: Extract data from uploaded documents using OpenRouter
- [ ] OpenRouter API client (send document + prompt, receive JSON response)
- [ ] Extraction endpoint (POST /api/documents/:id/extract)
- [ ] Extraction results table in database (id, document_id, extracted_data JSON, status, processed_at)
- [ ] Real-time progress UI (show "⏳ Extracting..." → "✓ Complete" per document)
- [ ] Error handling (invalid API key, rate limit, extraction failure)
- [ ] Retry logic (button to re-extract if failed)
- [ ] Display extracted data in a table (parsed from JSON, one column per field)
- [ ] Test: Upload real document, extract with sample prompt, verify results display

**Deliverable**: Users can click "Extract" on a document, see progress, and view extracted results in a table.

---

### Phase 5: Excel Export
**Goal**: Users can download extracted data as formatted Excel
- [ ] Excel generation endpoint (GET /api/projects/:id/export)
- [ ] SheetJS integration to build .xlsx files
- [ ] Format: Bold headers, auto-width columns, metadata sheet
- [ ] Include: Project name, extraction fields, export date, total documents
- [ ] Download button on Project Detail page
- [ ] Excel preview modal (show first 3 rows + formatting before download)
- [ ] Filename: `{project_name}_{timestamp}.xlsx`
- [ ] Test: Export sample data, open in Excel, verify formatting and content

**Deliverable**: Users can export project results as a polished Excel file.

---

### Phase 6: Visual Polish & Demo Features
**Goal**: Make the app beautiful and demo-ready
- [ ] Dark mode toggle (CSS variables + localStorage)
- [ ] Color system: Choose primary color, apply throughout
- [ ] Dashboard analytics cards (total documents, total fields, uploads this month, avg extraction time)
- [ ] Project cards with icons (auto-assigned based on template type)
- [ ] One-click "Try Demo" button (uploads sample invoice, auto-extracts)
- [ ] Onboarding tooltip/walkthrough (highlight key UI elements on first visit)
- [ ] Empty states (helpful illustrations + CTAs, not blank tables)
- [ ] Loading spinners & animations (smooth, not jarring)
- [ ] Hover states on all buttons, cards, links
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Test: Check on desktop, tablet, mobile. Verify dark mode. Click demo button.

**Deliverable**: App is visually polished, feels modern, demo-ready for client presentation.

---

### Phase 7: Deployment & Documentation
**Goal**: App is ready to deploy on VPS and easy to run locally
- [ ] Dockerfile (Node.js base, build React, serve with Express)
- [ ] docker-compose.yml (web + database services, volumes for persistence)
- [ ] .env.example (with all required variables documented)
- [ ] Systemd service file (doc-processor.service for auto-restart)
- [ ] Nginx config template (reverse proxy, SSL ready)
- [ ] QUICKSTART.md (3 commands to run locally, 5 steps for VPS)
- [ ] README.md (overview, features, tech stack, setup instructions)
- [ ] Test: Run locally with `npm run dev`, then test Docker build and run

**Deliverable**: App runs locally with `npm run dev` and deploys to VPS with `docker-compose up`.

---

## Phase Checklist & Testing

| Phase | Test Command | Success Criteria |
|-------|--------------|------------------|
| 1 | `npm run dev`, register, login | User sees dashboard after login |
| 2 | Create/edit/delete project | 3 sample projects auto-load on first login |
| 3 | Upload a PDF | File appears in Project Detail table |
| 4 | Click "Extract", wait 3-5s | Extracted data fills table cells |
| 5 | Click "Export Excel" | .xlsx downloads with bold headers, correct data |
| 6 | Toggle dark mode, test mobile | App looks beautiful on phone, dark mode works |
| 7 | `docker build -t doc-proc .` | Image builds, container runs on localhost:3000 |

---

## Notes for Implementation

- **Build in order**: Don't skip phases. Each phase depends on the previous one.
- **Test as you go**: After each phase, verify locally before moving to the next.
- **Sample data**: After Phase 2, seed 3 sample projects. After Phase 4, generate sample extraction results for those projects.
- **Realistic data**: Use real invoice/receipt images or PDFs for testing, not placeholder text.
- **No skipping Phase 6**: Visual polish is critical for a demo. Don't treat it as optional.
- **Phase 7 last**: Only after app works perfectly locally should you build deployment configs.
- **Keep it simple**: Each phase should be completable in isolation. Don't mix concerns.
