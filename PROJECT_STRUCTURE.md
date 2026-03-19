# AARO E-Commerce — Complete Project Structure

## Overview

**AARO Groups** — Full-stack MERN e-commerce platform for phones, laptops & accessories.

| Layer     | Tech                                       | Port  |
| --------- | ------------------------------------------ | ----- |
| Frontend  | React 18 + TypeScript + Vite + TailwindCSS | 8000  |
| Backend   | Express.js + Mongoose                      | 5000  |
| Database  | MongoDB Atlas (fallback: MongoMemoryServer)| 27017 |
| Deploy    | Render.com (auto-deploy from `main`)       |       |

---

## Full Directory Tree

```
Aaro/
│
├── index.html                    # SPA entry — initial loader, SEO meta, favicon, PWA tags
├── package.json                  # Frontend dependencies & scripts
├── vite.config.ts                # Vite — proxy /api → :5000, SWC plugin, port 8000
├── tailwind.config.ts            # Tailwind — custom xs breakpoint, colors, fluid utilities
├── tsconfig.json                 # TypeScript root config
├── tsconfig.app.json             # App-specific TS config (src/)
├── tsconfig.node.json            # Node/Vite TS config
├── vitest.config.ts              # Unit test config (jsdom environment)
├── eslint.config.js              # ESLint flat config
├── postcss.config.js             # PostCSS — Tailwind + autoprefixer
├── components.json               # shadcn/ui component config
├── start.js                      # Combined dev server launcher
├── PROJECT_STRUCTURE.md          # This file
│
├── public/                       # ── Static assets (served as-is by Vite) ──
│   ├── manifest.json             # PWA manifest (app name, icons, screenshots)
│   ├── sw.js                     # Service worker — offline caching
│   ├── offline.html              # Offline fallback page
│   ├── apple-touch-icon.png      # iOS home screen icon (180x180)
│   ├── og-image.jpg              # Open Graph image (1200x630)
│   ├── og-image-square.jpg       # Square OG image (600x600)
│   ├── logo-transparent.png      # Logo with transparent bg
│   ├── logo-white-bg.png         # Logo with white bg
│   ├── googlef3aae...html        # Google Search Console verification
│   └── icons/                    # PWA icon set
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-152x152.png
│       ├── icon-192x192.png      # Also used as default favicon
│       ├── icon-384x384.png
│       ├── icon-512x512.png
│       └── maskable-icon-512x512.png
│
├── scripts/                      # ── Build-time utility scripts ──
│   ├── compress-images.js        # Sharp-based image compression
│   ├── generate-icons.js         # Generate PWA icon set from source logo
│   ├── generate-og.js            # Generate OG images
│   └── process-logo.js           # Process uploaded logo
│
├── src/                          # ══ FRONTEND (React + TypeScript) ══
│   ├── main.tsx                  # React DOM root — wraps all providers
│   ├── App.tsx                   # Routes, layout, AaroLoader, favicon updater, logo cache
│   ├── App.css                   # Minimal app styles
│   ├── index.css                 # Global CSS — Tailwind, clamp() typography, animations
│   ├── vite-env.d.ts             # Vite type declarations
│   │
│   ├── pages/                    # ── Page components (one per route) ──
│   │   ├── Index.tsx             #   /              Homepage
│   │   ├── Shop.tsx              #   /shop          All products + filters
│   │   ├── Phones.tsx            #   /phones        Phone listing
│   │   ├── Laptops.tsx           #   /laptops       Laptop listing
│   │   ├── Accessories.tsx       #   /accessories   Accessories listing
│   │   ├── ProductDetails.tsx    #   /product/:id   Full PDP
│   │   ├── Cart.tsx              #   /cart           Shopping cart
│   │   ├── OrderForm.tsx         #   /order          Checkout → WhatsApp
│   │   ├── MyOrders.tsx          #   /my-orders      Order history
│   │   ├── Login.tsx             #   /login          JWT login
│   │   ├── Register.tsx          #   /register       Registration
│   │   ├── ForgotPassword.tsx    #   /forgot-password
│   │   ├── Profile.tsx           #   /profile        User/Admin profile
│   │   ├── Contact.tsx           #   /contact        Branch cards
│   │   ├── Community.tsx         #   /community      WhatsApp + Instagram
│   │   ├── Brands.tsx            #   /brands         Brands showcase
│   │   ├── Offers.tsx            #   /offers         Active offers
│   │   ├── Elite.tsx             #   /elite          VIP page
│   │   ├── WhatsAppGroup.tsx     #   /whatsapp       WhatsApp redirect
│   │   ├── CustomerDashboard.tsx #   /dashboard      Customer dashboard
│   │   ├── NotFound.tsx          #   *               404 page
│   │   │
│   │   └── admin/                # ── Admin panel tabs ──
│   │       ├── Dashboard.tsx     #   Shell: sidebar, header, tab routing
│   │       ├── OverviewTab.tsx   #   Stats cards, quick actions
│   │       ├── OrdersTab.tsx     #   Order management (year/category filters)
│   │       ├── ProductsTab.tsx   #   CRUD products, search, pagination, variants
│   │       ├── CategoriesTab.tsx #   Categories + Brands management
│   │       ├── FeaturedTab.tsx   #   Toggle featured products
│   │       ├── OffersTab.tsx     #   Popup offer config (image, countdown)
│   │       ├── BannersTab.tsx    #   Hero/center banner management
│   │       ├── ContactTab.tsx    #   Contact settings, branches, logo upload
│   │       ├── UsersTab.tsx      #   User management
│   │       ├── ReviewsTab.tsx    #   Reviews management
│   │       └── CredentialsTab.tsx#   Credentials management
│   │
│   ├── components/               # ── Reusable UI components ──
│   │   ├── Navbar.tsx            #   Sticky header: logo, nav, search, cart, profile, mobile menu
│   │   ├── Footer.tsx            #   Dynamic logo, links, contact, social
│   │   ├── MobileNav.tsx         #   Fixed bottom nav (visible < lg breakpoint)
│   │   ├── ProductCard.tsx       #   Card: image swap, badges, price, add-to-cart
│   │   ├── SkeletonCard.tsx      #   Loading skeleton for product grids
│   │   ├── QuickViewModal.tsx    #   Quick view modal
│   │   ├── WhatsAppButton.tsx    #   Floating WhatsApp button (bottom-right)
│   │   ├── OfferPopup.tsx        #   Auto-show offer popup + countdown + minimized icon
│   │   ├── PageMeta.tsx          #   SEO: title, OG tags, structured data
│   │   ├── BrandLogo.tsx         #   Brand logo with fallback initials
│   │   ├── ImageUpload.tsx       #   Reusable image upload (admin)
│   │   ├── ReviewSection.tsx     #   Review display/submission
│   │   ├── AdminRoute.tsx        #   Protected route wrapper
│   │   ├── NavLink.tsx           #   Active-state nav link
│   │   │
│   │   └── ui/                   # ── shadcn/ui primitives ──
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── tooltip.tsx
│   │
│   ├── context/                  # ── React Context providers ──
│   │   ├── AuthContext.tsx        #   user, token, isAdmin, login(), logout()
│   │   ├── CartContext.tsx        #   cart, addToCart(), totalItems, totalPrice
│   │   └── DataContext.tsx        #   products, categories, brands, offers, banners, contactSettings
│   │
│   ├── data/
│   │   └── products.ts           #   TypeScript interfaces + WHATSAPP_NUMBER constant
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts        #   Debounce hook (search inputs)
│   │   ├── use-mobile.tsx        #   Mobile detection hook
│   │   └── use-toast.ts          #   Toast hook (sonner)
│   │
│   ├── lib/
│   │   ├── api.ts                #   API base URL helper
│   │   ├── auth.ts               #   JWT expiration checker
│   │   ├── cloudinary.ts         #   Cloudinary upload helper (client)
│   │   ├── schemas.ts            #   Zod validation schemas
│   │   └── utils.ts              #   cn() — clsx + tailwind-merge
│   │
│   ├── assets/
│   │   ├── hero-banner.jpg       #   Default hero banner
│   │   ├── logo.png              #   Static fallback logo
│   │   ├── summer-sale-bg.png    #   Sale background
│   │   └── banners/
│   │       ├── smartphone.jpg
│   │       ├── laptop.jpg
│   │       └── accessories.jpg
│   │
│   └── test/
│       ├── setup.ts              #   Test setup (jsdom)
│       ├── example.test.ts
│       ├── auth.test.ts
│       ├── schemas.test.ts
│       └── ProductCard.test.tsx
│
├── server/                       # ══ BACKEND (Express.js + Mongoose) ══
│   ├── server.js                 #   Entry: middleware, MongoDB, routes, static, errors
│   ├── package.json              #   Backend dependencies
│   │
│   ├── routes/                   # ── API route handlers ──
│   │   ├── auth.js               #   POST /api/auth/register, /login, /forgot-password
│   │   ├── products.js           #   CRUD /api/products (GET public, write admin)
│   │   ├── categories.js         #   CRUD /api/categories
│   │   ├── brands.js             #   CRUD /api/brands + POST /:id/fetch-logo
│   │   ├── offers.js             #   CRUD /api/offers
│   │   ├── banners.js            #   CRUD /api/banners
│   │   ├── orders.js             #   /api/orders (user create/list, admin status update)
│   │   ├── reviews.js            #   /api/reviews (user write, public read)
│   │   ├── users.js              #   /api/users (admin only)
│   │   ├── contactSettings.js    #   /api/contact-settings (GET public, PUT admin)
│   │   ├── upload.js             #   POST /api/upload (multer → /uploads/)
│   │   └── sitemap.js            #   GET /sitemap.xml (dynamic generation)
│   │
│   ├── middleware/
│   │   └── authMiddleware.js     #   JWT verify → req.userId; isAdmin → DB role check
│   │
│   ├── models/                   # ── Mongoose schemas ──
│   │   ├── User.js               #   name, email, phone, password, role
│   │   ├── Product.js            #   name, brand, category, condition, images[], specs, features[]
│   │   ├── Variant.js            #   product(ref), ram, storage, color, price, originalPrice, stock
│   │   ├── Category.js           #   name, slug, description, image
│   │   ├── Brand.js              #   name, slug, category, description, image
│   │   ├── Order.js              #   user(ref), items[], totalAmount, status, shippingAddress
│   │   ├── Review.js             #   product(ref), user(ref), name, rating, comment
│   │   ├── Offer.js              #   title, description, tag, code, discount, image, active
│   │   ├── Banner.js             #   title, subtitle, image, link, position, active
│   │   ├── ContactSettings.js    #   phone, email, whatsappNumber, logoUrl, branches[]
│   │   └── ProductModel.js       #   name, brand, category
│   │
│   ├── config/
│   │   ├── env.js                #   dotenv loader
│   │   └── logger.js             #   Pino logger
│   │
│   ├── lib/
│   │   ├── cloudinary.js         #   Cloudinary SDK config
│   │   └── validate.js           #   Zod validation middleware
│   │
│   ├── seed.js                   #   Master seeder
│   ├── seedAdmin.js              #   Default admin (admin@aaro.com / admin@1402)
│   ├── seedProducts.js           #   Sample products
│   ├── seedVariants.js           #   Product variants
│   ├── seedLogos.js              #   Brand logos
│   ├── seedModels.js             #   Product models
│   ├── fetchLogos.js             #   Fetch brand logos from web
│   ├── fix_logos.js              #   Fix broken logo URLs
│   │
│   └── uploads/                  #   Multer upload destination (ephemeral on Render)
│
└── aaro-tests/                   # ══ E2E TESTS (Playwright) ══
    ├── playwright.config.ts
    ├── health-check.js
    ├── package.json
    ├── utils/
    │   └── helpers.ts
    └── tests/
        ├── e2e/
        │   ├── 01-homepage.spec.ts
        │   ├── 02-shop-pages.spec.ts
        │   ├── 03-auth.spec.ts
        │   ├── 04-admin-products.spec.ts
        │   ├── 05-admin-tabs.spec.ts
        │   ├── 06-orders-whatsapp.spec.ts
        │   └── 08-responsive.spec.ts
        └── api/
            └── 07-backend-api.spec.ts
```

