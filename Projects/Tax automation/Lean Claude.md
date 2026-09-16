# Lean Claude.md — Tax Desk

Compact project index for the Tax Automation application. Keep this lean and
accurate; put deep detail in `docs/` or source comments.

## Purpose

A professional Tax Management app (Sri Lanka) to understand, calculate, verify
and manage tax obligations. Starts as a demo; intended to become a real product
for accounting firms and their clients.

**Non-negotiable:** the LLM/agent NEVER calculates tax. A deterministic,
rule-based engine is the single source of truth. AI may only assist (explain,
extract, summarise) in later phases.

## Tech stack

- **Next.js 16 (App Router)** — NOTE: this is the Next 16 major, not 15. Read
  `node_modules/next/dist/docs/` before writing Next API code; conventions
  changed (async `params`, Turbopack default, `proxy` not `middleware`, etc).
- **TypeScript** (strict), **Tailwind CSS v4** (`@theme` tokens in `app/globals.css`).
- **Vitest** for engine + parser tests.
- **exceljs** for `.xlsx` parsing (with a pinned safe `uuid` via npm override).
  CSV is parsed natively in `lib/upload/parse.ts`. (The deprecated `xlsx` package
  was rejected: it has unfixed high-severity vulns.)
- **No AI, no LLM.** Persistence: a small `PersistenceAdapter` interface with a
  **JSON-file dev adapter** (`lib/database/json-adapter.ts`, file-backed, no cloud
  deps) plus a Supabase/PostgreSQL `schema.sql` ready for a live swap. Live Supabase
  wiring needs project credentials; in dev, calculations persist to
  `data/calculations.json` (gitignored).

## Architecture (core rule)

Tax rules are **versioned data**, never hard-coded in UI. New tax year /
jurisdiction = a new ruleset data file + registration in `lib/tax/rules/repository.ts`.

```text
User / Financial Data → Tax Rules → Deterministic Engine → Calculation
                     → Verification / Audit Trail → (later) AI Explanation
```

Directory structure:

```text
app/            layouts, pages, server actions (app/actions.ts)
components/     ui primitives + app shell + tax/individual (form, result, upload)
                + tax/vat (form, result) + tax/withholding (form, result)
                + tax/business (form, result)
lib/tax/        types.ts, rules/ (schema+seed+repo), engine/ (progressive, rounding, audit),
                calculators/ (individualIncome.ts, vat.ts, withholding.ts, business.ts),
                money.ts, index.ts
lib/database/   adapter.ts (PersistenceAdapter), json-adapter.ts (JsonFileAdapter),
                index.ts (getPersistence singleton), types.ts (SavedCalculation),
                schema.sql (Supabase/PostgreSQL target)
lib/upload/     parse.ts (CSV + xlsx → headers/rows)
components/history/  result-view.tsx (re-render a saved calculation by type)
app/history/    page.tsx (list) + [id]/page.tsx (reopen)
docs/           PHASE 1–3 planning docs (the product roadmap)
```

## Key files

- `lib/tax/rules/sl-lk-2025-26.ts` — verified Sri Lanka 2025/2026 Individual Income
  rules (seed data).
- `lib/tax/rules/sl-lk-vat-2025-26.ts` — verified Sri Lanka 2025/2026 VAT rules.
- `lib/tax/rules/sl-lk-wht-2025-26.ts` — verified Sri Lanka 2025/2026 Withholding
  Tax / AIT rules (seed data).
- `lib/tax/rules/sl-lk-business-2025-26.ts` — Sri Lanka 2025/2026 Business Tax
  rules, `verified: true`, six per-category `BUSINESS_TAX` rates (30/15/15/45/45/30%).
- `lib/tax/engine/progressive.ts` — generic band application (reused by all calcs).
- `lib/tax/calculators/individualIncome.ts` — Individual Income Tax flow + audit.
- `lib/tax/calculators/vat.ts` — `calculateVat` (output/input/net) + separate
  `assessVatRegistration`; input-tax eligibility is a declared input, not invented.
- `lib/tax/calculators/withholding.ts` — `calculateWithholding` (data-driven WHT/AIT)
  + `validateWithholdingInput`; rates/thresholds come from the repository, never the UI.
- `lib/tax/calculators/business.ts` — `calculateBusinessTax` (per-category taxable
  income; each expense reduces only its own attributed source; shared expenses force
  NEEDS_ALLOCATION) + `validateBusinessTaxInput`.
- `lib/upload/parse.ts` — spreadsheet → headers/rows for import.
- `app/actions.ts` — server actions: `calculateIndividualTax` (form),
  `calculateIndividualTaxFromInput` (upload), `parseUpload` (file),
  `calculateVat` + `assessVat` (VAT forms). Each calculator action now also
  persists the completed run via `persistResult` (id, type, taxYear, atDate,
  rulesetId, input, result, user, createdAt).
