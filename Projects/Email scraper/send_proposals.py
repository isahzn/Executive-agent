#!/usr/bin/env python3
"""
Outbound cold-email automation for Isa, Floza Solutions.

For each lead (small accounting firm): read the personally-researched cold
email (subject + body, written per lead using PPC/PC/PEC formulas) from
cold_emails.txt, personalize the proposal PDF, and send. Collect up to 5
candidate addresses per company (published ones plus SMTP-probed common
aliases), send to each verified address via Gmail SMTP (app password from
.env), retry once on failure, log every attempt, and print a summary.

Leads WITHOUT a website get the website demo (website_demo.html) attached
alongside the PDF. Leads without a personalized email on file are SKIPPED
(no generic proposal emails are ever sent).

Usage:
    python send_proposals.py
        [--list companies.txt] [--recipients recipients.txt] [--emails cold_emails.txt]
        # connectivity test, then the campaign
    python send_proposals.py --selftest  # verify parsing without sending
"""

import csv
import os
import random
import re
import smtplib
import socket
import subprocess
import sys
import tempfile
import time
from datetime import datetime
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr

from PyPDF2 import PdfReader, PdfWriter
from PyPDF2.generic import DecodedStreamObject, NameObject

BASE = os.path.dirname(os.path.abspath(__file__))
LIST_FILE = os.path.join(BASE, "Companies and thier emails.txt")
RECIPIENTS_FILE = os.path.join(BASE, "recipients.txt")
COLD_EMAILS_FILE = os.path.join(BASE, "cold_emails.txt")
PROPOSAL_PDF = os.path.join(BASE, "Agentic Automation Proposal.pdf")
WEBSITE_DEMO = os.path.join(BASE, "website_demo.html")
ENV_FILE = os.path.join(BASE, ".env")
LOG_FILE = os.path.join(BASE, "send_log.csv")

SENDER_NAME = "Isa, Floza Solutions"
ATTACH_NAME = "Agentic Automation Proposal.pdf"
DEMO_ATTACH_NAME = "website-demo.html"
TEST_RECIPIENT = "isamohommedh@gmail.com"
FALLBACK_COMPANY = "Floza Automations"
MP_ASSOCIATES = "MP Associates"  # real name behind the 'Unknown (Hostinger)' row
MAX_PER_COMPANY = 5
RETRY_DELAY = 30  # seconds before the single retry

# Common aliases generated per company domain (SMTP-probed before sending).
ALIAS_LOCAL_PARTS = [
    "info", "accounts", "tax", "admin", "hr", "audit", "contact",
    "careers", "finance", "support", "enquiries", "enquiry", "office",
    "secretary", "management", "director", "compliance", "operations",
    "payroll", "bookkeeping", "recruitment", "jobs", "mail", "hello",
    "general", "sales",
]
ALIAS_PROBE_POOL = 12

# Placeholder variants to replace with the company name (all formats).
PLACEHOLDER_RE = re.compile(
    r"(\{\{\s*company(?:_name)?\s*\}\}|\[(?:firm|client|company)\s*name\])",
    re.IGNORECASE,
)
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")

LOG_HEADER = ["timestamp", "company_name", "email", "status", "error_message"]


# --------------------------------------------------------------------------
# Small helpers
# --------------------------------------------------------------------------

