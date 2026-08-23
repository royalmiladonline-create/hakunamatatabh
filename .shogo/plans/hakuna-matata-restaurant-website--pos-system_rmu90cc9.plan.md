---
name: "Hakuna Matata Restaurant Website + POS System"
overview: "Build a full restaurant website with menu display and a Zoho-style POS system with role-based access, table management, payments, inventory, reports, and delivery integration (Talabat + Keeta)."
createdAt: "2026-07-21T09:27:51.783Z"
status: pending
todos:
  - id: create-database-schema
    content: "Create Prisma database schema with all models (User with PIN, MenuCategory, MenuItem, Table, Order, OrderItem, Inventory, Reports)"
    status: pending
  - id: seed-menu-data
    content: "Seed database with menu categories and all 54 items from the attached menu"
    status: pending
  - id: build-public-website
    content: "Build public website pages (Home, Menu, About, Contact) with green/yellow branding"
    status: pending
  - id: implement-pin-auth
    content: "Implement PIN-based authentication system with 3-tier role access (Staff, Staff+, Admin)"
    status: pending
  - id: build-order-screen
    content: "Build POS order screen with cart, menu grid, and order type selection"
    status: pending
  - id: build-table-management
    content: "Build table management with visual floor plan and status indicators"
    status: pending
  - id: implement-payment-processing
    content: "Implement payment processing (Cash, Card, Online) with receipt generation"
    status: pending
  - id: build-inventory-management
    content: "Build inventory management with stock levels and low-stock alerts (Staff+ & Admin)"
    status: pending
  - id: build-reports-dashboard
    content: "Build admin reports dashboard with daily sales, revenue charts, and CSV export"
    status: pending
  - id: build-staff-management
    content: "Build staff management for admin (add/edit users, assign roles)"
    status: pending
  - id: build-menu-management
    content: "Build menu management for admin (add/edit items, update prices)"
    status: pending
  - id: implement-delivery-integration
    content: "Implement delivery integration for Talabat and Keeta"
    status: pending
  - id: verify-build-and-testing
    content: "Final verification: build check, lint check, API endpoint testing"
    status: pending
---

# Hakuna Matata Restaurant Website + POS System

# Hakuna Matata Restaurant — Website + POS System

## Overview
Build a complete restaurant website and point-of-sale system for Hakuna Matata Restaurant W.L.L in Bahrain.

## Restaurant Information
- **Name:** Hakuna Matata Restaurant W.L.L (مطعم هاكونا ماتاتا ذ.م.م)
- **Domain:** www.hakunamatatbh.com
- **Address:** Block 318, Shop 720, Street 1809, Manama 973, Bahrain
- **Phone:** +973 7791 6767
- **Hours:** 8:00 AM - 11:00 PM daily, Fridays 8:00 AM - 12:00 AM

---

## Phase 1: Data Model (Prisma Schema)

### Models to Create:

**User** (existing — extend for roles)
- `id`, `name`, `pin` (4-6 digit PIN), `role` (ADMIN | STAFF_PLUS | STAFF), `isActive`, `createdAt`

**MenuCategory**
- `id`, `name`, `nameAr` (Arabic name), `displayOrder`, `isActive`

**MenuItem**
- `id`, `name`, `price` (Decimal), `currency` (BD/FILLS), `category` (relation), `description`, `isAvailable`, `image`, `createdAt`

**Table**
- `id`, `number`, `capacity`, `status` (AVAILABLE | OCCUPIED | RESERVED), `section` (indoor/outdoor)

**Order**
- `id`, `orderNumber`, `type` (DINE_IN | TAKEAWAY | DELIVERY), `table` (relation), `status` (PENDING | CONFIRMED | PREPARING | READY | SERVED | COMPLETED | CANCELLED), `subtotal`, `tax`, `total`, `paymentMethod` (CASH | CARD | ONLINE), `paymentStatus` (PENDING | PAID | REFUNDED), `staff` (relation), `deliveryPlatform` (TAKEAWAY | TALABAT | KEETA), `createdAt`, `completedAt`

**OrderItem**
- `id`, `order` (relation), `menuItem` (relation), `quantity`, `price`, `notes`

**InventoryItem**
- `id`, `name`, `quantity`, `unit`, `minStock`, `cost`, `supplier`, `lastUpdated`

**InventoryTransaction**
- `id`, `item` (relation), `type` (PURCHASE | USAGE | ADJUSTMENT), `quantity`, `notes`, `createdAt`

