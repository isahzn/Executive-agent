PHASE 08 — PROJECT MANAGEMENT
Purpose

Build the project-management and project-inquiry experience for the portfolio.

This phase should provide a structured way for a potential client or collaborator to explain what they need and understand what happens next.

The experience should feel like a professional project intake system, not a generic contact form.

It should collect enough useful information to understand a potential project while keeping the experience simple enough that a visitor will actually complete it.

This phase builds on:

MASTER.md
PHASE_00_AUDIT_ARCHITECTURE.md
PHASE_01_HOMEPAGE.md
PHASE_02_MULTIPAGE_ARCHITECTURE.md
PHASE_03_PAST_WORK.md
PHASE_04_PROCESSES.md
PHASE_05_WEBSITE_SHOWCASE.md
PHASE_06_AUTOMATION_SHOWCASE.md
PHASE_07_AI_AGENT_SHOWCASE.md

Do not introduce unrelated business-management infrastructure unless it is required by the existing architecture.

1. Scope

This phase covers:

Start a Project page
Project inquiry form
Project requirements collection
Project-type selection
Budget/timeline information where appropriate
Contact information
Submission handling
Validation
Success states
Error states
Basic inquiry management architecture
Privacy considerations

The primary route should follow MASTER.md, expected to be:

/start-a-project

2. Core Objective

The page should answer:

How can someone start working with Isa?

A visitor should be able to:

Understand what information is needed
Describe their project
Select relevant services
Provide useful constraints
Submit an inquiry
Understand what happens afterward

The process should feel clear and deliberate.

3. Project Inquiry Structure

A suitable structure is:

Page Header
↓
Project Types
↓
Inquiry Form
↓
What Happens Next
↓
Final Contact Option

Do not make the page unnecessarily long.

The form should collect only information that can actually improve project qualification or communication.

4. Page Header

The page should establish the purpose immediately.

Conceptual direction:

START A PROJECT

Tell me what you're building,
and we'll figure out the right approach.

The wording should remain professional and direct.

Avoid:

Aggressive sales language
Artificial urgency
Fake scarcity
"Book your free strategy call"
"Let's transform your business today"

unless such an offering genuinely exists.

5. Project Types

The visitor should be able to identify the type of work they need.

Potential options:

Website
Web Application
AI Automation
AI Agent
Backend System
Integration
Other

The list should reflect actual capabilities shown elsewhere in the portfolio.

Do not list services that cannot realistically be provided.

6. Service Selection

If a project can involve multiple capabilities, allow multiple selections.

Example:

What do you need?

☐ Website
☐ Web application
☐ AI automation
☐ AI agent
☐ Backend/API
☐ Integration
☐ Other

Do not overwhelm the visitor with dozens of options.

The categories should correspond with:

What I Do
Work
Live Demos
The actual technical capabilities of the portfolio
7. Project Description

The project description is one of the most important fields.

Prompt the visitor to explain:

What they want built
What problem they are trying to solve
What the system should do
Any important requirements

Example field:

Tell me about the project

What are you trying to build or improve?

Avoid forcing the visitor to understand technical terminology.

8. Business Context

Where useful, collect basic context.

Potential fields:

Business / organization
Current website
Current system
Industry

Only collect information that will actually be used.

Do not request sensitive business information unnecessarily.

9. Budget

Budget can be useful for project qualification, but it should not feel invasive.

Possible options:

Estimated budget

Under $500
$500–$1,000
$1,000–$2,500
$2,500+
Not sure yet

The exact ranges should follow the business model defined in MASTER.md.

Do not assume the visitor knows the final project cost.

"Not sure yet" should always be available when budget information is collected.

Do not use budget selection to automatically reject a visitor unless that behavior is explicitly intended.

10. Timeline

Potential timeline options:

When are you looking to start?

As soon as possible
Within a month
1–3 months
3+ months
Just exploring

Do not promise delivery dates automatically.

The timeline should be treated as project context rather than a guaranteed commitment.

11. Contact Information

Collect only what is necessary to respond.

Potential fields:

Name
Email
Preferred contact method
Optional phone number

Email should normally be required if the inquiry will be answered by email.

Do not require a phone number unless the workflow actually uses it.

12. Contact Method

