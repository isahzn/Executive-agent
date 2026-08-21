# Personalization Variables

Two kinds of variables:

## 1. Auto-replaced by send_proposals.py (at send time)

| Placeholder | Replaced with |
|---|---|
| `{{company_name}}` / `{{company}}` | Firm name |
| `[Firm Name]` / `[Client Name]` / `[Company Name]` | Firm name |

## 2. Filled in by the AI/human while writing each firm's email
(not auto-replaced yet — deliberately, since the outreach system isn't built)

| Variable | Example | Used in |
|---|---|---|
| `{{contact_name}}` | Jane | first email, follow-ups |
| `{{firm_name}}` | Example Accountants | subject, body |
| `{{location}}` | Leeds, UK | body observation |
| `{{research_observation}}` | "a four-person practice serving owner-managed clients around Leeds" | body ¶1 |
| `{{pain_point}}` | "manual document intake eats hours each month" | body ¶2 |
| `{{rating}}` | 4.6★ | research notes only |
| `{{employees}}` | 4 | research notes only |
| `{{service_short}}` | "a small document processor" | body ¶3 |
| `{{cta}}` | "open to a quick 15-minute conversation this week?" | body ¶4 |

Note: to make `{{contact_name}}` and friends auto-replace later, the core
code would need one small addition — intentionally NOT done in this prep
round.
