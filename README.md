# DineDesk – Restaurant Ordering Platform
> *Digital ordering, reservations and kitchen management made simple.*

![DineDesk Platform](https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80)

---

## 🍽️ Project Overview

**DineDesk** is a modern, production-grade full-stack restaurant management, online ordering, and table reservation platform. Built to streamline operations across the entire dining lifecycle, DineDesk connects:
1. **Customers**: Browsing digital menus, adding items to cart, customized dining preferences (dine-in table delivery or takeaway), simulated multi-method payments (Card, UPI, Cash), real-time visual 5-step order timeline tracking, and table reservations with conflict detection.
2. **Kitchen & Restaurant Staff**: Dedicated live Kitchen Display System (KDS) with 5-second polling, incoming ticket feeds, chef notes, dish breakdown, and real-time status progression (`PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `COMPLETED`).
3. **Administrators**: Comprehensive back-office command center for food menu CRUD, category management, table layouts, reservation oversight, customer directory, payment auditing, and executive analytics reports with instant CSV export.

---

## 🌟 Key Features

### 1. Customer Experience
- **Interactive Digital Menu**: Filter dishes across courses (*Starters*, *Main Course*, *Desserts*, *Beverages*) with live search, chef's specials, dietary badges, and real-time stock indicators.
- **Detailed Recipe Pages**: High-resolution imagery, culinary descriptions, preparation estimates, and quantity selectors.
- **Shopping Cart & Checkout**: Persistent cart synced with `localStorage`, automatic 8% tax calculation, dining preference selection (dine-in table delivery vs. takeaway), and kitchen notes.
- **Simulated Multi-Method Payments**:
  - 💳 **Credit / Debit Cards**: Instant simulation with transaction references.
  - 📱 **UPI**: Instant QR / VPA sandbox simulation.
  - 💵 **Cash on Counter**: Instant order dispatch with `PENDING` payment status settled upon dining completion.
- **Real-Time Visual Order Tracking**: Live 5-step animated timeline showing:
  `Order Placed` ➔ `Confirmed` ➔ `Preparing` ➔ `Ready` ➔ `Completed`.
- **Conflict-Free Table Reservations**: Date, time slot, and guest party picker with interactive visual table layout. Prevents overlapping double-bookings on identical tables and times.
- **Self-Service Order & Booking History**: Customers can view past tickets, check status, and cancel pending orders/reservations.

### 2. Kitchen Display System (KDS)
- **Live Ticket Queue**: Real-time auto-refreshing interface optimized for kitchen tablets and touchscreens.
- **One-Click Fulfillment Pipeline**:
  - `PENDING` ➔ `CONFIRMED`
  - `CONFIRMED` ➔ `PREPARING`
  - `PREPARING` ➔ `READY`
  - `READY` ➔ `COMPLETED`
- **Elapsed Time Tracking**: Color-coded urgency alerts for orders waiting or actively on stoves.
- **Integrated Reservations Board**: View today's incoming table reservations and party sizes.

### 3. Administrator Control Center
- **Executive Operations Dashboard**: High-level metrics for revenue, order volume, pending tickets, active covers, and popular dish rankings.
- **Digital Menu Management**: Add, edit, delete dishes, toggle availability (sold out / in stock), set pricing, upload image URLs, and mark chef signatures.
- **Course & Category Management**: Dynamic courses, display orders, and cover photography.
- **Table Layout Control**: Configure indoor dining, window-side booths, VIP salons, and patio sections with seating capacities and maintenance flags.
- **Order & Ticket Oversight**: Filter by any status, search by customer, view itemized tickets, and override statuses.
- **Customer Directory**: Track registered diners, total lifetime spend, order frequency, and full order receipts.
- **Payment Ledger**: Audit transactions across Cash, Card, and UPI methods.
- **Executive Analytics & CSV Export**: Date-range filtered revenue analytics with one-click `.csv` download.

---

## 🔐 Authentication & User Roles

Authentication is secured using **HTTP-Only Cookies**, **JWT Tokens**, and **bcrypt password hashing**. Upon login, users are automatically routed to their role-specific experience:

| Role | Access Permissions | Landing Destination |
| :--- | :--- | :--- |
| **`ADMIN`** | Complete system access (Menu, Categories, Orders, Tables, Customers, Reports, Settings) | `/admin/dashboard` |
| **`KITCHEN`** | Live Kitchen Display System (KDS), order status updates, table reservations list | `/kitchen/dashboard` |
| **`CUSTOMER`** | Digital menu, cart, checkout, tracking, table booking, profile | `/menu` or `/` |

### 🔑 Demo Accounts

The database comes pre-seeded with realistic demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@dinedesk.com` | `Admin@123` |
| **Kitchen Staff** | `kitchen@dinedesk.com` | `Kitchen@123` |
| **Customer** | `customer@dinedesk.com` | `Customer@123` |

*(Quick 1-click auto-fill buttons are also embedded directly on the `/login` page for convenience).*

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React Server Components & Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type checking)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Warm artisanal culinary theme)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Production schema with Prisma ORM)
- **Embedded Engine**: Native PostgreSQL 18 engine for zero-dependency local dev
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Security**: `bcryptjs` (Password hashing) & `jsonwebtoken` (JWT tokens)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```
restaurent management/
├── app/
│   ├── (customer pages)
│   │   ├── page.tsx                    # Landing Page
│   │   ├── menu/                       # Digital Menu (/menu & /menu/[id])
│   │   ├── cart/                       # Shopping Cart
│   │   ├── checkout/                   # Checkout & Simulated Payment
│   │   ├── orders/                     # My Orders & Live Tracking (/orders/[id])
│   │   ├── reservations/               # Table Reservation & My Bookings
│   │   ├── profile/                    # Customer Profile
│   │   ├── login/                      # Login with quick-fill demo buttons
│   │   └── register/                   # Customer Registration
│   ├── kitchen/
│   │   └── dashboard/                  # Kitchen Display System (KDS)
│   ├── admin/
│   │   ├── layout.tsx                  # Admin sidebar layout & RBAC guard
│   │   ├── dashboard/                  # Operations Overview
│   │   ├── menu/                       # Menu CRUD & availability toggles
│   │   ├── categories/                 # Category management
│   │   ├── orders/                     # Order fulfillment & detail modals
│   │   ├── reservations/               # Reservation confirmations & cancellations
│   │   ├── tables/                     # Floor layout & capacity management
│   │   ├── customers/                  # Customer directory & order history
│   │   ├── payments/                   # Payment monitoring
│   │   ├── reports/                    # Analytics & CSV export
│   │   └── settings/                   # Restaurant settings
│   ├── api/                            # REST API Endpoints
│   │   ├── auth/                       # Login, Register, Logout, Me
│   │   ├── menu/                       # Menu items CRUD
│   │   ├── categories/                 # Category CRUD
│   │   ├── orders/                     # Order placement & status updates
│   │   ├── reservations/               # Booking & conflict detection
│   │   ├── tables/                     # Table floor management
│   │   ├── payments/                   # Payment auditing
│   │   ├── customers/                  # Customer directories
│   │   └── reports/                    # Aggregate reports & analytics
│   ├── layout.tsx                      # Root layout with providers
│   └── globals.css                     # Global styles
├── components/
│   ├── AuthProvider.tsx                # Client authentication session context
│   ├── CartProvider.tsx                # Shopping cart context with localStorage
│   ├── Navbar.tsx                      # Responsive top navigation with cart count
│   ├── Footer.tsx                      # Restaurant footer
│   └── StatusBadge.tsx                 # Status & payment method badges
├── lib/
│   ├── auth.ts                         # JWT, bcrypt, and RBAC utilities
│   ├── prisma.ts                       # Prisma Client singleton
│   └── utils.ts                        # Currency, date/time formatters
├── prisma/
│   ├── schema.prisma                   # PostgreSQL relational models & enums
│   └── seed.ts                         # Realistic restaurant demo data seed
├── scripts/
│   ├── start-dev.ts                    # Zero-config runner (Postgres + Next.js)
│   ├── pg-service.ts                   # Embedded PostgreSQL service daemon
│   ├── setup-db.ts                     # Database push and seed script
│   └── test-suite.ts                   # 34-step automated verification suite
├── types/
│   └── index.ts                        # Shared TypeScript interfaces
├── .env.example                        # Template environment variables
├── package.json                        # Scripts & dependencies
└── tsconfig.json                       # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 1. Installation
Clone the repository and install all dependencies:
```bash
npm install
```

### 2. Environment Configuration
The project is configured out-of-the-box. Ensure your `.env` file exists:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dinedesk?schema=public"
JWT_SECRET="dinedesk-super-secure-jwt-secret-key-change-in-production-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PG_PORT="5432"
```

