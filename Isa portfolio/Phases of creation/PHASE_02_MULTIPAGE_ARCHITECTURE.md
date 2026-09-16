# PHASE 02 — MULTIPAGE ARCHITECTURE

## Purpose

Transform the portfolio from a homepage-centered experience into a clean, scalable multi-page portfolio.

This phase establishes the site's **routing, page hierarchy, shared layouts, navigation behavior, and cross-page architecture**.

The homepage created in Phase 01 remains the visual foundation.

Do not fully implement the detailed content systems belonging to later phases.

---

# 1. Read First

Before implementation:

1. Read `MASTER.md`.
2. Read `PHASE_00_AUDIT_ARCHITECTURE.md`.
3. Read `PHASE_01_HOMEPAGE.md`.
4. Review the actual implementation produced by Phase 01.
5. Follow all architectural decisions already established.

Do not redesign the homepage simply because this phase introduces additional pages.

---

# 2. Primary Objective

The final portfolio should feel like **one cohesive website**, not several independent websites connected by links.

Every page must share:

* Navigation
* Typography
* Color system
* Spacing system
* Motion language
* Buttons
* Transitions
* Footer
* Responsive behavior
* Accessibility conventions

Pages may have different compositions, but they must clearly belong to the same design system.

---

# 3. Page Architecture

Establish the primary page structure.

Target conceptual architecture:

```text
/
├── work
├── what-i-do
├── live-demos
├── experience
└── start-a-project
```

The exact URLs may differ if Phase 00 or `MASTER.md` established another convention.

The important requirement is that the architecture clearly separates:

### Work

Previous projects and completed work.

### What I Do

Capabilities, services, and technical areas.

### Live Demos

Interactive demonstrations and technical experiments.

### Experience

Relevant experience, background, and previous work.

### Start a Project

Project inquiry/contact flow.

---

# 4. Route Responsibilities

Each page should have one clear purpose.

## `/`

Homepage.

Purpose:

* Establish identity
* Communicate capabilities
* Introduce selected work
* Direct visitors deeper into the portfolio

---

## `/work`

Purpose:

Show completed projects and previous work.

This page should eventually become the main project archive.

Detailed implementation belongs primarily to Phase 03.

---

## `/what-i-do`

Purpose:

Explain what can be built.

Potential categories:

```text
Web Development
AI Automation
AI Agents
Backend Systems
```

Detailed content and presentation should be expanded in later phases where appropriate.

---

## `/live-demos`

Purpose:

Provide access to working demonstrations.

Potential categories:

```text
Websites
Automations
AI Agents
Experiments
```

Detailed showcase implementations belong to Phases 05–07.

---

## `/experience`

Purpose:

Present relevant previous experience and background.

Do not fabricate employment, clients, achievements, or credentials.

Detailed content belongs to Phase 03/04 where appropriate.

---

## `/start-a-project`

Purpose:

Allow a visitor to begin a project inquiry.

The page should eventually contain:

* Project type
* Description
* Goals
* Optional budget
* Contact information
* Submission flow

Do not build a complex CRM or backend system in this phase.

---

# 5. Shared Layout

Create a reusable global layout.

Conceptually:

```text
RootLayout
├── Navigation
├── PageContent
└── Footer
```

Do not duplicate navigation or footer markup across every page.

The shared layout should support:

* Page transitions
* Global metadata
* Responsive behavior
* Consistent spacing
* Global background treatment

---

# 6. Navigation

The navigation must work consistently across all pages.

Primary navigation should represent the major destinations.

Expected conceptual structure:

```text
Work
What I Do
Live Demos
Experience
Start a Project
```

The logo/name should navigate to `/`.

Do not add a separate `Home` navigation item unless `MASTER.md` explicitly requires it.

---

# 7. Active Navigation State

Users should be able to understand which section they are currently viewing.

Implement an appropriate active state.

Possible methods:

* Typography change
* Underline
* Small indicator
* Opacity/contrast change
* Subtle motion

Do not make the active state visually loud.

---

# 8. Navigation on Mobile

Mobile navigation must be intentionally designed.

