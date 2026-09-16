# Handoff — Isa Portfolio

## Planned next: AI assistant that answers questions about Isa (NOT STARTED)

- **What Isa wants** — an AI assistant on the portfolio that can answer visitor questions about him (his work, projects, skills, background).
- **API provider he chose** — **NVIDIA NIM** (`https://integrate.api.nvidia.com/v1`, OpenAI-compatible chat completions API; get a key at build.nvidia.com).
- **Nothing is implemented yet** — next session should:
  1. Get the NIM API key from Isa and put it in `site/.env` ONLY (e.g. `NIM_API_KEY`), same rules as the SMTP credentials: server-side only, never exposed to the browser, never committed.
  2. Create a server-only API route (e.g. `app/api/assistant/route.ts`) that proxies chat requests to NIM using the OpenAI-compatible client shape (`fetch` to `.../v1/chat/completions` works, no extra SDK needed).
  3. Ground it in real data: system prompt built from the portfolio's own content (projects in `data/` + the store, skills, process pages) so answers stay factual; instruct it to say "I don't know" rather than invent.
  4. Rate-limit and cap response length (reuse the `checkRateLimit` pattern from `lib/inquiry-store.ts`); never stream secrets; validate/limit the conversation payload.
  5. UI: a chat panel component consistent with the site's design; keep it clearly AI-labeled for honesty.
- Contact details were configured by Isa himself in the CMS (`.data-store/contact.json`, git-ignored): email `isamohommedh@gmail.com`, WhatsApp/phone `+94 78 572 6665`.

## Latest addition: Tax Desk project added via the CMS (COMPLETE)

- **What was done** — Added the "Tax Desk" project (from `Projects/Tax automation`) to the portfolio through the management API, not source edits:
  - Seeded Tax Desk's dev history (`data/calculations.json`) with 4 engine-computed demo calculations (`scripts/seed-demo-history.ts`, asserts exact expected figures before writing) so the dashboard/history screenshots show real content.
  - Captured 6 real screenshots (1349×706, headless Chrome) of the running Tax Desk app: dashboard, individual, VAT, withholding, business, history.
  - Uploaded all 6 via the manage API; created the `tax-desk` project (type `automation`, featured, order 2, full case study + verifiable features) and published it. Audit trail records the uploads, create and publish.
  - Fixed a real validator bug found during creation: `strArray` used the list-count limit as the per-item character limit (rejected long screenshot paths/features). Count and item-length limits are now separate.
  - Fixed a content-loss regression: public pages replaced the seed projects with store projects once the store was non-empty, so Bantex vanished. Store and seeds are now MERGED (store wins on slug collision) in `data/projects-store.ts`.
  - Extended the 3D browser-frame treatment to `automation`-type projects on `/work/[slug]` (`isWebsite = type !== "agent"`); FeaturedWork meta plates are now data-driven and the "Project 01/02" index is computed.
- **Where to look** — `/work` (both projects), `/work/tax-desk` (3D tilt frame + gallery of 5 screenshots), homepage featured section (both). Screenshots live in `public/uploads/tax-desk-*.png`.
- **Tax Desk notes** — Its dev server was left running by the user on port 3000; screenshots reflect it. The seeding script is re-runnable and asserts engine outputs before writing.

## This session: Private Work Management System + Contact/Intake email (COMPLETE)

- **Goal** — Replace the fictional "Admin Panel" with a private Work Management/CMS: create/manage complete portfolio projects, publish them to the public Work page, upload media and sandboxed HTML demos, manage contact credentials from one source of truth, receive project inquiries by email, full audit trail. Also: remove every em-dash from the site.

- **Current state** — ALL items complete and verified against a production build (`next start` on scratch port 3215), including a full authenticated end-to-end regression of every management workflow and a hostile unauthenticated battery.

### What was built

**Data layer (server-only, JSON file store in `.data-store/`, git-ignored)**
- `lib/store.ts` — persistence for project records (`{id, project, demo, status, createdAt, updatedAt, publishedAt}`), contact config `{email, whatsapp, phone}`, audit log (JSONL). Atomic writes; OneDrive-safe.
- `lib/auth.ts` — `ADMIN_USER`/`ADMIN_PASSWORD` (timing-safe compare) + HMAC-signed session cookie (`ADMIN_SESSION_SECRET`), server-only.
- `lib/auth-gate.ts` — `requireManageUser()` server-side gate; every `/manage/*` page calls it at the top. Real enforcement; `components/manage/SessionGate.tsx` is UX-only.
- `lib/manage-validation.ts` — treats all management payloads as untrusted: unknown fields rejected, types enforced, length windows, URL allow-lists, slug format enforcement.
- `lib/email.ts` — nodemailer SMTP (Gmail app password from `.env` only); professional HTML+text inquiry notification.
- `lib/demo-constants.ts` — demo filename allow-list regex, shared client/server.

