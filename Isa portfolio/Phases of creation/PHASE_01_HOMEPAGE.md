# PHASE 01 — HOMEPAGE

## Purpose

Build the portfolio homepage according to the architecture established in `PHASE_00_AUDIT_ARCHITECTURE.md` and the global rules in `MASTER.md`.

This phase focuses **only on the homepage**.

The homepage must establish the visual identity of the entire portfolio: premium, minimal, technical, personal, and confident without looking like a generic developer template or AI-generated website.

Do not implement the major showcase pages from later phases.

---

# 1. Read First

Before implementing:

1. Read `MASTER.md`.
2. Read `PHASE_00_AUDIT_ARCHITECTURE.md`.
3. Review the Phase 00 audit results.
4. Inspect the existing homepage implementation.
5. Inspect the existing assets.
6. Confirm the established architecture before adding components.

Do not ignore architectural decisions made in Phase 00.

---

# 2. Homepage Objective

The homepage should immediately communicate:

> Isa Hassen — developer building websites, automations, AI agents, and backend systems.

It should feel like the homepage of a serious independent developer/technical builder.

It should **not** feel like:

* A generic freelancer template
* An AI agency landing page
* A SaaS startup
* A template marketplace
* A collection of cards
* An overly animated WebGL experiment

The visual system should rely primarily on:

* Typography
* Composition
* Whitespace
* Scale
* Motion
* Carefully controlled 3D
* Real work

---

# 3. Hero Section

The hero is the most important section on the page.

It must contain a large visual treatment of:

# Isa Hassen

The name should be one of the dominant visual elements on the entire website.

The typography should feel:

* Oversized
* Editorial
* Technical
* Precise
* Confident

Avoid making the name look like ordinary navbar text.

---

# 4. Hero Composition

The hero should establish a strong visual hierarchy.

Conceptually:

```text
small contextual information

ISA HASSEN
large 3D / dimensional typography

short positioning statement

primary actions

profile image / visual element
```

The exact composition should be determined by the existing design and `MASTER.md`.

Do not blindly copy this layout.

The final composition should feel intentionally designed rather than assembled from cards.

---

# 5. Profile Photo

Use the user's **real profile photo**.

Do not generate a replacement person.

Do not use:

* AI-generated portraits
* Stock photos
* Generic developer avatars
* Placeholder faces

The real profile photo should be integrated into the visual system rather than simply placed inside a circular avatar.

Possible treatments include:

* Editorial crop
* Large portrait
* Masked image
* Layered composition
* Subtle interaction
* Controlled motion

Do not over-process the image.

If the required profile photo is not already available in the project, stop short of inventing one and identify it as a required asset.

---

# 6. Positioning

The homepage should clearly communicate the user's capabilities.

Core areas:

### Web Development

Modern websites and web applications.

### AI Automation

Business workflows and automated systems.

### AI Agents

Agents capable of performing useful business tasks.

### Backend Systems

APIs, databases, integrations, and infrastructure.

Do not turn these into generic SaaS feature cards.

The information should feel integrated into the overall visual composition.

---

# 7. Hero Copy

Keep the copy concise.

The hero should answer:

1. Who is this?
2. What does he build?
3. What can the visitor do next?

Avoid:

* Long personal biographies
* Corporate language
* Empty buzzwords
* "Revolutionizing the future"
* "Next-generation solutions"
* "AI-powered innovation"
* Generic claims without evidence

The portfolio should demonstrate capability through actual work rather than exaggerated claims.

---

# 8. Primary Actions

The homepage should provide clear actions.

Primary navigation/action concepts:

```text
Work
What I Do
Live Demos
Experience
Start a Project
```

Use the exact navigation structure established by `MASTER.md` / Phase 00 if it differs.

The homepage should not overwhelm the user with many CTAs.

There should be a clear primary path toward seeing the work.

---

# 9. Navigation

Create or refine the global navigation.

Navigation should be:

* Minimal
* Clear
* Responsive
* Keyboard accessible
* Consistent with the final architecture

The logo/name should lead to the homepage.

Do not add unnecessary navigation items.

Avoid:

* Hamburger menus on large screens
* Excessive navigation labels
* Decorative navigation elements
* Large SaaS-style nav bars

Mobile navigation should be intentionally designed rather than simply collapsed.

---

# 10. 3D Hero System

