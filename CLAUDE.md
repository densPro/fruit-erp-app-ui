# fruit-erp-app-ui

The single front-end for the whole **fruit ERP**. It is one Next.js app that talks to every backend microservice and presents them as modules in one product. Today the services are:

| Service | Folder | Port | Role | UI module |
|---|---|---|---|---|
| mango-auth | `../mango-auth` | 8003 | users, login, roles, permissions (shared by all apps) | sign-in, plus an admin module |
| lime-warehouse | `../lime-warehouse` | 8004 | stock, receiving, put-away, picking, stock counts | **Warehouse** (first module) |
| *(future)* sales, purchasing, finance, HR, ... | TBD | TBD | | one module each, added the same way |

> Status: foundation and the whole Warehouse module are built (Nov 2026). Reads were verified against the live backends; create/update flows are built and type-checked but not yet exercised end to end or in a browser (no Playwright suite yet). Choices marked *(my call)* were made by Claude, not confirmed by the owner. Unknowns are marked TODO.

## 1. Principles

- **One app, many modules, domain-driven.** Each microservice maps to a module under `src/modules/<service>/`, split into domain folders that mirror the backend's domains (see section 9). Adding a service must not require changing other modules.
- **Backend is the source of truth.** The UI reflects what the services allow; it never invents business rules. Permissions come from mango-auth, and the UI hides or disables actions, while the backend still enforces them.
- **Respect each service's invariants.** Example from lime-warehouse: stock quantities are never edited directly. Every change is an append-only `stock_movements` row, so the UI offers business actions (receive, put away, pick, count, approve), never "edit quantity". Read each service's `CLAUDE.md`/README for its rules before building its module.
- **Consistent look and behavior across modules**: one design system, one error model, one auth session.

## 2. Tech stack *(my call)*

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, `cacheComponents` on), React 19, TypeScript (`strict`). Next 16 differs from older versions: middleware is `proxy.ts`, `params`/`cookies()` are async. Read `node_modules/next/dist/docs/` before using a Next API |
| Styling / UI | Tailwind CSS 4 + shadcn-style components in `components/ui` (Radix Dialog/Slot, native `<select>`), `lucide-react` icons, `sonner` toasts |
| Server state | TanStack Query |
| Client state | Zustand (small UI state only) |
| Tables | TanStack Table v8 (pin to v8; v9 has a different API), server-side pagination |
| Forms | React Hook Form + Zod |
| API clients | One client per service via `serviceClient()` in `src/lib/api.ts`. Types are hand-written per domain (`types.ts`) from each service's `/openapi.json`; generating them with `openapi-typescript` is a TODO |
| Auth | Own httpOnly-cookie session (not Auth.js): `/api/auth/login` calls mango-auth, tokens live in cookies `erp_access` / `erp_refresh`, the proxy refreshes once on a 401. `src/proxy.ts` does the optimistic redirect to `/login` |
| i18n | `next-intl`, English (`en`, default) and Spanish (`es`). No URL prefix: the locale comes from the `erp_locale` cookie, else `Accept-Language` (`src/i18n/request.ts`). Catalogs in `messages/en.json` / `messages/es.json`, keys typed via `src/global.d.ts`. Header toggle calls the `setLocale` server action |
| Barcode / scanning | Not built yet. Inputs are scanner-friendly (plain text/number fields, Enter submits) |
| Tests | Vitest + React Testing Library (set up, 22 unit tests incl. en/es catalog parity). MSW and Playwright are TODO |
| Tooling | pnpm, ESLint, Prettier, Husky + lint-staged |

Do not add dependencies without asking.

## 3. Commands

`pnpm dev` (port 3000), `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format`. TODO: `pnpm e2e`, `pnpm gen:api`.

pnpm is not preinstalled here: `corepack enable --install-directory ~/.local/bin pnpm` and add `~/.local/bin` to PATH.

Before finishing any task: lint, typecheck and tests must pass.

## 4. Backend contract (shared conventions)

Verified against mango-auth and lime-warehouse; re-check when adding a service.

- Services are versioned under `/api/v1` and publish OpenAPI at `/openapi.json` and `/docs`.
- Auth: `Authorization: Bearer <mango-auth access token>` issued for app `erp`. mango-auth: `POST /login`, `/refresh`, `/logout`, `GET /me`, `GET /permissions`.
- Permissions are `resource:action` codes (e.g. `stock:view`) granted through roles in mango-auth (Super Admin, Admin, Manager, Accountant, Sales, Warehouse, HR, Viewer).
- **Browser calls go through the BFF.** `/api/<service>/<path>` is proxied to `<service url>/api/v1/<path>` by `src/app/api/[service]/[...path]/route.ts`; `/api/auth/*` handles login, logout and `me`.
- **Do not assume CORS.** lime-warehouse has none configured. Call services through Next.js route handlers / rewrites (BFF proxy) under `src/app/api/<service>/...` and keep tokens in httpOnly cookies, never `localStorage`.
- Lists return `{items, total, limit, offset}`; `limit` 1-200 (default 50), `offset`. `POST` returns `201` + `Location`.
- Errors share one body: `{detail, code, request_id, details?}` (`errors` lists fields on 422). Show `detail` to the user and surface `request_id` ("copy error ID").

