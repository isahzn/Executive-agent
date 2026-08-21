# Floza Solutions — What I Do & How to Run My Email Campaigns

## Who I Am

Automation specialist (**Isa, Floza Solutions**). I build systems that do the busywork for small businesses:

- **Document automation** — auto-generated, personalized proposals / invoices / reports
- **Email & outreach automation** — cold campaigns, auto-reply agents, automatic follow-ups
- **Website development** — modern, animated websites
- **AI agents** — custom agents for business workflows

I currently work **for experience — any price, even free.**

---

# COLD EMAIL CAMPAIGN PLAYBOOK

## 1. Trigger

When I say **"send emails"** (or "send another 30", "run the campaign", "start outreach", etc.), start a new outreach round immediately. **Do not ask for confirmation before starting.** Only stop if a critical error occurs (SMTP login failure, missing credentials, missing campaign files).

## 2. Target & Volume

- **Volume:** ~30 emails sent per round, up to **5 per company**.
- **Firms:** small accounting / bookkeeping / tax / audit firms — **the smaller the better** (2–15 employees; micro 1–5 staff preferred).
- **Ratings:** prefer 2–5★ Google-rated firms, but **never skip a firm just because it's unrated**.
- **Regions:** global mix — UK, US, Canada, Australia/NZ, UAE, Sri Lanka, India, South Africa, Ireland.
- **Fresh leads only:** never repeat companies already covered in previous rounds (check `send_log.csv` and prior `companies_roundN.txt` files).

## 3. Research (per company)

Find up to **5 published email addresses** per firm:

1. **Prioritize decision-makers:** Owner, Partner, Director, Managing Director, Accountant, Finance Manager — otherwise a general contact (info@, contact@, admin@, accounts@, etc.).
2. **ONLY use emails actually published** on their website, directory listing, or social media. **Never guess or construct addresses.**
3. Remove duplicates and obviously invalid addresses.
4. Record: **Google star rating** if visible, **employee-count evidence**, whether they **have a website**, and the **source URL**.

## 4. Write the Email (Alex Berman formulas)

Every email is individually researched and personalized. **Never send a generic template.**

### Formula 1 — PPC (Pain + Partial Solution + CTA) — use by default
```
Hi {{name}},

I noticed {{specific observation about company}}.

Looks like {{specific pain/problem}}.

I found a few opportunities where automation could help reduce {{problem}}.

Would you be open to me showing you what I found?
```

### Formula 2 — PC (Pain + CTA) — when the problem is obvious
Personalized observation → specific pain → one simple question CTA.

### Formula 3 — PEC (Pain/Desire/Fear + Evidence + CTA) — when there's strong business motivation
Identify the desire/fear → add proof ("We helped similar firms cut X hours…") → one simple next step.

### Mandatory content — EVERY email must include:
1. A **real researched observation** about the company (never fake compliments like "love your website").
2. A **specific pain point** connected to that observation.
3. A **partial solution / insight** — never the full pitch.
4. **Exactly ONE simple CTA** ("Open to seeing what I found?" / "Worth a quick look?" / "Would you like me to send over the idea?"). Never ask for a meeting, a call slot, or multiple questions.
5. **The experience line:** "I'm doing this for experience — any price, even free."
6. **The auto-reply agent line:** they can get an auto-reply agent so they **never miss a lead**.
7. **The automatic follow-ups line:** automatic follow-ups are included.
8. **If the firm has NO website:** offer website building ("I can also make websites") — the demo will be attached.

### Subject (exact format)
```
Document Automation for {{company_name}}
```
`{{company_name}}` is replaced with the actual firm name (also handle `[Firm Name]` / `[Client Name]` variants).

### NEVER include
- "We are Floza Automations and we help businesses…" intros
- Long explanations of the service
- Large blocks of text
- Sales-heavy language
- Multiple questions or calendar-booking requests

## 5. What to Send (attachments)

- **ALWAYS:** `Agentic Automation Proposal.pdf` — personalized per company (placeholders like `[Client Name]` replaced with the firm name, layout untouched).
- **ONLY IF the firm has no website:** also attach `website_demo.html` (a dark, colorful 3D-stripes demo site) + the website offer line.
- The PDF goes on every email, including website-less ones.

## 6. Sending Rules (non-negotiable)

1. Process **one company at a time**; up to **5 verified addresses** per company.
2. **Verify each address** (format + SMTP probe) before sending; skip rejected or unconfirmed alias addresses.
3. **Never send to an address already in `send_log.csv`** — no duplicates, ever.
4. On failure: **retry once after 30 seconds**; if it fails again, mark **Failed** and continue.
5. Wait a **random 10–20 seconds** between emails to avoid looking automated.
6. **Log every attempt** to `send_log.csv`: timestamp, company, email, status (Sent / Failed / Skipped), error.
7. **Continue until every company is processed.** Don't stop unless there's a critical error.

## 7. Files & Formats

- `companies_roundN.txt` — tab-separated: `Company Name<TAB>primary@email.com`
- `recipients_roundN.txt` — tab-separated: `Company Name<TAB>email<TAB>source<TAB>domain`
- `cold_emails.txt` — the personalized emails, one block per company separated by a line of `---`:
```
COMPANY: Exact Company Name
SUBJECT: Document Automation for Company Name
HAS_WEBSITE: no          <- set to 'no' only if the firm has no website
BODY:
<email body lines>

---
```
- **Company names must match exactly** across all three files (the script uses them as keys).

## 8. Run the Campaign

Verify without sending:
```
python send_proposals.py --selftest --list companies_roundN.txt --recipients recipients_roundN.txt --emails cold_emails.txt
```
Then run for real:
```
python send_proposals.py --list companies_roundN.txt --recipients recipients_roundN.txt --emails cold_emails.txt
```

## 9. Completion Report

When all companies are processed, report:
- Companies processed
- Total emails found / sent / failed / skipped
- Success rate
- Which firms received the website demo

## 10. Deliverables per Round

- `companies_roundN.txt`, `recipients_roundN.txt`, `cold_emails.txt` (N = next round number)
- Updated `send_log.csv`
- A short summary of results
