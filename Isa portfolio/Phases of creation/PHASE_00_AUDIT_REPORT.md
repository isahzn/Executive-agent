# PHASE 00 — AUDIT REPORT

Date: 2026-09-13

---

## A. Current Stack

```text
Framework:      None (static HTML prototype only)
Language:       HTML + CSS + vanilla JS (prototype)
Styling:        Single inline <style> block, custom properties
Routing:        None — one page with anchor links
3D:             CSS 3D transforms only (perspective, preserve-3d)
Animation:      CSS keyframes + vanilla JS (IntersectionObserver, mousemove)
Deployment:     None configured
Package manager: npm (Node v24.14.1 available)
```

## B. Current Architecture

The folder contains only:

- `preview.html` — a 2,450-line single-page static prototype (hero, marquee, capabilities, Bantex section, about, systems diagram, demos, contact, footer) with all CSS/JS inline.
- `me.jpeg` — the real profile photo (unreferenced by the prototype).

The prototype declares the intended stack in its About section: **Next.js · Vercel · CSS**. No `MASTER.md` exists; `APORTFOLIO_SPEC.md` is the governing document. The sibling Bantex project (`Projects/BantexTrading web/web`) uses **Next.js 16.3.4 / React 19 / TypeScript**, confirming the intended stack and giving a consistent version target.

## C. Problems Found

### Critical
- C1. No multi-page architecture — spec §6 requires real routes (/ /work /processes /contact); the prototype is one page with anchors.
- C2. Hero does not comply with spec §4: the name "ISA HASSEN" must be the dominant 3D typographic element; the prototype hero is a sentence headline.
- C3. Real profile photo exists but is unused.

### High
- H1. The Bantex section renders a fake CSS-mock browser instead of the actual landing-page screenshot (spec §5 requires the real screenshot once provided; `Projects/BantexTrading web/Pic preview.png` exists).
- H2. No reusable project data structure (spec §13); project copy is hardcoded in markup.
- H3. No asset organization (spec §15).

### Medium
- M1. Prototype JS animates on every `mousemove` with layout reads (`getBoundingClientRect`) — fine for a prototype, not acceptable as final code.
- M2. Reduced-motion handling brute-forces every element's duration via JS instead of a CSS media query.
- M3. `mailto:YOUR_EMAIL` / `wa.me/YOUR_NUMBER` placeholders — acceptable per spec §16 until real details are provided, must remain clearly placeholder.
- M4. Custom cursor hides the native cursor's affordance and has no reduced-motion/opt-out handling; keep only as an enhancement, never critical.

### Low
- L1. Monospace/Arial fallback stack — real display typeface needed for the editorial look.
- L2. Marquee/demos sections are placeholders ("More experiments coming here") — not part of spec's required homepage content; drop or fold into later phases.

## D. Keep / Modify / Rebuild / Remove