| Status | `code` | UI behaviour |
|---|---|---|
| 401 | `unauthorized` | refresh token once, else redirect to login |
| 403 | `forbidden` | "you don't have permission" state, never a blank page |
| 404 | `not_found` | not-found state |
| 409 | `conflict`, `insufficient_stock` | inline message with `details`; refetch the data |
| 422 | `validation_error`, `invalid_request` | map `errors` to form fields |
| 503 | `service_unavailable` | retry banner |
| 500 | `internal_error` | generic message + `request_id` |

Env vars (see `.env.example`, copy to `.env.local`): `MANGO_AUTH_URL` (8003), `MANGO_AUTH_APP` (`erp`), `LIME_WAREHOUSE_URL` (8004). Add one `<SERVICE>_URL` per service and register it in `src/lib/server/config.ts`. mango-auth's auth routes are under `/api/v1/auth/*` and admin routes under `/api/v1/admin/*`.

## 5. Platform features (shell, shared by all modules)

| # | Scenario | Source | Status |
|---|---|---|---|
| P1 | Login, silent refresh, logout, current user | mango-auth `/login` `/refresh` `/logout` `/me` | [x] |
| P2 | Permission-aware navigation and buttons (module appears only if the user has any of its permissions) | mango-auth `/permissions` | [x] |
| P3 | App shell: sidebar of modules, header, user menu, theme toggle | - | [x] |
| P4 | Cross-module dashboard (one widget per module). Only the Warehouse dashboard exists; `/` redirects to it | derived | [~] |
| P5 | Global error, forbidden, not-found and offline/service-down states | - | [x] |
| P6 | Admin module: users, roles, permissions, audit log (only for users who hold the mango-auth admin permissions) | mango-auth admin endpoints | [ ] |
| P7 | Language switch (English / Spanish), persisted in a cookie; dates follow the UI language | `messages/*.json` | [x] |

## 6. Module: Warehouse (lime-warehouse)

The UI must cover **every scenario lime-warehouse already supports**. This table is the checklist: update it when you build something, and if the backend gains a capability with no row here, add a row and flag it. Do not ignore backend capabilities.

Status: `[ ]` not started, `[~]` in progress, `[x]` done.

| # | Area | Scenario | Endpoint | Permission | Status |
|---|---|---|---|---|---|
| W1 | Catalog | List / search / view items | `GET /items`, `GET /items/{id}` | `stock:view` | [x] |
| W2 | Catalog | Create item | `POST /items` | `product:create` | [x] |
| W3 | Catalog | Edit item | `PATCH /items/{id}` | `product:edit` | [x] |
| W4 | Catalog | List / view locations (bins, `RECV` dock) | `GET /locations`, `GET /locations/{id}` | `stock:view` | [x] |
| W5 | Catalog | Create / edit location | `POST /locations`, `PATCH /locations/{id}` | `stock:adjust` | [x] |
| W6 | Inventory | Stock levels by item and by bin | `GET /stock-levels` | `stock:view` | [x] |
| W7 | Inventory | Movement ledger / audit trail with filters (actor, item, type, date) | `GET /stock-movements` | `stock:view` | [x] |
| W8 | Receiving | List / view purchase orders | `GET /purchase-orders`, `GET /purchase-orders/{id}` | `purchase:view` | [x] |
| W9 | Receiving | Create purchase order (confirmed to exist) | `POST /purchase-orders` | `purchase:create` | [x] |
| W10 | Receiving | Book a goods receipt, with or without a PO; counted qty lands in `RECV` | `POST /goods-receipts` | `stock:transfer` | [x] |
| W11 | Receiving | Show per-line flags `short` / `over` / `unexpected` and `has_discrepancy` | receipt response | `stock:view` | [x] |
| W12 | Receiving | List / view goods receipts | `GET /goods-receipts`, `GET /goods-receipts/{id}` | `stock:view` | [x] |
| W13 | Put-away | Move stock between bins | `POST /putaways` | `stock:transfer` | [x] |
| W14 | Picking | Create pick list | `POST /pick-lists` | `stock:transfer` | [x] |
| W15 | Picking | List / view pick lists | `GET /pick-lists`, `GET /pick-lists/{id}` | `stock:view` | [x] |
| W16 | Picking | Confirm a pick on a line; handle 409 `insufficient_stock` | `POST /pick-lists/{id}/lines/{line}/picks` | `stock:transfer` | [x] |
| W17 | Picking | Cancel pick list | `POST /pick-lists/{id}/cancellation` | `stock:transfer` | [x] |
| W18 | Stock counts | Open a count for one bin (snapshots system qty) | `POST /stock-counts` | `stock:transfer` | [x] |
| W19 | Stock counts | List (filter by status / location) and view counts with variances | `GET /stock-counts`, `GET /stock-counts/{id}` | `stock:view` | [x] |
| W20 | Stock counts | Record / re-record counted lines (incl. items not in baseline) | `PUT /stock-counts/{id}/lines` | `stock:transfer` | [x] |
| W21 | Stock counts | Submit count | `POST /stock-counts/{id}/submission` | `stock:transfer` | [x] |
| W22 | Stock counts | Approve count with required reason (writes adjustments) | `POST /stock-counts/{id}/approval` | `stock:adjust` | [x] |
| W23 | Stock counts | Cancel count | `POST /stock-counts/{id}/cancellation` | `stock:transfer` | [x] |
| W24 | Warehouse dashboard | Open counts, receipts with discrepancies, active pick lists | derived | `stock:view` | [x] |