**API routes (all auth-checked; unauthenticated → 401/307)**
- `app/api/manage/session` — login (POST), logout (DELETE).
- `app/api/manage/projects` — GET list, POST create (rejects seed-slug collisions with 409).
- `app/api/manage/projects/[slug]` — GET one, PUT full update (keeps status, slug immovable), PATCH publish/unpublish (`{"action":"publish"|"unpublish"}`).
- `app/api/manage/projects/[slug]/delete` — DELETE.
- `app/api/manage/uploads` — POST images (`kind=image`, single `file`, jpg/png/webp/gif/avif, ≤5MB) and demo bundles (`kind=demo`, `files[]`, index/script/styles .html/.css/.js/.mjs, ≤2MB each); idempotent overwrite; per-slug storage.
- `app/api/manage/contact` — GET/PUT contact config (flat body `{email, whatsapp, phone}`; validated, audited with before/after).
- `app/api/manage/audit` — GET audit trail (auth required).
- `app/api/media/images/[file]` + `app/api/media/demos/[slug]/[file]` — runtime serving of uploaded files (avoids Next.js stale-404 prerender caching of runtime files). Demo files get `Content-Security-Policy: sandbox allow-scripts` so even direct access runs null-origin.
- `app/api/inquiry` — now sends the SMTP email; response `{ok, stored, delivered, referenceId}`; graceful degradation when SMTP is unconfigured.

**Public pages (all read from the store; store-backed pages are `force-dynamic` to avoid build-time caching)**
- `/work` — seed projects (from `data/seed-projects.ts`) merged with store projects; only published; drafts invisible.
- `/work/[slug]` — seed + store lookup; internal demos open through the sandboxed viewer.
- `/` (FeaturedWork) and `/live-demos` — store-backed.
- `/contact` — renders contact config via `data/contact.ts` mapping layer (single source of truth); Email/WhatsApp/Call/Start-a-Project actions all live.
- `/demos-view/[slug]` — viewer wrapping internal demos in `sandbox="allow-scripts"` iframe (no allow-same-origin: demo code cannot touch portfolio cookies/storage/DOM/APIs).

**Management UI (`/manage`, visually consistent with the portfolio)**
- `/manage/login`, `/manage` (dashboard: list, publish/unpublish, delete, preview, audit feed), `/manage/projects/new`, `/manage/projects/[slug]` (full editor: Basic Info / Presentation / Media / Technologies / Links / Demo / Content / Publishing + live preview link), `/manage/contact`.

**Environment variables (`.env`, git-ignored — never commit)**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (Gmail **app** password), `INQUIRY_NOTIFY_EMAIL` (defaults to `SMTP_USER`).
- `ADMIN_USER`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (management login at `/manage/login`).
- Security properties verified: no secrets in source (grep clean), no client-side credential exposure, `.env`/`.data-store`/`public/uploads`/`public/demos` git-ignored.

**Audit trail** — `project.created/updated/published/unpublished/deleted`, `demo.uploaded`, `contact.updated` (with before/after), each with actor + timestamp + target; visible on the dashboard and `/api/manage/audit`.

### Verification performed (production build, real HTTP)
- Visitor: `/`, `/work`, `/contact`, `/live-demos`, `/start-a-project`, `/manage/login` → 200; seed projects render; contact page uses configured email/WhatsApp/phone.
- Hostile battery (no auth): all 6 management endpoints + audit + uploads → 401; wrong password → 401; create against seed slug → 409.
- Owner workflow: login → create (with validation errors surfaced for missing fields) → upload image → publish → appears on `/work` + detail 200 → edit/configure demo (PUT body is `{project, demo}`) → upload 3-file demo bundle → demo served with CSP sandbox + sandboxed viewer + public page button → unpublish → hidden (listing + detail 404) → republish → delete → gone, audit records `project.deleted`.
- Inquiry: valid submission → `{ok:true, stored:true, delivered:true}` (email actually sent through Gmail; reference `VX-...` returned and JSONL stored).
- Typecheck clean, lint clean, build passes.
- **Known UI-vs-test discrepancy (works as intended):** the dashboard/editor publish via PATCH action; PUT deliberately preserves status. My earlier scripted PUT included `status` and returned 200 while staying draft — correct per design, not a bug.
- **Not done:** real-browser visual QA (no browser automation available this session); all verification was HTTP/HTML-level. Recommend one manual pass at desktop + 375px.