---

## Application Flows

### Authentication
```
User → POST /api/auth/login → Server returns JWT (7d expiry)
  → Frontend stores in localStorage (aaro_token, aaro_user)
  → All API calls send Authorization: Bearer <token>
  → authMiddleware verifies JWT → sets req.userId
  → isAdmin middleware checks user.role === "admin" in DB
```

### Order (WhatsApp-based)
```
Route 1: ProductDetails → "Order on WhatsApp" → opens wa.me with product message
Route 2: Cart → "Proceed to Checkout" → OrderForm
  → Fills shipping details → POST /api/orders (saves to DB)
  → Auto-opens WhatsApp with full order summary
```

### Data Loading
```
App mounts → DataContext fires parallel fetches:
  GET /api/products        (with variants embedded)
  GET /api/categories
  GET /api/brands
  GET /api/offers
  GET /api/banners
  GET /api/contact-settings
→ Stored in React context, shared across all pages
→ SkeletonCard shown during loading
→ Admin CRUD operations update context in-place
```

### Dynamic Logo
```
Admin uploads logo → POST /api/upload → URL saved to ContactSettings.logoUrl
  → Navbar, Footer, App Loader read from contactSettings.logoUrl
  → Browser tab icon (favicon) dynamically updated via DOM
  → Logo URL cached in localStorage("aaro_logo") for pre-React HTML loader
```