Stock count lifecycle: `open -> count -> submit -> approve` (or cancel); a count changes **nothing** until approval. Verify exact status values against the backend. Permissions: `stock:view` (all reads), `stock:transfer` (receive, put away, pick, run counts), `stock:adjust` (approve counts, edit locations), `purchase:view`/`purchase:create`, `product:create`/`product:edit`.

Re-read `../lime-warehouse/src/lime_warehouse/*/router.py` and `/openapi.json` before starting a feature.

## 7. Adding a new service module

1. Read the service's README/CLAUDE.md and `/openapi.json`; list every endpoint, state transition and permission.
2. Add its port/URL to the table at the top and its env var to section 4.
3. Add a "Module: <name>" section like section 6 with a full scenario checklist, so nothing the backend does is left without a UI row.
4. Create `src/modules/<service>/` with one domain folder per backend domain (components, hooks, api, schemas, types, `index.ts`), a generated API client, a BFF route under `src/app/api/<service>/`, and sidebar entries gated by its permissions.
5. Add a widget to the cross-module dashboard (P4).

## 8. Design system: color palette

These are the only brand colors, shared by every module. Define them once as CSS variables and Tailwind theme tokens, and use the tokens everywhere.

| Token | Hex | Use |
|---|---|---|
| `brand-950` | `#192524` | darkest: text on light, dark-mode background, sidebar, main CTA in light mode |
| `brand-700` | `#3C5759` | primary: buttons, links, focus ring (light), secondary text |
| `brand-500` | `#959D90` | muted: hover states, muted text on dark, decorative borders |
| `brand-300` | `#D0D5CE` | borders and dividers |
| `brand-200` | `#D1EBDB` | soft mint: active nav item, success badges, selected states, primary on dark |
| `brand-100` | `#EFECE9` | warm off-white: page background (light), text on dark |

Rules:
- Never hardcode hex values in components; use semantic tokens (`bg-primary`, `text-muted-foreground`, ...) or `brand-*` tokens. Semantic tokens switch automatically between light and dark in `src/styles/tokens.css`.
- Keep text contrast at WCAG AA or better. **Never use `brand-500` as text on light backgrounds** (2.4:1); use `brand-700` instead. `brand-500` is fine on `brand-950` (5.6:1).
- The palette has no error/warning color. Separate semantic tokens `danger` (red) and `warning` (amber) are defined *(my call)*. Never use palette colors to signal an error.
- Support light and dark themes *(my call)*; dark uses `brand-950` as background.

## 9. Structure and conventions *(my call)*

Use a **domain-driven folder structure**. Code is grouped by business domain, not by technical type. Each backend service is a module, each module is split into the same domains the backend uses (e.g. lime-warehouse: `catalog`, `inventory`, `receiving`, `putaway`, `picking`, `stock-counts`), and each domain owns everything it needs: UI, data access, validation and types.