### Also this session
- **Contact UX fixes (latest pass):** contact channel rows are now a client component (`ChannelRow` in `components/contact/CopyChannelButton.tsx` + `.module.css`). Clicking the Email or Phone row COPIES the value and shows "Copied ✓" - the row no longer depends on a configured OS mail/phone app, which is why `mailto:` previously appeared to do nothing. "Open in Gmail" and "Call" remain as explicit secondary links; WhatsApp stays a normal wa.me link. The footer is an async server component listing the owner's real channels (`components/layout/Footer.tsx`). The Start-a-Project form is a one-question-at-a-time wizard (10 steps, progress bar, per-step validation with the same shared rules, review step with per-row Edit, Skip on optional steps; payload and `lib/inquiry.ts` validation unchanged). The project editor has a "Paste a list instead" panel on technologies/screenshots/features that parses pasted bullets (`-`, `*`, `•`, dashes, `1.`, `a)`) into rows (`PasteListPanel` in `components/manage/ProjectEditor.tsx`).
- **Em-dash removal:** entire site source (ts/tsx/css/json/md) swept; grep for `—` returns empty. (Earlier edits to files that previously contained em-dashes had to be re-applied against the post-sweep text.)
- Test data cleaned: store reset (`projects.json` empty, `contact.json` `{}`), test uploads/demos/inquiries/audit removed; seed content intact.
- `nodemailer` + `server-only` added as dependencies; `.data-store/`, `/public/uploads/`, `/public/demos/` added to `.gitignore`.

### Test-data discrepancy note
- The contact config in `.data-store/contact.json` was reset to `{}` after testing. First login at `/manage/login`, set real contact details at `/manage/contact`; the public contact page falls back to placeholders until then.
- One earlier test inquiry was actually delivered to the real inbox (during the SMTP verification) — expect one "New project inquiry — Test Visitor" email from testing.

### Failed attempts / lessons
- **React controlled-input warning (post-session fix):** with an all-empty `contact.json` (`{}`), the GET route returned a truthy-but-partial config whose fields were `undefined`, flipping the contact form's inputs from controlled to uncontrolled. Fixed in `lib/store.ts` (all-empty config now reads as "no config" → `null`) and `ManageContactForm.tsx` (defensive `?? ""` merge); the project editor's edit page props are likewise normalized.
- Next.js prerender-caching pitfall (twice): pages/routes reading runtime data must be `force-dynamic` or API-routed, else stale 404s/HTML persist from build time. Fixed via `dynamic = "force-dynamic"` and media API routes.
- Windows/OneDrive ACL blocked `mv` on route-group dirs (rename denied, copy worked) → used per-page server-side auth gates instead of a route group; simpler and equally safe.
- code_search's ripgrep failed once (ENOENT) → fell back to terminal grep.
- Several write_file/str_replace calls were rejected for malformed params → retried successfully.

### Next steps
1. Isa: log in at `/manage/login` (credentials in `.env`), set real contact details at `/manage/contact`, create/publish first managed project.
2. Visual QA in a real browser (desktop + 375px), especially the editor's long form and the demo viewer.
3. Optional hardening later: HTTPS-only secure cookie flag when deployed behind a real domain; consider turning on Next.js `images` remote patterns if remote screenshots are ever used.

## Prior sessions (history)

- **Goal** — Build the Isa Hassen portfolio per `Isa portfolio/Phases of creation/APORTFOLIO_SPEC.md`, phases 00–10.

- **Current state** — Phases 00–07 built in earlier sessions; Phases 08–10 (intake system, assets/perf, final QA) completed the previous session. Summary of that work:
  - Phase 08: `/start-a-project` multi-part intake (`data/inquiry.ts` single source of truth, `lib/inquiry.ts` shared validation, `lib/inquiry-store.ts` dev persistence + rate limiting, `app/api/inquiry/route.ts`, `components/inquiry/*`), navbar/footer/homepage wiring.
  - Phase 09: Bantex screenshot → WebP (374KB → 59KB), unused `motion` dependency removed, favicon, hero pill repointed to `/start-a-project`.
  - Phase 10: full route/payload hostile battery, unique titles, custom 404, dead `/work/tax-desk` link removed, accessibility verified in rendered markup.
  - Phases 00–07: homepage with 3D hero, multi-page shell + 404, `/work/[slug]` case studies, `/processes`, `/live-demos` website showcase, Tax Desk automation showcase, Doc Processor agent showcase.
  - Honest-state disclosures throughout (simulation banners, "Live deployment pending", placeholder contact note).

- **Next steps (from history, still open where not superseded)**
  1. Visual QA in a real browser (desktop + 375px mobile) — still outstanding.
  2. From Isa: Bantex live URL, extra screenshots, real MP4/audio recordings, more real automations/agents.
  3. Optional: real Tax Desk case study under `/work` and restore `relatedProject: "tax-desk"` in `data/automations.ts`.
