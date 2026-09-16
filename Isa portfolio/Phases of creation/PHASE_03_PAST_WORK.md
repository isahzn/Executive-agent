# PHASE 03 — PAST WORK

## Purpose

Build the portfolio's primary **Past Work / Work** experience.

This phase turns the project's real previous work into a polished, credible portfolio section that demonstrates what has actually been built.

The emphasis is on **evidence over claims**.

Do not invent:

* Clients
* Revenue
* Results
* Testimonials
* Ratings
* Statistics
* Partnerships
* Experience
* Technologies that were not actually used

Every project shown must represent real work, a real experiment, or a clearly labeled personal/demo project.

---

# 1. Read First

Before implementation:

1. Read `MASTER.md`.
2. Read `PHASE_00_AUDIT_ARCHITECTURE.md`.
3. Read `PHASE_01_HOMEPAGE.md`.
4. Read `PHASE_02_MULTIPAGE_ARCHITECTURE.md`.
5. Review the current project/data architecture.
6. Review all existing project assets.

Do not create a separate visual language for the Work section.

---

# 2. Objective

The Work section should answer:

> What has Isa actually built?

A visitor should be able to quickly understand:

* What was built
* What type of project it was
* What technologies/systems were involved
* What Isa contributed
* What the finished result looks like
* Where appropriate, how the project works

The section should feel like a **case-study archive**, not a gallery of random screenshots.

---

# 3. Primary Route

The main route should be:

```text id="f0y8l2"
/work
```

If Phase 02 established a different route, preserve that architecture.

The homepage should link to this page.

---

# 4. Work Categories

Projects may belong to categories such as:

```text id="e8u6l9"
Websites
Web Applications
AI Automation
AI Agents
Backend Systems
Experiments
```

Do not force every project into multiple categories.

Use categories only when they help visitors understand the work.

---

# 5. Project Data Model

Create or refine a centralized project data structure.

A project should be capable of containing:

```text id="8w4m1p"
id
title
slug
shortDescription
description
category
year
status
featured
thumbnail
heroMedia
gallery
technologies
services
role
liveUrl
repositoryUrl
demoUrl
process
notes
```

Only include fields that are actually needed.

Do not populate fields with fabricated information.

---

# 6. Featured Work

Create a curated featured-work section.

Featured projects should represent the strongest available evidence of capability.

Prioritize:

1. Quality
2. Relevance
3. Visual quality
4. Technical complexity
5. Variety
6. Completeness

Do not simply feature the newest projects.

---

# 7. Project Cards

Project cards should visually prioritize the project itself.

A card may contain:

```text id="p1d1q8"
Project visual

Category / year

Project title

Short description

Relevant technologies

View project
```

Avoid turning every project into a generic rounded rectangle.

Use:

* Large imagery
* Strong typography
* Asymmetric layouts
* Editorial spacing
* Subtle interaction
* Visual hierarchy

where appropriate.

---

# 8. Project Interaction

Project previews should have clear interaction states.

Support:

* Hover
* Focus
* Keyboard interaction
* Touch interaction

Possible effects:

* Image scaling
* Position shift
* Typography movement
* Mask reveal
* Cursor interaction

Keep interaction subtle.

Do not make the project difficult to open because of an animation.

---

# 9. Project Detail Pages

Where useful, create individual project pages.

Conceptual route:

```text id="6k0s8n"
/work/project-slug
```

Each project page should be capable of presenting:

```text id="n3t6qz"
Project title
Project summary
Hero media
Role
Services
Technologies
Problem / goal
Approach
Implementation
Result
Gallery
Links
Related projects
```

Only display sections for which real information exists.

---

# 10. Project Hero

A project detail page should begin with a strong visual introduction.

Possible structure:

```text id="a8v4c1"
CATEGORY

PROJECT TITLE

Short description

Project metadata

Large project visual
```

The hero should establish the project before the visitor reaches technical details.

---

# 11. Project Metadata

Useful metadata may include:

```text id="l0m4ne"
Role
Type
Year
Technologies
Status
Live project
```

Do not display metadata merely to fill space.

If a field is unknown, omit it.

Do not write:

> Full-stack developer

if the actual role was more limited.

Be accurate.

---

# 12. Case Study Structure

For substantial projects, use a narrative.

Possible structure:

## 01 — Context

What was the project?

## 02 — Goal

What needed to be built?

## 03 — Approach

How was it approached?

## 04 — Build

What systems/components were implemented?

## 05 — Result

What exists now?

Only include sections supported by real information.

---

# 13. Technical Details

Technical information should be understandable to both technical and non-technical visitors.

Avoid:

> Next.js + Tailwind + Supabase + API + AI

without explaining what those technologies actually did.

Prefer contextual descriptions such as:

> A multi-page storefront with product variants, persistent cart state, and an admin workflow for managing products.

Technology labels can then support the explanation.

---

# 14. Bantex Trading

If Bantex Trading is included, present it accurately.

The project should communicate the actual scope of the work.

Potential areas:

* Multi-page storefront
* Stationery catalogue
* Electrical goods catalogue
* Product pages
* Product variants
* Cart
* Checkout
* Admin functionality
* Responsive design

Only include functionality that actually exists in the final project.

Do not claim payment integration, backend functionality, email automation, or admin features unless implemented.

---

# 15. Project Media

Use real project media.

Possible media:

* Screenshots
* Screen recordings
* Videos
* Product images
* UI captures
* Architecture diagrams

Media should demonstrate the work.

Avoid decorative stock photography.

---

# 16. Image Presentation

Project images should be displayed at useful sizes.

Support:

* Responsive image sizing
* Appropriate aspect ratios
* Lazy loading where appropriate
* High-quality desktop images
* Optimized mobile delivery

Do not stretch images.