| Area        | Decision | Reason |
| ----------- | -------- | ------ |
| Design tokens (black/white/gray palette, container, section rhythm) | KEEP | Matches spec §3 direction exactly |
| Copy voice ("I build things businesses can actually use") | KEEP | Strong, honest, matches spec §1 positioning |
| Nav structure (Work / Capabilities / About / Let's talk) | MODIFY | Must become real routes (/work, /processes, /contact) per spec §6 |
| Hero | REBUILD | Must be huge 3D ISA HASSEN typography + real photo (spec §4) |
| Bantex presentation | REBUILD | Real screenshot in 3D browser frame, data-driven (spec §5, §13) |
| Capabilities section | MODIFY | Keep concept/visual language, make data-driven, integrate with new hero system |
| CSS-only 3D (sphere, cube, ring) | MODIFY | Keep the lightweight CSS-3D approach; refine into the hero system |
| Particle canvas | REMOVE | Decorative noise, costs a rAF loop for little value; spec §18 wants lightweight |
| Custom cursor, magnetic buttons | MODIFY | Keep as progressive enhancements, disabled on touch/reduced motion |
| Scroll reveals (IntersectionObserver) | KEEP | Standard, cheap, respects the design language |
| Single-file structure | REBUILD | Replace with Next.js App Router architecture |

## E. Recommended Architecture

Next.js 16 App Router, TypeScript, no UI/animation/3D libraries (spec §18: avoid unnecessary dependencies; the "3D" is CSS 3D + canvas, not WebGL).

```text
Isa portfolio/site/
├── app/
│   ├── layout.tsx          # fonts, metadata, nav, footer
│   ├── page.tsx            # Home (Phase 01)
│   ├── work/page.tsx       # Phase 02/03 (stub route)
│   ├── processes/page.tsx  # Phase 02/04 (stub route)
│   ├── contact/page.tsx    # Phase 02 (stub route)
│   └── globals.css         # tokens + base styles
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── home/               # Hero3D, Capabilities, FeaturedWork
│   └── ui/                 # buttons, section headings, reveals
├── data/
│   ├── projects.ts         # project registry (spec §13 shape)
│   └── capabilities.ts
├── lib/                    # small shared utilities (motion hooks)
└── public/
    ├── images/profile/     # me.jpeg
    ├── images/projects/    # bantex-landing.png
    ├── videos/projects/
    ├── audio/processes/
    └── models/3d/          # (empty, reserved per spec §15)
```

Rules carried into later phases (from §16 + audit):
1. Content data → reusable UI → 3D presentation; never hardcode project content in components.
2. 3D/motion isolated in dedicated components with `prefers-reduced-motion` and no-JS fallbacks.
3. No new runtime dependencies without a documented reason.
4. Real content only; placeholders visibly marked `TODO(asset)` / `TODO(contact)`.

## F. Dependency Changes

```text
Keep:    next@16, react@19, react-dom@19, typescript (matching Bantex stack)
Remove:  n/a (greenfield)
Replace: n/a
Add later (only if a phase proves the need): none anticipated for Phases 01–05
```

## G. Asset Requirements

```text
Existing (real, usable):
  - Isa portfolio/me.jpeg                                  → /images/profile/isa-hassen.jpg
  - Projects/BantexTrading web/Pic preview.png              → /images/projects/bantex-landing.png
  - Bantex logo (Projects/BantexTrading web/logo.jpeg)      → optional, later phases

Missing (identified, do NOT fabricate):
  - Additional Bantex screenshots (gallery view)
  - Automation/AI-agent project assets (Phase 06/07)
  - Processes media: MP4 / audio (Phase 04)
  - Contact details (spec §16: keep placeholders)

Needs optimization:
  - me.jpeg: verify dimensions/weight when wired in
  - Pic preview.png: PNG is heavy for a hero image; serve as-is initially,
    consider WebP conversion in Phase 09
```

## H. Performance Risks

| Risk | Planned solution |
| ---- | ---------------- |
| Mousemove handlers reading layout per frame (prototype) | rAF-throttled, transform-only animations in final code |
| Particle canvas rAF loop | Removed |
| Heavy hero PNG | `next/image` with sizing; lazy-load below-fold images; Phase 09 converts to modern formats |
| Bundle bloat from animation libs | None used; CSS 3D + IntersectionObserver only |
| Layout shift from fonts | `next/font` with `display: swap`, preloaded, self-hosted |

## I. Responsive Risks

- Hero name at clamp() sizes must be tested at 320px; spec §17 forbids horizontal overflow.
- 3D transforms degrade on mobile — reduce depth/parallax amplitude below 768px.
- Prototype hides nav links under 600px without a mobile menu — the real nav needs a working mobile pattern.

## J. Phase 01 Readiness

**READY.** No critical blockers: stack target confirmed (Next.js 16 + TS), real assets located, architecture defined above. The only unavoidable gaps are missing contact details and Bantex project URL — both remain visible placeholders per spec §16 and §7 (never invent).