- `components/tax/individual/result.tsx` — shared result/audit rendering.
- `components/tax/vat/result.tsx` — VAT breakdown + registration assessment rendering.
- `lib/database/json-adapter.ts` — file-backed `JsonFileAdapter` (save/list/get);
  `index.ts` exports `getPersistence()` (lazy singleton → `data/calculations.json`,
  overridable via `CALCULATIONS_DATA_FILE`).
- `components/history/result-view.tsx` — renders a saved `result` by its `type`.
- `app/history/page.tsx` — list saved calculations (most-recent first); empty state.
- `app/history/[id]/page.tsx` — reopen one calculation: inputs, applied rule version,
  result + audit trail.

## Current status (Phase 1 foundations, demo)

Implemented: deterministic engine + versioned rules; Sri Lanka **2025/2026**
Individual Income Tax calculator (personal relief LKR 1,800,000; bands 6/18/24/30/36%;
10% investment-asset-gains rate); the **2025/2026 VAT calculator + registration
assessment** (see below); responsive dashboard shell + KPI empty states;
CSV/Excel upload → preview → column-mapping → calculate; **165 passing tests**.

The Individual Income Tax experience is **complete**: clean input flow, whole-rupee
validation, and a result view that surfaces taxable income, personal relief applied,
tax per band, total tax, effective rate and an AI-free audit trail. `personalReliefApplied`
(= min of assessable income and the relief cap) is shown separately from the full
relief amount; the form footer and page metadata are driven by the resolved ruleset
rather than hard-coded tax-year text. The result view renders an IRD-style computation
schedule (assessable → relief → taxable → bands → investment gains → total).

Rules are **official IRD-verified for 2025/2026 only**. Do not present them as
current for any other tax year unless a corresponding official IRD ruleset is
added/verified.

**VAT (Phase — 2025/2026) is implemented** on the same deterministic engine:
`SL_LK_VAT_2025_26` registered in the repository and verified to official IRD sources
(IRD VAT page, IRD Tax Chart, consolidated VAT Act, IRD Gazette Extraordinary No.
2443/30 of 2025-07-01). `calculateVat` derives output VAT from verified rates
(18% standard, 0% zero-rated/exports, 18% financial services), credits only the
declared deductible input VAT, and reports a PAYABLE / REFUNDABLE / NIL net position.
`assessVatRegistration` is a separate function that evaluates the exclusive "more than"
registration thresholds (> LKR 15M/quarter OR > 60M/year ordinary; > 3M/quarter OR >
12M/year financial; non-resident e-platform from 2025-10-01 at > 15M/3-month OR >
60M/12-month), plus voluntary registration and the compulsory commercial import/export
rule. Both are rules-driven and emit an AI-free audit trail; input-tax eligibility is a
declared input (the engine applies no invented eligibility rule). UI: two forms
(VAT calculation + registration assessment) under `/tax/vat`, rendered with the shared
ui primitives.

**Withholding Tax / AIT (phase — 2025/2026) is implemented** on the same deterministic
engine: `SL_LK_WHT_2025_26` registered in the repository and verified to official IRD
sources (Official IRD 2025/2026 Tax Chart + the official WHT/AIT schedules: Schedule 1
interest/discount, 2A payments to residents, 2B payments to non-residents, effective
01.04.2025). `calculateWithholding` is fully data-driven: rates and any monthly
threshold come from the versioned repository, never hard-coded in the UI. Input is a
payment `category` + `gross` (+ `monthlyAggregate`, required for the two threshold
categories). Eleven official categories are encoded: 2% non-resident transport/telecom
(s85(2)); 2.5% NGJA gem auction; 5% resident non-employee service fee (> LKR 100,000
/month, exclusive, on the full payment); 10% interest/discount; 10% resident rent
(> LKR 100,000 /month, exclusive, full payment); 14% lottery/betting winnings; 14%
natural-resource charge/premium; 14% royalty; 14% non-resident rent; 14% non-resident
service fee/insurance premium; 15% dividends. Threshold categories use an **exclusive
"exceeds"** bound; when met, the rate applies to the **full** gross (full-payment
treatment). WHT = `roundToRupee(gross × rate)`; net = gross − withholding; an AI-free
audit trail is emitted. UI: a single data-driven form + result under `/tax/withholding`.