**DailyReport**
- `id`, `date`, `totalOrders`, `totalRevenue`, `cashTotal`, `cardTotal`, `onlineTotal`, `deliveryOrders`, `dineInOrders`, `takeawayOrders`, `generatedAt`

---

## Phase 2: Public Website

### Pages:

**1. Home Page**
- Hero section with restaurant name and tagline
- Highlights section (Kenyan cuisine in Bahrain)
- Featured menu items
- Call-to-action for orders/reservations

**2. Menu Page**
- Category tabs (Main Dishes, Breakfast, Extra Sides, Drinks, Sweets)
- Grid/list view of items with prices
- Arabic + English names
- "Order Now" button linking to POS

**3. About Page**
- Restaurant story
- Location map embed
- Opening hours

**4. Contact Page**
- Address, phone, email
- Opening hours
- Social media placeholders
- Contact form (optional)

### Design:
- Green/yellow/red color scheme from menu
- Responsive (mobile-first)
- Arabic + English text support
- Clean, modern UI with shadcn components

---

## Phase 3: POS System

### Authentication & Roles:

**Login System:**
- PIN-based login (4-6 digit PIN per staff member)
- No email/password required
- Quick tap interface for fast checkout

**Role Permissions:**

| Feature | STAFF | STAFF_PLUS | ADMIN |
|---------|-------|------------|-------|
| Take orders | ✅ | ✅ | ✅ |
| Process payments | ❌ | ✅ | ✅ |
| View reports | ❌ | ❌ | ✅ |
| Manage menu | ❌ | ❌ | ✅ |
| Manage tables | ❌ | ✅ | ✅ |
| Manage inventory | ❌ | ✅ | ✅ |
| Manage staff | ❌ | ❌ | ✅ |
| Handle deliveries | ❌ | ✅ | ✅ |

### POS Screens:

**1. Login Screen**
- Large PIN pad (4-6 digits)
- Staff name display after PIN entry
- Quick switch user button

**2. Dashboard (Staff+ & Admin)**
- Today's stats (orders, revenue, active tables)
- Quick actions (New Order, View Reports)
- Recent orders list

**3. Order Screen (All Staff)**
- Order type selector (Dine-in, Takeaway, Delivery)
- Table selector (for dine-in)
- Menu grid with categories
- Cart with quantities, notes, modifiers
- Payment processing (Cash/Card/Online)
- Print receipt option

**4. Table Management (Staff+)**
- Visual floor plan
- Table status indicators (green/red/yellow)
- Assign orders to tables
- Merge/split tables

**5. Kitchen Display (Optional)**
- Order queue with timers
- Status updates (Preparing → Ready)
- Print tickets

**6. Reports (Admin Only)**
- Daily sales summary
- Revenue by category/payment method
- Peak hours chart
- Staff performance
- Export to CSV

**7. Inventory Management (Staff+ & Admin)**
- Stock levels with low-stock alerts
- Usage tracking
- Supplier management
- Purchase orders

**8. Staff Management (Admin Only)**
- Add/edit staff accounts
- Assign roles
- View activity logs

**9. Menu Management (Admin Only)**
- Add/edit/delete menu items
- Update prices
- Toggle availability
- Manage categories

**10. Delivery Integration**
- Talabat order sync
- Keeta order sync
- Delivery status tracking
- Driver assignment

---

## Phase 4: Implementation

### File Structure:

```
src/
├── components/
│   ├── ui/                    # shadcn components
│   ├── website/               # Public website components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── MenuSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ContactSection.tsx
│   │   └── Footer.tsx
│   └── pos/                   # POS system components
│       ├── PinLogin.tsx
│       ├── PinPad.tsx
│       ├── Dashboard.tsx
│       ├── OrderScreen.tsx
│       ├── TableManagement.tsx
│       ├── Reports.tsx
│       ├── Inventory.tsx
│       ├── StaffManagement.tsx
│       ├── MenuManagement.tsx
│       └── DeliveryTracker.tsx
├── lib/
│   ├── auth.ts               # Auth helpers
│   ├── permissions.ts        # Role-based access
│   └── db.ts                 # Database client
├── routes/
│   ├── Website.tsx           # Public website
│   └── POS.tsx               # POS application
└── App.tsx                   # Router setup
```

### API Routes (custom-routes.ts):