---

## NPM Scripts

### Frontend (root `package.json`)
| Command             | Description                      |
| ------------------- | -------------------------------- |
| `npm run dev`       | Vite dev server (port 8000)      |
| `npm run dev:all`   | Frontend + backend concurrently  |
| `npm run build`     | Production build (Vite)          |
| `npm run preview`   | Preview production build         |
| `npm test`          | Run Vitest unit tests            |
| `npm run lint`      | ESLint check                     |

### Backend (`server/package.json`)
| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `npm start`             | Production server (node)      |
| `npm run dev`           | Dev server (nodemon)          |
| `npm run seed`          | Run all seeders               |
| `npm run seed:admin`    | Create default admin user     |
| `npm run seed:products` | Seed sample products          |

---

## Environment Variables

### Frontend (`.env`)
```
VITE_API_URL=/api
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

### Backend (`server/.env`)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NODE_ENV=production
```

---

## Key Architecture Decisions

| Pattern              | Implementation                                                    |
| -------------------- | ----------------------------------------------------------------- |
| Responsive           | Tailwind `xs/sm/md/lg/xl/2xl` + CSS `clamp()` fluid typography   |
| PWA                  | Service worker + manifest.json + offline.html                     |
| SEO                  | react-helmet-async per page + JSON-LD structured data + sitemap.xml |
| Auth                 | JWT (7d) in localStorage, authMiddleware + isAdmin on backend     |
| State                | React Context (Auth, Cart, Data) — no Redux                      |
| Logo                 | Dynamic from DB → Navbar/Footer/Favicon/Loader + localStorage cache |
| Loading              | SkeletonCard pulse animation while DataContext fetches            |
| Variants             | Product → Variant[] (RAM/Storage/Color/Price/Stock) with cascading select |
| WhatsApp             | wa.me deep links with pre-formatted order messages                |
| Image upload         | Multer → server/uploads/ (local) or Cloudinary (cloud)           |
| Code splitting       | React.lazy() for all pages except Index (eager)                  |
| Styling              | Tailwind + shadcn/ui primitives + glass-morphism custom utilities |
