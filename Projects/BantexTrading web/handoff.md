# Handoff — Bantex Trading web (hardcoded product catalogue from owner photos)

## Goal
Take the owner's 40 processed product photos (`Photos/processed/`), review + research them, and put all of them on the website as a **hardcoded** catalogue (not the gitignored JSON cache) with the photos **committed to GitHub** so they are real repo files. Per owner decisions: placeholder prices, everything under Stationery, commit + push.

## Current state
**Done and verified.** 40 photos → `web/public/products/` (38 unique products; Puncher and Correction Pen each have 2 shots → second gallery image). All 38 products hardcoded in `web/lib/catalog/seed.ts` with descriptions/specs written from each product's packaging text (OCR already existed in `Photos/ocr-results.txt`). Home page now features the first 8 real products (demo pen/calculator/charger no longer featured). typecheck / lint / 44 tests / production build all pass; runtime smoke-tested via dev server + curl. **Committed and pushed to `origin/master` (isahzn/Executive-agent).**

## Active files
- `web/lib/catalog/seed.ts` — rewritten: 38 real products (sortOrder 0–37, ids = slugs) + 3 demo products (now sortOrder 100+, `isSeedDemo: true`)
- `web/public/products/*.jpg` — 40 new committed photos (7.9 MB, slugified names)
- `web/app/(public)/page.tsx` — home features `!isSeedDemo` products (first 8)
- `CLAUDE.md` — updated: hardcoded-catalogue section, placeholder-price exception, test counts
- `web/data/catalog.json` — deleted (gitignored runtime cache; reseeds from seed on next run)

## Changes made
- Every product: name/brand/pack size from its actual packaging (Vneeds, DLOffice, Al-Mohandis, Great Wall, MAP, Cello, GXIN, SUN, Windmill), 2–4 spec rows, "In Stock" badge, category `stationery` (incl. Thermal Cup / Snow Spray / Dice per owner).
- **First product researched as template:** 2B Eraser = Al-Mohandis ED-50, 30-piece box (web-searched 2B eraser grading — soft graphite eraser for exams/school).
- **Multi-colour options (5 values where sensible):** GXIN Highlighter (Yellow/Pink/Blue/Green/Orange), Sticky Notes (Assorted/Yellow/Pink/Green/Blue), Display Books (Blue/Grey). **Pack/Type options:** Correction Pen (Single / Boxed Display +Rs. 960), Macaroon Scissors (Single / 24-PCS Display +Rs. 4,550).
- **All prices are placeholders** (photos carry no prices; owner hasn't confirmed) — documented in seed.ts header comment and CLAUDE.md. No internet-downloaded photos used (copyright risk on a commercial site; owner's own photos cover every product).

## Verification
- `tsc --noEmit` clean · lint clean · **44/44 tests** · build succeeds with 39 stationery PDPs prerendered (`/stationery/2b-eraser` … 38 real + pen demo).
- Runtime (dev :4199, curl): `/stationery` lists 38 product links; `/products/2b-eraser.jpg` serves 200 `image/jpeg` (real file, not remote); PDP shows researched copy; highlighter colour options render; home shows real products.

## Failed attempts
- First `write_file` of `seed.ts` emitted corrupted content (mangled syntax, stray fields, truncation) — detected immediately and rewritten cleanly; no impact on the final file.

## Next steps
- **Owner: confirm real prices** and replace the placeholders (via `/admin` per-product, or edit `seed.ts` + delete `web/data/catalog.json`).
- Deploy on Vercel with `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, Stripe + SMTP env vars (unchanged from Phase 8 pending items).
- Electrical Goods category still has only the demo items — real electrical product photos still needed from the owner.
- Previous session's phone-retest items (pre-hydration tap replay) still await owner confirmation on their device.
