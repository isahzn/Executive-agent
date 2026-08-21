# Outbound Email Automation — Specification

**Status:** Draft (pre-implementation)
**Date:** August 4, 2026
**Author:** Buffy (assistant), based on interview with the user (Isa)

---

## 1. Overview

A Python script that sends personalized proposal emails — with a personalized proposal PDF attached — to a list of companies, one at a time, from the user's Gmail account (via SMTP app password stored in `.env`). The script validates each address, personalizes the template and attachment, logs every attempt to a CSV, and prints a final summary.

The user's request also asked for the assistant to send these emails directly. **Scope of this document:** the full behavior spec. Implementation is a separate next step.

---

## 2. Goals

- Send one personalized proposal email per company in the list.
- Replace all placeholder formats in the template/PDF with the real company name.
- Attach a per-company personalized version of `Agentic Automation Proposal.pdf`.
- Never send duplicates (within a run and across runs, via log check).
- Skip invalid/empty addresses; validate emails before sending.
- Log every attempt (timestamp, company, email, status, error).
- Print a final summary: Total / Sent / Failed / Skipped.
- Natural-looking random delays (10–20 s) between sends.
- A connectivity test email to the owner's own address before the real run.

## 3. Non-Goals (out of scope)

- No automatic retry (user explicitly overrode rule #10 — see §9).
- No rate-limit management beyond the random delay.
- No tracking of opens/clicks, no read receipts.
- No mail merge UI — a plain script run from the terminal.
- No HTML email styling — plain-text body with a PDF attachment.

---

## 4. Inputs

| File | Format | Notes |
|---|---|---|
| `Companies and thier emails.txt` | Tab-separated, no header: `Company Name\temail` | 9 rows. Filename typo ("thier") kept as-is. |
| `Email Template.txt` | Plain text | Uses `[Firm Name]` placeholder; no signature currently. |
| `Agentic Automation Proposal.pdf` | PDF, 2 pages | Contains `[Client Name]` placeholder ("Prepared for: [Client Name]"). Currently signed "Prepared by: Hassen, Floza Automations". |
| `.env` | KEY=VALUE lines | Gmail SMTP credentials (app password). **Credential-blocked from reading in this environment — variable names must be confirmed before implementation.** |

**Source list (9 rows):**

1. `Baker Tilly Sri Lanka (Edirisinghe & Co.)` → `info@bakertilly.lk`
2. `SPM Corporate Services (Pvt) Ltd` → `spm@sltnet.lk`
3. `Sumudu BPO (Pvt) Ltd` → `info@sumudubpo.com`
4. `Unknown (Hostinger temporary website)` → `info@peachpuff-sandpiper-684882.hostingersite.com`
5. `First Accounting Solutions` → `haroon@firstaccsolutions.com`
6. `Qcontra Accounting Consultants` → `info@qcontra.com`
7. `H. T. Peiris & Company` → `audit@htpeiris.com`
8. `MAS Associates` → `info@masassociates.lk`
9. `Finlorex Associates` → `finlorexassociate@gmail.com`

---

## 5. Environment & Credentials

- **Language:** Python 3 (single script, e.g. `send_proposals.py`).
- **Auth:** Gmail SMTP app password from `.env` (smtp.gmail.com, port 587, STARTTLS). *User confirmed: not OAuth.*
- **Suggested `.env` keys (to confirm):** `GMAIL_USER`, `GMAIL_APP_PASSWORD` (or whatever names the user already used).
- **Sender identity:**
  - From name: **Isa, Floza Solutions**
  - From address: the Gmail address in `.env`
- **Dependencies (minimal):** Python stdlib `smtplib`, `email`, `csv`, `re`, `random`, `time`, `os` + a `.env` parser (hand-rolled or `python-dotenv` if available) + **pypdf** for PDF manipulation. `PyPDF2` is already installed in the environment (pypdf-compatible API).
- **Runtime:** Windows, bash shell.

---

## 6. Main Flow (sequential)

1. **Load & parse** the company list (tab-separated; skip empty lines).
2. **Read** the email template and the PDF path.
3. **Load** Gmail credentials from `.env` (abort with a critical error if missing).
4. **Load existing send log** (`send_log.csv`, if any) to build a "already sent" set (email → status == Sent/Failed counts; see dedup rules §10).
5. **Connectivity test:** send a test email `"hi its working"` (subject: `Test — hi its working`, or similar) to **isamohommedh@gmail.com**.
   - Test succeeds → proceed automatically (no confirmation; user confirmed).
   - Test fails → **critical error**: stop, print the reason, do not send anything else. (This is the one case where user confirmation/attention is required.)
6. For each company, **in order, one at a time**:
   a. Clean the company name (see §7).
   b. Validate the email (see §8). Invalid → log `Skipped`, continue.
   c. Check dedup (see §10). Already sent → log `Skipped`, continue.
   d. Personalize the subject and body (see §7).
   e. Personalize the PDF attachment (see §9) into a temp file.
   f. Compose MIME message (plain text body + PDF attachment, UTF-8) and send via SMTP.
   g. Log the result (`Sent` or `Failed` + error message).
   h. Clean up the temp PDF (delete after send).
   i. Wait a random 10–20 s delay before the next company (including before/after the test email as appropriate).
7. After all companies are processed → print summary (see §11).

**No confirmation is requested during the run** unless a critical error occurs (test failure, missing credentials, no valid rows, etc.).

---

## 7. Personalization Rules

### 7.1 Company name cleaning
- Strip **parenthetical content**: `Baker Tilly Sri Lanka (Edirisinghe & Co.)` → `Baker Tilly Sri Lanka`.
- Strip **trailing geographic qualifiers**: e.g. drop `Sri Lanka` → **`Baker Tilly`** (user's explicit example: "don't add the sri lanka part just baker tilly").
  - Implement a small stoplist of geographic suffixes (e.g. `sri lanka`, `lanka`, `uk`, `uae`, `usa`) applied case-insensitively to the tail of the name.
  - If the cleaned result is empty/unrecognizable, fall back to the full listed name.
- `(Pvt) Ltd` / `Ltd` / `Co.` style suffixes inside parentheses are removed by the parenthesis rule.
- **Unknown/no real name** (e.g. the "Unknown (Hostinger temporary website)" row): fall back to **`Floza Automations`**.

### 7.2 Placeholder replacement — support ALL variants
Replace every occurrence (case-insensitive) of:
- `{{company_name}}` and `{{company}}`
- `[Firm Name]`, `[Client Name]`, `[Company Name]`

…with the cleaned company name, in **both the email body and the PDF** (see §9).

The email template currently only uses `[Firm Name]`, but the rules mention `{{company_name}}`, so the script handles both. **Note:** the user answered "all" for placeholder formats — the script should use one shared replace function.

### 7.3 Subject (exact format)
```
Professional Document Automation for {Cleaned Company Name}
```
Examples:
- `Professional Document Automation for Baker Tilly`
- `Professional Document Automation for Floza Automations` (the "Unknown" row)

### 7.4 Body
- Start from `Email Template.txt` verbatim.
- Replace placeholders (§7.2).
- Keep everything else **exactly the same** — only fix grammar if needed (template has none pending).
- **Append a signature block:**
  ```
  Best regards,
  Isa
  Floza Solutions
  ```
  (User: "Remove Hassen and Enter 'Isa, Floza Solutions'". The exact wording of the closing line is a minor open question — see §13.)

---

## 8. Email Validation (before sending)

1. **Format check:** regex `^[^@\s]+@[^@\s]+\.[^@\s]+$`.
   - Empty / missing address → `Skipped` (reason: "empty email").
2. **Full SMTP probe** (user selected this over format-only or MX-lookup):
   - Connect to the recipient domain's MX server (or A record), send `HELO`/`EHLO`, `MAIL FROM:<sender>`, `RCPT TO:<recipient>`.
   - `550`/`5xx "user unknown"` → `Skipped` (reason: "address rejected by server").
   - Inconclusive result (timeout, connection refused, server refuses probes — common for Gmail/Outlook) → **proceed with the send attempt anyway**; the send itself is the final arbiter.
   - Hard timeouts (e.g. 10 s) so a dead domain doesn't stall the run.
3. `Skipped` rows are logged with the reason.

---

## 9. PDF Attachment

- The 2-page `Agentic Automation Proposal.pdf` is attached to every email, **personalized per company** (user selected "Personalize PDF per company").
- Approach: replace `[Client Name]` (and other §7.2 placeholders) inside the PDF.
  - **Technical risk (important):** in-place text replacement in an existing PDF is unreliable with pypdf/PyPDF2 because text is split across content-stream operations. **Mitigation plan, in order:**
    1. Try pypdf content-stream patching for `[Client Name]`.
    2. If patching fails or the placeholder is not found in the extracted text, fall back to **regenerating a minimal branded PDF** (reportlab) that mirrors the proposal's key content with the company name filled in.
    3. Final fallback: attach the generic PDF untouched (logged in the summary).
  - A verification step asserts the placeholder text is gone from the generated PDF before attaching; if not, use the fallback.
- **Storage:** temp folder (system temp or `temp_pdfs/`), auto-deleted after each send (user selected "temp folder, auto-cleaned"). A safe filename per company (slugified) avoids path issues.
- **Open question:** the PDF currently says "Prepared by: Hassen, Floza Automations". Should this also become "Isa, Floza Solutions"? See §13.

---

## 10. Deduplication & Duplicate Rules

- **Within a run:** process each row once; if two rows share the same email, the second is `Skipped` ("duplicate address in list"). (No duplicates exist in the current list.)
- **Across runs:** before sending, load the existing `send_log.csv`; any email already logged as `Sent` (or `Failed` for manual-recovery cases, per user's manual-handling preference) is skipped. The current list is a static file, so a re-run must not double-send.
- One email per address, ever.

---

## 11. Logging & Summary

### 11.1 Log file — `send_log.csv` (append mode, one row per attempt)
Columns (in order):
1. `timestamp` — local machine time (ISO format `YYYY-MM-DD HH:MM:SS`; user: "no need" for TZ config → use local)
2. `company_name` — the cleaned name
3. `email`
4. `status` — one of `Sent`, `Failed`, `Skipped`
5. `error_message` — empty unless Failed/Skipped

The test email may be logged too (company: `(test)`), or logged only to console — decide at implementation; recommended: log it to the CSV for a full audit trail.

### 11.2 Console summary (end of run)
```
=== Summary ===
Total:    9
Sent:     N
Failed:   N
Skipped:  N
```
Plus a one-line detail list of Failed/Skipped entries with reasons.

---

## 12. Retry, Delay & Failure Policy

- **Retry: OVERRIDDEN by the user.** Rule #10 (retry once after 30 s) is **removed**. Try each email **once**; on failure, log `Failed` + error and move on. The user will handle failures manually ("leave it up to me i will do it").
- **Delay:** random 10–20 seconds between emails (rule #11) using `random.uniform(10, 20)` — applies between all sends, including after the test email.
- **Critical errors that abort the run:** missing/invalid `.env` credentials, SMTP connection failure on the *test* email, zero valid rows, template/PDF file missing.
- **Non-critical errors** (individual send failures): log and continue.

---

## 13. Open Questions / Decisions Pending

1. **`.env` variable names** — must be confirmed before implementation (file is credential-blocked; expected keys: `GMAIL_USER`, `GMAIL_APP_PASSWORD` or similar).
2. **PDF "Prepared by" line** — update "Hassen, Floza Automations" → "Isa, Floza Solutions" inside the personalized PDFs, or leave the PDF untouched except `[Client Name]`?
3. **Signature closing wording** — exact block: `Best regards,` / `Isa` / `Floza Solutions` — confirm or adjust.
4. **Test-email subject/body wording** — confirm `"hi its working"` body and a simple subject like `Test — hi its working`.
5. Whether the "Unknown (Hostinger temporary website)" row should still get the SMTP probe given the disposable domain (user said process it anyway; the probe will likely skip it if the domain rejects).

---

## 14. Acceptance Criteria

- Script runs end-to-end from a single terminal command.
- Test email arrives at isamohommedh@gmail.com; run then proceeds automatically.
- Every company gets exactly one email attempt; subject contains the cleaned company name; body matches the template (placeholders replaced, signature appended); personalized PDF attached.
- `send_log.csv` contains one row per attempt with all 5 columns; summary printed with correct totals.
- Re-running the script does not re-send to addresses already in the log.
- No exceptions crash the run; failures are logged and processing continues.

---

## 15. Implementation Steps (next phase, not this spec)

1. Confirm `.env` keys (ask user to paste variable names).
2. Write `send_proposals.py` (parse → validate → test email → loop send → log → summary).
3. Implement PDF personalization with fallback chain (§9).
4. Test with `--dry-run`-style console check first, then the real test email, then the full run.
5. Review, then execute the run per the approved spec.
