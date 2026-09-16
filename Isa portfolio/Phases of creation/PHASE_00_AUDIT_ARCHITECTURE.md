# PHASE 00 — AUDIT & ARCHITECTURE

## Purpose

Audit the existing portfolio project before making major UI or architectural changes.

This phase is **analysis and foundation only**. Do not begin implementing the visual redesign unless explicitly required by the audit.

The goal is to understand what already exists, identify what should be preserved, identify what must be replaced, and establish a clean architecture for the remaining phases.

---

# 1. Read First

Before making any changes:

1. Read `MASTER.md`.
2. Read the entire existing project structure.
3. Inspect `package.json`.
4. Inspect the framework configuration.
5. Inspect the routing structure.
6. Inspect all major components.
7. Inspect existing styles/design tokens.
8. Inspect public/static assets.
9. Inspect 3D/WebGL-related code.
10. Inspect existing content/data structures.
11. Inspect deployment configuration.
12. Identify dead, duplicated, experimental, or unused code.

Do not assume the current architecture is correct.

---

# 2. Current Project Audit

Create a clear understanding of:

### Framework

Determine:

* Framework
* Version
* Build tool
* Package manager
* TypeScript/JavaScript
* CSS solution
* Component system
* Routing solution
* Animation libraries
* 3D/WebGL libraries
* Icon libraries
* Image handling
* Deployment platform

### Project Structure

Document:

* `src/`
* `app/` or `pages/`
* `components/`
* `public/`
* assets
* utilities
* hooks
* data
* styles
* configuration files

Identify whether the structure is scalable for a multi-page portfolio.

---

# 3. Existing UI Audit

Inspect the current UI and classify every major section as:

* KEEP
* MODIFY
* REBUILD
* REMOVE

Evaluate:

* Navigation
* Hero
* Typography
* Profile section
* Work/project sections
* Experience
* Services/capabilities
* Animations
* 3D elements
* Cards
* Buttons
* Forms
* Footer
* Mobile layout
* Accessibility
* Loading states
* Error states

Do not redesign sections yet.

The purpose is to establish what needs to happen later.

---

# 4. Design-System Audit

Identify the existing:

### Typography

Record:

* Current fonts
* Font weights
* Heading scale
* Body scale
* Letter spacing
* Line heights

### Color

Record:

* Background colors
* Text colors
* Border colors
* Accent colors
* Gradients
* Shadows

### Spacing

Identify:

* Container widths
* Section spacing
* Grid gaps
* Padding conventions
* Breakpoints

### Visual Language

Determine whether the existing design follows the intended direction from `MASTER.md`.

The target direction is:

* Premium
* Minimal
* Technical
* Editorial
* High contrast
* Black/white/neutral
* Strong typography
* Controlled 3D
* Sophisticated motion

Avoid:

* Generic AI aesthetics
* Excessive gradients
* Neon colors
* Blue/purple AI styling
* Generic SaaS cards
* Fake testimonials
* Fake ratings
* Excessive glassmorphism
* Template-like layouts
* Unnecessary icons
* Visual clutter

---

# 5. Architecture Requirements

The final portfolio must support multiple pages without becoming difficult to maintain.

Architecture should prioritize:

* Reusable components
* Reusable layouts
* Shared navigation
* Shared footer
* Shared typography
* Shared animation primitives
* Shared project data
* Shared media handling
* Clear separation of content and presentation
* Easy addition of future projects
* Easy modification of existing projects

Avoid:

* Giant page components
* Repeated markup
* Hardcoded duplicate project information
* Page-specific versions of identical components
* Unnecessary abstraction
* Over-engineering

Use the simplest architecture that remains scalable.

---

# 6. Content Architecture

Determine what information should be data-driven.

Potential data structures include:

```text
projects
experiences
capabilities
processes
website demos
automation demos
AI agent demos
case studies
```

Project information should ideally be stored separately from presentation components.

For example:

```text
project title
description
category
thumbnail
images
technologies
live URL
repository URL
status
featured
```

Do not create unnecessary CMS infrastructure.

A local/static data architecture is acceptable unless `MASTER.md` explicitly requires something else.

---

# 7. Routing Audit

Determine the current routing system and compare it against the intended portfolio architecture.

The portfolio should eventually support dedicated pages for the major content areas.

Expected conceptual structure:

```text
/
├── work
├── what-i-do
├── live-demos
├── experience
└── start-a-project
```

The exact implementation may differ if `MASTER.md` specifies another structure.

Do not create all routes during this phase.

Only establish the routing architecture and document what will be implemented later.

---

# 8. 3D / Motion Audit

Inspect all existing 3D and animation systems.

Determine:

* Library being used
* Where rendering occurs
* Whether it is client-only
* Whether it affects initial page load
* Whether it causes hydration issues
* Whether it is mobile-safe
* Whether it has performance safeguards
* Whether animations respect reduced-motion preferences

3D should be treated as a visual system, not decoration added everywhere.

The future implementation should favor:

* One strong hero 3D experience
* Controlled interactive elements
* Lightweight motion elsewhere
* Progressive enhancement
* Reduced-motion support

Avoid making every section move.

---

# 9. Asset Audit

Inventory all existing assets.

Classify them as:

### KEEP

Assets already suitable for the final portfolio.

### REPLACE

Assets that exist but do not meet the final visual direction.

### MISSING

Assets that must be supplied or created later.

Important assets may include:

* Profile photo
* Project screenshots
* Project videos
* Logos
* 3D assets
* Icons
* Background textures
* Website mockups
* Automation diagrams
* AI-agent visualizations

