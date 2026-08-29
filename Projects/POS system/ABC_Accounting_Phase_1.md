# ABC Accounting — Phase 1: Visual Audit & Product Foundation

## Goal
Turn the existing ABC Accounting dashboard into a polished accounting-firm application foundation.

## Critical instruction
Use the existing HTML/dashboard as a reference, NOT something to blindly copy. Inspect the existing code first, identify visual errors and weak UX, preserve good work, and improve it.

Keep the visual direction:
- Light professional UI
- Purple primary accent
- Blue, green, orange and red used selectively
- Thin borders
- Restrained corner radii
- Excellent spacing and alignment
- Strong information hierarchy
- Dense enough for professional software

Avoid harsh gradients, glassmorphism/liquid glass, rainbow UI, excessive shadows, generic AI/SaaS patterns, excessive cards, giant empty spaces, emojis as decoration, excessive icons, fake testimonials, decorative terminals, excessive pills, random colored stripes, generic bento grids, and unnecessary animation.

## Product
Brand: **ABC Accounting**
Subtitle: **Practice Management**

Navigation:
- Dashboard
- Clients
- Accounting
- Tax
- Documents
- Invoices
- Expenses
- Reports
- Tasks
- Team
- Integrations
- Settings

## Dashboard
Create a firm-wide dashboard with:
- Total Clients
- Monthly Revenue
- Tax Due This Month
- Pending Tasks
- Firm Revenue
- Client Portfolio
- Clients Requiring Attention
- Upcoming Tax Deadlines
- Workload by Team
- Firm Snapshot
- Recent Activity

Every chart must answer a useful business question.

## Client workspace
Support:
Client → Financial Overview → Accounting → Tax → Documents → Invoices → Expenses → Reports

Use realistic fictional Sri Lankan-style data and Rs. currency. Clearly mark it as demo data.

## Reporting foundation
Use mature enterprise reporting principles inspired by products such as ManageEngine, but DO NOT copy its interface.

Include:
- Report categories
- Filters
- Client selection
- Date ranges
- KPI summaries
- Tables
- Charts
- Drill-down structure
- Saved reports
- Scheduled reports
- Export actions

Categories:
Financial, Tax, Client, Documents, Invoices, Expenses, Team, Management.

## Interactions
Navigation must work. Client selection must open the client workspace. Reports, Tax and Documents should have meaningful demo states.

## Architecture
Keep the code clean so later phases can add demo authentication, users, roles, permissions, client assignment, a database, server-side authentication and NGINX deployment.

Do not build those yet.

## QA
Perform a visual audit of alignment, spacing, typography, tables, charts, buttons, navigation, empty states and desktop responsiveness. Fix every visual issue found.