def load_env(path):
    """Parse a KEY=VALUE .env file (values hidden from stdout)."""
    env = {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return env


def load_companies(path):
    """Parse the tab-separated company list into (name, email) rows."""
    rows = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if "\t" in line:
                parts = [p.strip() for p in line.split("\t") if p.strip()]
            else:
                parts = [p.strip() for p in re.split(r"\s{2,}", line) if p.strip()]
            if len(parts) >= 2:
                rows.append((parts[0], parts[-1]))
            elif len(parts) == 1 and EMAIL_RE.match(parts[0]):
                rows.append(("", parts[0]))
    return rows


def load_recipients(path):
    """Recipients file -> {company: [(email, source, alias_domain)]}."""
    rec = {}
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("\t")
            if len(parts) < 2 or not parts[0].strip():
                continue
            company = parts[0].strip()
            email = parts[1].strip()
            source = parts[2].strip() if len(parts) > 2 else "site"
            domain = parts[3].strip() if len(parts) > 3 else None
            rec.setdefault(company, []).append((email, source, domain))
    return rec


def load_cold_emails(path):
    """Parse cold_emails.txt -> {company_lower: {subject, body, has_website}}.

    File format (blocks separated by a line of ---):
        COMPANY: Exact Company Name
        SUBJECT: Short subject line
        HAS_WEBSITE: no        (omit or 'yes' to keep the demo unattached)
        BODY:
        <email body, one paragraph per line>
    """
    emails = {}
    if not os.path.exists(path):
        return emails
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    blocks = re.split(r"\n---+\s*\n", text)
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        company = subject = None
        has_website = True
        body_lines = []
        in_body = False
        for line in block.splitlines():
            if in_body:
                # Everything after BODY: is body content, never a header.
                body_lines.append(line)
                continue
            low = line.lower().strip()
            if low.startswith("company:"):
                company = line.split(":", 1)[1].strip()
            elif low.startswith("subject:"):
                subject = line.split(":", 1)[1].strip()
            elif low.startswith("has_website:"):
                has_website = line.split(":", 1)[1].strip().lower() not in ("no", "false", "0")
            elif low.startswith("body:"):
                in_body = True
        if company and subject and body_lines:
            emails[company.strip().lower()] = {
                "subject": subject.strip(),
                "body": "\n".join(body_lines).strip(),
                "has_website": has_website,
            }
    return emails


def clean_company_name(raw):
    """Strip parentheticals + trailing geographic suffixes; fallback name."""
    name = re.sub(r"\s*\([^)]*\)\s*", " ", raw or "")
    name = re.sub(r"\s+", " ", name).strip()
    if not name or name.lower().startswith("unknown"):
        return FALLBACK_COMPANY
    lower = name.lower()
    for suffix in ("sri lanka", "lanka", "uae", "usa", "uk", "india",
                   "canada", "australia", "singapore", "dubai"):
        if lower.endswith(" " + suffix):
            name = name[: -(len(suffix) + 1)].rstrip()
            break
    name = re.sub(
        r"\s+(?:pvt\.?\s*ltd\.?|pvt\.?|ltd\.?|limited|inc\.?|llc|corp\.?|corporation)$",
        "", name, flags=re.IGNORECASE,
    ).strip()
    return name or FALLBACK_COMPANY


def company_lookup_name(name):
    """Map the fallback name for the 'Unknown' row to its real company name."""
    return MP_ASSOCIATES if name == FALLBACK_COMPANY else name


def replace_placeholders(text, company):
    return PLACEHOLDER_RE.sub(lambda m: company, text)


def escape_pdf_literal(s):
    return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def personalize_pdf(src, dst, company):
    """Replace placeholders (and the sender branding) inside the PDF, keeping
    the layout untouched. Returns (changed, verified)."""
    reader = PdfReader(src)
    writer = PdfWriter()
    changed = 0
    for page in reader.pages:
        text = page.get_contents().get_data().decode("latin-1")
        new_text = text
        for placeholder in ("[Client Name]", "[Firm Name]", "[Company Name]",
                            "{{company_name}}"):
            new_text = new_text.replace(placeholder, escape_pdf_literal(company))
        new_text = new_text.replace(
            "Prepared by: Hassen, Floza Automations",
            "Prepared by: Isa, Floza Solutions",
        )
        if new_text != text:
            changed += 1
        stream = DecodedStreamObject()
        stream.set_data(new_text.encode("latin-1"))
        page[NameObject("/Contents")] = stream
        writer.add_page(page)
    with open(dst, "wb") as f:
        writer.write(f)
    out = " ".join(p.extract_text() for p in PdfReader(dst).pages)
    ok = ("[Client Name]" not in out) and (company.lower() in out.lower())
    return changed, ok


# --------------------------------------------------------------------------
# Email validation (format + SMTP probe)
# --------------------------------------------------------------------------

_MX_CACHE = {}


def resolve_mx(domain):
    """Find the MX host for a domain; fall back to the A record (cached)."""
    if domain in _MX_CACHE:
        return _MX_CACHE[domain]
    result = None
    try:
        out = subprocess.run(
            ["nslookup", "-type=mx", domain],
            capture_output=True, text=True, timeout=8,
        )
        mxs = re.findall(r"mail\s+exchanger\s*=\s*\d+\s+([\w.\-]+)",
                         out.stdout, re.IGNORECASE)
        if not mxs:
            mxs = re.findall(
                r"MX\s+preference\s*=\s*\d+\s*,\s*mail\s+exchanger\s*=\s*([\w.\-]+)",
                out.stdout, re.IGNORECASE,
            )
        if mxs:
            result = mxs[0].rstrip(".")
    except Exception:
        pass
    if result is None:
        try:
            result = socket.gethostbyname(domain)
        except Exception:
            result = None
    _MX_CACHE[domain] = result
    return result


def probe_email(sender, email):
    """SMTP RCPT probe. Returns True (ok), False (rejected), None (inconclusive)."""
    domain = email.split("@", 1)[1].lower()
    mx = resolve_mx(domain)
    if not mx:
        return None
    s = None
    try:
        s = smtplib.SMTP(timeout=6)
        s.connect(mx, 25)
        s.ehlo("localhost.localdomain")
        code, _ = s.mail(sender)
        if code // 100 != 2:
            return None
        code2, msg2 = s.rcpt(email)
        if code2 == 250:
            return True
        if code2 // 100 == 5:
            text = msg2.decode(errors="replace") if isinstance(msg2, bytes) else str(msg2)
            if (
                "5.1.1" in text or "5.1.10" in text
                or re.search(
                    r"user unknown|no such (user|recipient|mailbox)|mailbox (unavailable|not found)|invalid (recipient|mailbox)",
                    text, re.IGNORECASE,
                )
            ):
                return False
            return None
        return None
    except Exception:
        return None
    finally:
        if s is not None:
            try:
                s.quit()
            except Exception:
                pass


def alias_candidates(company_entries):
    """Generate common-alias candidates on the company's domains."""
    domains = set()
    for email, source, dom in company_entries:
        if dom:
            domains.add(dom.lower())
        elif "@" in email:
            domains.add(email.split("@", 1)[1].lower())
    aliases = []
    # Never probe alias candidates on consumer/ISP mail domains.
    CONSUMER = ("gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk",
                "hotmail.com", "hotmail.co.uk", "outlook.com", "live.com",
                "icloud.com", "aol.com", "btconnect.com", "btinternet.com",
                "sky.com", "talktalk.net", "virginmedia.com",
                "hostingersite.com")
    for d in sorted(domains):
        if d.endswith(CONSUMER):
            continue
        for local in ALIAS_LOCAL_PARTS:
            aliases.append((f"{local}@{d}", "alias", None))
    return aliases


# --------------------------------------------------------------------------
# Email composition / sending
# --------------------------------------------------------------------------

def build_message(sender, to, subject, body, attachments):
    """attachments: list of (path, filename, mime_subtype)."""
    msg = MIMEMultipart()
    msg["From"] = formataddr((SENDER_NAME, sender))
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))
    for path, filename, subtype in attachments:
        with open(path, "rb") as f:
            part = MIMEApplication(f.read(), _subtype=subtype)
        part.add_header("Content-Disposition", "attachment", filename=filename)
        msg.attach(part)
    return msg