If multiple communication methods are supported, allow the visitor to choose.

Examples:

Preferred contact

Email
WhatsApp
Phone
Other

Only include methods that can genuinely be used for project communication.

Do not collect a phone number merely because the field exists.

13. Form Design

The form should feel like part of the portfolio rather than an embedded third-party form.

Prioritize:

Strong typography
Clear labels
Spacious inputs
Simple borders
Clear focus states
Minimal decoration
Logical grouping

Avoid:

Excessive rounded inputs
Generic SaaS forms
Decorative illustrations
Unnecessary icons
Multi-column forms on narrow screens
Huge numbers of fields
14. Progressive Form Design

If the form contains many questions, consider progressive disclosure.

For example:

1 — Project
2 — Requirements
3 — Timeline & Budget
4 — Contact
5 — Submit

This can make a long intake process feel easier.

Do not split a short form into multiple screens unnecessarily.

Use the simplest interaction that works.

15. Validation

Validate both client-side and server-side where applicable.

Validate:

Required fields
Email format
Field lengths
Allowed option values
Unexpected input
Submission payload

Do not rely only on browser-side validation.

Server-side validation is required whenever data is submitted to a backend.

16. Error Messages

Errors should be specific and actionable.

Prefer:

Please enter a valid email address.

over:

Invalid input.

Errors should appear near the relevant field where possible.

Do not erase the visitor's entire form because one field is invalid.

17. Submission State

The interface should clearly communicate:

Ready

The visitor can submit.

Submitting

The submission is being processed.

Success

The inquiry was received.

Failure

The submission failed and the visitor can retry.

Example:

Sending inquiry...

Then:

Inquiry received.

Your project details have been submitted successfully.

Do not claim that someone has reviewed the inquiry unless that has actually happened.

18. Success State

After successful submission, provide useful next-step information.

Possible content:

Inquiry received.

The project details were submitted successfully.

Next:
1. Review the requirements
2. Clarify anything necessary
3. Discuss the appropriate approach

Only include response-time promises if they are actually maintained.

Avoid fake guarantees such as:

"You'll hear back within 2 hours."

unless that is genuinely true.

19. Submission Handling

The implementation should define where inquiries go.

Possible destinations include:

Secure backend
Email notification
Database
CRM
Spreadsheet
Project management system

The chosen destination should follow the architecture established in MASTER.md.

Do not send project data directly from the browser to an email provider using exposed credentials.

20. Email Handling

If inquiries are sent by email:

Keep credentials server-side
Validate input server-side
Sanitize content
Prevent header injection
Rate-limit submissions
Handle failed delivery
Do not expose email credentials

If an app-password-based email workflow is used, the credential must remain server-side.

21. CRM Integration

If a CRM is connected, an inquiry may create or update a lead.

Potential information:

Name
Email
Project type
Services
Description
Budget
Timeline
Source
Submission date
Status

Only implement CRM integration if a real CRM is being used.

Do not create a fake CRM interface merely for appearance.

22. Inquiry Status

If inquiry management is actually implemented, useful states may include:

New
Reviewing
Needs Information
Discussing
Proposal
Active
Completed
Declined
Archived

Only use statuses that correspond to a real workflow.

Do not imply that a backend project-management system exists if the portfolio only sends an email.

23. Project Management Architecture

If a real project-management layer is implemented, keep it separate from the public portfolio UI.

Conceptually:

Public Portfolio
      ↓
Project Inquiry API
      ↓
Validation
      ↓
Database / CRM
      ↓
Notification
      ↓
Internal Project Management

Do not expose internal project-management routes or data publicly.

24. Security

Project inquiries are untrusted public input.

Protect against:

Spam
Automated submissions
Injection
Malformed requests
Excessive payloads
Credential exposure
Unauthorized database access
API abuse

Use appropriate:

Rate limiting
Validation
Sanitization
Authentication for internal systems
Server-side secrets
Access controls

Do not build custom security mechanisms when established platform capabilities are sufficient.

25. Spam Protection

If the form is publicly accessible, implement an appropriate level of spam protection.

Possible approaches:

Rate limiting
Honeypot fields
CAPTCHA/turnstile-style protection
Server-side validation
Request throttling

Do not make the form frustrating for legitimate visitors.