The homepage may use 3D as a major visual element.

The 3D system must have a clear purpose.

Possible purposes:

* Dimensional typography
* Interactive name treatment
* Depth behind the profile
* Controlled environmental object
* Subtle spatial interaction

The 3D system must not exist simply because WebGL is available.

---

# 11. 3D Performance Rules

3D must be implemented defensively.

Requirements:

* Avoid blocking initial page rendering.
* Lazy-load heavy 3D where appropriate.
* Avoid unnecessarily complex geometry.
* Avoid excessive textures.
* Avoid continuous expensive calculations when nothing changes.
* Respect mobile limitations.
* Respect `prefers-reduced-motion`.
* Provide a fallback for unsupported/weak devices where appropriate.

The page should remain usable if 3D fails.

The portfolio's content must never depend entirely on WebGL.

---

# 12. Motion

Motion should reinforce hierarchy.

Use animation for:

* Hero entrance
* Typography
* Image reveal
* Navigation transitions
* Scroll-based visual relationships
* Subtle hover states

Avoid:

* Constant movement everywhere
* Excessive parallax
* Bouncing elements
* Random floating objects
* Animation that delays reading
* Animation that exists purely for spectacle

Motion should feel controlled and intentional.

---

# 13. Homepage Sections

The homepage should eventually contain a curated subset of the portfolio content.

Potential structure:

```text
Navigation
Hero
Capabilities / What I Build
Selected Work
Process preview
Live Demo preview
Experience preview
Final CTA
Footer
```

The exact sections must follow `MASTER.md`.

Do not implement full versions of later-phase systems here.

For example:

* Full website showcase → Phase 05
* Full automation showcase → Phase 06
* Full AI-agent showcase → Phase 07
* Full project management system → Phase 08

The homepage can contain previews/links to these areas.

---

# 14. Selected Work Preview

The homepage should show enough real work to establish credibility.

Use actual projects.

Potential examples include:

* Bantex Trading
* Other completed websites
* Automation systems
* AI-agent systems

Do not fabricate project metrics.

Do not use fake:

* Client counts
* Revenue
* Testimonials
* Ratings
* Conversion rates
* "Trusted by" logos

A project can demonstrate quality without invented statistics.

---

# 15. Project Presentation

Project previews should prioritize the work itself.

Use:

* Real screenshots
* Real interfaces
* Real videos
* Real descriptions
* Technologies where useful
* Clear project links

Avoid generic cards with:

```text
icon
title
3-line description
"Learn More"
```

for every project.

Project presentation should feel editorial and visual.

---

# 16. Visual Design

Follow the global design system from `MASTER.md`.

Target:

* Black
* White
* Gray
* Neutral tones
* Strong contrast
* Large typography
* Generous spacing
* Sharp composition
* Subtle borders
* Controlled shadows
* Refined motion

Avoid:

* Neon
* Purple/blue AI gradients
* Excessive glassmorphism
* Rainbow gradients
* Generic dark SaaS UI
* Overuse of rounded cards
* Decorative blobs
* Stock illustrations
* AI-generated visual clichés

---

# 17. Typography

Typography is one of the primary design tools.

The system should have:

* Clear display typography
* Highly readable body typography
* Strong hierarchy
* Consistent spacing
* Responsive scaling

Do not use a font simply because it is common in developer templates.

If `MASTER.md` specifies a font, follow it.

If it does not, choose a typography system that supports the intended editorial/technical aesthetic.

Do not introduce several unnecessary fonts.

---

# 18. Responsive Homepage

The homepage must be designed intentionally for:

```text
Mobile
Tablet
Laptop
Desktop
Large desktop
```

Mobile must not simply be:

> Desktop but narrower.

Specifically test:

* Hero typography
* Profile image
* 3D canvas
* Navigation
* CTA buttons
* Project previews
* Section spacing
* Horizontal overflow
* Touch interactions

The hero must remain visually strong on small screens.

---

# 19. Accessibility

Implement:

* Semantic headings
* Correct heading hierarchy
* Accessible links
* Accessible buttons
* Keyboard navigation
* Visible focus states
* Image alt text
* Sufficient contrast
* Reduced-motion support

Do not sacrifice accessibility for visual effects.

---

# 20. SEO Foundation

Implement basic homepage metadata.

Include where appropriate:

