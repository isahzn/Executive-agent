# Tax Desk — User Guide & Demo Guide

A practical, beginner-friendly guide for running, testing, and demonstrating the
Tax Automation application ("Tax Desk"). Every figure, route, and field below
reflects the **actual** implementation as of the 2025/2026 verified ruleset.

> **What Tax Desk is:** a deterministic, auditable Sri Lankan tax calculator for
> Individual Income Tax, Business Tax, VAT, and Withholding Tax. The rule engine
> is the single source of truth — **AI never computes a tax figure.** Every
> result includes an AI-free audit trail showing exactly how it was derived.
>
> **What it is not:** it is not an accounting suite, a live-filing portal, or an
> LLM. It is a demo-ready MVP built on official IRD-verified 2025/2026 figures.

---

## Table of contents

1. [Starting the application locally](#1-starting-the-application-locally)
2. [Opening the application in a browser](#2-opening-the-application-in-a-browser)
3. [Dashboard](#3-dashboard)
4. [Individual Income Tax](#4-individual-income-tax)
5. [Value Added Tax (VAT)](#5-value-added-tax-vat)
6. [Withholding Tax](#6-withholding-tax)
7. [Business Tax](#7-business-tax)
8. [Calculation History](#8-calculation-history)
9. [Individual Tax — file import flow](#9-individual-tax--file-import-flow)
10. [What successful results look like](#10-what-successful-results-look-like)
11. [Errors & validation states to test](#11-errors--validation-states-to-test)
12. [Pre-demo QA checklist](#12-pre-demo-qa-checklist)
13. [Demo Run](#demo-run)

---

## 1. Starting the application locally

You need [Node.js](https://nodejs.org) installed (v20+ recommended).

1. Open a terminal and change into the project directory:

   ```bash
   cd "Projects/Tax automation"
   ```

2. Install dependencies (only needed the first time):

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. You should see output like:

   ```
   ▲ Next.js 16.3.3 (Turbopack)
     - Local:   http://localhost:3000
   ```

The server stays running in that terminal. Stop it with `Ctrl+C`.

> **Tip:** to confirm the build is healthy before a demo, run
> `npm run build` (production build) and `npm test` (165 engine tests). Both
> should pass with no errors.

---

## 2. Opening the application in a browser

Once `npm run dev` is running, open any browser and go to:

```
http://localhost:3000
```

You should land on the **Dashboard**. The left sidebar (desktop) or top bar
(mobile/tablet) shows the navigation:

| Section | Page | Route |
|---|---|---|
| Overview | Dashboard | `/` |
| Overview | Calculation History | `/history` |
| Tax | Individual Income Tax | `/tax/individual` |
| Tax | Business Tax | `/tax/business` |
| Tax | VAT | `/tax/vat` |
| Tax | Withholding Tax | `/tax/withholding` |
| Workflow | Documents, Compliance, Tax Assistant | marked **Soon** (not yet built) |

The "Soon" items are intentionally disabled — they are planned for later phases
and are not clickable. This is expected, not a bug.

---

## 3. Dashboard

**Route:** `/` · **Nav label:** "Dashboard"

The dashboard is the landing page. It has three regions:

### KPI tiles (top row)
Four metric tiles: **Estimated tax payable**, **Taxable income**, **VAT
position**, and **Compliance status**. In the current demo these are empty
placeholders ("—", `0`, "Not started") because no live data is connected yet.
This is expected — they are fed by running calculations, not a database of
filings.

### Quick actions card (left, wide)
Four clickable rows:
- **Calculate individual income tax** → `/tax/individual`
- **Import financial data** → jumps to the individual tax page and scrolls to the **Import from file** card (`/tax/individual#import`)
- **Browse calculation history** → `/history`
- **Assess VAT** → `/tax/vat`

### Active ruleset card (right)
Shows the currently active Individual Income Tax ruleset:
- **Jurisdiction · Year** — "Sri Lanka · 2025/2026"
- **Personal relief** — LKR 1,800,000
- **Top marginal rate** — 36%
- A **Verified** badge (green) — this confirms the figures are IRD-verified.
- A footer note explaining that new tax years are added as versioned rulesets.

**What to check:** the "Verified" badge should be green, not amber. If it is
amber ("Unverified"), the ruleset seed is not loaded — that would indicate a
broken state.

---

## 4. Individual Income Tax

**Route:** `/tax/individual` · **Nav label:** "Individual Income Tax"

### What it calculates
Sri Lanka resident individual income tax for Year of Assessment 2025/2026, on
the verified IRD rules:
- **Personal relief:** LKR 1,800,000 (deducted from assessable income; does not
  apply to investment-asset gains)
- **Progressive bands** on taxable income:

  | Band (LKR) | Rate |
  |---|---|
  | 0 – 1,000,000 | 6% |
  | 1,000,000 – 1,500,000 | 18% |
  | 1,500,000 – 2,000,000 | 24% |
  | 2,000,000 – 2,500,000 | 30% |
  | Above 2,500,000 | 36% |

- **Investment-asset gains:** taxed separately at **10%** on gross, with no
  personal relief applied.

### The form fields
The "Income details" card has six numeric fields (all in LKR, whole rupees):

| Field | What to enter |
|---|---|
| Employment income | Gross employment income for the period |
| Business income | Business/professional income |
| Investment income | Investment income (ordinary, not gains) |
| Other income | Any other assessable income |
| Allowable deductions | Qualifying deductions (reduces assessable income) |
| Investment asset gains | Gains from realisation of investment assets (separate 10% rate) |

Leave any field blank or `0` if it does not apply.

### How to perform a calculation
1. Navigate to `/tax/individual`.
2. Enter values in the fields (see sample below).
3. Click **Calculate tax** (bottom-right of the card).
4. The result appears below the form.

### Sample run (use this for the demo)
Enter these values, leaving the rest at `0`:

| Field | Value |
|---|---|
| Employment income | `5000000` |
| Allowable deductions | `0` |
| Investment asset gains | `0` |

Click **Calculate tax**.

### Expected result
- **Total tax payable:** LKR 672,000
- **Effective rate:** 13.44%
- **Taxable income:** LKR 3,200,000 (5,000,000 − 1,800,000 relief)
- **Personal relief:** LKR 1,800,000 (of LKR 1,800,000)

The **Calculation breakdown** table shows each progressive band with the amount
in the band and the tax for that band:
- 1,000,000 × 6% = 60,000
- 500,000 × 18% = 90,000
- 500,000 × 24% = 120,000
- 500,000 × 30% = 150,000
- 700,000 × 36% = 252,000
- **Total = 672,000**

The **Audit trail** card lists each step (assessable income → relief applied →
taxable income → each band → total) with the amount and a detail string.

### With investment-asset gains (second sample)
Set Employment income `5000000` and Investment asset gains `1000000`.
- **Total tax payable:** LKR 772,000 (672,000 band tax + 100,000 gains tax)
- The breakdown shows an extra "Investment asset gains" row at 10% = 100,000.
- The top tile sub-text reads "incl. investment gains".

### What indicates something is broken
- Total tax does not equal the sum of the per-band taxes shown.
- Personal relief shown is not capped at LKR 1,800,000.
- Investment-asset gains are reduced by personal relief (they must **not** be).
- Effective rate = 0% when tax is clearly due.
- Any "Unverified rules" badge instead of "IRD verified".

---

## 5. Value Added Tax (VAT)

**Route:** `/tax/vat` · **Nav label:** "VAT"

### What it calculates
Sri Lanka VAT for 2025/2026 on verified IRD rates:
- **Standard rate:** 18% (goods/services, excluding financial services)
- **Zero-rated (exports):** 0%
- **Financial services:** 18%
- **Registration thresholds (exclusive "more than"):**
  - Ordinary: > LKR 15,000,000/quarter **OR** > 60,000,000/12 months
  - Financial services: > 3,000,000/quarter **OR** > 12,000,000/annum
  - Non-resident e-platform: > 15,000,000/3 months **OR** > 60,000,000/12
    months (rule in force from **2025-10-01**)
- Voluntary registration available for persons carrying out taxable supplies.
- Mandatory registration for commercial importers/exporters regardless of
  turnover.

There are **two separate forms** on this page: a VAT calculation form and a
registration assessment form. They are independent.

### VAT calculation form (top card)
Fields (all LKR, whole rupees):

| Field | Meaning |
|---|---|
| Standard-rated supplies | Goods/services at 18% |
| Zero-rated supplies (exports) | Exports at 0% |
| Financial services | Financial services at 18% |
| Deductible input VAT | Input VAT you declare as creditable |
| Non-deductible input VAT | Recorded but never credited |

### How to test the VAT calculation
1. Go to `/tax/vat`.
2. Enter: Standard-rated supplies `1000000`, Deductible input VAT `80000`
   (leave the rest `0`).
3. Click **Calculate VAT**.

### Expected result
- **Output VAT:** LKR 180,000 (1,000,000 × 18%)
- **Input VAT (creditable):** LKR 80,000
- **Net VAT:** LKR 100,000
- **Position:** Payable (green/accent tone)
- The breakdown table shows one supply row (Standard 18%) plus the input-VAT
  deduction and the net line.

The audit trail lists each non-zero supply, the creditable and non-deductible
input VAT, and the net VAT position.

### Registration assessment form (lower card)
Fields: quarterly/annual turnover for ordinary and financial-services supplies,
platform turnover (3-month and 12-month), and three checkboxes:
- "I carry out taxable supplies" (enables voluntary registration)
- "I import/export goods for commercial purposes" (mandatory regardless)
- "I am a non-resident e-platform supplier" (assessed from 2025-10-01)

### How to test registration assessment
1. In the lower form, enter:
   - Ordinary taxable supplies — quarter: `16000000`
   - Ordinary taxable supplies — 12 months: `0`
   - Leave the checkboxes unchecked.
2. Click **Assess registration**.

### Expected result
- **Status badge:** "Registration required" (amber)
- **Reason:** "Turnover on ordinary taxable supplies exceeds the quarterly
  registration threshold."
- The threshold-check table shows one row: quarter threshold 15,000,000,
  turnover 16,000,000, Exceeds = **Yes**.
- Driving category: STANDARD.

### Other registration cases to try
- **Voluntary:** enter a small turnover (e.g. quarter `1000000`), tick "I carry
  out taxable supplies" → status "Voluntary registration".
- **Not required:** leave all turnover blank and all checkboxes unchecked →
  "Registration not required", with the note "No taxable supplies were
  recorded…".
- **Commercial import/export:** tick only "I import/export goods for commercial
  purposes" → "Registration required" regardless of turnover.

### What indicates something is broken
- Output VAT ≠ supply × rate (e.g. 1,000,000 × 18% should be exactly 180,000).
- Non-deductible input VAT is subtracted from output VAT (it must **not** be).
- The e-platform rule is applied at a date before 2025-10-01.
- Commercial import/export does not force mandatory registration.

---

## 6. Withholding Tax

**Route:** `/tax/withholding` · **Nav label:** "Withholding Tax"

### What it calculates
Sri Lanka WHT/AIT for 2025/2026 on verified IRD rates (effective 2025-04-01).
Eleven payment categories are encoded. Each has a rate and, for two categories, a
monthly threshold (exclusive "exceeds" bound — when the aggregate monthly
payment exceeds it, WHT applies to the **full** payment).

| Category | Rate | Monthly threshold |
|---|---|---|
| Non-resident: transport/telecom (s85(2)) | 2% | — |
| Gem sale at an NGJA auction | 2.5% | — |
| Service fee to a resident non-employee | 5% | > LKR 100,000/month |
| Interest or discount paid | 10% | — |
| Rent to a resident person | 10% | > LKR 100,000/month |
| Lottery/betting/gambling winnings | 14% | — |
| Charge / natural-resource premium | 14% | — |
| Royalty | 14% | — |
| Rent to a non-resident | 14% | — |
| Service fee/insurance to a non-resident | 14% | — |
| Dividends | 15% | — |

### The form
- **Payment category** — a dropdown listing all categories with their rate.
- **Gross payment** — the payment amount (LKR).
- **Total to this recipient this month** — appears **only** for the two
  threshold categories (service fee, rent). Required to test the threshold.

### How to test each important category

#### A. No-threshold category (e.g. Dividends)
1. Select **Dividends — 15%** in the dropdown.
2. Enter Gross payment `1000000`.
3. Click **Calculate withholding**.

**Expected:**
- WHT rate: 15%
- Withholding tax: LKR 150,000
- Net payment: LKR 850,000
- Badge: "Subject to WHT"
- No threshold-check card appears (no threshold for dividends).

#### B. Threshold category — threshold EXCEEDED (Rent to resident)
1. Select **Rent to a resident person — 10%**.
2. Enter Gross payment `500000`.
3. Enter Total to this recipient this month `120000` (exceeds 100,000).
4. Click **Calculate withholding**.

**Expected:**
- Withholding tax: LKR 50,000 (10% of the full 500,000)
- Net payment: LKR 450,000
- A **Threshold check** card appears showing: threshold 100,000, aggregate
  120,000, "Exceeded — WHT applies".

#### C. Threshold category — threshold NOT exceeded
1. Same category (Rent to a resident person).
2. Gross payment `500000`, monthly aggregate `80000` (does not exceed 100,000).
3. Calculate.

**Expected:**
- Withholding tax: LKR 0 (no WHT withheld — threshold not exceeded)
- Net payment: LKR 500,000
- Badge: "No WHT withheld"
- Threshold check card: "Not exceeded — no WHT".

> **Note the "full payment" rule:** when the threshold is exceeded, the rate
> applies to the **entire** gross payment, not just the portion above the
> threshold. This is the verified IRD treatment.

### What indicates something is broken
- WHT is withheld when the monthly aggregate is at or below 100,000 (the bound
  is exclusive — it must *exceed*).
- Only part of the payment is taxed when the threshold is exceeded (the full
  payment must be taxed).
- The rate for a category differs from the table above.
- The monthly-aggregate field is shown for a non-threshold category, or hidden
  for a threshold category.

---

## 7. Business Tax

**Route:** `/tax/business` · **Nav label:** "Business Tax"

### What it calculates
Sri Lanka company/business tax for Y/A 2025/2026 on verified IRD rates:

| Income category | Rate |
|---|---|
| Ordinary business income (standard) | 30% |
| Foreign-currency service income (remitted via bank) | 15% |
| Foreign-source income in foreign currency (remitted via bank) | 15% |
| Betting & gaming | 45% |
| Liquor & tobacco (manufacture/import/sale) | 45% |
| Investment-asset gains | 30% (separate, gross) |

**Key rule:** declared allowable expenses reduce **only ordinary (standard)
income**. The 15%/45% categories and investment-asset gains are computed on
**gross** — no expense netting, no cross-category allocation.

### The form
Two groups of fields:

**Income (six fields):** Ordinary business income, Foreign-currency service
income, Foreign-source income (FC), Betting & gaming, Liquor & tobacco,
Investment-asset gains.

**Declared allowable expenses (five fields):** Cost of goods sold, Operating
expenses, Other allowable expenses, Capital allowances, Other deductions.

### How to perform a calculation
1. Go to `/tax/business`.
2. Enter:
   - Ordinary business income: `1000000`
   - Cost of goods sold: `400000`
   - Leave all other fields at `0`.
3. Click **Calculate business tax**.

### Expected result
- **Total gross income:** LKR 1,000,000
- **Allowable expenses:** LKR 400,000
- **Taxable income:** LKR 600,000 (1,000,000 − 400,000, ordinary only)
- **Tax payable:** LKR 180,000 (600,000 × 30%)
- **Status badge:** "Tax computed"
- The **Computation** card lists each income and expense line, then "Ordinary
  business income (net of expenses)" = 600,000.
- The **Applicable business tax** table shows one component: Ordinary business
  income, taxable 600,000, rate 30%, tax 180,000. The total row reads 180,000.

### Multi-category sample (good for the demo)
- Ordinary business income: `1000000`
- Betting & gaming: `200000`
- Cost of goods sold: `400000`
- All else `0`.

**Expected:**
- Ordinary taxable = 600,000 → tax 180,000 (30%)
- Betting & gaming = 200,000 (gross, no expense netting) → tax 90,000 (45%)
- **Total tax = 270,000**
- The components table shows both rows; note the betting row is computed on
  gross 200,000, **not** reduced by the 400,000 expenses.

### What indicates something is broken
- Expenses are deducted from betting/gaming or investment-asset gains (they must
  only reduce ordinary income).
- The tax status reads "NOT_IMPLEMENTED" when only verified categories with
  income are present (the business ruleset is verified, so it should compute).
- Total tax ≠ sum of the per-component taxes in the table.
- Ordinary taxable income goes negative (it is clamped at 0; no loss
  carry-forward).

---

## 8. Calculation History

**Route:** `/history` (list) and `/history/[id]` (detail) · **Nav label:**
"Calculation History"

### How a calculation is saved
You do **not** click a separate "save" button. Every successful calculation
from the Individual, VAT, Withholding, and Business calculators is **saved
automatically** when it completes. The saved record includes:
- The calculation type and tax year
- The exact inputs you entered
- The applied ruleset ID (the rule version)
- The full result and audit trail
- A timestamp and a "local" user label

### How to find a saved calculation
1. Go to `/history` (sidebar: Overview → Calculation History).
2. You see a "Saved calculations" card listing every completed calculation,
   most-recent first, with a type badge and the date.
3. If the list is empty, you see an empty-state message explaining that
   completing a calculation will populate it.

### How to open one
Click any row. You are taken to `/history/<id>`.

### What you see on the detail page
- A header "Reopened calculation" with a **History** button (top-right) to go
  back.
- A **Calculation details** card: Type, Tax year, Assessed at, Applied rule
  version (the ruleset ID, highlighted), Completed (timestamp), User.
- A note that the audit trail reproduces exactly how the result was derived,
  with a badge showing the stored rule version.
- The **same result view** the live calculator produced (stats, breakdown
  table, audit trail) — re-rendered from the saved inputs and result.

### How to verify the audit information
1. Open a saved Individual calculation.
2. Confirm the "Applied rule version" matches the ruleset ID (e.g.
   `LK-individual-2025-26`).
3. Confirm the audit trail steps match the live result you saw when you ran it.
4. Because the rule version is stored with the record, reopening later
   reproduces the **same** figures even if the live ruleset is later updated.

### What indicates something is broken
- A saved calculation shows different figures when reopened than it did when
  first computed (the stored result must be used, not recalculated).
- The detail page 404s for an ID that was just saved (the JSON store may not be
  writing — check `data/calculations.json` exists).
- The list is empty after you have completed calculations (persistence is
  best-effort; a failed save should not crash the calculation, but the record
  should appear).

> **Note:** in dev, calculations persist to `data/calculations.json`
> (gitignored). Deleting that file clears the history. This is expected for a
> local dev adapter.

---

## 9. Individual Tax — file import flow

**Route:** `/tax/individual` · scroll to the **Import from file** card (or click
"Import financial data" on the dashboard, which links to
`/tax/individual#import`).

This flow lets you upload a CSV or Excel (`.xlsx`) file, preview it, map its
columns to the individual tax input fields, and run a calculation from the
mapped totals. The engine never reads the file until you map and confirm.

### Step-by-step
1. On `/tax/individual`, scroll down to the **Import from file** card.
2. Click **Choose File** (or the file input) and select a `.csv` or `.xlsx`
   file. The file must have a header row and at least one data row.
   - Max size: 8 MB.
   - Accepted types: `.csv`, `.xlsx`, `.xls`.
3. Click **Parse file**. A preview table appears (first 8 rows) with the
   detected headers, and a "Showing X of Y rows" note.
4. Under **Map columns to tax fields**, use each dropdown to map a spreadsheet
   column to a tax field (Employment income, Business income, Investment
   income, Other income, Allowable deductions, Investment asset gains). You can
   leave fields unmapped (they default to 0).
5. As you map columns, the **Mapped totals (summed)** section updates, showing
   the summed value for each mapped field.
6. Click **Calculate from import** (bottom-right). The mapped totals are sent
   to the same deterministic engine, and the result appears below using the
   same result view as the manual form.

### Sample file
A CSV like this works:

```csv
Employment,Business,Deductions
5000000,0,0
3000000,0,0
```

Map "Employment" → Employment income, "Deductions" → Allowable deductions.
The summed employment income will be 8,000,000; click calculate and you get a
result based on that total.

### Expected result
The result view is identical to the manual Individual Tax calculation — same
stats, breakdown table, and audit trail. The audit trail's first step shows the
income components summed (e.g. `5000000 + 3000000 − deductions 0`).

### What indicates something is broken
- A valid CSV/XLSX fails to parse with "The file could not be parsed."
- The preview table is empty for a file with data.
- Mapped totals do not equal the sum of the mapped column's numeric cells.
- Non-numeric cells in a mapped column are treated as numbers (they should be
  read as 0, not crash the sum).
- The "Calculate from import" button does nothing or errors silently.

---

## 10. What successful results look like

Across all four calculators, a healthy result shares these traits:

- **A green/positive "IRD verified" badge** appears in the page header and in
  the result's breakdown card header.
- **Four stat tiles** appear at the top of the result with values formatted as
  `LKR 1,234,567` (tabular-aligned numbers).
- **A breakdown card** with a table (bands/supplies/categories/components) where
  every row's tax equals `amount × rate`, and the total row equals the sum of
  the rows.
- **An audit trail card** as the final section, listing each step with a label,
  an amount, and a detail string. The last step is always the total.
- **No "Unverified" or "NOT_IMPLEMENTED" badge** for the verified Sri Lankan
  rulesets (all four 2025/2026 sets are verified).

For Individual and Business tax, money is displayed in whole rupees with
thousand separators. Rates display as `18%`, `2.5%`, etc.

---

## 11. Errors & validation states to test

The engine validates server-side and returns friendly error lists. Intentionally
trigger these to confirm validation works:

### Individual / VAT / Business — negative numbers
- Enter `-100` in any amount field and submit.
- **Expected:** a red error panel titled "Please fix the following:" listing
  `<field> cannot be negative.`

### Individual / VAT / Business — decimals
- Enter `1000.50` in an amount field.
- **Expected:** validation error `<field> must be a whole number of rupees.`
  (the engine works in integer LKR).

### Withholding — missing monthly aggregate
- Select **Rent to a resident person**, enter a gross, leave the monthly
  aggregate blank, and submit.
- **Expected:** error "The monthly aggregate payment is required for this
  category (to check the LKR 100,000 threshold)."

### Withholding — no category selected
- (Hard to trigger via the UI since a category is always selected, but) if the
  category were empty, you would get "A valid payment category must be
  selected."

### VAT registration — invalid turnover
- Enter a negative number in a turnover field and assess.
- **Expected:** validation error for that field.

### Upload — empty / unsupported file
- Click **Parse file** without choosing a file.
  - **Expected:** "No file provided."
- Upload a `.txt` or `.pdf`.
  - **Expected:** "Unsupported file type. Upload a CSV or Excel (.xlsx) file."
- Upload an empty CSV (0 bytes or headers only).
  - **Expected:** "The uploaded file is empty." or "The file contains no usable
    data rows."

### Upload — oversize file
- Upload a file larger than 8 MB.
  - **Expected:** "File is too large (max 8 MB)."

### History — missing record
- Navigate to `/history/does-not-exist`.
  - **Expected:** the branded not-found page (404) with "Page not found" and
    links back to the dashboard and history.

### What indicates validation is broken
- A negative or decimal input is silently accepted and produces a figure.
- No red error panel appears when invalid input is submitted.
- The form crashes or shows a raw stack trace instead of a friendly message.

---

## 12. Pre-demo QA checklist

Run through this before demonstrating to the accounting firm. Each item has a
clear pass/fail signal.

### Build health
- [ ] `npm run dev` starts without errors.
- [ ] `npm run build` completes (9 routes generated).
- [ ] `npm test` passes (165 tests).
- [ ] `npm run typecheck` and `npm run lint` are clean.

### Navigation & shell
- [ ] Sidebar (desktop) shows all four tax pages + Dashboard + History; "Soon"
      items are visually disabled.
- [ ] Mobile/tablet top nav is a horizontally scrollable list of the live pages.
- [ ] Every sidebar link loads its page (200, no error overlay).
- [ ] The "Verified" badge on the dashboard ruleset card is green.

### Individual Income Tax
- [ ] Employment `5000000`, deductions `0` → total tax **LKR 672,000**, rate
      **13.44%**, taxable **3,200,000**, relief **1,800,000**.
- [ ] Add investment-asset gains `1000000` → total tax **LKR 772,000** with an
      "incl. investment gains" sub-note.
- [ ] Negative input shows a red validation error panel.

### VAT
- [ ] Standard supplies `1000000`, deductible input `80000` → output VAT
      **180,000**, net VAT **100,000**, position **Payable**.
- [ ] Registration: ordinary quarter `16000000` → **Registration required**,
      threshold row shows 15,000,000 vs 16,000,000, Exceeds **Yes**.
- [ ] Registration with commercial import/export checkbox only → **Registration
      required** regardless of turnover.

### Withholding Tax
- [ ] Dividends `1000000` → WHT **150,000**, net **850,000**.
- [ ] Rent to resident, gross `500000`, aggregate `120000` → WHT **50,000**
      (full payment), threshold exceeded.
- [ ] Same, aggregate `80000` → WHT **0**, "No WHT withheld".

### Business Tax
- [ ] Ordinary `1000000`, COGS `400000` → taxable **600,000**, tax **180,000**.
- [ ] Add betting & gaming `200000` → tax **270,000** (betting on gross, not
      reduced by expenses).

### History
- [ ] After running the above, `/history` lists each saved calculation.
- [ ] Opening one reproduces the exact result and shows the stored rule version.
- [ ] `/history/does-not-exist` shows the branded 404 page.

### Upload flow
- [ ] A CSV with a header row parses and previews.
- [ ] Mapping columns updates the "Mapped totals" live.
- [ ] "Calculate from import" produces a result identical in shape to the
      manual form.

### Visual consistency
- [ ] All tax pages use the same page header with a verified status badge.
- [ ] All forms use the same input styling (border, focus ring, hint/error
      placement).
- [ ] All result tables use consistent padding and a highlighted totals row.
- [ ] No raw URLs, placeholder "lorem", or demo-only text visible in copy.
- [ ] No unhandled console errors in the browser DevTools during the flows.

---

## Demo Run

The fastest complete sequence to demonstrate the application end-to-end.
Estimated time: ~5 minutes.

1. **Start** — `npm run dev`, open `http://localhost:3000`.
2. **Dashboard** — point out the "Active ruleset" card: **Verified**, Sri Lanka
   2025/2026, personal relief LKR 1,800,000, top rate 36%. Emphasise that the
   rule engine is the source of truth and AI never computes tax.
3. **Individual Income Tax** — sidebar → Individual Income Tax. Enter
   Employment `5000000`, click **Calculate tax**. Show total tax **LKR
   672,000**, scroll the audit trail. Mention every step is reproducible.
4. **Withholding Tax** — sidebar → Withholding Tax. Pick **Dividends — 15%**,
   gross `1000000`, calculate → WHT **150,000**, net **850,000**. Then switch
   to **Rent to a resident person**, gross `500000`, monthly aggregate
   `120000` → WHT **50,000** and the threshold-check card showing "Exceeded".
5. **VAT** — sidebar → VAT. Standard supplies `1000000`, deductible input
   `80000` → net VAT **100,000 Payable**. Then in the registration form enter
   ordinary quarter `16000000` → **Registration required**.
6. **Business Tax** — sidebar → Business Tax. Ordinary `1000000`, betting &
   gaming `200000`, COGS `400000` → total tax **270,000**. Point out betting
   is taxed on gross (90,000) while ordinary is reduced by expenses (180,000).
7. **History** — sidebar → Calculation History. Show the list of saved runs,
   open the Individual one, show the stored rule version and that the figures
   match exactly.
8. **Close** — restate: deterministic, IRD-verified 2025/2026, every figure
   audited, nothing AI-invented.

> If anything in the Demo Run shows a different figure than listed, stop and
> consult the relevant section above — the expected values were verified
> against the engine and should match exactly.
