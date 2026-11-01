# Vincent & Vintage — E-Commerce Web Application

Modern menswear e-commerce platform built for **Vincent & Vintage** (*Feel The Style • Premium Quality || Comfort || Classy*).
Inspired by the design architecture of **Manfare BD** and optimized for **$0/month free cloud hosting** capable of handling moderate concurrent traffic.

---

## 🚀 Tech Stack & Free Cloud Architecture

- **Frontend & Serverless API**: Next.js 15 (App Router) + Tailwind CSS + Lucide Icons
- **Database (Online)**: **Neon Serverless PostgreSQL** (Connected directly via `@neondatabase/serverless` connection pooler)
- **Invoice Engine**: Client-side jsPDF + autoTable invoice generator (BD Cash on Delivery ready)
- **Deployment**: Vercel (1-Click Free Tier deployment with ISR edge caching)

---

## 🎨 Design Features (Faithful to Manfare BD UX)

1. **Brand Identity**:
   - Integrated official **Vincent & Vintage** deer antler logo & cover banner.
   - Color palette: Warm Bronze (`#B89579` / `#A98153`), Deep Espresso (`#46351F`), Charcoal (`#212121`), Accent Amber (`#F9AF5E`).
   - Fonts: Bahnschrift / Oswald (Headings & UI), Bebas Neue (Category hover pills), Montserrat (Body text).
2. **Global Navigation**:
   - Desktop 3-column header (Search bar, Centered logo, Quick action cluster with Wishlist badge and hotline).
   - Horizontal uppercase category navigation bar with indicator underline.
   - Mobile sticky header + bottom tab bar (*Home, Category, Search, Cart, Wishlist*).
   - Floating right-edge sticky cart pill showing live bag count and total BDT.
3. **Homepage Sections**:
   - Hero Slider with autoplay and navigation controls.
   - 4-Column Trust Strip (*Fastest Shipping, Easy Return Policy, Premium Quality, 24/7 Support*).
   - "Browse Our Categories" with Bebas Neue floating pill labels that transition to bronze gradient on hover.
   - Best Selling & New Arrival 4-column product showcases.
   - 3-Column Asymmetric Bento Lookbook grid (`col-span-8` + `col-span-4`).
   - Alternating Split-Banner + Category Carousel blocks in `#F3F3F3`.
   - Complete interactive catalog with real-time category filtering and live search.
4. **Product Card & Quick View Modal**:
   - Dual-thumbnail image hover swap.
   - Discount tag (`-25% OFF`) and SKU badge.
   - Quick View Modal with thumbnail gallery, size pills, color swatches, stock counter, and quantity stepper.
5. **Bangladeshi Checkout**:
   - 1-Step Guest Phone Checkout (No account password required).
   - Automated delivery zone calculation (Inside Dhaka ৳60 / Outside Dhaka ৳120).
   - Cash on Delivery, bKash, and Nagad payment support.
   - Automatic variant stock decrement upon order confirmation.
   - Instant downloadable PDF invoice with order breakdown.
6. **Order Tracking (`/orders`)**:
   - Live tracking by mobile phone number.
   - Status indicators (`pending`, `processing`, `shipped`, `delivered`).
   - Download past invoices anytime.
7. **Admin Inventory Portal (`/admin`)**:
   - Live active revenue counter & order stats.
   - Order management: change courier statuses live in Neon Postgres.
   - Catalog management: add new apparel SKUs with size variants & images directly into Neon.

---

## 📦 Running Locally

```bash
cd D:\vincent2\vincent-and-vintage
npm install
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to review the live store.