### 3. Database Setup
Run the automated database setup and seed command:
```bash
# Push schema and seed demo records into PostgreSQL
npm run db:push
npm run db:seed
```

### 4. Run Development Server
Start the full stack with a single command:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📡 REST API Reference

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates user and issues HTTP-only session |
| `/api/auth/register` | `POST` | Public | Registers a new customer account |
| `/api/auth/logout` | `POST` | Public | Clears session cookie |
| `/api/auth/me` | `GET` | Authenticated | Fetches current user session profile |
| `/api/menu` | `GET` | Public | Returns menu items with category & search filters |
| `/api/menu` | `POST` | `ADMIN` | Adds a new menu item |
| `/api/menu/:id` | `GET` | Public | Returns details of a specific dish |
| `/api/menu/:id` | `PUT` | `ADMIN` | Updates dish details or toggles availability |
| `/api/menu/:id` | `DELETE` | `ADMIN` | Deletes a menu item |
| `/api/categories` | `GET` | Public | Returns categories and dish counts |
| `/api/categories` | `POST` | `ADMIN` | Creates a new category |
| `/api/categories/:id` | `PUT` | `ADMIN` | Updates an existing category |
| `/api/categories/:id` | `DELETE` | `ADMIN` | Deletes a category |
| `/api/tables` | `GET` | Public | Returns tables and seating capacities |
| `/api/tables` | `POST` | `ADMIN` | Creates a dining table |
| `/api/tables/:id` | `PUT` | `ADMIN` | Updates table capacity, zone, or status |
| `/api/tables/:id` | `DELETE` | `ADMIN` | Deletes a table |
| `/api/reservations` | `GET` | Auth / Admin | Lists customer or restaurant table bookings |
| `/api/reservations` | `POST` | Public | Books table with overlap collision check |
| `/api/reservations/:id` | `PUT` | Auth / Admin | Updates status (`CONFIRMED`, `COMPLETED`, `CANCELLED`) |
| `/api/orders` | `GET` | Auth / Staff | Lists customer orders or kitchen order queue |
| `/api/orders` | `POST` | Public | Places an online order with verified server pricing |
| `/api/orders/:id` | `GET` | Public | Returns full order ticket and tracking step |
| `/api/orders/:id` | `PUT` | Staff / Admin | Updates fulfillment status or payment state |
| `/api/payments` | `GET` | `ADMIN` | Returns transaction audit log |
| `/api/customers` | `GET` | `ADMIN` | Lists customer directory and lifetime metrics |
| `/api/reports` | `GET` | `ADMIN` | Aggregates revenue, popularity, and stats |

