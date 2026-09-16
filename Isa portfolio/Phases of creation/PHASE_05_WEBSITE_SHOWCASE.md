PHASE 05 — WEBSITE SHOWCASE
Purpose

Build the website showcase experience for the portfolio.

This phase should demonstrate Isa's ability to design and build polished, functional websites and web applications through real projects and interactive demonstrations.

The goal is not to create another generic project grid. The showcase should make the work feel tangible, credible, and technically substantial.

This phase builds on:

MASTER.md
PHASE_00_AUDIT_ARCHITECTURE.md
PHASE_01_HOMEPAGE.md
PHASE_02_MULTIPAGE_ARCHITECTURE.md
PHASE_03_PAST_WORK.md
PHASE_04_PROCESSES.md

Do not redesign unrelated sections or implement later phases unless required by the shared architecture.

1. Scope

This phase covers the website/web-application showcase experience.

It should include:

Website-focused projects
Web application projects
Interactive website demos where available
Screenshots and/or videos
Technology information
Project purpose
Relevant implementation details
Live project links where available
Case-study links where appropriate
Clear distinction between completed work and demonstrations

The primary showcase should live within the route established by MASTER.md, expected to be:

/live-demos

If the existing architecture establishes a more appropriate route, follow the established architecture rather than creating a conflicting route.

2. Core Objective

A visitor should quickly understand:

What websites can Isa build?

The page should demonstrate:

Visual quality
Frontend implementation
Responsive design
Interaction quality
Real functionality
Technical range
Attention to detail

The showcase should communicate capability through evidence, not claims.

Avoid statements such as:

"I build world-class websites."
"I create stunning websites."
"The best web developer."
"Industry-leading websites."

Instead, let the actual work demonstrate those capabilities.

3. Website Showcase Structure

Use a structure similar to:

Page Header
↓
Featured Website
↓
Website Collection
↓
Interactive / Live Demonstrations
↓
Technical Capabilities
↓
CTA

The exact structure may be adjusted based on the actual number and quality of projects.

Do not force sections that do not have enough real content.

4. Page Header

The header should immediately establish the purpose of the page.

It should include:

Strong page title
Short supporting description
Optional small category label
Clear visual hierarchy

Possible conceptual direction:

WEBSITE SHOWCASE

Websites and web applications built around
real interfaces, interactions, and functionality.

Do not use generic marketing copy.

The header should feel like part of the portfolio's editorial/technical system.

5. Featured Website

If there is a clearly strongest website project, give it a larger featured presentation.

The featured project should receive substantially more visual space than secondary projects.

Potential structure:

Large project visual
Project name
Short description
Category
Technologies
Key functionality
View project
View case study

The featured presentation may use:

Large screenshot
Browser-style frame
Video preview
Interactive embed
Layered image composition
Carefully controlled 3D presentation

Use whichever format best represents the actual project.

Do not add visual effects simply because they are possible.

6. Website Collection

Secondary websites should be presented as a curated collection rather than a repetitive collection of identical cards.

Possible layouts include:

Asymmetrical editorial grid
Large/small alternating projects
Horizontal project list
Image-led project index
Numbered project archive
Scroll-based project sequence

Choose the layout that best fits the actual quantity and quality of work.

Do not create a large grid just to make the page appear full.

Quality is more important than quantity.

7. Project Data

Website showcase information must come from centralized project/demo data.

Do not hardcode the same project information into multiple components.

A website project should support fields such as:

{
  id,
  title,
  slug,
  shortDescription,
  description,
  category,
  year,
  status,
  featured,
  thumbnail,
  heroMedia,
  gallery,
  technologies,
  services,
  role,
  liveUrl,
  repositoryUrl,
  demoUrl,
  projectType,
  features,
  process
}

Only use fields that are actually required by the implementation.

Do not create fake values simply to populate the schema.

8. Real Projects Only

Every showcased website must represent something actually built.

Do not invent:

Clients
Companies
Revenue
Traffic
Conversion rates
Testimonials
User counts
Awards
Business results
Performance statistics
Project outcomes

If a project is a personal experiment, label it accurately.

For example:

Personal experiment
Prototype
Concept
Demo
Client project
Personal project

Do not present a concept as a completed client project.

9. Bantex Trading

If Bantex Trading is included, represent the project accurately according to the actual implementation.

Potential features may include:

Multi-page storefront
Stationery catalogue
Electrical goods catalogue
Product pages
Product variants/options
Shopping cart
Checkout
Administrative product management

Only display functionality that is actually implemented and working.

If a feature is incomplete, do not present it as completed.

The project should demonstrate:

Multi-page architecture
Product organization
Responsive UI
Product presentation
User interaction
E-commerce-oriented flows
Frontend engineering

Technical details should remain understandable to nontechnical visitors.

10. Interactive Demonstrations

Where practical, provide interactive demonstrations of websites.

Possible approaches:

Open the deployed website
Embedded preview
Interactive iframe
Controlled live preview
Video demonstration
Screenshot sequence

Use the least complex method that provides the best experience.

Do not embed an entire website if doing so causes:

