# Project: ABC Accounting — Practice Management

## Status: ACTIVE

> Note: the repo folder is named `POS system`. The product it contains is **ABC Accounting — Practice Management** (accounting-firm practice management). This is the demo built to the phase docs in this folder.

## Purpose

Build a polished, end-to-end client demo of an accounting-firm practice-management platform — firm dashboard, client workspaces, accounting ledger, tax center, documents, invoices, expenses, tasks, reports, team, integrations, settings, and a demo authentication/RBAC layer — all in vanilla HTML/CSS/JS with an architecture that can later be swapped to a real API + database + NGINX deployment.

## Scope

### In Scope
- Firm-wide dashboard and per-client workspaces (Overview / Accounting / Tax / Documents / Invoices / Expenses / Reports)
- Firm-wide Accounting, Tax, Invoices, Expenses, Documents, Tasks, Reports, Team, Integrations, Settings pages
- Demo auth + roles (admin/manager/accountant/viewer) with per-user permissions and **enforced** client access
- Admin console: users, roles & permissions, custom permission toggles, enable/disable
- Fictional Sri Lankan-style demo data, Rs. currency; clearly flagged as a demo workspace

### Out of Scope (for now)
- Real backend / database (the `store.js` data layer is demo-only, persisted to localStorage)
- Production-grade authentication / security (demo sessions via localStorage + sessionStorage)
- Legal/tax-grade calculations — all tax figures are fictional demo data
- Real integrations, email, file upload, report export (these simulate behavior for the demo)

## Tech Stack

- **Vanilla HTML/CSS/JS** — no framework, no build step, no bundler
- Native ES modules (requires serving over HTTP; `file://` will not work)
- Design tokens in CSS custom properties; layered CSS (tokens / base / components / layout)
- Inline SVG icon set; hand-rolled chart components
- localStorage for demo state (`abc_pm_state`), sessionStorage for demo session (`abc_pm_session`)

## Load

```bash
cd "Projects/POS system"
python -m http.server 8123
# open http://localhost:8123/index.html
```

## Constraints

- Must run in any modern browser over a static server; no external dependencies/CDNs
- Every chart/table must answer a useful business question; no filler
- VIEW must be separate from INPUT/EDIT; client access enforced in logic, not just hidden in UI
- Visual direction: light professional UI, purple primary, thin borders, restrained radii, dense info hierarchy
- Avoid: harsh gradients, glassmorphism, rainbow UI, excessive shadows, generic AI/SaaS patterns, excessive cards/emojis/icons, bento grids, decorative terminal UI

## Skills Available

| Skill | Purpose |
|-------|---------|
| frontend-design | Production-grade frontend interfaces |
| senior-frontend | Frontend development — React, Next.js, TypeScript, Tailwind |
| ui-design-system | Design systems — tokens, components, responsive |
| ui-ux-pro-max | UI/UX design — styles, palettes, charts |
| webapp-testing | Test with Playwright — screenshots, logs, debugging |
| clean-code | Pragmatic coding standards |
| code-reviewer | Code review for quality checks |

## Related Files

- Phase docs: `ABC_Accounting_Phase_1.md`, `_Phase_2.md`, `_Phase_3.md`
- Agent instructions: `CLAUDE.md` (this folder)
- Demo data: `js/data/db.js`
- App bootstrap: `index.html`, `js/main.js`, `js/core/router.js`
- Deployment (future): `nginx.conf`