Do not invent personal/project assets that do not exist.

Use placeholders only where explicitly appropriate.

---

# 10. Performance Audit

Identify likely performance risks.

Check for:

* Oversized images
* Unoptimized video
* Large JavaScript bundles
* Unnecessary dependencies
* Client-side rendering where unnecessary
* Excessive animation
* Heavy 3D scenes
* Layout shift
* Font loading problems
* Duplicate assets
* Unused packages

Establish performance priorities for later phases.

Target principles:

* Fast initial render
* Optimized images
* Lazy loading
* Code splitting where useful
* 3D loaded intelligently
* Video loaded intelligently
* Minimal dependencies
* No unnecessary client-side work

Do not prematurely optimize code that has not been identified as a real issue.

---

# 11. Responsive Audit

Inspect the current behavior at:

```text
Mobile
Tablet
Laptop
Desktop
Large desktop
```

Identify:

* Overflow
* Broken grids
* Typography scaling issues
* Navigation problems
* 3D viewport issues
* Image cropping problems
* Button sizing issues
* Excessive horizontal padding
* Sections that become unusable on mobile

Do not simply shrink desktop layouts.

Later phases must use responsive layouts intentionally.

---

# 12. Accessibility Audit

Check:

* Semantic HTML
* Heading hierarchy
* Keyboard navigation
* Focus states
* Button semantics
* Link semantics
* Image alt text
* Color contrast
* Reduced motion
* Form labels
* Screen-reader considerations

Accessibility should be part of implementation rather than a final patch.

---

# 13. Dependency Audit

Review all dependencies.

For each dependency determine:

```text
Package
Purpose
Currently used?
Required later?
Replaceable?
Remove?
```

Remove dependencies only when it is safe to do so.

Do not add libraries merely because they are popular.

Every dependency should have a clear reason.

---

# 14. Technical Debt

Identify:

* Duplicate components
* Dead code
* Temporary hacks
* Inconsistent naming
* Inconsistent styling
* Hardcoded content
* Broken imports
* Console errors
* Hydration issues
* Type errors
* Build errors
* Deprecated APIs
* Unused files

Rank issues:

### Critical

Blocks future development.

### High

Likely to cause significant problems.

### Medium

Should be cleaned up during architecture work.

### Low

Cosmetic or optional cleanup.

---

# 15. Architecture Decision

After the audit, define the recommended architecture.

Document:

### Application structure

```text
app/
components/
data/
lib/
styles/
public/
```

Use the project's actual framework conventions rather than blindly copying this example.

### Component categories

For example:

```text
layout
navigation
sections
projects
media
motion
3d
ui
forms
```

Only create categories that are actually useful.

---

# 16. Rules For Later Phases

Establish these rules before proceeding:

1. Do not rebuild working systems without a reason.
2. Do not introduce unnecessary dependencies.
3. Do not duplicate components.
4. Do not hardcode repeated content.
5. Keep content separate from presentation where practical.
6. Keep 3D isolated from ordinary UI where possible.
7. Keep animation purposeful.
8. Every page must be responsive.
9. Every interactive element must be keyboard accessible.
10. Do not use fake portfolio content.
11. Do not fabricate client results, testimonials, ratings, or statistics.
12. Do not use generic AI imagery unless explicitly required.
13. Do not compromise the visual direction for convenience.
14. Do not sacrifice performance for visual effects.
15. Do not implement later-phase features early unless required by architecture.

---

# 17. Required Output

At the end of Phase 00, produce an audit report containing:

## A. Current Stack

```text
Framework:
Language:
Styling:
Routing:
3D:
Animation:
Deployment:
Package manager:
```

## B. Current Architecture

Explain the existing architecture briefly.

## C. Problems Found

List problems by severity.

## D. Keep / Modify / Rebuild / Remove

Create a table:

| Area       | Decision | Reason |
| ---------- | -------- | ------ |
| Navigation | ...      | ...    |
| Hero       | ...      | ...    |
| Projects   | ...      | ...    |
| 3D         | ...      | ...    |
| Styling    | ...      | ...    |
| Routing    | ...      | ...    |

## E. Recommended Architecture

Describe the final architecture that later phases should follow.

## F. Dependency Changes

List:

```text
Keep:
Remove:
Replace:
Add later:
```

## G. Asset Requirements

List:

```text
Existing:
Missing:
Needs replacement:
Needs optimization:
```

## H. Performance Risks

List the major risks and their planned solutions.

## I. Responsive Risks

List known responsive issues.

## J. Phase 01 Readiness

Explicitly state whether the project is ready for Phase 01.

If not ready, identify exactly what must be fixed first.

---

# 18. Implementation Restrictions

During Phase 00:

### DO

* Inspect
* Audit
* Document
* Fix critical blockers
* Fix broken imports/build issues if necessary
* Establish architecture decisions
* Preserve useful existing work

### DO NOT

* Redesign the homepage
* Build new showcase pages
* Add unnecessary animations
* Add unnecessary dependencies
* Replace the entire project blindly
* Generate fake project content
* Implement future phases
* Rewrite functioning code without justification

---

# 19. Completion Criteria

Phase 00 is complete only when:

* [ ] Existing project has been fully audited
* [ ] Framework and stack are documented
* [ ] Existing routing is understood
* [ ] Existing components are understood
* [ ] Existing assets are inventoried
* [ ] Dependencies are reviewed
* [ ] Technical debt is identified
* [ ] Performance risks are identified
* [ ] Responsive risks are identified
* [ ]
