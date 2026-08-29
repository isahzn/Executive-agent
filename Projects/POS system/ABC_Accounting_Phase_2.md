# ABC Accounting — Phase 2: Authentication, Users & Permissions

## Goal
Add realistic demo authentication and access control.

This is a client demo, NOT production security. Use local/demo storage now, but structure it so real authentication/database can replace it later.

## Login
Create a polished login screen:
ABC Accounting
Practice Management

Fields:
- Username/email
- Password

Actions:
- Sign in
- Demo access

Support multiple accounts such as:
- Admin
- Accountant 01
- Accountant 02
- Manager
- Viewer

Do not hard-code the application around only these users.

## User accounts
Each user has:
- Name
- Email/username
- Demo password
- Role
- Active/disabled status
- Assigned clients
- Permissions
- Last active

Support login, logout, current-user display, profile and account status. Do not expose passwords in normal UI.

## Roles
Roles are starting templates, not permanent permission sets:
- Admin
- Accountant
- Manager
- Viewer

Admins can customize individual permissions.

## Permission model
Separate **VIEW** from **INPUT / EDIT**.

Clients:
- View
- Create
- Edit
- Delete

Accounting:
- View
- Input Transactions
- Edit Transactions
- Export

Tax:
- View
- Input
- Edit
- Generate Reports
- Mark as Filed

Documents:
- View
- Upload
- Edit
- Delete

Reports:
- View
- Create
- Export

Invoices:
- View
- Create
- Edit

Expenses:
- View
- Create
- Edit

Tasks:
- View
- Create
- Assign
- Complete

Team:
- View
- Manage

Settings:
- View
- Modify

## Admin dashboard
Create a dedicated control center, not just the normal dashboard with extra buttons.

Sections:
- Overview
- Users
- Roles & Permissions
- Client Access
- Activity
- Settings

Overview:
- Total Users
- Active Users
- Disabled Users
- Administrators
- Accountants
- Managers
- Viewers
- Recent Account Activity
- Recent Permission Changes
- Recently Added Users
- Recently Disabled Accounts

## Users
Table:
User | Role | Assigned Clients | Last Active | Status | Permissions | Actions

Actions:
- Manage
- Disable/Enable
- Edit
- Change permissions

Add User form:
- Name
- Email/username
- Temporary password
- Role
- Status
- Assigned clients
- Permissions

## Permission matrix
Clearly show:
VIEW | INPUT / EDIT

Allow individual permissions to be toggled.

Roles should be editable templates.

## Client access
Admins assign clients to users.

Example:
Accountant 01 → Silva Holdings, Nova Retail, Perera Trading, Greenline Services
Accountant 02 → Oceanic Foods, ABC Construction, Metro Services

Unauthorized users must not see unauthorized client financial information. Do not merely hide it visually; enforce the access logic.

## Accountant dashboard
Show:
- My Clients
- Tasks Due
- Tax Deadlines
- Documents To Review
- Upcoming Deadlines
- My Tasks
- Recent Client Activity
- Recent Reports

Only assigned clients are visible.

## Viewer
View permitted information but cannot edit restricted information.

## Functional QA
Test:
ADMIN → login, create user, assign role, assign clients, change permissions, disable account.
ACCOUNTANT → login, see assigned clients, blocked unauthorized clients/actions.
VIEWER → login, view permitted information, blocked restricted edits.

Do not consider the phase complete until these flows work.