Performance problems
Security issues
Broken layouts
Cross-origin problems
Mobile usability problems
Excessive loading time

A video or optimized preview may be better than an iframe.

11. Demo vs Completed Project

Clearly distinguish between:

Completed Project

A real implementation that has been built and can be represented as finished work.

Demo

A demonstration created to show a particular capability or interaction.

Concept

An exploration or visual concept that may not represent a completed implementation.

These categories must not be blurred.

For example:

PROJECT
Bantex Trading

DEMO
Interactive checkout concept

Do not imply that a demo is a production client implementation.

12. Project Preview Media

Visual media should be the primary method of communicating website quality.

Prioritize:

Real screenshots
Real screen recordings
Real deployed websites
Real project assets
Carefully designed previews

Avoid:

Stock website screenshots
AI-generated fake interfaces
Generic device mockups
Placeholder images
Fake browser windows that obscure the actual project

If mockup framing is used, it should support the project rather than replace the project.

13. Image Handling

Website screenshots should be optimized appropriately.

Requirements:

Use modern image formats where appropriate
Provide appropriate dimensions
Avoid unnecessarily huge source images
Use responsive image loading
Lazy-load below-the-fold media where appropriate
Provide meaningful alt text
Avoid layout shift
Use stable aspect ratios where possible

Do not sacrifice visible quality excessively for file size.

14. Video Handling

If project videos are used:

Keep previews short
Optimize file size
Avoid autoplay with sound
Prefer muted previews
Provide poster images
Avoid loading every video immediately
Pause/unload media when appropriate
Respect reduced-motion preferences

Do not make video playback essential to understanding the project.

A static fallback should exist.

15. Website Detail Pages

Where a project warrants deeper explanation, link to its project detail page:

/work/[project-slug]

The showcase page should provide enough information to understand the project, while the detailed page can contain:

Problem
Goal
Approach
Design
Architecture
Implementation
Technologies
Key interactions
Screenshots
Results, only when real
Lessons or observations
Live project
Repository, if public

Do not duplicate an entire case study on the showcase page.

16. Technical Capability Display

The page should communicate technical capability without becoming a résumé of technologies.

Relevant examples include:

Frontend
Responsive layouts
Component architecture
Interactive interfaces
Forms
Navigation systems
State management
Accessibility
Backend
APIs
Databases
Authentication
Server-side functionality
Data handling
Integrations
Web Applications
Dashboards
E-commerce flows
Admin systems
Dynamic content
User workflows

Only mention technologies actually used.

Do not add technologies merely because they are popular.

17. Technology Presentation

Technology lists should remain secondary to the actual project.

For example:

React
TypeScript
Next.js
PostgreSQL

is acceptable when accurate.

Do not turn the page into:

React • Next.js • TypeScript • Tailwind • Node • API •
Database • Cloud • AI • DevOps • ...

Long technology walls reduce clarity.

Prioritize technologies relevant to the specific project.

18. Interactions

Interactions should reinforce the website-showcase purpose.

Useful interactions include:

Hover preview
Image zoom
Project reveal
Scroll progression
Video preview
Expandable project information
Smooth page transitions
Interactive live preview

Avoid:

Excessive cursor effects
Constant movement
Random parallax
Decorative particle systems
Excessive 3D
Long loading animations
Interaction that makes navigation slower

Every significant animation should have a reason.

19. 3D Usage

3D may be used where it adds meaningful visual identity.

It should not be required for the showcase to function.

Requirements:

Client-side execution where necessary
Lazy loading
Performance-conscious rendering
Mobile fallback
Reduced-motion handling
Static fallback when appropriate
No unnecessary WebGL on every project

Do not create a heavy 3D scene for a page whose main purpose is showing website work.

The projects themselves are the primary visual content.

20. Visual Design

The page must follow the global design system defined by MASTER.md.

Maintain:

Black
White
Gray
Neutral tones
Strong typography
Generous whitespace
Controlled borders
Subtle depth
Editorial composition
Technical precision

Avoid:

Purple AI gradients
Blue SaaS gradients
Neon effects
Excessive glassmorphism
Generic rounded card grids
Excessive shadows
Floating blobs
AI-generated decorative imagery
Generic icon collections
Template-like dashboard aesthetics

The page should look like a serious personal engineering portfolio.

21. Typography

Typography should create hierarchy through:

Scale
Weight
Spacing
Alignment
Contrast

Large project titles may be used as visual anchors.

Do not rely on dozens of font sizes or decorative typography effects.

Follow the typography system established in MASTER.md.

Do not introduce a new font without a clear architectural reason.

22. Navigation

The showcase must use the shared navigation system.

Expected primary navigation:

Work
What I Do
Live Demos
Experience
Start a Project

The logo/name should return to:

/

Do not create a separate navigation system for this page.

The current page should have a subtle active state.

23. Responsive Design

The website showcase must be designed intentionally for:

Mobile
Tablet
Laptop
Desktop
Large desktop

Do not simply shrink the desktop layout.

Mobile considerations include:

Project media width
Typography scale
Touch targets
Navigation
Video behavior
Embedded demos
Horizontal overflow
Project metadata
CTA placement