It should provide access to every major route.

Requirements:

* Touch-friendly targets
* Keyboard accessibility
* Clear open/close state
* No accidental navigation
* No horizontal overflow
* Proper focus management where applicable

Do not simply shrink the desktop navigation until it stops fitting.

---

# 9. Page Transitions

If page transitions are used, they should be subtle.

Possible behavior:

```text
Current page
↓
short transition
↓
New page
```

Avoid:

* Long loading animations
* Full-screen unnecessary effects
* Excessive blur
* Complex transitions that delay navigation

Navigation must always feel fast.

Respect:

```text
prefers-reduced-motion
```

---

# 10. URL Design

Routes should be:

* Short
* Human-readable
* Stable
* Consistent
* Lowercase where appropriate

Avoid URLs such as:

```text
/page?id=7
/projectPageFinal2
/new-work-page
```

Prefer semantic routes.

Project detail routes, if required later, should follow a consistent pattern such as:

```text
/work/project-name
```

Do not implement the complete project routing system unless required by the architecture.

---

# 11. Page-Level Layout System

Create reusable page primitives where appropriate.

Potential components:

```text
PageShell
PageHeader
PageTitle
PageIntro
Section
SectionHeading
Container
Footer
```

Do not create excessive abstractions.

A component should exist because it provides meaningful reusable behavior or structure.

---

# 12. Page Headers

Secondary pages should have a consistent header system.

A page header may contain:

```text
small category / number

Large page title

short description
```

Example conceptual hierarchy:

```text
WORK

Selected projects, experiments, and systems I've built.
```

Do not make every page header identical in exact composition.

The system should be consistent while allowing pages to have individual identities.

---

# 13. Visual Hierarchy

Secondary pages should feel less visually dominant than the homepage hero while still being strong.

The homepage establishes:

> Who I am.

Secondary pages establish:

> What I have built and how I work.

Maintain strong typography and whitespace.

Avoid filling every available area with content.

---

# 14. Footer

Create one reusable footer.

It should provide appropriate access to:

* Name/identity
* Main navigation
* Relevant external links
* Contact/project action
* Copyright information where appropriate

Do not overload the footer.

Do not include fake social accounts or nonexistent platforms.

Only include links that actually exist.

---

# 15. Shared Components

Audit the Phase 01 components and identify what should become globally reusable.

Potential shared components:

```text
Navbar
Footer
Button
Link
PageShell
SectionHeading
Container
MediaFrame
ProjectPreview
MotionWrapper
```

Only promote components that genuinely belong to the global design system.

Do not refactor working code purely for abstraction.

---

# 16. Content/Data Architecture

The multi-page system must support shared data.

For example:

```text
projects
capabilities
experiences
demos
processes
```

A project should not need to be manually rewritten in:

* Homepage
* Work page
* Live Demos page
* Individual project page

Where appropriate, use one source of truth.

---

# 17. Project Routes

If individual project pages are required by the architecture, establish the routing pattern.

Conceptually:

```text
/work
/work/bantex-trading
/work/project-two
/work/project-three
```

Individual project pages should eventually support:

* Project title
* Description
* Screenshots
* Videos
* Technologies
* Process
* Outcome where truthful
* Links
* Related work

Do not build the full project detail experience in Phase 02.

---

# 18. Live Demo Routes

Establish a consistent structure for demos.

Conceptually:

```text
/live-demos
/live-demos/website/example
/live-demos/automation/example
/live-demos/agent/example
```

The exact route architecture may be simplified depending on the number of demos.

The goal is to avoid creating an unstructured collection of demo URLs.

---

# 19. Error Pages

Establish a basic fallback for invalid routes.

At minimum:

```text
404
```

The error page should:

* Match the portfolio design
* Explain that the page does not exist
* Provide a route back to the homepage
* Avoid looking like a generic framework error screen

Keep it simple.

---

# 20. Loading States

Where navigation or page rendering requires loading states, create a consistent visual treatment.

Loading states should be:

* Minimal
* Fast
* Consistent
* Accessible

Avoid fake loading progress.

Do not show a loading animation when content can appear immediately.

