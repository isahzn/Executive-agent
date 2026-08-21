# Accounting-Firm Outreach — Campaign Config (Round 4)

Prep pack for the small-accounting-firm outreach round. The core system
(`send_proposals.py` + `send_log.csv`) is **untouched** — this folder is pure
configuration, so the campaign can be changed without any code changes.

## File map

| File | What it is |
|---|---|
| `campaign.md` | Target, service, goal, CTA, sender, volume |
| `outreach-rules.md` | Non-negotiable data + sending rules |
| `system-instructions.md` | System prompt for the AI when preparing a round |
| `personalization-variables.md` | Every placeholder and who fills it in |
| `templates/first_email.txt` | First-touch email skeleton |
| `templates/followup_1.txt` / `_2.txt` / `_3.txt` | Follow-up messages (3) |
| `leads/leads_master.csv` | Master lead table (all fields incl. research notes) |
| `leads/companies_round4.txt` | Script input — firm + primary email |
| `leads/recipients_round4.txt` | Script input — addresses, source, domain |
| `emails/cold_emails.txt` | Script input — personalized emails per firm |
| `.env.example` | Required Gmail keys (copy to root `.env`) |

## How it fits the existing system

`send_proposals.py` already accepts `--list`, `--recipients` and `--emails`
flags, so this folder plugs straight in — **no code changes**. The script:
verifies addresses, dedups against `send_log.csv`, personalizes the proposal
PDF, attaches the website demo for firms with no website, sends via Gmail
SMTP, and logs every attempt.

## Tomorrow: plug in firms and test (~15 min)

1. Paste your firm list into `leads/leads_master.csv` (one row per firm).
2. Copy each firm into `leads/companies_round4.txt` and
   `leads/recipients_round4.txt` (tab-separated; firm names must match exactly).
3. Write each firm's email into `emails/cold_emails.txt` using
   `templates/first_email.txt` — the worked `Example Accountants` block shows
   the exact format.
4. Verify (sends nothing — but note the selftest still needs `.env` in the
   project root because the script loads credentials even in selftest mode):
   ```
   python send_proposals.py --selftest --list accounting-outreach/leads/companies_round4.txt --recipients accounting-outreach/leads/recipients_round4.txt --emails accounting-outreach/emails/cold_emails.txt
   ```
5. Run the real campaign with the same flags (drop `--selftest`) once the
   selftest looks right.

## Notes

- The `Example Accountants` row is only for testing the file formats —
  replace or delete it before a real run.
- Follow-ups are prepared in `templates/` but not wired into the script yet
  (by design — the outreach system itself is not built yet).
