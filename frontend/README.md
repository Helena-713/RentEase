# RentEase Frontend

Vanilla HTML/CSS/JS portals for tenants, landlords, and admins. No build step, no framework — just static files served over HTTP and talking to the backend API.

## Tech Stack

- **HTML/CSS/JS** — static files, no bundler
- **[Axios](https://axios-http.com/)** — HTTP client, loaded via CDN in each portal's `index.html`
- **Hash routing** — client-side navigation with `#/path` URLs
- **Backend API** — Express.js REST API at `http://localhost:3000` (see [backend/README.md](../backend/README.md))

## Prerequisites

- Node.js 18+ (for `npx serve` and the backend)
- Backend API running (see [backend setup](../backend/README.md))

## Quick Start

```bash
# Terminal 1 — API (required)
cd backend && npm run dev

# Terminal 2 — frontend static server (from repo root)
npx serve frontend -p 8080
```

Open `http://localhost:8080/` for the landing page.

| Portal | URL | Role |
|--------|-----|------|
| Landing | `/` | — |
| Tenant | `/tenant/` | `TENANT` |
| Landlord | `/landlord/` | `LAND_LORD` |
| Admin | `/admin/` | `ADMIN` |

**Test admin account** (from backend seed): `admin@rentease.com` / `admin_password`

## Project Structure

```
frontend/
├── index.html              # Landing page with portal links
├── css/                    # Shared styles (variables, base, layout, components)
├── js/                     # Shared modules (RE namespace)
│   ├── config.js           # API_ORIGIN, portal paths
│   ├── api.js              # Axios client + endpoint wrappers
│   ├── auth.js             # JWT session in localStorage
│   ├── ui.js               # UI helpers + hash router factory
│   ├── utils.js            # Formatting, escaping, query builders
│   ├── messages.js         # Messaging polling and badges
│   ├── ratings.js          # Star rating display
│   └── review-section.js   # Reusable review UI
├── tenant/                 # Tenant portal
│   ├── index.html
│   ├── main.js             # Nav + router bootstrap
│   ├── router.js           # Route table
│   └── pages/              # Page render functions
├── landlord/               # Landlord portal (same pattern)
└── admin/                  # Admin portal (same pattern)
```

Each portal follows the same layout: `index.html` loads shared `js/` modules, then portal-specific `pages/*.js`, `router.js`, and `main.js`.

## Architecture

```
Portals (tenant/, landlord/, admin/)
        │
        ▼
Shared js/ (config, api, auth, ui, utils, …)
        │
        ▼
Backend API (Express :3000)  ← Axios + JWT
```

### `window.RE` namespace

All shared code attaches to a global `RE` object. This avoids module bundling — each file is a plain `<script>` tag.

### Hash routing

Each portal uses `RE.router.create()` (defined in `js/ui.js`) with `#/path` URLs:

- Routes support `:param` segments (e.g. `/properties/:id`)
- Optional `guard` functions run before rendering (used for auth checks)
- The matched page render function receives the `#app` element and route params

### Page modules

Each `pages/*.js` file exports render functions on a portal namespace (e.g. `RE.tenantPages.home`). Render functions are `async` and build HTML into the `#app` container.

### Authentication

- JWT stored in `localStorage` under the key `rentease_auth`
- `RE.auth.requireRole('TENANT')` and similar functions are used as route guards
- Axios interceptors attach the token to every request and redirect to login on 401

### API client

`RE.api` wraps all backend endpoints. The base URL is controlled by `RE.config.API_ORIGIN` in `js/config.js`.

## Portal Routes

Routes are hash-based — e.g. `http://localhost:8080/tenant/#/applications`.

### Tenant (`tenant/router.js`)

| Path | Auth | Description |
|------|------|-------------|
| `/` | Public | Browse available properties |
| `/properties/:id` | Public | Property detail and apply |
| `/login` | Public | Login |
| `/register` | Public | Register as tenant |
| `/applications` | Tenant | List own applications |
| `/applications/:id` | Tenant | Application detail |
| `/profile` | Tenant | Edit profile |
| `/messages` | Tenant | Conversations inbox |
| `/messages/:id` | Tenant | Conversation thread |

### Landlord (`landlord/router.js`)

| Path | Auth | Description |
|------|------|-------------|
| `/` | Landlord | List own properties |
| `/properties/new` | Landlord | Create property |
| `/properties/:id` | Landlord | Edit property |
| `/login` | Public | Login |
| `/register` | Public | Register as landlord |
| `/applications` | Landlord | Applications on own properties |
| `/applications/:id` | Landlord | Application detail |
| `/verification` | Landlord | Submit identity verification |
| `/profile` | Landlord | Edit profile |
| `/messages` | Landlord | Conversations inbox |
| `/messages/:id` | Landlord | Conversation thread |

### Admin (`admin/router.js`)

| Path | Auth | Description |
|------|------|-------------|
| `/` | Admin | Dashboard |
| `/login` | Public | Login |
| `/users` | Admin | Manage users |
| `/verifications` | Admin | Review landlord verifications |
| `/properties` | Admin | Review property listings |
| `/applications` | Admin | View all applications |
| `/applications/:id` | Admin | Application detail |
| `/amenities` | Admin | Manage amenity catalog |
| `/reviews` | Admin | View all reviews |
| `/reviews/:id` | Admin | Review detail |

## Configuration

Change the API URL in `js/config.js`:

```js
RE.config = {
  API_ORIGIN: 'http://localhost:3000',
  // ...
};
```

- `RE.config.API_BASE` resolves to `API_ORIGIN + '/api'`
- `RE.uploadUrl(path)` prepends `API_ORIGIN` to backend upload paths (e.g. `/uploads/profiles/...`)
- CORS must be enabled on the backend (already configured)

## Adding a New Page

1. Create `pages/my-page.js` with a render function on the portal's pages namespace:

   ```js
   RE.tenantPages.myPage = async function (app, params) {
     app.innerHTML = '<h1>My Page</h1>';
   };
   ```

2. Add a route entry in `router.js`:

   ```js
   {
     path: '/my-page',
     guard: () => RE.auth.requireRole('TENANT'),
     render: RE.tenantPages.myPage,
   }
   ```

3. Add a `<script>` tag in the portal's `index.html`:

   ```html
   <script src="pages/my-page.js"></script>
   ```

4. Add a nav link in `main.js` if the page should appear in the navbar.

5. Add an API method in `js/api.js` if a new backend endpoint is needed.

## Styling

- Shared CSS lives in `css/` — `variables.css`, `base.css`, `layout.css`, `components.css`
- Portal-specific accent colors via body classes: `portal-tenant`, `portal-landlord`, `portal-admin`
- UI components are built via `RE.ui` helpers: cards, forms, alerts, pagination, empty states, loading spinners

## Related Docs

- [Backend API docs](../backend/README.md) — endpoints, migrations, Swagger
- [Project overview](../README.md) — monorepo quick start
