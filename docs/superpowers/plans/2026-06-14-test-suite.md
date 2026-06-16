# Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a comprehensive three-layer test suite (Vitest unit, Vitest+RTL integration, Playwright E2E) to FarmBridge covering authentication, role-based flows, and API caching.

**Architecture:** MSW 2.x intercepts `fetch` in the Node environment for Vitest tests; Playwright uses `page.route()` for network mocking in E2E tests. A shared fixtures layer keeps mock data consistent across both layers.

**Tech Stack:** Vitest 4, React Testing Library 16, MSW 2, @playwright/test, jsdom

---

## File Map

**New files:**
```
src/test/setup.js                           — MSW server lifecycle + jest-dom matchers
src/mocks/fixtures/users.js                 — shared user fixtures (FARMER, BUYER, AGENT, ADMIN)
src/mocks/fixtures/listings.js              — shared listing fixtures
src/mocks/fixtures/orders.js                — shared order fixtures
src/mocks/handlers/auth.js                  — MSW handlers for /api/auth/*
src/mocks/handlers/listings.js              — MSW handlers for /api/listings
src/mocks/handlers/orders.js                — MSW handlers for /api/orders
src/mocks/handlers/inventory.js             — MSW handlers for /api/listings (farmer-owned)
src/mocks/handlers/index.js                 — aggregates all handlers
src/mocks/server.js                         — MSW Node server (Vitest)
src/test-utils.jsx                          — renderWithProviders + createAuthWrapper
src/__tests__/tokenStore.test.js
src/__tests__/api.test.js
src/__tests__/dashboardUtils.test.js
src/__tests__/orderUtils.test.js
src/hooks/__tests__/useInventory.test.js
src/hooks/__tests__/useBarterProposals.test.js
src/components/__tests__/OrderRow.test.jsx
src/components/__tests__/EditProductModal.test.jsx
playwright.config.js
e2e/fixtures/index.js                       — Playwright fixtures with page.route() API mocking
e2e/pages/LoginPage.js
e2e/pages/MarketplacePage.js
e2e/pages/InventoryPage.js
e2e/pages/OrdersPage.js
e2e/specs/auth.spec.js
e2e/specs/buyer-flow.spec.js
e2e/specs/farmer-flow.spec.js
e2e/specs/orders.spec.js
e2e/smoke/smoke.spec.js
```

**Modified files:**
```
vite.config.js          — add test.env (VITE_API_URL), test.coverage
package.json            — add test:e2e, test:smoke, test:all scripts
```

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install MSW and Playwright**

```bash
npm install -D msw@latest @playwright/test
npx playwright install chromium
```

Expected: No errors. `node_modules/msw` and `node_modules/@playwright/test` appear.

- [ ] **Step 2: Add test scripts to package.json**

Open `package.json` and replace the existing `"scripts"` block with:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:e2e": "playwright test e2e/specs",
  "test:smoke": "SMOKE=true playwright test e2e/smoke",
  "test:all": "vitest run && playwright test e2e/specs"
}
```

- [ ] **Step 3: Update vite.config.js test block**

Open `vite.config.js`. Replace the existing `test:` block inside `defineConfig({...})`:

```js
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.js',
  env: {
    VITE_API_URL: 'http://localhost:8000',
  },
  coverage: {
    provider: 'v8',
    include: ['src/lib/**', 'src/hooks/**'],
  },
},
```

- [ ] **Step 4: Commit**

```bash
git add package.json vite.config.js
git commit -m "chore: install MSW, Playwright; configure test env"
```

---

## Task 2: Create Fixtures

**Files:**
- Create: `src/mocks/fixtures/users.js`
- Create: `src/mocks/fixtures/listings.js`
- Create: `src/mocks/fixtures/orders.js`

- [ ] **Step 1: Create user fixtures**

Create `src/mocks/fixtures/users.js`:

```js
export const mockFarmer = {
  id: 'user-farmer-1',
  fullName: 'Kwame Asante',
  email: 'kwame@farm.test',
  role: 'FARMER',
  isVerified: true,
  profilePhotoUrl: null,
  avatarUrl: null,
};

export const mockBuyer = {
  id: 'user-buyer-1',
  fullName: 'Ama Owusu',
  email: 'ama@buyer.test',
  role: 'BUYER',
  isVerified: true,
  profilePhotoUrl: null,
  avatarUrl: null,
};

export const mockAgent = {
  id: 'user-agent-1',
  fullName: 'Kofi Mensah',
  email: 'kofi@agent.test',
  role: 'AGENT',
  isVerified: true,
  profilePhotoUrl: null,
  avatarUrl: null,
};

export const mockAdmin = {
  id: 'user-admin-1',
  fullName: 'Admin User',
  email: 'admin@farmbridge.test',
  role: 'ADMIN',
  isVerified: true,
  profilePhotoUrl: null,
  avatarUrl: null,
};

export const mockAccessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWZhcm1lci0xIiwicm9sZSI6IkZBUk1FUiJ9.fake';
```

- [ ] **Step 2: Create listing fixtures**

Create `src/mocks/fixtures/listings.js`:

```js
import { mockFarmer } from './users.js';

export const mockListing = {
  id: 'listing-1',
  title: 'Fresh Tomatoes',
  description: 'Organically grown tomatoes',
  pricePerUnit: 5.50,
  quantity: 200,
  quantityAvailable: 150,
  unit: 'KG',
  status: 'ACTIVE',
  category: { name: 'Vegetable' },
  location: 'Kumasi',
  negotiable: false,
  images: [],
  owner: { id: mockFarmer.id },
  ownerId: mockFarmer.id,
};

export const mockListingDraft = {
  ...mockListing,
  id: 'listing-2',
  title: 'Cassava',
  status: 'PAUSED',
  quantityAvailable: 80,
};
```

- [ ] **Step 3: Create order fixtures**

Create `src/mocks/fixtures/orders.js`:

```js
import { mockFarmer, mockBuyer } from './users.js';
import { mockListing } from './listings.js';

export const mockOrder = {
  _id: 'order-1',
  status: 'PENDING',
  createdAt: '2026-06-01T10:00:00.000Z',
  totalPrice: 82.50,
  paymentMethod: 'CASH',
  paymentStatus: 'PENDING',
  deliveryAddress: '12 Accra Rd, Kumasi',
  buyer: mockBuyer,
  seller: mockFarmer,
  items: [
    {
      _id: 'item-1',
      productName: 'Fresh Tomatoes',
      quantityOrdered: 15,
      unitPriceAtOrder: 5.50,
      totalPrice: 82.50,
      listing: mockListing,
    },
  ],
};
```

- [ ] **Step 4: Commit**

```bash
git add src/mocks/fixtures/
git commit -m "test: add MSW fixtures for users, listings, and orders"
```

---

## Task 3: Create MSW Handlers and Server

**Files:**
- Create: `src/mocks/handlers/auth.js`
- Create: `src/mocks/handlers/listings.js`
- Create: `src/mocks/handlers/orders.js`
- Create: `src/mocks/handlers/inventory.js`
- Create: `src/mocks/handlers/index.js`
- Create: `src/mocks/server.js`

- [ ] **Step 1: Create auth handlers**

Create `src/mocks/handlers/auth.js`:

```js
import { http, HttpResponse } from 'msw';
import { mockFarmer, mockBuyer, mockAgent, mockAdmin, mockAccessToken } from '../fixtures/users.js';

