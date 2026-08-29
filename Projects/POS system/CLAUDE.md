# CLAUDE.md — ABC Accounting Practice Management

## What this is

A **client-facing demo** of an accounting-firm practice-management platform. The repo folder is named `POS system`, but the product (per the phase docs in this folder) is **ABC Accounting — Practice Management**. All data is fictional demo data; nothing is production.

The interface is **vanilla HTML/CSS/JS** — no build step, no framework, no bundler. It uses native ES modules, so it must be served over HTTP (`file://` will not work).

## Run it

```bash
# from this folder
python -m http.server 8123
# then open http://localhost:8123/index.html
```

## Architecture (layered, so a real API/DB can replace the demo store later)

```
index.html                    → HTML shell (links CSS, loads js/main.js)
js/main.js                    → bootstrap: init() → initAuth() → boot()/showLogin()
js/core/
  router.js                   → app shell, sidebarnav, PAGES map, navigate(), boot(), showLogin()
  auth.js                     → session (localStorage state + sessionStorage session), login/logout, currentUser, permissionSet, can(), visibleClients()
  store.js                    → data layer: getState/resetDemo/saveRecord/…; persists to localStorage 'abc_pm_state'
  permissions.js              → buildPermissionSet/roleGrantSpec/defaultPermissionsFor/can/canEditModule
  utils.js                    → money/moneyK/num/pct/esc/uid/today/daysAgo/relTime/initials
js/data/db.js                 → the demo dataset: PERMISSIONS/ROLE_GRANTS/CLIENTS/USERS/FIRM/ACTIVITY/SCHEDULED_REPORTS/REPORT_CATEGORIES
js/components/
  icons.js                    → icon(name,size) inline SVG set
  ui.js                       → statusPill/toast/modal/field/input/emptyState
  charts.js                   → areaLine/multiLine/donutStyle/sparkbar
js/pages/*.js                 → one module per page, each default-exports render(el, params)
css/  tokens.css base.css components.css layout.css
```

**Key convention:** every page module default-exports a `render(el, params)` function. The router calls `PAGES[page](el, params)` directly (pages are the render functions themselves, not objects with a `.render` method).

## Routing & nav

- Nav items are declared in `js/core/router.js` as `NAV` entries; each can gate on `perm` (e.g. `accounting.view`) or `adminOnly`.
- Pages are registered in the `PAGES` map (module name → default export).
- `window.__nav(page, params)` and `window.__boot()` are exposed globally for test scripts and the login screen.
- The client workspace is the `client` page; it uses a `params.clientId` and a tabbed interface (Overview / Accounting / Tax / Documents / Invoices / Expenses / Reports).

## RBAC

- Permission key = `module.perm`, e.g. `accounting.input`, `documents.upload`, `settings.modify`.
- **VIEW is separate from INPUT/EDIT.** Roles are starting templates, not fixed grants — admins override per-user permissions.
- Role grants live in `db.js` (`ROLE_GRANTS`): `admin` (all), `manager` (all except delete), `accountant` (explicit list), `viewer` (view-only).
- **Client access is enforced in logic, not just hidden in the UI.** `visibleClients()` in `auth.js` filters to what the current user can see; unauthorized users must never be able to open or act on a client they aren't assigned to.

## Demo users

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | `admin@abc.lk` | `admin123` | admin |
| Amara Perera | `amara@abc.lk` | `demo123` | accountant |
| Nuwan Silva | `nuwan@abc.lk` | `demo123` | accountant |
| Kavisha Fernando | `kavisha@abc.lk` | `demo123` | manager |
| Dimuthu Jaya | `dimuthu@abc.lk` | `demo123` | viewer |
| Rasika Bandara | `rasika@abc.lk` | `demo123` | accountant (disabled) |

## Design system

- Purple primary `#6d3df5`; thin borders; restrained radii; light professional UI.
- Sri Lankan-style demo data, **Rs.** currency.
- Avoid gradients/glassmorphism/rainbow colors/excessive icons/emojis as decoration/bento grids/decorative terminal UI.

## Conventions for editing

- Follow the layered structure above; put new demo data in `db.js`, new logic in the relevant `js/core/*` module, new UI in `js/components/*`.
- Every new page: create `js/pages/<name>.js` default-exporting `render(el, params)`, then register it in `PAGES` and `NAV`/`META` in `router.js`.
- Respect permissions via `can('<module>.<perm>')` before showing or allowing edit actions.
- Keep data in demo CSV-free, in-module form; add new fields to `db.js` and consume them in the page.

## Verification

- This is UI. Serve it (`python -m http.server`) and check in a browser (or Playwright) rather than trusting static analysis.
- Check the `window.__nav`/`window.__boot` globals work, exercise a non-admin role, and confirm unauthorized clients can't be opened.