* Page title
* Description
* Open Graph metadata
* Social preview image
* Canonical URL if architecture supports it
* Appropriate semantic structure

Do not spend this phase building a complex SEO system.

---

# 21. Component Architecture

Use reusable components where repetition exists.

Potential components:

```text
Navbar
Hero
ProfileVisual
CapabilitySection
ProjectPreview
SectionHeading
CTA
Footer
```

Do not create a component for every small `<div>`.

Component boundaries should represent meaningful reusable behavior or structure.

---

# 22. Data Architecture

Projects and other repeated content should use the data architecture established in Phase 00.

For example:

```text
data/projects
data/capabilities
```

Do not duplicate project information between:

* Homepage
* Work page
* Showcase pages

Later phases should be able to reuse the same project data.

---

# 23. Error Handling

The homepage should degrade gracefully.

Examples:

### 3D fails

Show a static visual fallback.

### Image fails

Maintain layout integrity.

### Animation fails

Content remains accessible.

### JavaScript is delayed

Important content should remain understandable.

The site must not become a blank screen because one visual system fails.

---

# 24. Performance Requirements

Before considering the phase complete:

Check:

* Image sizes
* Image formats
* Lazy loading
* Font loading
* JavaScript bundle
* 3D loading
* Animation cost
* Layout shift
* Mobile performance

Do not optimize blindly.

Fix measurable or obvious bottlenecks.

---

# 25. Implementation Restrictions

### DO

* Build the homepage only.
* Reuse the Phase 00 architecture.
* Use real assets.
* Use real project information.
* Build reusable components.
* Keep the visual system consistent.
* Test responsive behavior.
* Test keyboard navigation.
* Test 3D fallback behavior.

### DO NOT

* Build the complete showcase pages.
* Build the admin system.
* Build a CMS.
* Add fake testimonials.
* Add fake statistics.
* Add fake clients.
* Generate fake project results.
* Add unnecessary dependencies.
* Overload the page with animations.
* Turn the homepage into a giant dashboard.
* Implement later phases prematurely.

---

# 26. Homepage Acceptance Criteria

Phase 01 is complete only when:

* [ ] Homepage follows `MASTER.md`
* [ ] Phase 00 architecture is respected
* [ ] Hero is implemented
* [ ] "Isa Hassen" is visually dominant
* [ ] Real profile photo is used
* [ ] Core capabilities are communicated
* [ ] Navigation is implemented
* [ ] Primary CTA is clear
* [ ] Selected work preview is implemented
* [ ] No fabricated claims are present
* [ ] 3D works where supported
* [ ] 3D has a fallback
* [ ] Reduced motion is supported
* [ ] Mobile layout works
* [ ] Tablet layout works
* [ ] Desktop layout works
* [ ] Keyboard navigation works
* [ ] Images have appropriate alt text
* [ ] Basic metadata is implemented
* [ ] No horizontal overflow
* [ ] No critical console errors
* [ ] Production build succeeds
* [ ] Performance is acceptable
* [ ] Later-phase functionality has not been unnecessarily implemented

---

# 27. Visual Quality Test

Before declaring completion, view the homepage as if seeing it for the first time.

Ask:

### Does it immediately look personal?

It should clearly belong to Isa rather than looking like a template.

### Does the hero have a strong focal point?

The name and visual identity should dominate.

### Does it look premium without being flashy?

Visual sophistication should come from composition and execution.

### Does it look like an AI agency?

If yes, remove the generic AI aesthetic.

### Does it communicate actual capability?

The visitor should understand what is being built.

### Does the work look real?

Use actual projects and interfaces.

### Does mobile still feel intentional?

If mobile looks like a broken desktop layout, the phase is not complete.

---

# 28. Final Deliverable

At the end of Phase 01, the repository should contain a production-quality homepage that establishes the visual language for the remaining portfolio.

The homepage becomes the visual benchmark for:

* Phase 02
* Phase 03
* Phase 04
* Phase 05
* Phase 06
* Phase 07
* Phase 08
* Phase 09
* Phase 10

Later phases should extend this system rather than introducing unrelated visual languages.

---

# 29. Final Rule

**Build the homepage as the foundation of the portfolio's identity, not as a collection of sections.**

The page should be memorable because of:

* Typography
* Composition
* Real work
* Personal identity
* Controlled 3D
* Precise interaction

—not because it contains the maximum number of effects.
