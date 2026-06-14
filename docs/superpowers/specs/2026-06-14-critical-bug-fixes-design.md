# Critical Bug Fixes — Design Spec
**Date:** 2026-06-14
**Scope:** 4 critical bugs causing incorrect logouts, 404 navigation, duplicate loading UI, and silent message failures.

---

## Bug 1 — api.js: Retry errors incorrectly log the user out

**File:** `src/lib/api.js` (lines 60–84)

**Problem:** When a request returns 401, the code refreshes the token and retries. The retry call `return apiFetch(endpoint, requestOptions)` is inside the same `try/catch` as the refresh request. Any error the retry throws — 500, network timeout, anything — is caught and rewritten as "Session expired", which clears the access token and fires `auth:unauthorized`. This logs the user out even though their session is valid.

**Fix:** Use a `refreshSucceeded` flag. The try/catch wraps only the refresh call. If refresh fails (flag stays false), clear the token and throw. The retry lives outside the try/catch so its errors propagate naturally.

```js
let refreshSucceeded = false;
try {
  const refreshResponse = await fetchWithTimeout(
    `${API_BASE_URL}/api/auth/refresh`,
    { method: "POST", credentials: "include" },
    timeoutMs
  );
  if (refreshResponse.ok) {
    const data = await refreshResponse.json();
    setAccessToken(data.accessToken);
    refreshSucceeded = true;
  }
} catch {
  // network error during refresh — treat as session expired
}

if (!refreshSucceeded) {
  clearAccessToken();
  window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  throw new Error("Session expired. Please log in again.");
}

return apiFetch(endpoint, requestOptions);
```

---

## Bug 2 — Dashboard.jsx: Knowledge Base button navigates to 404

**File:** `src/pages/Dashboard.jsx` (line 219)

**Problem:** `onKnowledgeBase={() => navigate("/help")}` — no `/help` route exists in `App.jsx`. Clicking the button silently lands on the NotFound page.

**Fix:** Replace with a no-op until a help page is implemented.

```js
onKnowledgeBase={() => {}}
```

---

## Bug 3 — Orders.jsx: Double loading skeleton in buyer view

**File:** `src/pages/Orders.jsx` (lines 427–485)

**Problem:** When `loading` is true, the buyer layout renders two loading UIs simultaneously:
1. An inline table skeleton (lines 427–481)
2. `<OrdersBuyerSkeleton>` in the empty-state ternary immediately below (lines 484–485)

**Fix:** Remove the ternary wrapping the empty state. Render it only when `!loading` and there are no orders:

```js
{!loading && filteredOrders.length === 0 && (
  <motion.div ...>...</motion.div>
)}
```

---

## Bug 4 — Messages.jsx: Silent message send failure

**File:** `src/pages/Messages.jsx` (lines 154–172)

**Problem:** The catch block in `handleSend` is empty. When a message fails to send, the user gets no feedback and may believe the message was delivered when it was not.

**Fix:** Add a `sendError` state variable. Set it in catch, clear it on success, render it as a red hint below the textarea.

```js
const [sendError, setSendError] = useState("");

// on success:
setSendError("");

// in catch:
setSendError("Failed to send message. Please try again.");

// in JSX below textarea:
{sendError && (
  <p className="text-xs text-red-500 px-1 pt-1">{sendError}</p>
)}
```

---

## Out of Scope

The following were identified but are deferred to a future pass:
- UX inconsistencies (native `alert()`/`confirm()` in Inventory, non-unique toast IDs)
- Code quality issues (dead `useEffect` in ProtectedRoute, duplicate `decodeJwtPayload`, misplaced import in useDashboard)
- Missing `/help` route implementation (Bug 2 fix is a no-op placeholder only)