- `POST /api/auth/pin-login` — Authenticate with PIN
- `GET /api/auth/me` — Get current user
- `GET /api/menu` — Public menu
- `GET /api/pos/orders` — List orders (auth required)
- `POST /api/pos/orders` — Create order
- `PATCH /api/pos/orders/:id` — Update order status
- `GET /api/pos/tables` — List tables
- `PATCH /api/pos/tables/:id` — Update table status
- `GET /api/pos/reports/daily` — Daily report
- `GET /api/pos/inventory` — Inventory list
- `POST /api/pos/inventory` — Add inventory item
- `GET /api/pos/staff` — Staff list (admin only)
- `POST /api/pos/staff` — Create staff (admin only)

---

## Phase 5: Menu Data

### Categories & Items:

**Main Dishes** (21 items)
- Fish & Ugali — 3.500 BD
- Fish Wet Fry with Ugali — 4.000 BD
- Coconut Cassava with Fish — 3.500 BD
- Coconut Beans & 3 Chapati — 2.500 BD
- Coconut Fish (Kupaka) with Rice — 3.800 BD
- Fish (Full) & Chips — 3.500 BD
- Matumbo (Tripe) with Ugali — 2.800 BD
- Beef Wet Fry with Ugali — 3.500 BD
- Soup with 3 Chapatis — 2.800 BD
- Beef Stew with 3 Chapati — 3.200 BD
- Mukimo with Beef Stew — 4.000 BD
- Beef Matoke — 4.000 BD
- Githeri with Avocado — 2.500 BD
- Chicken (Quarter) & Chips — 2.500 BD
- Chicken Biryani — 1.500 BD
- Meat Pilau — 2.500 BD
- Choma Ugali with Greens — 3.500 BD
- Chicken Tikka Chips — 2.000 BD
- Chicken Tikka Chips Masala — 2.500 BD
- Omena Ugali Greens — 2.500 BD
- Kenyan Pizza with Chips Masala — 3.500 BD

**Breakfast** (17 items)
- Swahili Platter — 3.500 BD
- Mbahazi Mahamri 10pcs — 3.000 BD
- Zege (Fries & Omelette) — 2.000 BD
- Chapati Egg Roll (Rolex) — 1.000 BD
- Smocha (Sausage Chapati) — 1.000 BD
- Spring Rolls 3pcs — 1.000 BD
- Samosa Beef 5pcs — 1.000 BD
- Kebab Swahili 3pcs — 1.000 BD
- Mitai 5pcs — 1.000 BD
- Vitumbua 3pcs — 1.000 BD
- Ngumu 4pcs — 1.000 BD
- Viazi Karai 10pcs — 1.000 BD
- Bajia 8pcs — 1.000 BD
- Zanzibari Nutella 5pcs — 1.000 BD
- Zanzibari Plain 10pcs — 1.000 BD
- Zanzibari Cheese 8pcs — 1.000 BD

**Extra Sides** (7 items)
- White Rice — 0.800 fills
- Ugali — 1.000 BD
- Chapati — 0.200 fills
- Fries — 1.000 BD
- Chips Masala — 1.500 BD
- Kachumbari Salad — 0.800 fills
- Greens — 0.850 fills

**Drinks** (6 items)
- Fresh Juices — 1.500 BD
- Soft Drink — 0.300 fills
- Water — 0.200 fills
- Elkasus Chai — 0.200 fills
- Chai Masala — 0.200 fills
- Black Tea — 0.100 fills

**Sweets** (3 items)
- Achari — 1.500 BD
- Mabuyu — 1.500 BD
- Labania — 0.350 fills

---

## Implementation Order

1. **Database Schema** — Create all models in Prisma
2. **Seed Menu Data** — Populate menu categories and items
3. **Public Website** — Home, Menu, About, Contact pages
4. **POS PIN Login** — PIN-based authentication with role access
5. **Order Screen** — Core POS functionality
6. **Table Management** — Visual table layout
7. **Payment Processing** — Cash/Card/Online payments
8. **Inventory Management** — Stock tracking (Staff+ & Admin)
9. **Reports Dashboard** — Sales analytics for admin
10. **Staff Management** — User administration
11. **Menu Management** — Admin menu editor
12. **Delivery Integration** — Talabat + Keeta webhooks

---

## Verification

After each phase:
- Run `read_lints` to check for TypeScript errors
- Verify build in `.shogo/logs/build.log`
- Test API endpoints with curl
- Verify UI renders correctly

---

## Success Criteria

✅ Public website displays all menu items with correct prices
✅ Staff can log in with PIN and take orders
✅ Staff+ can process payments and manage inventory
✅ Admin has full access to all features
✅ Tables can be managed visually
✅ Reports show accurate daily sales
✅ Inventory tracking works
✅ Delivery orders are tracked
✅ System is responsive on mobile/tablet devices

