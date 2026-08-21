# Outreach Rules — Accounting Campaign (Round 4)

Non-negotiable rules. Follow these when building the list and writing emails.

## Lead data
1. **Fresh leads only** — check `send_log.csv` and prior `companies_roundN.txt`
   before adding a firm.
2. Record every field in `leads/leads_master.csv` for each firm (firm name,
   contact name, email, website, location, research notes, ...).
3. **Only use emails actually published** on the firm's website, directory
   listing or social media. Never guess or construct addresses.
4. Up to 5 candidate addresses per firm; prefer decision-makers (Owner,
   Partner, Director, Managing Director, Accountant, Finance Manager).

## File formats (consumed by send_proposals.py)
5. **Firm names must match EXACTLY** across all three script files (companies,
   recipients, cold_emails) — the script uses them as keys.
6. `leads/companies_round4.txt` — `Company Name<TAB>primary@email.com`
   (one per line, no header)
7. `leads/recipients_round4.txt` —
   `Company Name<TAB>email<TAB>source<TAB>alias_domain`
   (`source` = site | social | directory | alias; `alias_domain` optional)
8. `emails/cold_emails.txt` — one block per firm:
   `COMPANY:` / `SUBJECT:` / `HAS_WEBSITE:` / `BODY:` (see the worked example
   in that file)

## Sending behavior (handled by send_proposals.py — do not change the script)
9. Every address is format-checked and SMTP-probed before sending; rejected or
   unconfirmed alias addresses are skipped.
10. Never send to an address already in `send_log.csv` — no duplicates, ever.
11. Retry once after 30 s on failure; then mark Failed and continue.
12. Random 10–20 s delay between sends.
13. Log every attempt to `send_log.csv` (timestamp, firm, email, status, error).
14. Never send a generic email — every firm needs its own researched email in
    `cold_emails.txt`; the script aborts if one is missing.
15. No website? Set `HAS_WEBSITE: no` — the website demo is attached and the
    website offer line is used.

## Before every run
16. Run the selftest first (see README). It sends nothing.