```
src/
├── app/                          routes only (App Router); thin pages that compose domain components
│   ├── (auth)/login/
│   ├── (app)/<module>/<domain>/  e.g. (app)/warehouse/receiving/
│   └── api/                      BFF proxies, one per service: auth/, warehouse/, ...
├── modules/
│   ├── warehouse/                one module per backend service
│   │   ├── catalog/              one folder per domain, mirroring the backend domain
│   │   │   ├── components/       domain UI (ItemTable, ItemForm, ...)
│   │   │   ├── hooks/            TanStack Query hooks (useItems, useCreateItem, ...)
│   │   │   ├── api.ts            calls to this domain's endpoints via the service client
│   │   │   ├── schemas.ts        Zod schemas (forms, payloads)
│   │   │   ├── types.ts          domain types (derived from generated API types)
│   │   │   └── index.ts          public API of the domain; the only file others may import
│   │   ├── inventory/
│   │   ├── receiving/
│   │   ├── putaway/
│   │   ├── picking/
│   │   ├── stock-counts/
│   │   ├── dashboard/            composes other domains through their index.ts
│   │   └── shared/               code used by several domains of this module only (lookups.tsx: item/location names)
│   └── auth-admin/               mango-auth admin module (users, roles, permissions, audit)
├── components/ui/                shadcn primitives (shared by all modules)
├── lib/                          api wrapper, generated clients, auth/session, permissions, formatting
└── styles/                       tokens
```

- **Dependency rules:** a domain imports from its own folder, its module's `shared/`, `components/` and `lib/`. A domain talks to another domain only through that domain's `index.ts`. A module never imports from another module. Cross-module needs go through `lib/` or the dashboard. This mirrors the backend rule that domains call each other's services, never each other's tables.
- **One domain, one place:** adding or changing a backend capability means touching that domain's folder (plus its row in the feature table), not scattered folders by type.
- Pages in `app/` stay thin: fetch/compose, no business logic.
- Domains call their API only through their own hooks (TanStack Query), never `fetch` inline in components.
- Server Components by default; add `"use client"` only for interactivity.
- Server-side pagination, filtering and sorting for every list; never load whole tables.
- Mutations: disable submit while pending, invalidate affected queries, toast the result.
- Handle loading, empty, error and forbidden states on every screen.
- Warehouse flows are hands-on: large touch targets, scanner-friendly inputs (autofocus, Enter to confirm), usable on tablets and phones.
- **No hard-coded UI text.** Every user-facing string (labels, headings, buttons, toasts, aria-labels, page titles) lives in `messages/en.json` **and** `messages/es.json` under the domain's namespace (`warehouse.<domain>.*`, shared ones in `common`, `status`, `errors`, `validation`); a test fails if the two files' keys or `{placeholders}` differ. Use `useTranslations` in components and hooks, `pageTitle(key)` (`src/lib/i18n/metadata.ts`) for `<title>`, `useFormatDate()` for dates. Zod schemas use message keys (`"validation.required"`); `Field` and `useMessageText()` translate them. Errors go through `useErrors()` (`src/lib/errors.ts`): in English the backend `detail` is shown, in other languages the `code` is translated. Backend status values are shown through `StatusBadge` / the `status` namespace, never raw. A new module adds its own namespace to both files.
- Accessibility: keyboard navigable, labeled inputs, visible focus ring (`brand-200` on dark).
- Strict TypeScript, no `any`; validate form input with Zod before sending.

## 10. Rules for Claude

- Read the service's router/schema before building a feature; do not guess payloads.
- Update the feature tables (sections 5-6, plus any new module) as part of every feature change.
- Never offer a way to bypass a service's invariants (e.g. editing stock quantities directly).
- Never commit secrets, `.env` files or tokens; never log tokens.
- Keep components small; no new dependencies without asking.
- Run lint, typecheck and tests before declaring work done. Report failures honestly.

## 11. Glossary (warehouse)

- **SKU / item:** a fruit product in the catalog.
- **Location / bin:** a storage spot; `RECV` is the receiving dock where receipts land.
- **Purchase order (PO):** order placed with a supplier (e.g. `PO-DEMO-0001`).
- **Goods receipt:** record of a delivery; lines flagged `short`, `over` or `unexpected` versus the PO.
- **Put-away:** moving stock from one bin to another (typically `RECV` to a storage bin).
- **Pick list:** instructions to take quantities of items from bins.
- **Stock count:** reconciliation of one bin against the system; variances are adjusted only on approval.
- **Stock movement:** an immutable ledger row (who, when, why) behind every quantity change.

Add glossary entries for each new module.

## 12. Local setup

1. Start mango-auth (port 8003), then lime-warehouse (`docker compose up --build`, port 8004; `seed --demo` for sample data).
2. The signed-in user needs the right role in the `erp` app (e.g. Warehouse or Admin).
3. TODO: UI dev server port, env file template, and `gen:api` script once the app is scaffolded.
