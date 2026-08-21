# Campaign — Small Accounting Firms (Round 4)

One page of decisions for this outreach round. Edit this file to change the
campaign — no code changes needed.

## Target
- **Firms:** small CPA / accounting / bookkeeping / tax / audit firms
- **Size:** 2–15 employees; micro firms (1–5 staff) preferred
- **Ratings:** prefer 2–5★ Google-rated firms, but never skip an unrated firm
- **Regions:** global mix — UK, US, Canada, Australia/NZ, UAE, Sri Lanka,
  India, South Africa, Ireland
- **Fresh leads only:** never repeat firms from earlier rounds (check
  `send_log.csv` and prior `companies_roundN.txt` files)

## Service (what we're offering)
Document-processing / automation workflow:
1. Automated client-document intake, sorting and data entry (receipts, bank
   statements, invoices, PDFs, portal files)
2. Optional automatic reply agent — no lead or client enquiry ever missed
3. Automatic follow-ups built in
4. If the firm has NO website: website build offer + demo attached

## Goal
Get interested firms to **respond and book a conversation** — a short intro
call, not a pitch.

## CTA style
- Exactly ONE simple CTA per email, e.g. "Would you be open to a quick
  15-minute conversation this week?"
- Never multiple questions, never a hard calendar-booking push.
- (Deliberate change from earlier rounds' "want me to send the idea?" — the
  campaign goal is now a booked conversation.)

## Sender
- Name: **Isa, Floza Solutions**
- Address: `GMAIL_USER` from `.env` (project root)

## Volume
- ~30 firms per round, up to 5 verified addresses per firm
- Random 10–20 s delays between sends (handled by `send_proposals.py`)

## Pricing / experience line
- Kept by default: "I'm doing this for the experience, so any price works —
  even free."
- To change it, edit `templates/first_email.txt` and the follow-ups — no code
  changes needed.