No horizontal page overflow should occur.

Interactive elements must remain usable with touch.

24. Accessibility

Requirements:

Semantic HTML
Keyboard navigation
Visible focus states
Meaningful alt text
Accessible links
Accessible buttons
Appropriate heading hierarchy
Sufficient contrast
Reduced-motion support
No interaction that depends exclusively on hover

If a project preview is interactive, there must still be a usable non-hover path to the project.

25. Performance

The showcase can become media-heavy, so performance is a major concern.

Requirements:

Optimize screenshots
Lazy-load non-critical images
Lazy-load videos
Avoid loading every project asset immediately
Avoid unnecessary JavaScript
Avoid global WebGL
Avoid excessive animation
Prevent layout shift
Use appropriate caching/deployment behavior
Keep initial page load reasonable

Measure performance rather than assuming it is acceptable.

26. SEO

The page should have appropriate:

Page title
Description
Open Graph metadata where architecture supports it
Canonical URL where appropriate
Semantic headings

Individual project pages should have project-specific metadata.

Do not create keyword-stuffed descriptions.

27. Empty States

If there are not enough real website projects, do not fabricate content to fill the page.

The implementation should gracefully support:

Few projects
One featured project
No interactive demos
Projects without live URLs
Projects without videos
Projects without repositories

The layout should remain intentional even with limited content.

28. Error and Loading States

Handle:

Image loading
Video loading
Failed media
Failed embedded content
Missing project data
Invalid project routes

A failed preview should not make the entire page unusable.

Provide a fallback such as:

Preview unavailable
View project

when appropriate.

29. Architecture Requirements

Use reusable components where repetition exists.

Potential components:

WebsiteShowcase
FeaturedProject
ProjectPreview
ProjectMedia
ProjectMeta
ProjectTags
ProjectList
LivePreview
DemoPreview
ProjectCTA

Do not create components solely to fragment simple markup.

Keep page-specific composition separate from shared primitives.

30. Data Requirements

Project information should have one source of truth.

The same project data should be reusable by:

Homepage
Work page
Live Demos page
Project detail page
Related-project sections

Do not maintain separate copies of project metadata.

Updating a project's title, image, or technology list should not require editing multiple pages.

31. Security

For interactive previews and external websites:

Do not expose private credentials
Do not expose API keys
Do not embed admin credentials
Do not expose private URLs unintentionally
Do not expose environment variables
Do not include private client information
Use safe iframe policies when embedding content

Public demos must contain only information that is safe to expose.

32. Content Rules

Use concise, specific language.

Prefer:

Multi-page storefront with product variants,
persistent cart state, and checkout flow.

over:

A revolutionary next-generation e-commerce experience
designed to transform online shopping.

Technical claims must be verifiable from the implementation.

33. Do Not Implement

This phase should NOT unnecessarily implement:

AI agent showcase
Automation showcase
Full project management system
Experience page redesign
New business systems
Fake analytics dashboards
Fake client testimonials
Fake performance statistics
Unrelated 3D experiments
Heavy CMS infrastructure

Those belong to other phases or are unnecessary unless the architecture requires them.

34. Acceptance Criteria

Phase 05 is complete when:

Showcase

Website showcase route exists

Page purpose is immediately clear

Real website projects are displayed

Featured project is used when appropriate

Projects are visually curated rather than dumped into a generic grid

Projects

Project data comes from centralized data

Project information is accurate

Completed work and demos are clearly distinguished

Bantex Trading is accurate if included

No fabricated clients, metrics, results, testimonials, or claims

Media

Real screenshots/media are used

Images are optimized

Videos are optimized where used

Media has appropriate fallbacks

Media does not cause major layout shift

Interaction

Project previews work

Live links work where available

Interactive demos work where available

Hover interactions have non-hover alternatives

Reduced-motion behavior works

Architecture

Shared project data is reused

Components are reusable where appropriate

No unnecessary duplication exists

Project detail routes integrate correctly

Design

Global design system is preserved

No blue/purple/neon AI aesthetic

No excessive gradients

No generic SaaS card-wall design

Typography and spacing feel intentional

Visual hierarchy is strong

Responsive

Mobile layout works

Tablet layout works

Desktop layout works

No horizontal overflow

Touch targets are usable

Media behaves appropriately on mobile

Accessibility

Keyboard navigation works

Focus states are visible

Images have meaningful alt text

Semantic headings are used

Contrast is sufficient

Reduced motion is supported

Performance

Initial media loading is controlled

Below-the-fold media is lazy-loaded where appropriate

Heavy 3D is not loaded unnecessarily

Video loading is controlled

No obvious performance regressions are introduced

Technical

Production build succeeds

No critical console errors

No broken routes

No exposed secrets

No placeholder content remains where real content is required

35. Final Rule

The Website Showcase exists to answer one question:

Can Isa actually build high-quality websites and web applications?

The answer should come from the work itself.

Show real interfaces.

Show real interactions.

Show real implementation.

Show real technical decisions.

Do not compensate for a lack of real work with excessive animation, 3D, marketing language, or decorative UI.

Evidence first. Presentation second.