Start with lightweight protection and increase it if abuse occurs.

26. Privacy

Only collect information necessary for project communication.

Avoid collecting:

Passwords
Payment-card information
Identity documents
Sensitive personal information
Unnecessary private business data

If personal information is stored, the system should clearly communicate why it is collected and how it is used where legally appropriate.

27. File Uploads

File uploads should not be added unless they provide a genuine project-intake benefit.

If uploads are supported:

Restrict file types
Restrict file size
Validate server-side
Prevent executable uploads
Store securely
Avoid exposing uploaded files publicly
Consider malware scanning where appropriate

Do not allow unrestricted public file uploads.

28. Accessibility

The inquiry experience must support:

Keyboard navigation
Screen readers
Clear labels
Field descriptions
Visible focus states
Error announcements
Accessible validation
Logical tab order
Large enough touch targets

Do not rely on placeholder text as the only field label.

29. Responsive Design

The form should work intentionally on:

Mobile
Tablet
Laptop
Desktop

On mobile:

Inputs should use the full available width
Buttons should be easy to tap
Labels should remain visible
Multi-column sections should collapse appropriately
Keyboard interaction should remain manageable
Long text areas should remain usable

No horizontal overflow should occur.

30. Visual Design

Follow the global portfolio design system.

Maintain:

Neutral palette
Strong typography
Editorial hierarchy
Controlled borders
Generous spacing
Minimal decoration

The form should feel like a natural continuation of the portfolio.

Avoid:

Purple/blue AI gradients
Generic SaaS contact-form aesthetics
Excessive glassmorphism
Floating blobs
Fake trust badges
Fake client logos
Fake testimonials
"5-star" ratings
Artificial urgency
31. What Happens Next

Explain the process after submission.

This section should connect with PHASE_04_PROCESSES.md.

Conceptual example:

01
Understand
Review the project and requirements.

02
Clarify
Resolve important unknowns.

03
Plan
Determine the appropriate technical approach.

04
Build
Develop and test the system.

05
Deliver
Deploy and hand over the completed work.

Only describe steps that genuinely reflect the working process.

32. Project Qualification

The system may use submitted information to help determine what should happen next.

For example:

Website
→ Existing website information

Automation
→ Current manual workflow

AI Agent
→ Task + available tools

Web Application
→ Users + core functionality

Do not automatically reject projects based solely on form responses unless explicitly required.

The purpose is to improve the initial conversation.

33. Confirmation Email

If confirmation emails are implemented, they should clearly state:

Inquiry received
Basic reference information
What happens next
How to contact the project owner if necessary

Do not send sensitive submitted information unnecessarily.

Do not claim a proposal or project acceptance has occurred.

34. Internal Notification

If an internal notification exists, it should contain useful project information.

Potential fields:

New project inquiry

Name
Contact
Project type
Services
Budget
Timeline
Description
Submission timestamp

Keep internal notifications separate from public-facing content.

35. Project Reference ID

If useful, generate a simple inquiry reference ID.

Example:

Project inquiry #VX-1042

The ID should not expose sensitive information.

Do not make the ID sequential if that would allow visitors to infer the number of submissions or other private information.

36. Draft State

If useful, allow visitors to preserve form progress locally.

Potential approach:

Local browser storage
Temporary draft state

If implemented:

Do not store sensitive information unnecessarily
Provide a way to clear the draft
Avoid storing credentials
Handle stale drafts

A draft system is optional.

Do not add it unless it improves the actual experience.

37. Project Management Dashboard

A private dashboard may exist if the project-management architecture requires it.

Potential features:

Inquiry list
Inquiry details
Status
Notes
Contact information
Project type
Timeline
Budget
Search/filter
Archive

This dashboard must be authenticated.

Do not expose it through the public portfolio navigation.

Do not build a full CRM if a simple inquiry system is sufficient.

38. Authentication

If an internal dashboard exists:

Require authentication
Protect routes server-side
Do not rely only on hidden UI
Protect API endpoints
Secure sessions
Never hardcode passwords in frontend code

Do not create a custom authentication system unnecessarily.

Use the existing platform's secure authentication approach where appropriate.

39. Data Model

If inquiry records are stored, use a centralized structure.

Conceptual example:

{
  id,
  createdAt,
  name,
  email,
  contactMethod,
  projectTypes,
  description,
  business,
  currentWebsite,
  budget,
  timeline,
  status,
  notes
}

Only store fields that are genuinely necessary.

Do not store unnecessary personal information.

40. Empty States

Internal management interfaces should handle:

No inquiries yet.

or:

No inquiries match this filter.

Do not use fake sample inquiries in production.

If sample data is required during development, clearly isolate it from production data.

41. Error Recovery

If submission fails:

Preserve entered information
Explain that the submission failed
Allow retry
Avoid duplicate submissions
Disable repeated submission while processing

If the request succeeds but notification delivery fails, the system should handle that state appropriately rather than falsely reporting complete success.

42. SEO

The Start a Project page should have:

Appropriate page title
Appropriate description
Semantic headings
Share metadata where applicable

Do not keyword-stuff the page.

The goal is conversion through clarity, not search-engine manipulation.

43. Architecture Requirements

Potential reusable components:

ProjectInquiry
ProjectTypeSelector
ServiceSelector
FormField
FormSection
BudgetSelector
TimelineSelector
ContactFields
FormProgress
SubmissionState
SuccessState
ErrorState
NextSteps

Use existing shared components whenever possible.

Do not duplicate button, input, typography, spacing, or validation patterns already established by the portfolio.

44. Shared Data

Project types and services should align with the rest of the portfolio.

For example:

Work
What I Do
Live Demos
Start a Project

should describe the same capabilities.

Do not have:

What I Do → AI Agents

while:

Start a Project → Chatbots

unless the difference is intentional.

The portfolio should use consistent terminology.

45. Do Not Implement

This phase should NOT unnecessarily implement:

Full enterprise CRM
Complex sales pipeline
Payment processing
Automatic project acceptance
Automatic project pricing
Unrestricted file uploads
Public internal dashboard
Fake project inquiries
Fake client accounts
Automated contracts
Automated invoices
AI-generated project quotes without proper review

Keep the project-management layer proportional to the actual portfolio.

46. Acceptance Criteria

Phase 08 is complete when:

Public Inquiry

/start-a-project exists

Purpose is immediately clear

Visitor can select project type

Visitor can describe their project

Relevant requirements can be collected

Contact details can be submitted

Form is not unnecessarily long

Validation

Required fields are validated

Email is validated

Input lengths are controlled

Invalid options are rejected

Server-side validation exists where applicable

Errors are clear and actionable

Submission

Submission state is visible

Success state is clear

Failure state is clear

Duplicate submissions are controlled

Entered information is preserved on recoverable errors

Backend

Submission handling is secure

Secrets remain server-side

Data destination is clearly defined

Notifications work if implemented

CRM integration works if implemented

No private data is exposed

Security

Spam protection exists where needed

Public input is treated as untrusted

API endpoints are protected

Credentials are not exposed

Internal systems are authenticated

File uploads are restricted if supported

Privacy

Only necessary information is collected

Sensitive information is not requested unnecessarily

Stored information is appropriately protected

Public demos do not expose inquiry data

Design

Global portfolio design system is preserved

Form feels integrated with the portfolio

No generic SaaS contact-form aesthetic

No fake trust elements

Typography and spacing are intentional

CTA is clear

Responsive

Mobile layout works

Tablet layout works

Desktop layout works

Inputs are usable on touch devices

No horizontal overflow

Accessibility

Keyboard navigation works

Labels are accessible

Focus states are visible

Errors are accessible

Tab order is logical

Touch targets are usable

Internal Management

If an internal inquiry dashboard exists:

Authentication is required

Inquiry records are protected

Status management works

No fake production data exists

API routes are protected

Empty states work

Technical

Production build succeeds

No critical console errors

No broken routes

No exposed credentials

No placeholder submission behavior remains

Portfolio terminology remains consistent

47. Final Rule

The Project Management experience exists to answer:

What happens when someone wants to work with Isa?

Make the first step easy.

Collect useful information.

Protect the visitor's data.

Do not over-engineer the process.

Do not pretend a full agency infrastructure exists if it does not.

The portfolio should feel capable without pretending to be a large company.

The goal is a clear path from interest → useful project information → real conversation.