def send_with_retry(smtp, sender, app_password, msg):
    """Send, retry once after RETRY_DELAY (reconnecting first).
    Returns (ok, error, smtp)."""
    try:
        smtp.send_message(msg)
        return True, "", smtp
    except Exception as exc:
        time.sleep(RETRY_DELAY)
        try:
            smtp = smtplib.SMTP("smtp.gmail.com", 587, timeout=30)
            smtp.starttls()
            smtp.login(sender, app_password)
            smtp.send_message(msg)
            return True, "", smtp
        except Exception as exc2:
            return False, str(exc2), smtp


def load_log(path):
    """Return the set of emails already logged as Sent or Failed."""
    done = set()
    if not os.path.exists(path):
        return done
    with open(path, "r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            if row.get("status") in ("Sent", "Failed") and row.get("email"):
                done.add(row["email"].strip().lower())
    return done


def log_attempt(path, company, email, status, error=""):
    new_file = not os.path.exists(path)
    with open(path, "a", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        if new_file:
            writer.writerow(LOG_HEADER)
        writer.writerow([
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            company, email, status, error,
        ])


def random_delay():
    t = random.uniform(10, 20)
    print(f"    [waiting {t:.0f}s to avoid looking automated...]")
    time.sleep(t)


# --------------------------------------------------------------------------
# Selftest (no sending)
# --------------------------------------------------------------------------

def selftest(sender, list_file=LIST_FILE, recipients_file=RECIPIENTS_FILE,
             emails_file=COLD_EMAILS_FILE):
    print("=" * 60)
    print("SELF-TEST (no emails are sent)")
    print("=" * 60)
    print(f"Companies file : {list_file}")
    print(f"Recipients file: {recipients_file}")
    print(f"Cold emails file: {emails_file}")
    companies = load_companies(list_file)
    candidates = load_recipients(recipients_file)
    cold = load_cold_emails(emails_file)
    total_candidates = 0
    print(f"Personalized cold emails on file: {len(cold)}")
    for raw_name, primary in companies:
        name = clean_company_name(raw_name)
        lookup = company_lookup_name(name)
        entries = candidates.get(lookup, [])
        aliases = alias_candidates(entries)
        total_candidates += len(entries) + len(aliases)
        entry = cold.get(lookup.lower())
        print(f"\n{name}  (primary: {primary})")
        if entry:
            print(f"  SUBJECT: {entry['subject']}")
            preview = entry["body"].replace("\n", " | ")
            print(f"  BODY: {preview[:120]}...")
            print(f"  WEBSITE: {'yes (no demo attached)' if entry['has_website'] else 'no (demo WILL be attached)'}")
        else:
            print("  !! NO personalized email on file - company will be SKIPPED")
        for email, source, dom in entries:
            print(f"  PUBLISHED  {email:<50} [{source}]")
        for email, source, _ in aliases[:MAX_PER_COMPANY]:
            print(f"  ALIAS      {email}")
    print(f"\nWebsite demo file exists: {os.path.exists(WEBSITE_DEMO)}")
    print(f"Total candidate addresses across all companies: {total_candidates}")
    # Verify the PDF personalization round-trip still works.
    dst = os.path.join(tempfile.gettempdir(), "selftest_pdf.pdf")
    try:
        changed, ok = personalize_pdf(PROPOSAL_PDF, dst, "Test Firm")
        print(f"PDF personalization: changed={changed}, verified={ok}")
        os.remove(dst)
    except Exception as exc:
        print(f"PDF personalization FAILED: {exc}")
        return False
    print("SELF-TEST PASSED (structure OK).")
    return True


# --------------------------------------------------------------------------
# Main run
# --------------------------------------------------------------------------

def main():
    args = sys.argv[1:]

    def arg(name, default):
        if name in args:
            i = args.index(name) + 1
            if i < len(args):
                return args[i]
        return default

    list_file = arg("--list", LIST_FILE)
    recipients_file = arg("--recipients", RECIPIENTS_FILE)
    emails_file = arg("--emails", COLD_EMAILS_FILE)
    selftest_mode = "--selftest" in args

    env = load_env(ENV_FILE)
    sender = env.get("GMAIL_USER", "").strip()
    app_password = env.get("GMAIL_APP_PASSWORD", "").strip()
    if not sender or not app_password:
        print("CRITICAL ERROR: .env is missing GMAIL_USER or GMAIL_APP_PASSWORD.")
        print("No emails were sent.")
        sys.exit(1)

    if selftest_mode:
        selftest(sender, list_file, recipients_file, emails_file)
        return

    companies = load_companies(list_file)
    candidates = load_recipients(recipients_file)
    cold = load_cold_emails(emails_file)
    if not companies:
        print(f"CRITICAL ERROR: no companies found in {list_file}. Aborting.")
        sys.exit(1)

    # Pre-flight: every company must have a personalized cold email on file.
    # Never send a generic email, and never silently skip the user's list.
    missing = []
    for raw_name, _ in companies:
        name = clean_company_name(raw_name)
        name = MP_ASSOCIATES if name == FALLBACK_COMPANY else name
        if name.lower() not in cold:
            missing.append(f"{name}  ({raw_name})")
    if missing:
        print("CRITICAL ERROR: no personalized cold email on file for:")
        for m in missing:
            print(f"  - {m}")
        print("Fix cold_emails.txt first; no emails were sent.")
        sys.exit(1)

    already_sent = load_log(LOG_FILE)

    print("=" * 60)
    print("OUTBOUND COLD EMAIL CAMPAIGN (formula-based)")
    print("=" * 60)
    print(f"Sender: {SENDER_NAME} <{sender}>")
    print(f"Companies to process: {len(companies)}")
    print(f"Personalized emails on file: {len(cold)}")

    # 1) Login (required for everything).
    print("\n[1/3] Connecting to Gmail SMTP...")
    try:
        smtp = smtplib.SMTP("smtp.gmail.com", 587, timeout=30)
        smtp.starttls()
        smtp.login(sender, app_password)
    except Exception as exc:
        print(f"CRITICAL ERROR: SMTP login failed: {exc}")
        print("No company emails were sent. Check GMAIL_APP_PASSWORD / network.")
        sys.exit(1)

    # 2) Connectivity test to the owner's own inbox (skipped if already sent).
    print("[2/3] Connectivity test -> " + TEST_RECIPIENT)
    test_done = False
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r", encoding="utf-8", newline="") as f:
            test_done = any(
                row.get("company_name") == "(test)" and row.get("status") == "Sent"
                for row in csv.DictReader(f)
            )
    if test_done:
        print("    Test email already sent previously - skipping.")
    else:
        try:
            msg = build_message(
                sender, TEST_RECIPIENT,
                "Test - hi its working",
                "hi its working",
                [(PROPOSAL_PDF, ATTACH_NAME, "pdf")],
            )
            smtp.send_message(msg)
            log_attempt(LOG_FILE, "(test)", TEST_RECIPIENT, "Sent", "")
            print("    Test email sent successfully.")
        except Exception as exc:
            print(f"CRITICAL ERROR: connectivity test failed: {exc}")
            try:
                smtp.quit()
            except Exception:
                pass
            sys.exit(1)

    # 3) Campaign.
    print("\n[3/3] Campaign")
    sent = failed = skipped = 0
    total_found = 0
    companies_processed = 0
    no_email = 0
    seen = set()
    tmp_dir = tempfile.mkdtemp(prefix="floza_pdf_")
    first_send = True

    for ci, (raw_name, _primary) in enumerate(companies, 1):
        name = clean_company_name(raw_name)
        name = MP_ASSOCIATES if name == FALLBACK_COMPANY else name
        entry = cold.get(name.lower())
        entries = candidates.get(name, [])
        aliases = alias_candidates(entries)

        if not entry:
            no_email += 1
            print(f"\n=== ({ci}/{len(companies)}) {name} ===  SKIPPED (no personalized email on file)")
            for email, source, _ in entries:
                log_attempt(LOG_FILE, name, email, "Skipped", "no personalized email on file")
                skipped += 1
            companies_processed += 1
            continue

        subject = replace_placeholders(entry["subject"], name)
        body = replace_placeholders(entry["body"], name)

        # Personalize the PDF once per company.
        pdf_path = os.path.join(
            tmp_dir, f"c{ci:02d}_{re.sub(r'[^A-Za-z0-9]+', '_', name)}.pdf")
        try:
            _, pdf_ok = personalize_pdf(PROPOSAL_PDF, pdf_path, name)
        except Exception as exc:
            print(f"\n=== ({ci}/{len(companies)}) {name} ===  PDF ERROR: {exc}")
            for _, email, _ in entries + aliases:
                log_attempt(LOG_FILE, name, email, "Failed", f"pdf error: {exc}")
                failed += 1
            continue
        if not pdf_ok:
            pdf_path = PROPOSAL_PDF

        # Attachments: PDF always; website demo only if the lead has no website.
        attachments = [(pdf_path, ATTACH_NAME, "pdf")]
        if not entry["has_website"] and os.path.exists(WEBSITE_DEMO):
            attachments.append((WEBSITE_DEMO, DEMO_ATTACH_NAME, "html"))

        print(f"\n=== ({ci}/{len(companies)}) {name} ===")
        print(f"  SUBJECT: {subject}")

        published = [(e, s, d) for (e, s, d) in entries
                     if EMAIL_RE.match(e) and e.lower() not in already_sent]
        published = published[:MAX_PER_COMPANY]
        remaining = MAX_PER_COMPANY - len(published)
        alias_pool = aliases[:ALIAS_PROBE_POOL] if remaining > 0 else []
        total_found += len(published) + len(alias_pool)

        if not published and not alias_pool:
            companies_processed += 1
            print("    No candidate addresses found (single published email already sent).")
            continue

        def attempt(email, source):
            """Probe + send a single candidate. Returns True if sent."""
            nonlocal sent, failed, skipped
            key = email.lower()
            if key in seen or key in already_sent:
                log_attempt(LOG_FILE, name, email, "Skipped", "duplicate / already processed")
                skipped += 1
                print(f"    SKIP  {email} (duplicate / already processed)")
                return False
            seen.add(key)

            probe = probe_email(sender, email)
            is_published = source != "alias"
            if probe is False or (not is_published and probe is not True):
                reason = ("rejected by mail server" if probe is False
                          else "not confirmed by SMTP probe")
                log_attempt(LOG_FILE, name, email, "Skipped", reason)
                skipped += 1
                print(f"    SKIP  {email} ({reason})")
                return False

            nonlocal first_send, smtp
            if not first_send:
                random_delay()
            first_send = False

            ok, error, smtp = send_with_retry(
                smtp, sender, app_password,
                build_message(sender, email, subject, body, attachments))
            status = "Sent" if ok else "Failed"
            log_attempt(LOG_FILE, name, email, status, error)
            if ok:
                sent += 1
                print(f"    SENT  {email}")
            else:
                failed += 1
                print(f"    FAIL  {email}: {error}")
            return ok

        sent_company = 0
        # 1) Published addresses.
        for email, source, _ in published:
            if sent_company >= MAX_PER_COMPANY:
                break
            if attempt(email, source):
                sent_company += 1
        # 2) Alias addresses, until the per-company cap is reached.
        for email, source, _ in alias_pool:
            if sent_company >= MAX_PER_COMPANY:
                break
            if attempt(email, source):
                sent_company += 1

        companies_processed += 1

        if ci < len(companies) and os.path.exists(pdf_path) and pdf_path != PROPOSAL_PDF:
            os.remove(pdf_path)

    try:
        smtp.quit()
    except Exception:
        pass
    try:
        os.rmdir(tmp_dir)
    except Exception:
        pass

    # Summary.
    attempted = sent + failed
    success_rate = (sent / attempted * 100) if attempted else 0.0
    print("\n" + "=" * 60)
    print("=== SUMMARY ===")
    print(f"Companies processed: {companies_processed}")
    print(f"Companies skipped (no personalized email): {no_email}")
    print(f"Total emails found:  {total_found}")
    print(f"Total emails sent:   {sent}")
    print(f"Failed emails:       {failed}")
    print(f"Skipped emails:      {skipped}")
    print(f"Success rate:        {success_rate:.1f}% (of emails attempted)")
    print("=" * 60)
    print(f"Full log written to: {LOG_FILE}")


if __name__ == "__main__":
    main()
