# Test Suite Design — FarmBridge

**Date:** 2026-06-14
**Approach:** Classic Pyramid (Vitest unit + Vitest/RTL integration + Playwright E2E + smoke)
**Backend strategy:** MSW for unit/integration/E2E; real-backend smoke suite for staging

---

## 1. Architecture Overview

The suite lives in two roots:

- `src/` — Vitest tests colocated near source files
- `e2e/` — Playwright specs, page-object models, and smoke tests

MSW is the shared API contract layer. The same handler definitions run in both the Node environment (Vitest) and the browser (Playwright), keeping mock data consistent across all layers.

### File Layout

```
src/
  __tests__/
    tokenStore.test.js
    api.test.js
    dashboardUtils.test.js
    orderUtils.test.js
  hooks/__tests__/
    useInventory.test.js
    useBarterProposals.test.js
  components/__tests__/
    OrderRow.test.jsx
    EditProductModal.test.jsx
  mocks/
    handlers/
      auth.js
      listings.js
      orders.js
      inventory.js
    fixtures/
      users.js
      listings.js
      orders.js
    server.js              # MSW Node server (Vitest)
    browser.js             # MSW service worker (Playwright)
  test-utils.jsx           # renderWithProviders helper
  test-setup.js            # server.listen / resetHandlers / close

e2e/
  pages/
    LoginPage.js
    MarketplacePage.js
    InventoryPage.js
    OrdersPage.js
  specs/
    auth.spec.js
    buyer-flow.spec.js
    farmer-flow.spec.js
    orders.spec.js
  smoke/
    smoke.spec.js

playwright.config.js
vitest.config.js           # updated with setupFiles and coverage
```

---

## 2. MSW Setup

MSW 2.x intercepts `fetch` at the network level in both environments.

### Handlers

```js
// src/mocks/handlers/auth.js
http.post('/api/auth/login', ...)
http.post('/api/auth/refresh', ...)
http.post('/api/auth/logout', ...)
http.get('/api/auth/role-setup-status', ...)

// src/mocks/handlers/listings.js
http.get('/api/listings', ...)
http.get('/api/listings/:id', ...)

// src/mocks/handlers/orders.js
http.get('/api/orders', ...)
http.post('/api/orders', ...)

// src/mocks/handlers/inventory.js
http.get('/api/inventory', ...)
http.patch('/api/inventory/:id', ...)
```

Each handler reads from a fixture file so tests can import the same data objects to assert against.

### 401 → refresh scenario

A special handler variant returns `401` on the first call, then `200` on retry. This lets `api.test.js` verify the auto-refresh-and-retry chain in `api.js` without a real server.

### Handler aggregator (`src/mocks/handlers/index.js`)

```js
import { authHandlers } from './auth'
import { listingsHandlers } from './listings'
import { ordersHandlers } from './orders'
import { inventoryHandlers } from './inventory'
export const handlers = [...authHandlers, ...listingsHandlers, ...ordersHandlers, ...inventoryHandlers]
```

### Node server (`src/mocks/server.js`)

```js
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
export const server = setupServer(...handlers)
```

### Browser worker (`src/mocks/browser.js`)

```js
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
export const worker = setupWorker(...handlers)
```

Playwright starts the worker via `page.addInitScript` before each navigation.

### Vitest config update (`vitest.config.js`)

```js
test: {
  environment: 'jsdom',
  setupFiles: ['src/test-setup.js'],
  coverage: { provider: 'v8', include: ['src/lib/**', 'src/hooks/**'] }
}
```

