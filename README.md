# AgriTech Frontend (FarmBridge)

React + Vite frontend for the AgriTech Ghana marketplace platform.

## Stack

- React 19
- Vite 7
- React Router
- Tailwind CSS
- Vitest + Testing Library

## Prerequisites

- Node.js 18+
- npm 9+
- Backend API running (default: http://localhost:8000)

## Environment

Create .env in the project root:

VITE_API_URL=http://localhost:8000
GOOGLE_OAUTH_URL=https://api.agritechgh.me/api/auth/google

## Install

npm install

## Run

npm run dev

App runs on Vite default dev port unless overridden.

## Scripts

- npm run dev: Start development server
- npm run build: Create production build
- npm run preview: Preview production build locally
- npm run lint: Run ESLint
- npm test: Run Vitest once
- npm run test:watch: Run Vitest in watch mode
- npm run test:ui: Run Vitest UI

## High-Level Architecture

- src/App.jsx: Route map, role-protected sections, lazy page loading
- src/context/AuthContext.jsx: Auth state and session lifecycle
- src/lib/: API service layer (auth, listings, orders, admin, agent, etc.)
- src/hooks/: Feature-level state and orchestration hooks
- src/pages/: Route-level screens
- src/components/: Shared and domain components
- src/test/: Vitest unit tests for the lib/ layer (API client, token store, guest cart, order/dashboard/image utils)

## Main Product Areas

- Public: marketplace, auth, verification, profile
- Farmer: dashboard, ledger, inventory, proposals, activity
- Agent: dashboard, farmer management
- Admin: dashboard, users, listings, KYC, revenue, disputes, settings

## Notes

- Path alias @ resolves to src/ (configured in vite.config.js).
- API calls use credentials include for refresh-token flow.
- On unauthorized API events, auth context clears local session and redirects to login.