---

## 🧪 Verification & Automated Testing

DineDesk includes a comprehensive 34-step automated verification suite covering database connectivity, password hashing, JWT signing, CRUD operations, double-booking prevention, math validation, and status transitions:

```bash
# Run the test suite
npx tsx scripts/test-suite.ts
```

All 34 tests pass with 100% success rate:
- ✅ PostgreSQL database connectivity and relational integrity
- ✅ Demo account credentials & bcrypt validation
- ✅ Customer registration flow
- ✅ Menu and Category CRUD
- ✅ Table layout management & occupancy flags
- ✅ Table reservation booking & conflict collision prevention
- ✅ Online order item verification, tax calculation & payment linking
- ✅ 5-step Kitchen status pipeline (`PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`)
- ✅ Multi-method payment simulations (Cash, Card, UPI)
- ✅ Customer order history aggregation
- ✅ Popular recipe analytics ranking

```bash
# Verify TypeScript types
npx tsc --noEmit

# Run production build
npm run build
```

---

## 📸 Screenshots

| Customer Landing Page | Digital Restaurant Menu |
| :---: | :---: |
| *Modern hero, chef signatures & dining intro* | *Categorized grid with live stock toggles* |

| Live Kitchen Display System (KDS) | Executive Admin Control Center |
| :---: | :---: |
| *Real-time queue with 1-click status transitions* | *Revenue metrics, table layouts & CSV export* |

---

## 📦 Pushing to GitHub

To push this codebase to your GitHub repository:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add files
git add .

# 3. Create initial commit
git commit -m "Initial commit: DineDesk Restaurant Ordering Platform"

# 4. Set main branch
git branch -M main

# 5. Link remote repository (replace with your repo URL)
git remote add origin https://github.com/your-username/dinedesk-restaurant-platform.git

# 6. Push to GitHub
git push -u origin main
```

---

## 💡 Future Enhancements
- Real-time WebSockets / SSE for instant zero-latency kitchen bell alerts
- Dine-in QR code table scanning with instant table auto-assignment
- Kitchen printer integration via ESC/POS protocol
- Integration with external production payment gateways (Stripe, Razorpay)
