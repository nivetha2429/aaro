# AARO E2E Test Suite

End-to-end testing for the AARO Systems e-commerce platform using [Playwright](https://playwright.dev/).

## Test Structure

```
aaro-tests/
├── playwright.config.ts       # Playwright config + TEST_CONFIG export
├── package.json                # Dependencies & scripts
├── health-check.js             # Quick API health check (no Playwright)
├── run-tests.sh                # Master test runner with flags
├── utils/
│   └── helpers.ts              # Shared test utilities
├── tests/
│   ├── e2e/
│   │   ├── 01-homepage.spec.ts         # Homepage & navigation
│   │   ├── 02-shop-pages.spec.ts       # Shop, categories, product details
│   │   ├── 03-auth.spec.ts             # Login, register, protected routes
│   │   ├── 04-admin-products.spec.ts   # Admin product CRUD
│   │   ├── 05-admin-tabs.spec.ts       # All admin dashboard tabs
│   │   ├── 06-orders-whatsapp.spec.ts  # Orders flow & WhatsApp redirect
│   │   └── 08-responsive.spec.ts       # Responsive design across viewports
│   └── api/
│       └── 07-backend-api.spec.ts      # Direct API endpoint tests
```

## Test Suites Overview

| # | Suite | Tests | Covers |
|---|-------|-------|--------|
| 01 | Homepage | 11 | Navbar, hero, featured products, footer, navigation |
| 02 | Shop Pages | 12 | Shop, phones, laptops, accessories, brands, product details, 404 |
| 03 | Auth | 10 | Login, register, admin login, protected routes, forgot password |
| 04 | Admin Products | 8 | Inventory tab, search, add/create product, category tabs |
| 05 | Admin Tabs | 11 | All 10 admin tabs load correctly without errors |
| 06 | Orders & WhatsApp | 9 | Cart, WhatsApp links, add-to-cart, admin orders |
| 07 | Backend API | 25+ | Health, auth, products CRUD, categories, brands, orders, settings |
| 08 | Responsive | 48+ | 6 viewports × 8 checks (overflow, nav, footer, text, touch, images) |

## Setup

```bash
cd aaro-tests
npm install
npx playwright install
```

## Running Tests

### Quick Commands
```bash
npm test                    # Run all tests
npm run test:chrome         # Chrome only
npm run test:mobile         # Mobile devices only
npm run test:api            # API tests only
npm run test:admin          # Admin panel tests only
npm run test:fast           # Quick smoke test (homepage + shop)
npm run test:headed         # Watch tests in browser
npm run test:ui             # Playwright UI mode
npm run report              # View last test report
npm run health              # Quick API health check
```

### Shell Script
```bash
chmod +x run-tests.sh
./run-tests.sh              # Run all (default)
./run-tests.sh --fast       # Quick smoke test
./run-tests.sh --api        # API tests only
./run-tests.sh --admin      # Admin tests only
./run-tests.sh --mobile     # Mobile responsive tests
./run-tests.sh --headed     # Watch in browser
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TEST_URL` | `http://localhost:8000` | Frontend URL |
| `API_URL` | `http://localhost:5000/api` | Backend API URL |
| `ADMIN_EMAIL` | `admin@aaro.com` | Admin login email |
| `ADMIN_PASSWORD` | `admin@1402` | Admin login password |

## Browser Projects

| Project | Device |
|---------|--------|
| chromium | Desktop Chrome |
| firefox | Desktop Firefox |
| iPad | iPad (gen 7) — 810×1080 |
| Pixel 5 | Pixel 5 — 393×851 |
| iPhone 13 | iPhone 13 — 390×844 |
| Galaxy S21 | Galaxy S21 — 360×800 |

## Prerequisites

- Node.js 18+
- Backend server running on port 5000
- Frontend dev server running on port 8000
- Admin account (default: admin@aaro.com / admin@1402)