const BASE = 'http://localhost:8000';

const userByEmail = {
  [mockFarmer.email]: mockFarmer,
  [mockBuyer.email]: mockBuyer,
  [mockAgent.email]: mockAgent,
  [mockAdmin.email]: mockAdmin,
};

export const authHandlers = [
  http.post(`${BASE}/api/auth/login`, async ({ request }) => {
    const body = await request.json();
    const user = userByEmail[body.email];
    if (!user) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    return HttpResponse.json({ accessToken: mockAccessToken, user });
  }),

  http.post(`${BASE}/api/auth/refresh`, () =>
    HttpResponse.json({ accessToken: mockAccessToken })
  ),

  http.post(`${BASE}/api/auth/logout`, () =>
    HttpResponse.json({ message: 'Logged out' })
  ),

  http.get(`${BASE}/api/auth/me`, () =>
    HttpResponse.json({ user: mockFarmer })
  ),

  http.get(`${BASE}/api/auth/role-setup-status`, () =>
    HttpResponse.json({ roleSetupComplete: true, role: 'FARMER' })
  ),
];
```

- [ ] **Step 2: Create listings handlers**

Create `src/mocks/handlers/listings.js`:

```js
import { http, HttpResponse } from 'msw';
import { mockListing } from '../fixtures/listings.js';

const BASE = 'http://localhost:8000';

export const listingsHandlers = [
  http.get(`${BASE}/api/listings`, () =>
    HttpResponse.json({
      listings: [mockListing],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
  ),

  http.get(`${BASE}/api/listings/:id`, ({ params }) =>
    HttpResponse.json({ listing: { ...mockListing, id: params.id } })
  ),
];
```

- [ ] **Step 3: Create orders handlers**

Create `src/mocks/handlers/orders.js`:

```js
import { http, HttpResponse } from 'msw';
import { mockOrder } from '../fixtures/orders.js';

const BASE = 'http://localhost:8000';

export const ordersHandlers = [
  http.get(`${BASE}/api/orders`, () =>
    HttpResponse.json({ orders: [mockOrder] })
  ),

  http.post(`${BASE}/api/orders`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ order: { ...mockOrder, ...body } }, { status: 201 });
  }),
];
```

- [ ] **Step 4: Create inventory handlers**

Create `src/mocks/handlers/inventory.js`:

```js
import { http, HttpResponse } from 'msw';
import { mockListing, mockListingDraft } from '../fixtures/listings.js';

const BASE = 'http://localhost:8000';