`src/test-setup.js`:
```js
import { server } from './mocks/server'
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## 3. Vitest Unit Tests

Pure logic tests — no DOM, no React, no network (MSW Node server handles network).

### `src/__tests__/tokenStore.test.js`
- `getAccessToken()` returns null initially
- `setAccessToken()` stores token; `getAccessToken()` retrieves it
- `clearAccessToken()` resets to null
- Concurrent reads return the same value

### `src/__tests__/api.test.js` _(most critical)_
- Successful request returns parsed JSON
- 401 response triggers one refresh call, then retries original request
- If refresh also fails, throws without retrying again
- Non-401 errors propagate without triggering refresh
- Authorization header is set from tokenStore after refresh

### `src/__tests__/dashboardUtils.test.js`
- `getIdentifier()` returns `id` when present
- `getIdentifier()` falls back to `_id`
- `getIdentifier()` returns undefined when neither present

### `src/__tests__/orderUtils.test.js`
- `formatOrderStatus()` maps all known status strings to display labels
- `calculateOrderTotal()` sums items correctly
- Handles empty items array without throwing

---

## 4. Vitest + RTL Integration Tests

Mount real React components/hooks in jsdom. Network calls handled by MSW Node server.

### Shared render helper (`src/test-utils.jsx`)

```jsx
export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <ToastProvider>{ui}</ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}
```

### `src/hooks/__tests__/useInventory.test.js`
- Fetches inventory on mount, populates items list
- `stockLevel` and `maxStock` parsed as floats
- Re-fetches when identifier changes
- `cancelled` flag prevents setState after unmount
- Returns error state when API fails

### `src/hooks/__tests__/useBarterProposals.test.js`
- Fetches proposals for the correct identifier
- Maps proposal fields correctly
- Handles empty response without crashing

### `src/components/__tests__/OrderRow.test.jsx`
- Renders order items when `order.items` is populated
- Renders gracefully when `order.items` is null/undefined
- Displays correct status label

### `src/components/__tests__/EditProductModal.test.jsx`
- Submit success calls `onSave` then `onClose`
- `onSave` failure shows error message and keeps modal open
- Image upload failure shows `uploadError`, does not call `onClose`
- Disables submit button while saving

Per-test handler overrides:
```js
server.use(http.get('/api/inventory', () => HttpResponse.error()))
```

---

## 5. Playwright E2E Tests

Runs real Chromium against `http://localhost:5173`. MSW browser worker intercepts API calls.

### `playwright.config.js` key settings

```js
baseURL: 'http://localhost:5173',
webServer: {
  command: 'npm run dev',
  port: 5173,
  reuseExistingServer: true,
},
use: {
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
}
```

### Page Object Models (`e2e/pages/`)

Thin wrappers around Playwright locators so specs read as user actions:

```js
class LoginPage {
  fill(email, password) { ... }
  submit() { ... }
  expectRedirectTo(path) { ... }
}
```

### `e2e/specs/auth.spec.js`
- FARMER login → role setup incomplete → redirects `/complete-role-setup`
- FARMER login → role setup complete → redirects `/farmer/dashboard`
- BUYER login → redirects `/marketplace`
- AGENT login → redirects `/agent/dashboard`
- ADMIN login → redirects `/admin/dashboard`
- Invalid credentials → shows error message
- Logout → clears session → redirects `/login`
- Expired access token → MSW refresh fires → user stays logged in
- `?redirect=` param preserved through login for BUYER role

### `e2e/specs/buyer-flow.spec.js`
- Searches marketplace, results filtered by query
- Opens listing detail, sets quantity, adds to cart
- Invalid quantity (0 / non-numeric) → shows validation error
- Completes checkout, sees order confirmation

### `e2e/specs/farmer-flow.spec.js`
- Views inventory list with correct stock levels
- Edits product → save succeeds → modal closes
- Edits product → save fails → error shown, modal stays open
- Image upload fails → `uploadError` shown, product already saved
- Publishes draft → toast shown (not native `alert`)
- Pagination navigates to correct page

### `e2e/specs/orders.spec.js`
- Pending payment reference in `sessionStorage` → banner shown
- Dismiss button clears banner
- No stale-setState React warning after navigating away mid-fetch

### `e2e/smoke/smoke.spec.js` _(real backend)_

Runs only when `SMOKE=true` env var is set, against staging URL:

```
SMOKE=true npx playwright test e2e/smoke
```

Tests:
- `GET /api/listings` returns 200
- Login with real test account succeeds
- Marketplace page loads at least one listing
- Logout invalidates session

---

## 6. New Dependencies

```bash
npm install -D msw@latest @playwright/test
npx playwright install chromium
```

`package.json` additions:
```json
"test:e2e": "playwright test e2e/specs",
"test:smoke": "SMOKE=true playwright test e2e/smoke",
"test:all": "vitest run && playwright test e2e/specs"
```

---

## 7. CI Integration

Recommended GitHub Actions order:
1. `npm run test` — Vitest unit + integration (fast, ~10s)
2. `npm run test:e2e` — Playwright E2E with MSW (medium, ~60s)
3. `npm run test:smoke` — Real-backend smoke on staging (slow, run on main branch merges only)
