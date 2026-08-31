# PHASE 2 — DOCUMENTS, COMPLIANCE & AI ASSISTANT

## Objective

Add document processing, compliance management, and an AI assistant.

The AI must assist users but MUST NOT become the source of truth for tax calculations.

---

## 1. AI TAX ASSISTANT

Add an AI assistant called:

**Tax Assistant**

The assistant can:

- Explain calculations
- Explain tax terminology
- Answer questions about the application's tax rules
- Identify missing information
- Summarize tax positions
- Help users navigate the application
- Suggest what information an accountant may need
- Explain discrepancies
- Summarize uploaded financial documents

The assistant must NEVER independently invent:

- Tax rates
- Tax brackets
- Tax thresholds
- Deduction limits
- Filing deadlines
- Penalties

When discussing a calculation, AI must retrieve the actual calculation result and applicable rule data from the application.

---

## 2. AI CALCULATION EXPLANATION

After a calculation, provide:

**Explain this calculation**

Example:

```text
Taxable income
LKR X

Applicable rules
Tax Year XXXX

Tax before deductions
LKR X

Allowable deductions
LKR X

Estimated tax payable
LKR X
```

AI converts this into an understandable explanation.

The numerical values must come from the tax engine.

---

## 3. DOCUMENT UPLOAD

Create a document manager.

Support:

- PDF
- Excel
- CSV
- Images

Users can upload:

- Invoices
- Receipts
- Bank statements
- Payroll documents
- Expense reports
- Tax documents

---

## 4. DOCUMENT EXTRACTION

AI may extract structured information.

Example:

```text
Invoice
↓
Vendor
Invoice number
Date
Subtotal
VAT
Total
↓
Structured database record
```

Extracted information must be shown to the user for verification before it affects a tax calculation.

---

## 5. HUMAN VERIFICATION

Every AI-extracted financial value should have a status:

```text
AI Extracted
↓
Needs Review
↓
Approved
```

Users can:

- Approve
- Edit
- Reject

Never automatically use uncertain AI extraction in a final tax calculation.

---

## 6. COMPLIANCE CENTER

Create a dedicated compliance page.

Show:

- Filing deadlines
- Payment deadlines
- Outstanding obligations
- Completed filings
- Upcoming obligations
- Overdue items

Status:

- Complete
- Upcoming
- Due Soon
- Overdue

Deadlines must come from the application's rules/configuration, not AI-generated guesses.

---

## 7. TAX CALENDAR

Create a calendar/timeline showing:

```text
Tax obligation
↓
Due date
↓
Amount
↓
Status
↓
Action
```

Allow users to mark obligations as completed.

---

## 8. TAX HEALTH CHECK

Create a tax health-check workflow.

The system reviews available financial information and identifies:

- Missing data
- Unusual expenses
- Potentially inconsistent figures
- Missing documents
- Unreviewed AI extractions
- Upcoming obligations

Label these as:

**Information / Review Required**

Do NOT claim that something is legally non-compliant unless the applicable rule has been explicitly evaluated.

---

## 9. AI GUARDRAILS

The AI system prompt must enforce:

```text
The tax calculation engine is authoritative.

Never override numerical results from the tax engine.

Never invent tax rules.

Never fabricate legal requirements.

If required information is unavailable, say so.

If a question requires professional judgment, clearly identify it.

Use the application's current tax-rule dataset as the source of truth.

Do not present estimates as confirmed liabilities.

Do not silently modify financial data.

```

---

## 10. Activity & Audit Log

Track:

- Document uploaded
- Document edited
- AI extraction
- User approval
- Calculation created
- Calculation modified
- Rule version used
- Compliance item completed

---

## Definition of Done

Phase 2 is complete when:

- AI assistant works
- AI explanations work
- Documents can be uploaded
- Financial data can be extracted
- Human verification works
- Compliance center works
- Tax calendar works
- Tax health check works
- Audit logging works
- AI cannot override the tax engine