**Business Tax (Y/A 2025/2026) is implemented and IRD-verified.** `SL_LK_BUSINESS_2025_26`
is `verified: true` and carries six `BUSINESS_TAX` rules (one per income category, each
`kind: "FLAT_RATE"` with its own `appliesTo`), sourced from the Official IRD 2025/2026
Tax Chart + IRD Inland Revenue Act (2025 changes): standard company taxable income 30%;
qualifying foreign-currency service income remitted through a bank 15%; qualifying
foreign-source income in foreign currency remitted through a bank 15%; betting & gaming
45%; manufacture/import & sale of liquor or tobacco 45%; gains from realisation of
investment assets 30% (separately calculated). `calculateBusinessTax` is category-aware:
because each differently-taxed activity/source is a separate business (Inland Revenue Act
s60(2)), expenses are **attributed per category** — an expense reduces only the income
source it directly relates to (`max(0, gross − attributedExpenses)`, no loss carry-forward).
Investment-asset gains are computed on **gross** with no expense deduction. Expenses the
user cannot attribute to one source go in a **shared / unallocated** bucket: they are
never deducted (the engine applies no invented allocation formula) and the result is
reported as `NEEDS_ALLOCATION` with no liability figure until attributed. Per-category tax
is `roundToRupee(taxable × rate)`, summed to `totalTax`. The tax step is `COMPUTED` only
when the ruleset is verified and every category with income has an active rule; otherwise
`NEEDS_ALLOCATION` (shared expenses present) or `NOT_IMPLEMENTED` (no fabricated liability).
It emits an AI-free audit trail. Inputs: six income fields (`standardIncome`,
`foreignCcyServiceIncome`, `foreignCcyForeignSourceIncome`, `bettingGamingIncome`,
`liquorTobaccoIncome`, `investmentAssetGains`) + five per-category expense fields
(`ordinaryExpenses`, `foreignCcyServiceExpenses`, `foreignCcyForeignSourceExpenses`,
`bettingGamingExpenses`, `liquorTobaccoExpenses`) + `sharedExpenses`. UI: form + result
under `/tax/business`, labelled "IRD verified".

**Calculation History / persistence (Phase 1 DoD) is implemented.** A `PersistenceAdapter`
interface in `lib/database/` has two implementations: a file-backed `JsonFileAdapter`
(for local dev, no cloud deps) and a Supabase/PostgreSQL `schema.sql` target for a live
swap. Each completed calculator action in `app/actions.ts` persists the run via
`persistResult`, recording the exact `rulesetId` + input + result + audit trail so no
figure is ever attributed to an unverified rule. A history UI lives under `/history`
(list, most-recent-first, empty state) and `/history/[id]` (reopen: inputs, applied rule
version, result + audit trail, `notFound()` on a missing id). Records are `SavedCalculation`
objects (id, type, taxYear, atDate, rulesetId, input, result, user, createdAt) written to
`data/calculations.json` (gitignored) in dev.

**Verification note:** browser click-throughs of the upload → mapping → calculate,
the VAT, WHT and Business forms were not run (no Playwright/browser MCP is installed
in this environment). The engines are covered by 173 unit tests (35 individual, 38 VAT,
43 withholding, 47 business, 5 database, 5 upload); routes were validated via build +
dev-server 200s (`/`, `/tax/individual`, `/tax/vat`, `/tax/withholding`, `/tax/business`,
`/history`, `/history/[id]` all return 200).

**Known unimplemented WHT conditions (intentional — do not guess):** the fine-grained
exemptions/sub-cases in WHT/AIT Schedules 1, 2A, 2B beyond the verified Tax Chart
summary are not encoded (no verified offline copy; third-party sources are forbidden),
and the IRD 2025-03-28 circular on interest-income AIT relief where assessable income
≤ LKR 1,800,000 was NOT turned into a general exemption — interest/discount stays a
flat 10% WHT. These need official verification before being added.

Not yet built (next phases, in roadmap order): **live Supabase persistence + auth/roles**
(the `lib/database/` layer + `schema.sql` are in place; wiring against a real Supabase
project needs credentials); VAT spreadsheet upload; AI assistant; compliance calendar;
PDF/Excel reports. The rules repository + engine + persistence are structured so these
slot in without refactoring. Don't add a tax figure until an authoritative IRD source is
supplied and verified.

## Commands

```bash
npm run dev          # dev server (Turbopack)
npm run build        # production build (Turbopack)
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # vitest run
```

## Conventions

- Tax values live only in ruleset data; calculators consume a `TaxRuleSet`.
- Money is integer LKR (no floats); deterministic rounding via `roundToRupee`.
- Everything returns an audit trail (`result.audit`) — no AI in the maths.
- Server components by default; `"use client"` only where interaction is needed.
- Shared UI: `components/ui/*` (Button, Card, Stat, Field, Badge). Styling uses
  the semantic `@theme` palette in `app/globals.css` (navy/accent/warn/danger).
- Keep it professional/minimal — restrained colour, strong hierarchy, responsive.
- UI correctness is verified by running the app, not just type-checking.

## Constraints

- Only touch this project root: `Projects/Tax automation`.
- Never invent/estimate a tax rate; never let AI determine a liability.
- External input is untrusted: validate server-side (see `app/actions.ts`).
- No subagents without explicit user permission (global rule).

## Detailed docs

- `docs/PHASE 1..3 — *.md` — the full product roadmap and Definition of Done.

## Skills / tooling

- `token-optimizer:token-optimization` — use its MCP tools (`smart_read`,
  `smart_glob`, `smart_grep`, `smart_edit`) for large/re-read files and to keep
  context lean. Apply `dataviz`, `run`, `security-review`, `claude-api` only when
  they fit; don't load irrelevant skills.