Do not use extremely large source files unnecessarily.

---

# 17. Video

If a project has a useful video demonstration, support it.

Video should:

* Load intelligently
* Have a fallback
* Avoid autoplay with sound
* Not block page rendering
* Be optimized
* Work on mobile

Do not add videos simply because the page has empty space.

---

# 18. Filtering

If the number of projects justifies it, provide lightweight filtering.

Possible filters:

```text id="c9z4mk"
All
Websites
Automation
AI Agents
Backend
Experiments
```

Do not implement filtering merely because it is possible.

If there are only a few projects, a curated layout is preferable.

Filtering must remain:

* Fast
* Accessible
* Easy to understand
* Responsive

---

# 19. Search

Do not add project search unless the portfolio contains enough projects for search to provide real value.

A small portfolio does not need a search bar.

---

# 20. Related Work

Project detail pages may include related projects.

Related work should be selected based on meaningful similarity such as:

* Same category
* Similar technology
* Similar business problem
* Similar type of system

Avoid random recommendations.

---

# 21. Navigation Between Projects

If individual project pages exist, provide intuitive navigation.

Potential:

```text id="3x0q0m"
Previous project
Next project
Back to Work
```

Keep navigation subtle.

The visitor should never feel trapped inside a case study.

---

# 22. Homepage Integration

The homepage should use the same project data as `/work`.

Do not create separate homepage project objects.

For example:

```text id="n4gr6s"
projects.ts

→ Homepage selected projects
→ Work archive
→ Project detail pages
```

One source of truth.

---

# 23. Empty States

If a category contains no projects, do not display an empty grid.

Either:

* Hide the category
* Show a useful explanation
* Do not expose the filter

Avoid fake placeholder projects.

---

# 24. Project Status

If projects are unfinished, label them honestly.

Possible statuses:

```text id="v0e1l6"
Completed
In Progress
Prototype
Experiment
Archived
```

Use statuses only where they provide useful context.

---

# 25. External Links

If a project has:

* Live site
* GitHub repository
* Demo
* Documentation

provide the appropriate link.

Never invent URLs.

External links should open predictably.

---

# 26. Accessibility

All project presentation must support:

* Keyboard navigation
* Focus states
* Semantic links
* Image alt text
* Accessible filters
* Accessible video controls
* Proper headings

Project cards that navigate somewhere should use semantic links rather than clickable generic containers.

---

# 27. Responsive Design

Test the Work section at:

```text id="3xv1a2"
Mobile
Tablet
Laptop
Desktop
Large desktop
```

Pay particular attention to:

* Project grids
* Large images
* Asymmetric layouts
* Typography
* Filters
* Project detail galleries
* Navigation

Do not allow horizontal overflow.

---

# 28. Performance

The Work section may contain many large assets.

Use:

* Responsive images
* Lazy loading
* Appropriate image formats
* Video optimization
* Route-level loading
* Efficient rendering

Do not load every project's full gallery on the Work index.

Load detailed media when the visitor opens the relevant project.

---

# 29. SEO

Work pages should have useful metadata.

For individual projects:

```text id="e7h7m8"
Project title
Project description
Project image
Canonical URL where appropriate
Open Graph metadata
```

Do not generate generic metadata for every project.

---

# 30. Content Integrity

This is a strict rule.

Never fabricate portfolio evidence.

Do not invent:

* Client names
* Project outcomes
* Revenue
* User counts
* Conversion rates
* Testimonials
* Awards
* Partnerships
* Performance improvements
* Business results

If a project is a personal project, clearly identify it as such where useful.

If a project is a demo, identify it as a demo.

Credibility comes from accuracy.

---

# 31. Architecture Rules

### DO

* Use centralized project data.
* Reuse project components.
* Use real assets.
* Make project pages visually strong.
* Keep project descriptions concise.
* Show actual technical work.
* Support future projects without restructuring the system.

### DO NOT

* Duplicate project data.
* Build a CMS.
* Add fake content.
* Create huge walls of text.
* Make every project card identical.
* Load every project asset immediately.
* Add unnecessary filters.
* Add unnecessary animations.

---

# 32. Acceptance Criteria

Phase 03 is complete when:

* [ ] `/work` is fully implemented
* [ ] Real projects are represented
* [ ] Project data has one source of truth
* [ ] Featured projects are curated
* [ ] Project cards are responsive
* [ ] Project interactions work
* [ ] Keyboard navigation works
* [ ] Project detail routing works where required
* [ ] Project detail pages support real case-study information
* [ ] Bantex Trading is represented accurately if included
* [ ] No fabricated claims exist
* [ ] Real media is used
* [ ] Images are optimized
* [ ] Videos are optimized where used
* [ ] Empty categories are handled correctly
* [ ] Related projects work where implemented
* [ ] Mobile layouts work
* [ ] Desktop layouts work
* [ ] SEO metadata exists
* [ ] No horizontal overflow exists
* [ ] Production build succeeds
* [ ] No critical console errors exist

---

# 33. Final Validation

Review every project as if it were being evaluated by a potential client.

For each project ask:

```text id="n5y0k9"
Can I understand what this is within 5 seconds?

Can I see evidence that it exists?

Can I understand what Isa actually built?

Can I understand the technical difficulty?

Can I see the finished result?

Are all claims truthful?

Does the presentation look premium?

Does the page work on mobile?
```

If the answer to any important question is no, fix the underlying presentation or content before moving on.

---

# 34. Final Rule

**Past Work is the portfolio's evidence layer.**

The goal is not to make the portfolio appear larger than it is.

The goal is to make the existing work look:

* Clear
* Real
* Technical
* Well-executed
* Easy to understand
* Worth exploring

A smaller collection of genuinely strong projects is preferable to a large collection of padded or fabricated work.