export const inventoryHandlers = [
  http.patch(`${BASE}/api/listings/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({ listing: { ...mockListing, id: params.id, ...body } });
  }),

  http.delete(`${BASE}/api/listings/:id`, () =>
    HttpResponse.json({ message: 'Deleted' })
  ),

  http.post(`${BASE}/api/listings/:id/publish`, ({ params }) =>
    HttpResponse.json({ listing: { ...mockListingDraft, id: params.id, status: 'ACTIVE' } })
  ),
];
```

- [ ] **Step 5: Create handler aggregator**

Create `src/mocks/handlers/index.js`:

```js
import { authHandlers } from './auth.js';
import { listingsHandlers } from './listings.js';
import { ordersHandlers } from './orders.js';
import { inventoryHandlers } from './inventory.js';

export const handlers = [
  ...authHandlers,
  ...listingsHandlers,
  ...ordersHandlers,
  ...inventoryHandlers,
];
```

- [ ] **Step 6: Create MSW Node server**

Create `src/mocks/server.js`:

```js
import { setupServer } from 'msw/node';
import { handlers } from './handlers/index.js';

export const server = setupServer(...handlers);
```

- [ ] **Step 7: Commit**

```bash
git add src/mocks/
git commit -m "test: add MSW handlers and Node server"
```

---

## Task 4: Create Test Setup and Test Utils

**Files:**
- Create: `src/test/setup.js`
- Create: `src/test-utils.jsx`

- [ ] **Step 1: Create Vitest setup file**

Create `src/test/setup.js`:

```js
import '@testing-library/jest-dom';
import { server } from '../mocks/server.js';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

- [ ] **Step 2: Create shared render helper**

Create `src/test-utils.jsx`:

```jsx
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { mockFarmer } from './mocks/fixtures/users.js';

export function createAuthWrapper(user = mockFarmer) {
  return function Wrapper({ children }) {
    return (
      <AuthContext.Provider
        value={{
          user,
          loading: false,
          isAuthenticated: !!user,
          login: vi.fn(),
          logout: vi.fn(),
          register: vi.fn(),
          updateUser: vi.fn(),
        }}
      >
        <ToastProvider>
          <MemoryRouter>{children}</MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    );
  };
}

export function renderWithProviders(ui, { user = mockFarmer, route = '/' } = {}) {
  return render(ui, { wrapper: createAuthWrapper(user) });
}
```

- [ ] **Step 3: Verify setup runs**

```bash
npm test -- --reporter=verbose 2>&1 | head -20
```

Expected: Vitest finds 0 test files and exits cleanly (no errors about missing setup or missing modules).

- [ ] **Step 4: Commit**

```bash
git add src/test/ src/test-utils.jsx
git commit -m "test: add Vitest setup file and renderWithProviders helper"
```

---

## Task 5: Unit Tests — tokenStore

**Files:**
- Create: `src/__tests__/tokenStore.test.js`

- [ ] **Step 1: Write the tests**

Create `src/__tests__/tokenStore.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  decodeJwtPayload,
} from '../lib/tokenStore.js';

beforeEach(() => {
  clearAccessToken();
});

describe('tokenStore', () => {
  it('returns null initially', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('stores and retrieves a token', () => {
    setAccessToken('abc.def.ghi');
    expect(getAccessToken()).toBe('abc.def.ghi');
  });

  it('rejects empty string (stores null)', () => {
    setAccessToken('valid-token');
    setAccessToken('');
    expect(getAccessToken()).toBeNull();
  });

  it('rejects non-string values', () => {
    setAccessToken(123);
    expect(getAccessToken()).toBeNull();
  });

  it('clearAccessToken resets to null', () => {
    setAccessToken('my-token');
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  describe('decodeJwtPayload', () => {
    it('decodes a valid JWT payload', () => {
      const payload = { sub: 'user-1', role: 'FARMER' };
      const encoded = btoa(JSON.stringify(payload));
      const token = `header.${encoded}.signature`;
      expect(decodeJwtPayload(token)).toMatchObject(payload);
    });

    it('returns null for null input', () => {
      expect(decodeJwtPayload(null)).toBeNull();
    });

    it('returns null for malformed token', () => {
      expect(decodeJwtPayload('notajwt')).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run to verify all pass**

```bash
npm test -- src/__tests__/tokenStore.test.js --reporter=verbose
```

Expected: 8 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/tokenStore.test.js
git commit -m "test: tokenStore unit tests"
```

---

## Task 6: Unit Tests — api.js (401 Retry Chain)

**Files:**
- Create: `src/__tests__/api.test.js`

- [ ] **Step 1: Write the tests**

Create `src/__tests__/api.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server.js';
import api from '../lib/api.js';
import { clearAccessToken, setAccessToken, getAccessToken } from '../lib/tokenStore.js';

const BASE = 'http://localhost:8000';

beforeEach(() => {
  clearAccessToken();
});

describe('apiFetch', () => {
  it('returns parsed JSON for a successful request', async () => {
    server.use(
      http.get(`${BASE}/api/test`, () =>
        HttpResponse.json({ ok: true })
      )
    );
    const data = await api.apiFetch('/api/test');
    expect(data).toEqual({ ok: true });
  });

  it('throws with status on a non-2xx non-401 response', async () => {
    server.use(
      http.get(`${BASE}/api/test`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 })
      )
    );
    await expect(api.apiFetch('/api/test')).rejects.toMatchObject({
      status: 404,
    });
  });

  it('on 401, calls /api/auth/refresh once then retries original request', async () => {
    let refreshCalled = 0;
    let requestCount = 0;

    server.use(
      http.get(`${BASE}/api/protected`, () => {
        requestCount++;
        if (requestCount === 1) {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        return HttpResponse.json({ data: 'secret' });
      }),
      http.post(`${BASE}/api/auth/refresh`, () => {
        refreshCalled++;
        return HttpResponse.json({ accessToken: 'new-token' });
      })
    );

    const data = await api.apiFetch('/api/protected');

    expect(refreshCalled).toBe(1);
    expect(requestCount).toBe(2);
    expect(data).toEqual({ data: 'secret' });
  });

  it('sets the new access token in tokenStore after a successful refresh', async () => {
    server.use(
      http.get(`${BASE}/api/protected`, ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth === 'Bearer new-token') {
          return HttpResponse.json({ ok: true });
        }
        return HttpResponse.json({}, { status: 401 });
      }),
      http.post(`${BASE}/api/auth/refresh`, () =>
        HttpResponse.json({ accessToken: 'new-token' })
      )
    );

    await api.apiFetch('/api/protected');
    expect(getAccessToken()).toBe('new-token');
  });

  it('throws "Session expired" and dispatches auth:unauthorized if refresh fails', async () => {
    const events = [];
    window.addEventListener('auth:unauthorized', () => events.push('fired'));

    server.use(
      http.get(`${BASE}/api/protected`, () =>
        HttpResponse.json({}, { status: 401 })
      ),
      http.post(`${BASE}/api/auth/refresh`, () =>
        HttpResponse.json({}, { status: 401 })
      )
    );

    await expect(api.apiFetch('/api/protected')).rejects.toThrow('Session expired');
    expect(events).toContain('fired');

    window.removeEventListener('auth:unauthorized', () => {});
  });

  it('does NOT trigger refresh for /api/auth/* endpoints that return 401', async () => {
    let refreshCalled = 0;
    server.use(
      http.post(`${BASE}/api/auth/login`, () =>
        HttpResponse.json({ message: 'Bad credentials' }, { status: 401 })
      ),
      http.post(`${BASE}/api/auth/refresh`, () => {
        refreshCalled++;
        return HttpResponse.json({ accessToken: 'token' });
      })
    );

    await expect(api.apiFetch('/api/auth/login', { method: 'POST', body: '{}' })).rejects.toThrow();
    expect(refreshCalled).toBe(0);
  });
});
```

- [ ] **Step 2: Run to verify all pass**

```bash
npm test -- src/__tests__/api.test.js --reporter=verbose
```

Expected: 6 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/api.test.js
git commit -m "test: api.js 401 retry chain unit tests"
```

---

## Task 7: Unit Tests — dashboardUtils

**Files:**
- Create: `src/__tests__/dashboardUtils.test.js`

- [ ] **Step 1: Write the tests**

Create `src/__tests__/dashboardUtils.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  getIdentifier,
  toNumber,
  formatCurrency,
  toArray,
} from '../lib/dashboardUtils.js';

describe('getIdentifier', () => {
  it('returns id when present', () => {
    expect(getIdentifier({ id: 'abc', _id: 'def' })).toBe('abc');
  });

  it('falls back to _id when id is absent', () => {
    expect(getIdentifier({ _id: 'def' })).toBe('def');
  });

  it('falls back to userId', () => {
    expect(getIdentifier({ userId: 'uid-1' })).toBe('uid-1');
  });

  it('returns null for empty object', () => {
    expect(getIdentifier({})).toBeNull();
  });

  it('returns null for null input', () => {
    expect(getIdentifier(null)).toBeNull();
  });
});

describe('toNumber', () => {
  it('converts string numbers', () => {
    expect(toNumber('42')).toBe(42);
  });

  it('returns 0 for non-numeric strings', () => {
    expect(toNumber('abc')).toBe(0);
  });

  it('returns 0 for null', () => {
    expect(toNumber(null)).toBe(0);
  });
});

describe('formatCurrency', () => {
  it('formats a number with ₵ prefix and 2 decimal places', () => {
    expect(formatCurrency(10)).toBe('₵10.00');
  });

  it('handles 0', () => {
    expect(formatCurrency(0)).toBe('₵0.00');
  });
});

describe('toArray', () => {
  it('returns the array as-is', () => {
    expect(toArray([1, 2])).toEqual([1, 2]);
  });

  it('wraps non-array values in an empty array', () => {
    expect(toArray('string')).toEqual([]);
    expect(toArray(null)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify all pass**

```bash
npm test -- src/__tests__/dashboardUtils.test.js --reporter=verbose
```

Expected: 10 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/dashboardUtils.test.js
git commit -m "test: dashboardUtils unit tests"
```

---

## Task 8: Unit Tests — orderUtils

**Files:**
- Create: `src/__tests__/orderUtils.test.js`

- [ ] **Step 1: Write the tests**

Create `src/__tests__/orderUtils.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  getStatusMeta,
  STATUS_META,
  formatCurrency,
  getOrderItems,
  normalizeOrder,
  formatDate,
} from '../lib/orderUtils.js';

describe('getStatusMeta', () => {
  it('returns correct meta for PENDING', () => {
    expect(getStatusMeta('PENDING').label).toBe('Pending');
    expect(getStatusMeta('PENDING').color).toContain('yellow');
  });

  it('returns correct meta for DELIVERED', () => {
    expect(getStatusMeta('DELIVERED').label).toBe('Delivered');
    expect(getStatusMeta('DELIVERED').color).toContain('green');
  });

  it('returns fallback for unknown status', () => {
    const meta = getStatusMeta('UNKNOWN_STATUS');
    expect(meta.label).toBe('UNKNOWN_STATUS');
  });
});

describe('formatCurrency', () => {
  it('formats a number with GH₵ prefix', () => {
    expect(formatCurrency(55)).toBe('GH₵55.00');
  });

  it('handles null/undefined as 0', () => {
    expect(formatCurrency(null)).toBe('GH₵0.00');
  });
});

describe('getOrderItems', () => {
  it('extracts items from order.items', () => {
    const order = {
      items: [
        { _id: 'i1', productName: 'Tomatoes', quantityOrdered: 2, unitPriceAtOrder: 5, totalPrice: 10 },
      ],
    };
    const result = getOrderItems(order);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Tomatoes');
    expect(result[0].quantity).toBe(2);
    expect(result[0].unitPrice).toBe(5);
  });

  it('returns empty array when order.items is undefined', () => {
    expect(getOrderItems({})).toEqual([]);
  });

  it('returns empty array when order.items is null', () => {
    expect(getOrderItems({ items: null })).toEqual([]);
  });
});

describe('normalizeOrder', () => {
  it('maps _id to id', () => {
    const order = { _id: 'ord-1', status: 'PENDING', items: [] };
    expect(normalizeOrder(order).id).toBe('ord-1');
  });

  it('uppercases status', () => {
    const order = { status: 'pending', items: [] };
    expect(normalizeOrder(order).status).toBe('PENDING');
  });

  it('calculates total from items when totalPrice is absent', () => {
    const order = {
      items: [
        { _id: 'i1', productName: 'X', quantityOrdered: 2, unitPriceAtOrder: 10, totalPrice: 20 },
      ],
    };
    expect(normalizeOrder(order).total).toBe(20);
  });
});

describe('formatDate', () => {
  it('returns — for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('returns a formatted date string for a valid ISO string', () => {
    const result = formatDate('2026-06-01T10:00:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run to verify all pass**

```bash
npm test -- src/__tests__/orderUtils.test.js --reporter=verbose
```

Expected: 12 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/orderUtils.test.js
git commit -m "test: orderUtils unit tests"
```

---

## Task 9: Hook Tests — useInventory

**Files:**
- Create: `src/hooks/__tests__/useInventory.test.js`

- [ ] **Step 1: Write the tests**

Create `src/hooks/__tests__/useInventory.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server.js';
import { useInventory } from '../useInventory.js';
import { createAuthWrapper } from '../../test-utils.jsx';
import { mockFarmer } from '../../mocks/fixtures/users.js';
import { mockListing } from '../../mocks/fixtures/listings.js';

describe('useInventory', () => {
  it('populates products after successful fetch', async () => {
    const { result } = renderHook(() => useInventory(), {
      wrapper: createAuthWrapper(mockFarmer),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].name).toBe(mockListing.title);
  });

  it('parses stockLevel and maxStock as floats', async () => {
    server.use(
      http.get('http://localhost:8000/api/listings', () =>
        HttpResponse.json({
          listings: [{ ...mockListing, quantityAvailable: '42.5', quantity: '200.0', ownerId: mockFarmer.id }],
        })
      )
    );

    const { result } = renderHook(() => useInventory(), {
      wrapper: createAuthWrapper(mockFarmer),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products[0].stockLevel).toBe(42.5);
    expect(result.current.products[0].maxStock).toBe(200.0);
  });

  it('sets error state when API fails', async () => {
    server.use(
      http.get('http://localhost:8000/api/listings', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useInventory(), {
      wrapper: createAuthWrapper(mockFarmer),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.products).toEqual([]);
  });

  it('does not fetch when user is null', async () => {
    let fetchCalled = false;
    server.use(
      http.get('http://localhost:8000/api/listings', () => {
        fetchCalled = true;
        return HttpResponse.json({ listings: [] });
      })
    );

    const { result } = renderHook(() => useInventory(), {
      wrapper: createAuthWrapper(null),
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(fetchCalled).toBe(false);
    expect(result.current.loading).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify all pass**

```bash
npm test -- src/hooks/__tests__/useInventory.test.js --reporter=verbose
```

Expected: 4 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/__tests__/useInventory.test.js
git commit -m "test: useInventory hook tests"
```

---

## Task 10: Hook Tests — useBarterProposals

**Files:**
- Create: `src/hooks/__tests__/useBarterProposals.test.js`

- [ ] **Step 1: Create a barter fixture and handler**

Add to `src/mocks/fixtures/orders.js` (append to the file):

```js
export const mockBarterRequest = {
  id: 'barter-1',
  status: 'PENDING',
  requester: { id: 'user-buyer-1', fullName: 'Ama Owusu' },
  targetListing: { id: 'listing-1', title: 'Fresh Tomatoes', owner: { id: 'user-farmer-1' } },
  offeredListing: { id: 'listing-3', title: 'Yams' },
  offeredQuantity: 50,
  offeredDescription: '50kg of fresh yams',
  message: 'Trade proposal',
  createdAt: '2026-06-01T09:00:00.000Z',
};
```

Add a barter handler to `src/mocks/handlers/orders.js` (append to the array):

```js
import { mockBarterRequest } from '../fixtures/orders.js';

// Add inside ordersHandlers array:
http.get(`${BASE}/api/barter`, () =>
  HttpResponse.json({ barterRequests: [mockBarterRequest] })
),

http.patch(`${BASE}/api/barter/:id`, async ({ params, request }) => {
  const body = await request.json();
  return HttpResponse.json({ id: params.id, status: body.status });
}),
```

- [ ] **Step 2: Check what URL barterService uses**

Open `src/lib/barterService.js` and find the `getBarterRequests` method. Note the endpoint URL (likely `/api/barter` or similar). Update the handler URL in step 1 to match if needed.

- [ ] **Step 3: Write the tests**

Create `src/hooks/__tests__/useBarterProposals.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server.js';
import { useBarterProposals } from '../useBarterProposals.js';
import { createAuthWrapper } from '../../test-utils.jsx';
import { mockFarmer } from '../../mocks/fixtures/users.js';

describe('useBarterProposals', () => {
  it('fetches and normalizes barter requests on mount', async () => {
    const { result } = renderHook(() => useBarterProposals(), {
      wrapper: createAuthWrapper(mockFarmer),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.barterRequests.length).toBeGreaterThan(0);
  });

  it('sets error state on API failure', async () => {
    // Override the barter endpoint with the actual URL from barterService
    server.use(
      http.get('http://localhost:8000/api/barter', () =>
        HttpResponse.json({ message: 'Error' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useBarterProposals(), {
      wrapper: createAuthWrapper(mockFarmer),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });

  it('returns empty array on empty response', async () => {
    server.use(
      http.get('http://localhost:8000/api/barter', () =>
        HttpResponse.json({ barterRequests: [] })
      )
    );

    const { result } = renderHook(() => useBarterProposals(), {
      wrapper: createAuthWrapper(mockFarmer),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.barterRequests).toEqual([]);
  });
});
```

- [ ] **Step 4: Run to verify all pass**

```bash
npm test -- src/hooks/__tests__/useBarterProposals.test.js --reporter=verbose
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/mocks/fixtures/orders.js src/mocks/handlers/orders.js src/hooks/__tests__/useBarterProposals.test.js
git commit -m "test: useBarterProposals hook tests"
```

---

## Task 11: Component Tests — OrderRow

**Files:**
- Create: `src/components/__tests__/OrderRow.test.jsx`

- [ ] **Step 1: Write the tests**

Create `src/components/__tests__/OrderRow.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderRow } from '../orders/OrderRow.jsx';
import { renderWithProviders } from '../../test-utils.jsx';
import { mockOrder } from '../../mocks/fixtures/orders.js';
import { normalizeOrder } from '../../lib/orderUtils.js';

const order = normalizeOrder(mockOrder);

describe('OrderRow', () => {
  it('renders order ID and total', () => {
    renderWithProviders(
      <OrderRow order={order} onUpdateStatus={vi.fn()} currentRole="BUYER" />
    );
    expect(screen.getByText(/Order #/i)).toBeInTheDocument();
  });

  it('renders item count from normalized items', () => {
    renderWithProviders(
      <OrderRow order={order} onUpdateStatus={vi.fn()} currentRole="BUYER" />
    );
    expect(screen.getByText(/1 item/i)).toBeInTheDocument();
  });

  it('renders gracefully when items is null (the ?? [] fix)', () => {
    const orderWithNullItems = { ...order, items: null };
    renderWithProviders(
      <OrderRow order={orderWithNullItems} onUpdateStatus={vi.fn()} currentRole="BUYER" />
    );
    expect(screen.getByText(/0 items/i)).toBeInTheDocument();
  });

  it('renders gracefully when items is undefined', () => {
    const { items: _, ...orderWithoutItems } = order;
    renderWithProviders(
      <OrderRow order={orderWithoutItems} onUpdateStatus={vi.fn()} currentRole="BUYER" />
    );
    expect(screen.getByText(/0 items/i)).toBeInTheDocument();
  });

  it('shows PENDING status badge', () => {
    renderWithProviders(
      <OrderRow order={order} onUpdateStatus={vi.fn()} currentRole="BUYER" />
    );
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify all pass**

```bash
npm test -- src/components/__tests__/OrderRow.test.jsx --reporter=verbose
```

Expected: 5 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/__tests__/OrderRow.test.jsx
git commit -m "test: OrderRow component tests"
```

---

## Task 12: Component Tests — EditProductModal

**Files:**
- Create: `src/components/__tests__/EditProductModal.test.jsx`

- [ ] **Step 1: Write the tests**

Create `src/components/__tests__/EditProductModal.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditProductModal from '../dashboard/EditProductModal.jsx';
import { renderWithProviders } from '../../test-utils.jsx';

const mockProduct = {
  id: 'prod-1',
  title: 'Fresh Tomatoes',
  description: 'Good ones',
  category: 'Vegetable',
  pricePerUnit: 5.5,
  quantityAvailable: 100,
  minimumOrderQty: 10,
  negotiable: false,
  unit: 'KG',
  status: 'active',
};

describe('EditProductModal', () => {
  it('does not render when isOpen is false', () => {
    renderWithProviders(
      <EditProductModal
        isOpen={false}
        product={mockProduct}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onUploadImages={vi.fn()}
      />
    );
    expect(screen.queryByText('Edit Product')).not.toBeInTheDocument();
  });

  it('calls onSave then onClose on successful submit', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <EditProductModal
        isOpen={true}
        product={mockProduct}
        onClose={onClose}
        onSave={onSave}
        onUploadImages={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('shows error message and does NOT close when onSave throws', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Server error'));
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <EditProductModal
        isOpen={true}
        product={mockProduct}
        onClose={onClose}
        onSave={onSave}
        onUploadImages={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(screen.getByText('Server error')).toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows uploadError and does NOT close when image upload throws', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const onUploadImages = vi.fn().mockRejectedValue(new Error('Upload failed'));
    const user = userEvent.setup();

    renderWithProviders(
      <EditProductModal
        isOpen={true}
        product={mockProduct}
        onClose={onClose}
        onSave={onSave}
        onUploadImages={onUploadImages}
      />
    );

    // Attach a file to trigger the upload path
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(screen.getByText(/Upload failed/i)).toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify all pass**

```bash
npm test -- src/components/__tests__/EditProductModal.test.jsx --reporter=verbose
```

Expected: 4 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/__tests__/EditProductModal.test.jsx
git commit -m "test: EditProductModal component tests"
```

---

## Task 13: Playwright Config + Scripts

**Files:**
- Create: `playwright.config.js`

- [ ] **Step 1: Create Playwright config**

Create `playwright.config.js`:

```js
import { defineConfig, devices } from '@playwright/test';

const isSmokeRun = process.env.SMOKE === 'true';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const STAGING_URL = process.env.STAGING_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: isSmokeRun ? './e2e/smoke' : './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    baseURL: isSmokeRun ? STAGING_URL : BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: isSmokeRun
    ? undefined
    : {
        command: 'npm run dev',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
      },
});
```

- [ ] **Step 2: Verify Playwright can find the config**

```bash
npx playwright test --list 2>&1 | head -10
```

Expected: Playwright outputs "No tests found" or an empty list (no config errors).

- [ ] **Step 3: Commit**

```bash
git add playwright.config.js
git commit -m "test: add Playwright config"
```

---

## Task 14: Playwright Page Objects

**Files:**
- Create: `e2e/pages/LoginPage.js`
- Create: `e2e/pages/MarketplacePage.js`
- Create: `e2e/pages/InventoryPage.js`
- Create: `e2e/pages/OrdersPage.js`

- [ ] **Step 1: Create LoginPage**

Create `e2e/pages/LoginPage.js`:

```js
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /sign in/i });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async fill(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(email, password) {
    await this.goto();
    await this.fill(email, password);
    await this.submit();
  }
}
```

- [ ] **Step 2: Create MarketplacePage**

Create `e2e/pages/MarketplacePage.js`:

```js
export class MarketplacePage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/search/i);
  }

  async goto() {
    await this.page.goto('/marketplace');
  }

  async search(query) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async getListingCards() {
    return this.page.locator('[data-testid="listing-card"]').all();
  }
}
```

- [ ] **Step 3: Create InventoryPage**

Create `e2e/pages/InventoryPage.js`:

```js
export class InventoryPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/farmer/inventory');
  }

  async getProductRows() {
    return this.page.locator('table tbody tr').all();
  }

  async clickEdit(productName) {
    const row = this.page.locator('tr', { hasText: productName });
    await row.getByRole('button', { name: /edit/i }).click();
  }

  async clickPublish(productName) {
    const row = this.page.locator('tr', { hasText: productName });
    await row.getByRole('button', { name: /publish/i }).click();
  }
}
```

- [ ] **Step 4: Create OrdersPage**

Create `e2e/pages/OrdersPage.js`:

```js
export class OrdersPage {
  constructor(page) {
    this.page = page;
    this.paymentBanner = page.locator('[data-testid="payment-notice"]');
    this.dismissButton = page.locator('[data-testid="payment-notice"] button[aria-label="Dismiss"]');
  }

  async goto() {
    await this.page.goto('/orders');
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add e2e/pages/
git commit -m "test: add Playwright page-object models"
```

---

## Task 15: Playwright API Fixtures

**Files:**
- Create: `e2e/fixtures/index.js`

- [ ] **Step 1: Create Playwright fixtures with route interception**

Create `e2e/fixtures/index.js`:

```js
import { test as base } from '@playwright/test';
import { mockFarmer, mockBuyer, mockAgent, mockAdmin, mockAccessToken } from '../../src/mocks/fixtures/users.js';
import { mockListing, mockListingDraft } from '../../src/mocks/fixtures/listings.js';
import { mockOrder } from '../../src/mocks/fixtures/orders.js';

const API = process.env.VITE_API_URL || 'http://localhost:8000';

export const test = base.extend({
  mockApi: [async ({ page }, use) => {
    // Auth endpoints
    await page.route(`${API}/api/auth/login`, async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      const users = {
        [mockFarmer.email]: mockFarmer,
        [mockBuyer.email]: mockBuyer,
        [mockAgent.email]: mockAgent,
        [mockAdmin.email]: mockAdmin,
      };
      const user = users[body.email];
      if (!user) {
        await route.fulfill({ status: 401, json: { message: 'Invalid credentials' } });
        return;
      }
      await route.fulfill({ json: { accessToken: mockAccessToken, user } });
    });

    await page.route(`${API}/api/auth/refresh`, (route) =>
      route.fulfill({ json: { accessToken: mockAccessToken } })
    );

    await page.route(`${API}/api/auth/logout`, (route) =>
      route.fulfill({ json: { message: 'Logged out' } })
    );

    await page.route(`${API}/api/auth/me`, (route) =>
      route.fulfill({ json: { user: mockFarmer } })
    );

    await page.route(`${API}/api/auth/role-setup-status`, (route) =>
      route.fulfill({ json: { roleSetupComplete: true, role: 'FARMER' } })
    );

    // Listings
    await page.route(`${API}/api/listings**`, (route) => {
      const url = route.request().url();
      const idMatch = url.match(/\/api\/listings\/([^?]+)/);
      if (idMatch) {
        return route.fulfill({ json: { listing: { ...mockListing, id: idMatch[1] } } });
      }
      return route.fulfill({
        json: {
          listings: [mockListing, mockListingDraft],
          pagination: { page: 1, total: 2, totalPages: 1 },
        },
      });
    });

    // Orders
    await page.route(`${API}/api/orders**`, (route) =>
      route.fulfill({ json: { orders: [mockOrder] } })
    );

    await use(page);
  }, { auto: false }],
});

export { expect } from '@playwright/test';
```

- [ ] **Step 2: Commit**

```bash
git add e2e/fixtures/
git commit -m "test: add Playwright fixtures with page.route() API mocking"
```

---

## Task 16: E2E Auth Spec

**Files:**
- Create: `e2e/specs/auth.spec.js`

- [ ] **Step 1: Write the spec**

Create `e2e/specs/auth.spec.js`:

```js
import { test, expect } from '../fixtures/index.js';
import { LoginPage } from '../pages/LoginPage.js';
import { mockFarmer, mockBuyer, mockAgent, mockAdmin } from '../../src/mocks/fixtures/users.js';

test.describe('Authentication', () => {
  test('FARMER with complete role setup redirects to /farmer/dashboard', async ({ page, mockApi }) => {
    const login = new LoginPage(page);
    await login.login(mockFarmer.email, 'password');
    await page.waitForURL('**/farmer/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/farmer/dashboard');
  });

  test('FARMER with incomplete role setup redirects to /complete-role-setup', async ({ page, mockApi }) => {
    await page.route('http://localhost:8000/api/auth/role-setup-status', (route) =>
      route.fulfill({ json: { roleSetupComplete: false, role: 'FARMER' } })
    );

    const login = new LoginPage(page);
    await login.login(mockFarmer.email, 'password');
    await page.waitForURL('**/complete-role-setup', { timeout: 5000 });
    expect(page.url()).toContain('/complete-role-setup');
  });

  test('BUYER redirects to /marketplace', async ({ page, mockApi }) => {
    await page.route('http://localhost:8000/api/auth/me', (route) =>
      route.fulfill({ json: { user: mockBuyer } })
    );
    await page.route('http://localhost:8000/api/auth/login', (route) =>
      route.fulfill({ json: { accessToken: 'token', user: mockBuyer } })
    );

    const login = new LoginPage(page);
    await login.login(mockBuyer.email, 'password');
    await page.waitForURL('**/marketplace', { timeout: 5000 });
    expect(page.url()).toContain('/marketplace');
  });

  test('ADMIN redirects to /admin/dashboard', async ({ page, mockApi }) => {
    await page.route('http://localhost:8000/api/auth/me', (route) =>
      route.fulfill({ json: { user: mockAdmin } })
    );
    await page.route('http://localhost:8000/api/auth/login', (route) =>
      route.fulfill({ json: { accessToken: 'token', user: mockAdmin } })
    );

    const login = new LoginPage(page);
    await login.login(mockAdmin.email, 'password');
    await page.waitForURL('**/admin/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/admin/dashboard');
  });

  test('invalid credentials shows error message', async ({ page, mockApi }) => {
    const login = new LoginPage(page);
    await login.login('wrong@email.com', 'wrongpassword');
    await expect(page.getByText(/sign-in failed|invalid credentials/i)).toBeVisible({ timeout: 3000 });
  });

  test('logout clears session and redirects to /login', async ({ page, mockApi }) => {
    const login = new LoginPage(page);
    await login.login(mockFarmer.email, 'password');
    await page.waitForURL('**/farmer/dashboard', { timeout: 5000 });

    await page.getByRole('button', { name: /profile menu/i }).click();
    await page.getByRole('menuitem', { name: /log out/i }).click();

    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('?redirect param is preserved through login for BUYER', async ({ page, mockApi }) => {
    await page.route('http://localhost:8000/api/auth/me', (route) =>
      route.fulfill({ json: { user: mockBuyer } })
    );
    await page.route('http://localhost:8000/api/auth/login', (route) =>
      route.fulfill({ json: { accessToken: 'token', user: mockBuyer } })
    );

    await page.goto('/login?redirect=%2Forders');
    const login = new LoginPage(page);
    await login.fill(mockBuyer.email, 'password');
    await login.submit();

    await page.waitForURL('**/orders', { timeout: 5000 });
    expect(page.url()).toContain('/orders');
  });
});
```

- [ ] **Step 2: Run the spec**

```bash
npm run test:e2e -- --grep "Authentication" --reporter=line
```

Expected: All 7 tests pass.

- [ ] **Step 3: Commit**

```bash
git add e2e/specs/auth.spec.js
git commit -m "test: E2E authentication spec"
```

---

## Task 17: E2E Buyer Flow Spec

**Files:**
- Create: `e2e/specs/buyer-flow.spec.js`

- [ ] **Step 1: Write the spec**

Create `e2e/specs/buyer-flow.spec.js`:

```js
import { test, expect } from '../fixtures/index.js';
import { mockBuyer } from '../../src/mocks/fixtures/users.js';
import { mockListing } from '../../src/mocks/fixtures/listings.js';

test.describe('Buyer Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Inject buyer session state so tests start authenticated
    await page.route('http://localhost:8000/api/auth/refresh', (route) =>
      route.fulfill({ json: { accessToken: 'token' } })
    );
    await page.route('http://localhost:8000/api/auth/me', (route) =>
      route.fulfill({ json: { user: mockBuyer } })
    );
    await page.route('http://localhost:8000/api/listings**', (route) =>
      route.fulfill({
        json: {
          listings: [mockListing],
          pagination: { page: 1, total: 1, totalPages: 1 },
        },
      })
    );
  });

  test('marketplace page loads listings', async ({ page, mockApi }) => {
    await page.goto('/marketplace');
    await expect(page.getByText(mockListing.title)).toBeVisible({ timeout: 5000 });
  });

  test('search filters listings by query', async ({ page, mockApi }) => {
    await page.route('http://localhost:8000/api/listings**', (route) => {
      const url = route.request().url();
      if (url.includes('search=tomato')) {
        return route.fulfill({ json: { listings: [mockListing], pagination: { total: 1 } } });
      }
      return route.fulfill({ json: { listings: [], pagination: { total: 0 } } });
    });

    await page.goto('/marketplace');
    await page.getByPlaceholder(/search/i).fill('tomato');
    await page.getByPlaceholder(/search/i).press('Enter');
    await expect(page.getByText(mockListing.title)).toBeVisible({ timeout: 5000 });
  });

  test('entering invalid quantity 0 shows validation error on listing detail', async ({ page, mockApi }) => {
    await page.goto(`/marketplace/${mockListing.id}`);
    await page.getByLabel(/quantity/i).fill('0');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await expect(page.getByText(/valid quantity/i)).toBeVisible({ timeout: 3000 });
  });

  test('entering non-numeric quantity shows validation error', async ({ page, mockApi }) => {
    await page.goto(`/marketplace/${mockListing.id}`);
    await page.getByLabel(/quantity/i).fill('abc');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await expect(page.getByText(/valid quantity/i)).toBeVisible({ timeout: 3000 });
  });
});
```

- [ ] **Step 2: Run the spec**

```bash
npm run test:e2e -- --grep "Buyer Flow" --reporter=line
```

Expected: All 4 tests pass.

- [ ] **Step 3: Commit**

```bash
git add e2e/specs/buyer-flow.spec.js
git commit -m "test: E2E buyer flow spec"
```

---

## Task 18: E2E Farmer Flow Spec

**Files:**
- Create: `e2e/specs/farmer-flow.spec.js`

- [ ] **Step 1: Write the spec**

Create `e2e/specs/farmer-flow.spec.js`:

```js
import { test, expect } from '../fixtures/index.js';
import { mockFarmer } from '../../src/mocks/fixtures/users.js';
import { mockListing, mockListingDraft } from '../../src/mocks/fixtures/listings.js';

test.describe('Farmer Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('http://localhost:8000/api/auth/refresh', (route) =>
      route.fulfill({ json: { accessToken: 'token' } })
    );
    await page.route('http://localhost:8000/api/auth/me', (route) =>
      route.fulfill({ json: { user: mockFarmer } })
    );
    await page.route('http://localhost:8000/api/listings**', (route) => {
      const url = route.request().url();
      const method = route.request().method();
      if (method === 'PATCH') return route.fulfill({ json: { listing: mockListing } });
      if (url.includes('/publish')) return route.fulfill({ json: { listing: { ...mockListingDraft, status: 'ACTIVE' } } });
      return route.fulfill({
        json: { listings: [mockListing, mockListingDraft], pagination: { total: 2 } },
      });
    });
  });

  test('inventory page shows farmer products', async ({ page, mockApi }) => {
    await page.goto('/farmer/inventory');
    await expect(page.getByText(mockListing.title)).toBeVisible({ timeout: 5000 });
  });

  test('edit modal opens and save succeeds, modal closes', async ({ page, mockApi }) => {
    await page.goto('/farmer/inventory');
    await page.getByText(mockListing.title)
      .locator('xpath=ancestor::tr')
      .getByRole('button', { name: /edit/i })
      .click();

    await expect(page.getByText('Edit Product')).toBeVisible({ timeout: 3000 });

    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText('Edit Product')).not.toBeVisible({ timeout: 3000 });
  });

  test('publish draft shows toast (not native alert)', async ({ page, mockApi }) => {
    await page.goto('/farmer/inventory');

    // Listen for any native alert() calls — should not happen
    let alertFired = false;
    page.on('dialog', (dialog) => {
      alertFired = true;
      dialog.dismiss();
    });

    await page.getByText(mockListingDraft.title)
      .locator('xpath=ancestor::tr')
      .getByRole('button', { name: /publish/i })
      .click();

    await page.waitForTimeout(500);
    expect(alertFired).toBe(false);
  });
});
```

- [ ] **Step 2: Run the spec**

```bash
npm run test:e2e -- --grep "Farmer Flow" --reporter=line
```

Expected: All 3 tests pass.

- [ ] **Step 3: Commit**

```bash
git add e2e/specs/farmer-flow.spec.js
git commit -m "test: E2E farmer flow spec"
```

---

## Task 19: E2E Orders Spec

**Files:**
- Create: `e2e/specs/orders.spec.js`

- [ ] **Step 1: Write the spec**

Create `e2e/specs/orders.spec.js`:

```js
import { test, expect } from '../fixtures/index.js';
import { mockFarmer } from '../../src/mocks/fixtures/users.js';
import { mockOrder } from '../../src/mocks/fixtures/orders.js';

test.describe('Orders Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('http://localhost:8000/api/auth/refresh', (route) =>
      route.fulfill({ json: { accessToken: 'token' } })
    );
    await page.route('http://localhost:8000/api/auth/me', (route) =>
      route.fulfill({ json: { user: mockFarmer } })
    );
    await page.route('http://localhost:8000/api/orders**', (route) =>
      route.fulfill({ json: { orders: [mockOrder] } })
    );
  });

  test('payment notice banner appears when sessionStorage has a reference', async ({ page, mockApi }) => {
    await page.goto('/orders');

    // Inject the pending reference into sessionStorage before loading the page
    await page.evaluate(() => {
      sessionStorage.setItem(
        'pendingPaymentReference',
        JSON.stringify({ reference: 'REF-001', orderId: 'order-1' })
      );
    });

    await page.reload();
    await expect(page.locator('[data-testid="payment-notice"]')).toBeVisible({ timeout: 5000 });
  });

  test('dismiss button clears the payment notice banner', async ({ page, mockApi }) => {
    await page.goto('/orders');

    await page.evaluate(() => {
      sessionStorage.setItem(
        'pendingPaymentReference',
        JSON.stringify({ reference: 'REF-001', orderId: 'order-1' })
      );
    });

    await page.reload();
    await page.locator('[data-testid="payment-notice"] button[aria-label="Dismiss"]').click();
    await expect(page.locator('[data-testid="payment-notice"]')).not.toBeVisible({ timeout: 3000 });
  });

  test('orders list renders at least one order', async ({ page, mockApi }) => {
    await page.goto('/orders');
    await expect(page.getByText(/Order #/i)).toBeVisible({ timeout: 5000 });
  });
});
```

> **Note:** The Orders.jsx payment notice banner needs `data-testid="payment-notice"` added to the wrapping div and a `data-testid`-able dismiss button. If these attributes are not present, use the text content as the locator instead.

- [ ] **Step 2: Add data-testid to payment notice in Orders.jsx (if not already present)**

Open `src/pages/Orders.jsx`. Find the `paymentNotice` banner div. Add `data-testid="payment-notice"`:

```jsx
{paymentNotice.message && (
  <div data-testid="payment-notice" className={`flex items-center gap-3 ...`}>
    <span className="flex-1">{paymentNotice.message}</span>
    <button type="button" onClick={() => setPaymentNotice({ type: "", message: "" })} aria-label="Dismiss">
      <X size={16} />
    </button>
  </div>
)}
```

- [ ] **Step 3: Run the spec**

```bash
npm run test:e2e -- --grep "Orders Page" --reporter=line
```

Expected: All 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add e2e/specs/orders.spec.js src/pages/Orders.jsx
git commit -m "test: E2E orders spec; add data-testid to payment notice"
```

---

## Task 20: Smoke Spec

**Files:**
- Create: `e2e/smoke/smoke.spec.js`

- [ ] **Step 1: Write the smoke spec**

Create `e2e/smoke/smoke.spec.js`:

```js
import { test, expect } from '@playwright/test';

const API = process.env.STAGING_API_URL || 'http://localhost:8000';
const FARMER_EMAIL = process.env.SMOKE_FARMER_EMAIL || 'smoketest-farmer@farmbridge.test';
const FARMER_PASSWORD = process.env.SMOKE_FARMER_PASSWORD || 'smoketest';

test.describe('Smoke Tests (real backend)', () => {
  test('GET /api/listings returns 200', async ({ request }) => {
    const response = await request.get(`${API}/api/listings`);
    expect(response.status()).toBe(200);
  });

  test('login with real test account succeeds', async ({ request }) => {
    const response = await request.post(`${API}/api/auth/login`, {
      data: { email: FARMER_EMAIL, password: FARMER_PASSWORD },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('accessToken');
    expect(body.user.role).toBe('FARMER');
  });

  test('marketplace page loads at least one listing', async ({ page }) => {
    await page.goto('/marketplace');
    // Wait for at least one listing title to appear
    const listings = page.locator('[data-testid="listing-card"]');
    await expect(listings.first()).toBeVisible({ timeout: 10000 });
  });
});
```

- [ ] **Step 2: Document environment variables**

The smoke suite requires:
- `SMOKE=true` — enables smoke mode in playwright.config.js
- `STAGING_URL` — base URL of the staging frontend (e.g. `https://farmbridge.vercel.app`)
- `STAGING_API_URL` — base URL of the staging API (e.g. `https://api.farmbridge.app`)
- `SMOKE_FARMER_EMAIL` — email of a seeded test farmer account
- `SMOKE_FARMER_PASSWORD` — password of the seeded test farmer account

Run with:
```bash
SMOKE=true STAGING_URL=https://your-staging.app STAGING_API_URL=https://your-api.app SMOKE_FARMER_EMAIL=test@farm.test SMOKE_FARMER_PASSWORD=yourpass npm run test:smoke
```

- [ ] **Step 3: Commit**

```bash
git add e2e/smoke/smoke.spec.js
git commit -m "test: smoke spec for real-backend verification"
```

---

## Task 21: Run Full Suite and Verify

- [ ] **Step 1: Run all Vitest tests**

```bash
npm test -- --reporter=verbose
```

Expected: All unit and integration tests pass. Count should be ~38+ tests across 8 test files.

- [ ] **Step 2: Run all E2E tests**

```bash
npm run test:e2e
```

Expected: All E2E specs pass. Playwright report opens at `playwright-report/index.html`.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "test: complete test suite — Vitest unit/integration + Playwright E2E"
```