<!-- :::summary::: -->
# Hakuna Matata Restaurant Website + POS System

## Overview

Build a complete restaurant website and point-of-sale system for Hakuna Matata Restaurant in Manama, Bahrain. The solution includes a public-facing menu website and a full-featured POS system with role-based staff access, table management, payment processing, inventory tracking, and integration with delivery platforms.

## Business Goals

- Enable online menu visibility and ordering capability
- Streamline in-restaurant order taking and payment processing
- Track daily sales, revenue, and staff performance
- Manage table seating and kitchen workflow
- Monitor food inventory and stock levels
- Integrate with Talabat and Keeta delivery platforms

## Scope: Public Website

**Menu Website (www.hakunamatatbh.com)**
- Home page with restaurant highlights and featured items
- Full menu display across 5 categories (Main Dishes, Breakfast, Sides, Drinks, Sweets)
- Bilingual support (English + Arabic)
- About page with location and hours
- Contact page with address, phone, and hours
- Links to POS for taking orders
- Mobile-responsive design

## Scope: POS System

**Staff Access Levels**
- **Staff**: Take orders only
- **Staff Plus**: Take orders, process payments, manage tables, track inventory
- **Admin**: Full system access including reports, menu management, staff administration

**Core Features**
- PIN-based login (no usernames/passwords)
- Order management with status tracking (Pending → Served → Completed)
- Support for dine-in, takeaway, and delivery orders
- Table management with visual floor layout and availability indicators
- Payment processing (cash, card, online)
- Inventory tracking with low-stock alerts
- Daily sales reports (revenue, order count, payment breakdowns)
- Staff performance and activity logs
- Menu item management (add, edit, delete, pricing, availability)
- Delivery order sync and tracking (Talabat + Keeta integration)
- Optional kitchen display screens with order queues

## Menu & Pricing

**21 Main Dishes** (BD 1.50–4.00)
Kenyan cuisine including fish, beef, and chicken dishes with traditional sides like ugali, chapati, and rice.

**17 Breakfast Items** (BD 0.10–3.50)
Including traditional preparations: mahamri, rolex (chapati egg rolls), samosas, spring rolls, and Zanzibari pastries.

**7 Sides** (BD 0.20–1.50)
Rice, ugali, chapati, fries, chips masala, salad, greens.

**6 Drinks** (BD 0.10–1.50)
Fresh juices, soft drinks, water, and teas.

**3 Sweets** (BD 0.35–1.50)

## User-Visible Changes

- **Customers**: Can browse full menu online with prices and descriptions in English and Arabic
- **Staff**: Quick PIN login; streamlined order entry with menu categories and cart; ability to assign orders to tables; payment collection interface
- **Management**: Dashboard showing today's sales, order volume, and revenue; detailed reports by category, payment method, and time; inventory visibility with usage tracking; staff activity logs

## Key Workflows

**Order Taking**
1. Staff selects order type (dine-in/takeaway/delivery)
2. Selects table (if dine-in) or customer details (delivery)
3. Adds items from menu grid, organized by category
4. Enters notes or special requests per item
5. Reviews cart and totals
6. Processes payment (cash/card/online)
7. System prints receipt and/or kitchen ticket

**Daily Operations**
- Morning: Staff logs in with PIN; tables marked as available
- Service: Orders taken and tracked; kitchen sees queue
- Close: Admin reviews daily report (total orders, revenue breakdown, payment methods)
- Inventory: Staff+ updates stock as items are used

**Delivery Orders**
- Orders synced from Talabat/Keeta platforms
- Kitchen notified of incoming delivery orders
- Status updated and pushed back to delivery platform
- Driver assignment and tracking

## Success Criteria

✅ Website displays all menu items with correct prices and bilingual text  
✅ Staff can log in via PIN and create/modify orders  
✅ Staff Plus can process payments and manage inventory  
✅ Admin can view daily sales reports and manage menu/staff  
✅ Tables display available/occupied status and accept order assignment  
✅ Daily reports show accurate totals by payment method and order type  
✅ Inventory usage is tracked and alerts trigger at low stock  
✅ Delivery orders from Talabat and Keeta are received and tracked  
✅ System works on mobile, tablet, and desktop  

## Timeline & Phases

1. Database setup and menu data population
2. Public website launch (home, menu, about, contact)
3. POS PIN login and order entry
4. Table and payment management
5. Inventory and staff features
6. Reports and admin dashboards
7. Delivery platform integration
8. Testing and launch
<!-- :::end-summary::: -->