---

# 21. Metadata Architecture

Each page should eventually support its own metadata.

Create a consistent approach for:

```text
title
description
Open Graph title
Open Graph description
Open Graph image
canonical URL where appropriate
```

Do not duplicate metadata logic unnecessarily.

Page-specific metadata should be easy to modify.

---

# 22. Responsive Architecture

All pages must share consistent responsive rules.

Test:

```text
Mobile
Tablet
Laptop
Desktop
Large desktop
```

Check:

* Navigation
* Page headers
* Containers
* Typography
* Grids
* Images
* Buttons
* Footer
* Page transitions

A page should not introduce a completely separate breakpoint system without a strong reason.

---

# 23. Accessibility Architecture

The global architecture must support:

* Keyboard navigation
* Visible focus states
* Semantic landmarks
* Correct heading hierarchy
* Accessible navigation
* Accessible mobile menu
* Reduced motion
* Screen-reader-friendly labels

Navigation should use semantic elements.

Interactive elements must not be implemented as clickable decorative elements.

---

# 24. Performance

The multi-page architecture must avoid unnecessary global JavaScript.

Prefer:

* Server/static rendering where appropriate
* Code splitting
* Lazy loading
* Route-level loading
* Reusable lightweight components

Heavy systems such as:

* 3D
* video
* complex demos

should not load on pages that do not need them.

---

# 25. Architecture Rules

### DO

* Keep one shared design system.
* Reuse layouts.
* Reuse project data.
* Keep routes predictable.
* Keep pages independently maintainable.
* Preserve the homepage.
* Make navigation fast.
* Keep mobile navigation intentional.

### DO NOT

* Duplicate global navigation.
* Duplicate project data.
* Create separate styling systems per page.
* Add unnecessary routing complexity.
* Load every library globally.
* Add heavy 3D to every page.
* Create pages without a clear purpose.
* Implement detailed later-phase content prematurely.

---

# 26. Phase Scope

Phase 02 should establish:

* [ ] Routing
* [ ] Shared layout
* [ ] Navigation
* [ ] Footer
* [ ] Page shell
* [ ] Page header system
* [ ] Active navigation state
* [ ] Mobile navigation
* [ ] Page transition system if appropriate
* [ ] 404 page
* [ ] Loading strategy
* [ ] Metadata architecture
* [ ] Project route architecture
* [ ] Demo route architecture
* [ ] Shared data architecture

Phase 02 should **not** fully build:

* Past Work archive
* Process page
* Website showcase
* Automation showcase
* AI-agent showcase
* Project management system

Those belong to later phases.

---

# 27. Acceptance Criteria

Phase 02 is complete only when:

* [ ] All primary routes exist
* [ ] Navigation works from every page
* [ ] Logo/name returns to homepage
* [ ] Active navigation state works
* [ ] Mobile navigation works
* [ ] Keyboard navigation works
* [ ] Shared layout is implemented
* [ ] Shared footer is implemented
* [ ] Page shell is reusable
* [ ] Page headers follow a consistent system
* [ ] Invalid routes have a custom 404
* [ ] Loading behavior is consistent
* [ ] Metadata architecture exists
* [ ] Project route structure is established
* [ ] Demo route structure is established
* [ ] Shared data architecture is established
* [ ] No duplicated global components exist
* [ ] No horizontal overflow exists
* [ ] Responsive layouts work
* [ ] Reduced motion is supported
* [ ] Production build succeeds
* [ ] No critical console errors exist

---

# 28. Final Validation

Navigate through the entire site manually.

Test:

```text
/
→ Work
→ What I Do
→ Live Demos
→ Experience
→ Start a Project
→ Homepage
```

Then test:

```text
Desktop
Mobile
Keyboard
Reduced motion
Invalid URL
Refresh on every route
Direct URL access
```

Every route must remain usable when opened directly.

---

# 29. Final Rule

**Phase 02 establishes the skeleton of the entire portfolio.**

Do not make every page visually complete yet.

The goal is to create a strong, reusable architecture so that Phases 03–08 can add substantial content without requiring another rewrite of the site's foundation.
