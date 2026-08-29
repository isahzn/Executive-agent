# ABC Accounting — Phase 3: Accounting, Tax, Documents & Advanced Reporting

## Goal
Turn the foundation into a convincing end-to-end accounting-firm product demonstration.

This remains a prototype. Do not claim tax calculations are production/legal-grade.

## Client workspace
For each authorized client:
- Financial Overview
- Accounting
- Tax
- Documents
- Invoices
- Expenses
- Reports

KPIs:
Revenue, Expenses, Net Profit, Tax Liability, Receivables, Payables.

## Accounting
Create:
- Transaction list
- Date
- Description
- Account/category
- Debit
- Credit
- Status
- Reconciliation state

Support search, filters, date range, client selection and export.

Users with permission can input/edit transactions. Users without it can view but cannot modify.

## Tax Center
Firm-wide:
- Total Tax Due
- Returns Due
- Returns Filed
- Clients At Risk

Table:
Client | Return | Period | Amount | Due date | Status

Client tax workspace:
- Output tax
- Input tax
- Estimated tax payable
- Return status
- Filing deadline
- Review status

All tax data is fictional demo data. Do not present the prototype as legal/tax advice or production tax software.

## Documents
Types:
- Bank statements
- Invoices
- Receipts
- Tax documents
- Payroll documents
- Contracts
- Other

Statuses:
- Processed
- Needs Review
- Missing
- Processing

Demo interactions:
- Upload
- Search
- Filter
- Open document record
- Change review status

Respect View/Upload/Edit/Delete permissions.

## Invoices
Create:
- Invoice list
- Paid
- Pending
- Overdue
- Draft
- Create Invoice

Use fictional data.

## Expenses
Create:
- Expense list
- Category
- Client
- Amount
- Date
- Status

Support add/edit with permission checks.

## Tasks
Create:
- My Tasks
- Team Tasks
- Due dates
- Priority
- Client
- Assignee
- Status

Support create/assign/complete with permission checks.

## Advanced reporting
Use enterprise reporting concepts without copying ManageEngine's UI.

Categories:
- Financial
- Tax
- Client
- Documents
- Invoices
- Expenses
- Team
- Management

Filters:
- Client
- Date range
- Status
- Report type
- Team member

Output:
- KPI summaries
- Tables
- Charts
- Trends
- Comparisons
- Drill-downs

Actions:
- Create Report
- Save Report
- Export PDF
- Export CSV
- Schedule Report

These can simulate behavior for the demo.

## Scheduled reports
Table:
Report | Recipient | Frequency | Next Run | Status

Examples:
- Monthly Client Pack
- Tax Exposure Report
- Outstanding Fees

## Admin activity
Show:
- User logins
- Account creation
- Permission changes
- Client assignment changes
- Document activity
- Report generation
- Account disabling

Use fictional demo activity.

## Demo mode
Clearly indicate the environment is a demonstration where appropriate.

## NGINX
Keep the application deployment-ready for later VPS hosting:

Browser
↓
NGINX
↓
Application

Do not let infrastructure work dominate the demo.

## Final demo flow
1. Open ABC Accounting.
2. Login as Admin.
3. Show firm dashboard.
4. Open Users.
5. Show individual accountant accounts.
6. Open an accountant.
7. Show assigned clients.
8. Show permissions.
9. Change one permission.
10. Login as that accountant.
11. Show only assigned clients.
12. Show restricted actions are unavailable.
13. Open an authorized client.
14. Show financial overview.
15. Open Accounting.
16. Open Tax Center.
17. Open Documents.
18. Open Reports.
19. Demonstrate filters.
20. Demonstrate report generation/export.
21. Return to Admin.
22. Show admin controls users, client access and permissions.

## Final QA
Audit every page for:
- Overlap
- Clipping
- Bad spacing
- Typography
- Broken charts
- Broken buttons
- Navigation errors
- Permission errors
- Unauthorized client access
- Login/logout
- Responsive behavior
- Disabled states
- Loading/empty states

The final product must feel like a polished early-stage accounting practice-management platform, not a static mockup, generic AI dashboard, or copied ManageEngine interface.
