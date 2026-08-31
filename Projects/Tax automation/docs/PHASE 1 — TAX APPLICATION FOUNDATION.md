# PHASE 1 — TAX APPLICATION FOUNDATION

## Objective

Build the foundational tax application with a deterministic, auditable tax calculation engine.

The system must NEVER rely on an LLM to calculate tax rates, brackets, deductions, thresholds, penalties, or final tax liabilities.

AI will be added later as an assistant layer.

---

## 1. Core Architecture

Use:

- Next.js
- TypeScript
- Tailwind CSS
- Supabase/PostgreSQL
- OpenRouter for AI in later phases
- Server-side tax calculation logic
- Responsive web application

Structure the application so tax rules are separated from UI components.

Recommended architecture:

```text
app/
components/
lib/
  tax/
    engine/
    rules/
    calculators/
    validators/
  ai/
  database/
types/
```

---

## 2. Tax Rules Engine

Create a versioned tax-rule architecture.

Tax rules must support:

- Tax year
- Effective date
- Tax type
- Tax rate
- Tax bracket
- Threshold
- Deduction
- Allowance
- Exemption
- Penalty
- Filing deadline

Never scatter tax values throughout React components.

Instead:

```ts
TaxRuleSet
  ├── taxYear
  ├── effectiveFrom
  ├── effectiveTo
  ├── individualRules
  ├── businessRules
  ├── vatRules
  └── withholdingRules
```

The engine should make it possible to add a new tax year without rewriting the application.

---

## 3. Initial Calculators

Build:

### Individual Income Tax

Inputs:

- Gross income
- Employment income
- Business income
- Investment income
- Other income
- Allowable deductions
- Allowances
- Exempt income

Outputs:

- Gross income
- Total deductions
- Taxable income
- Tax by bracket
- Total tax
- Effective tax rate
- Remaining liability

### Business Tax

Inputs:

- Revenue
- Cost of goods sold
- Operating expenses
- Other allowable expenses
- Capital allowances
- Other deductions

Outputs:

- Revenue
- Allowable expenses
- Taxable profit
- Applicable tax
- Estimated liability

### VAT

Inputs:

- Taxable sales
- Taxable purchases
- Input VAT
- Output VAT
- Exempt sales

Outputs:

- Output VAT
- Input VAT
- Net VAT payable/refundable

### Withholding Tax

Create the calculation framework but keep rates configurable through the rules engine.

---

## 4. Dashboard

Create a professional accounting dashboard.

KPI cards:

- Estimated Tax Payable
- Taxable Income
- VAT Position
- Upcoming Filing
- Compliance Status

Charts:

- Tax liability over time
- Revenue vs taxable income
- VAT input vs output
- Tax payments

Tables:

- Recent calculations
- Upcoming deadlines
- Tax liabilities
- Recent activity

---

## 5. Calculation History

Every completed calculation should be saved.

Store:

- User
- Calculation type
- Tax year
- Input values
- Applied rule version
- Result
- Timestamp

The user must be able to reopen a previous calculation and see exactly how it was calculated.

---

## 6. Validation

Implement strong input validation.

Examples:

- Reject negative income
- Validate percentages
- Validate dates
- Prevent impossible values
- Handle empty optional fields
- Prevent invalid tax-year combinations

Use server-side validation as well as client-side validation.

---

## 7. Auditability

Every result should expose:

```text
Inputs
↓
Deductions
↓
Taxable amount
↓
Applicable rule
↓
Calculation
↓
Final liability
```

The application should be able to explain the mathematical calculation without AI.

---

## 8. Testing

Create automated tests for:

- Bracket calculations
- Deductions
- Thresholds
- VAT
- Withholding
- Rounding
- Zero income
- Boundary values
- Maximum/minimum values
- Different tax years

Test the tax engine independently from the UI.

---

## Definition of Done

Phase 1 is complete when:

- Dashboard works
- Individual calculator works
- Business calculator works
- VAT calculator works
- WHT framework works
- Rules are versioned
- Calculations are deterministic
- Calculation history works
- Tax calculations are tested
- No AI is involved in determining tax liability