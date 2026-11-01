# Vincent & Vintage — Software Architecture Blueprint & Master Technical Specification

> **Brand**: Vincent & Vintage (*Feel The Style • Premium Quality || Comfort || Classy*)  
> **Platform**: Fully Dynamic, Headless Modular Menswear E-Commerce Web Application  
> **Architecture Principle**: **Zero Hardcoding • 100% Modular CMS • Blank-Slate Ready**  
> **Cost Objective**: **$0.00 / month (100% Free Cloud Tier)** while sustaining viral ad traffic spikes without cold starts, database limits, or data loss.

---

## 1. System Architecture & Component Diagram

The platform employs a **decoupled, serverless edge architecture** where all structural visual elements (Categories, Hero Carousel Slides, Bento Lookbook Blocks, Split Category Showcases, and Product SKUs) are completely modular data records stored in **Neon Serverless PostgreSQL** and configurable in real-time via the **Admin Control Panel**.

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Responsive Web)"]
        UI_Desktop["Desktop Storefront\n(Matte White, 3-Column Header, Floating Cart)"]
        UI_Mobile["Mobile Storefront\n(Sticky Header, Bottom Nav, Touch Drawer)"]
        UI_Admin["Admin Modular Control Panel\n(Categories, Banners, Bento, Showcases, SKUs, Orders)"]
    end

    subgraph Edge ["Global Edge & Compute Layer (Vercel Free Tier)"]
        CDN["Global Edge CDN & Route Cache\n(~20ms Edge Response in BD)"]
        NextServer["Next.js 15 App Router Serverless Functions\n(Node.js / Edge Runtime)"]
        APIRoutes["Serverless REST API Engine\n(/api/categories, /api/banners, /api/products, /api/orders)"]
    end

    subgraph Data ["Cloud Database & Storage (Free Tier)"]
        NeonDB[("Neon Serverless PostgreSQL\n(Singapore aws-ap-southeast-1, PgBouncer Pooler)")]
        MediaCDN["High-Res Media CDN\n(Cloudinary / Cloudflare R2 / Unsplash)"]
        ClientPDF["Client-Side jsPDF Engine\n(Instant Local PDF Invoicing)"]
    end

    subgraph Operations ["Bangladeshi Courier & Payment Workflows"]
        COD["Cash on Delivery (COD) Engine"]
        bKash["bKash / Nagad Manual TrxID Matching"]
        Courier["Steadfast / Pathao Courier API Ready"]
    end

    UI_Desktop --> CDN
    UI_Mobile --> CDN
    UI_Admin --> CDN
    CDN --> NextServer
    NextServer --> APIRoutes
    APIRoutes -->|WebSocket / HTTP Pool| NeonDB
    APIRoutes --> MediaCDN
    APIRoutes --> COD
    APIRoutes --> bKash
    UI_Admin --> ClientPDF
```

---

## 2. Zero-Hardcoding Modular Architecture

In early prototypes, categories (such as *Old Money Shirts, Remi Cotton Shirts, Knitted Polos, Gurkha Trousers, Panjabis, Drop Shoulder Tees, Accessories*) were hardcoded into UI loops. 

In this production architecture, **every structural element is completely decoupled, blank-slate capable, and dynamically rendered**:

```mermaid
flowchart LR
    subgraph AdminControl ["Admin Control Panel (/admin)"]
        C1["Add / Delete Categories"]
        C2["Add / Delete Hero Slides"]
        C3["Add / Delete Layout Blocks\n(Bento Hero, Bento Small, Split Showcase)"]
        C4["Publish Product SKUs\n(Dynamic Category Dropdown)"]
    end

    subgraph NeonDB ["Neon PostgreSQL Database"]
        T1[("categories")]
        T2[("hero_slides")]
        T3[("promo_blocks")]
        T4[("products")]
    end

    subgraph Storefront ["Live Storefront (/)"]
        S1["Desktop & Mobile Navbar\n(Dynamic Category Links)"]
        S2["Hero Carousel\n(Dynamic Slides or Fallback Brand Banner)"]
        S3["Browse Categories Grid\n(Rendered if categories > 0)"]
        S4["Asymmetric Bento Lookbook\n(bento_large + bento_small)"]
        S5["Split Category Showcases\n(split_showcase with dynamic 3-product grid)"]
        S6["Catalog Tabs & Filters\n(Dynamic Category Pills)"]
    end

    C1 -->|POST/DELETE| T1
    C2 -->|POST/DELETE| T2
    C3 -->|POST/DELETE| T3
    C4 -->|POST/DELETE| T4

    T1 --> S1
    T1 --> S3
    T1 --> S6
    T2 --> S2
    T3 --> S4
    T3 --> S5
    T4 --> S4
    T4 --> S5
    T4 --> S6
```

### 2.1. Blank-Slate Resilience (Zero-State Handling)
If the database is initialized with zero rows or if an admin clears all data:
* **Navbar**: Renders the clean Vincent & Vintage logo, search bar, and "ALL COLLECTION" without broken links.
* **Hero Section**: Gracefully displays a centered luxury Matte White brand banner with the trimmed Vincent & Vintage emblem, brand slogan (*"Feel The Style • Premium Quality || Comfort || Classy"*), and direct navigation buttons.
* **Categories Grid**: Hides cleanly until categories are published.
* **Promo Bento & Split Showcases**: Render only when promotional records exist.
* **Catalog**: Displays a clean, elegant empty state (*"No garments available yet. Visit Admin to add your apparel collections."*) with a direct link to the Admin Control Panel.

---

## 3. Database Schema & Data Models

Managed on **Neon Serverless PostgreSQL** in Singapore (`aws-ap-southeast-1`):

```mermaid
erDiagram
    CATEGORIES ||--o{ PRODUCTS : "categorizes (ON DELETE SET NULL)"
    CATEGORIES ||--o{ PROMO_BLOCKS : "linked category"
    PRODUCTS ||--o{ ORDER_ITEMS : "purchased in"
    ORDERS ||--|{ ORDER_ITEMS : "contains"

    CATEGORIES {
        int id PK
        string name "Display Name (e.g. Cuban Linen Shirts)"
        string slug UK "URL identifier (e.g. cuban-linen-shirts)"
        string card_image "3:2 Aspect Card Thumbnail URL"
        string banner_image "Optional Wide Banner URL"
        int sort_order "Ascending display priority"
    }

    HERO_SLIDES {
        int id PK
        string title "Main Headline (e.g. OLD MONEY HERITAGE)"
        string subtitle "Brand Subtitle"
        string badge "Promo Badge (e.g. NEW SEASON 2026)"
        string cta_text "Button Label (e.g. EXPLORE COLLECTION)"
        string link_url "Target URL or Anchor"
        string image_url "1920x800 Wide Hero Graphic"
        int sort_order "Slide Sequence"
        timestamp created_at
    }

    PROMO_BLOCKS {
        int id PK
        string block_type "bento_large | bento_small | split_showcase"
        string title "Promo Title"
        string subtitle "Tagline / Description"
        string badge "Badge Text (e.g. ITALIAN SARTORIAL CUT)"
        string image_url "Promotional Banner URL"
        string category_slug "Filtered Category Slug"
        int sort_order "Display Priority"
        timestamp created_at
    }

    PRODUCTS {
        int id PK
        string name "Garment Name"
        string slug UK "Product Slug"
        string sku UK "Unique Stock Keeping Unit (e.g. VV-101)"
        string category_slug FK "References categories(slug)"
        numeric regular_price "Original Price (BDT)"
        numeric sale_price "Discounted Price (BDT)"
        text description "Detailed Fabric & Tailoring Notes"
        string fabric "Fabric Specification (GSM, Weave)"
        string primary_image "Main Product Thumbnail"
        string hover_image "Angle Swap Image on Mouseover"
        jsonb gallery "Array of additional images"
        jsonb sizes "Array of size objects with individual stock"
        jsonb colors "Color variations array"
        numeric rating "Customer rating (e.g. 4.9)"
        int reviews_count "Total verified reviews"
        boolean is_best_seller "Featured in Best Sellers"
        boolean is_new_arrival "Featured in New Arrivals"
        boolean is_todays_deal "Flash deal indicator"
        timestamp created_at
    }

    ORDERS {
        int id PK
        string order_number UK "Formatted ID (e.g. VV-2026-1001)"
        string customer_name "Customer Full Name"
        string customer_phone "Phone Number (Primary ID)"
        string customer_email "Optional Email"
        text shipping_address "Detailed Delivery Address"
        string delivery_zone "Inside Dhaka | Outside Dhaka"
        numeric delivery_charge "60.00 BDT or 120.00 BDT"
        numeric subtotal "Sum of line items"
        numeric discount "Voucher / Campaign Discount"
        numeric total_amount "Subtotal + Delivery - Discount"
        string payment_method "Cash on Delivery | bKash | Nagad"
        string payment_number "Sender bKash/Nagad Number"
        string transaction_id "TrxID for manual reconciliation"
        string status "pending | confirmed | shipped | delivered | cancelled"
        jsonb items "Frozen snapshot of purchased items & sizes"
        text notes "Customer delivery instructions"
        timestamp created_at
    }
```

---

## 4. Admin Modular Control Panel Specification

The Admin Control Panel (`/admin`) provides full self-service content and inventory management without touching code:

| Control Tab | Capabilities & Actions | Database Operations |
| :--- | :--- | :--- |
| **1. Manage Orders** | • View all customer orders with phone, delivery zone, and line items.<br>• Filter/update status: `Pending` &rarr; `Confirmed` &rarr; `Shipped` &rarr; `Delivered` &rarr; `Cancelled`.<br>• Generate and download professional branded **PDF Invoices** with a single click. | `SELECT` / `PATCH` on `orders` table. |
| **2. Product Inventory** | • View active SKUs with primary image, fabric, price, badges, and stock breakdown per size (`M`, `L`, `XL`, `XXL`).<br>• Instant SKU deletion. | `SELECT` / `DELETE` on `products` table. |
| **3. New Apparel SKU** | • Form to publish new clothing SKU with Name, SKU code, Category (dropdown dynamically populated from active categories), Regular Price, Sale Price, Fabric, Primary Image URL, Hover Image URL, and Description.<br>• Toggles for `Best Seller` and `New Arrival`. | `INSERT` into `products` table. |
| **4. Categories** | • Add new category: Name, Card Image (3:2), Banner Image, Sort Order.<br>• Slug is automatically generated from name.<br>• Delete category: Cascades `ON DELETE SET NULL` on products to prevent data loss. | `INSERT` / `DELETE` on `categories` table. |
| **5. Hero Slider** | • Add full-width hero slides: Title, Subtitle, Badge, CTA Button Text, CTA Link URL, Image URL (1920x800), and Sort Order.<br>• Delete slide.<br>• Real-time image preview before publishing. | `INSERT` / `DELETE` on `hero_slides` table. |
| **6. Promo Layout Blocks** | • Add promotional layout blocks with Block Type selection:<br>&nbsp;&nbsp;1. `bento_large`: 8-column main Lookbook card.<br>&nbsp;&nbsp;2. `bento_small`: 4-column right-stacked cards.<br>&nbsp;&nbsp;3. `split_showcase`: Alternating split-banner category showcase.<br>• Select linked category from dynamic dropdown.<br>• Delete promo block. | `INSERT` / `DELETE` on `promo_blocks` table. |

---

## 5. Design System: Matte White Luxury Aesthetic

Reverse-engineered from the highest-converting patterns of `manfarebd.com` and enhanced for Vincent & Vintage:

* **Canvas Surface**: `#FAF9F6` (Alabaster Matte Off-White — zero glare, soft luxury tone).
* **Card Panels**: `#FFFFFF` (Pure Matte White) framed by ultra-subtle border `#EAE7E1`.
* **Section Backings**: `#F4F3EF` (Muted Warm Alabaster for alternating split showcases).
* **Primary Typography**: `#18191B` (Deep Matte Charcoal — high legibility, softer than harsh `#000000`).
* **Secondary Text**: `#5A5D66` (Refined Slate Graphite for fabric descriptions and subheadings).
* **Accent Bronze**: `#A8825B` & `#B89579` (Manfare Signature Bronze for CTAs, active indicators, and badges).
* **Deep Espresso**: `#46351F` & `#211E1C` (For top announcement bar, dark buttons, and sticky cart header).
* **Accent Amber**: `#F9AF5E` (For price text and floating cart highlights).

### Typography & Logo Enhancement
* **Headings**: `Oswald` / `Bebas Neue` (Crisp uppercase, wide tracking `0.035em`).
* **Body**: `Plus Jakarta Sans` with OpenType font smoothing (`-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility`).
* **Logo**: The Vincent & Vintage emblem is edge-trimmed with `sharp` from 833×833 to 636×368, eliminating top whitespace and displayed at an enlarged `h-20 xl:h-24` scale with unconstrained sharpness.

---

## 6. Anticipated Technical Problems & Engineered Solutions

| Anticipated Risk | Impact on Business | Technical & Architectural Solution |
| :--- | :--- | :--- |
| **1. Viral Ad Traffic Spikes (Meta Ads)** | Free containers crash or hit memory limits; customers see 504 errors. | **Next.js 15 Route Optimization + Edge CDN**: Homepage data is cached at the edge. Database queries run over serverless WebSockets with connection pooling (PgBouncer) supporting up to 10,000 pooled connections. |
| **2. Ephemeral Storage Data Loss** | Product images vanish on container restart. | **Decoupled CDN Image Architecture**: Images are referenced via external CDN URLs (Cloudinary, Cloudflare R2, Unsplash, or public folder). Zero file uploads are written to ephemeral server disks. |
| **3. Orphaned Category References** | Deleting a category breaks products referencing its slug. | **PostgreSQL Foreign Key with `ON DELETE SET NULL`**: If an admin deletes a category, products remain safely intact in the database with `category_slug = NULL` and appear under "All Collection" rather than throwing database constraint errors. |
| **4. Overselling during Flash Sales** | Simultaneous checkouts order the last size `L`. | **Atomic Size Stock Decrement**: Order creation executes an atomic transaction in PostgreSQL that updates the `sizes` JSONB array stock in real time. |
| **5. Fake / Troll COD Orders (RTO Risk)** | Loss of ৳120 courier delivery fee on rejected parcels. | **Two-Tier Order Validation**: Orders enter as `pending`. Admin reviews phone number and address in `/admin` before confirming. Supports integration with Greenweb / MIM SMS OTP for phone verification. |
| **6. Broken Image Links from Admin** | Admin enters an invalid URL resulting in empty cards. | **Image Error Fallbacks**: `ProductCard` and hero banners implement native `onError` handlers that fall back to clean brand placeholders if an external URL fails to load. |

---

## 7. Courier Logistics & Delivery Integration Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Storefront as Next.js Storefront
    participant DB as Neon PostgreSQL
    actor Admin as Store Owner / Manager
    participant Courier as Steadfast / Pathao API

    Customer->>Storefront: Enters Name, Mobile & Address (COD Selected)
    Storefront->>DB: Saves order as "pending" & decrements size stock
    Storefront-->>Customer: Shows confirmation screen & downloads instant PDF invoice
    Admin->>Storefront: Reviews order in /admin portal
    Admin->>Customer: Calls customer to confirm size and delivery zone
    Admin->>Courier: Creates parcel entry with Cash Collection value (৳ Total)
    Admin->>Storefront: Updates order status to "Confirmed" &rarr; "Shipped"
    Courier->>Customer: Delivers parcel and collects cash
    Courier->>Admin: Settles collected cash into Admin bank / bKash account
    Admin->>Storefront: Updates order status to "Delivered"
```

---

## 8. 100% Free Cloud Deployment ($0/month) Guide

### Step 1: Push Repository to GitHub
```powershell
Set-Location D:\vincent2\vincent-and-vintage
git init
git add .
git commit -m "feat: Vincent & Vintage modular headless release"
git branch -M main
git remote add origin https://github.com/<your-username>/vincent-and-vintage.git
git push -u origin main
```

### Step 2: Deploy to Vercel (Hobby Free Tier)
1. Navigate to [https://vercel.com](https://vercel.com) and log in.
2. Select **"Import Git Repository"** &rarr; `vincent-and-vintage`.
3. Under **Environment Variables**, add:
   * `DATABASE_URL`: `postgresql://neondb_owner:npg_VxZlL5sgNkr9@ep-silent-haze-b33tmzc2-pooler.c-4.ap-southeast-1.aws.neon.tech/vincent_vintage?channel_binding=require&sslmode=require`
   * `CLOUDINARY_CLOUD_NAME`: `xqnmbmbd`
   * `CLOUDINARY_API_KEY`: `813265698343359`
   * `CLOUDINARY_API_SECRET`: `ieZkVDaezgYIAuSMMuTIeN9XVTE`
   * `CLOUDINARY_URL`: `cloudinary://813265698343359:ieZkVDaezgYIAuSMMuTIeN9XVTE@xqnmbmbd`
4. Click **Deploy**. Vercel automatically compiles the Next.js App Router and provisions edge CDN caching worldwide.

### Step 3: Connect Custom Domain (Free SSL)
* Go to **Project Settings &rarr; Domains** in Vercel.
* Add your custom domain (e.g., `vincentandvintage.com` or `vincentandvintage.com.bd`).
* Add the 2 DNS records (A Record: `76.76.21.21`, CNAME: `cname.vercel-dns.com`) at your domain registrar. Vercel automatically generates and renews Let's Encrypt SSL certificates for free.

---

## 9. Codebase File Inventory

* [`src/lib/db.js`](file:///D:/vincent2/vincent-and-vintage/src/lib/db.js): Serverless PostgreSQL query engine with CRUD functions for categories, hero slides, promo blocks, products, and orders.
* [`src/app/api/categories/route.js`](file:///D:/vincent2/vincent-and-vintage/src/app/api/categories/route.js): REST API (`GET`, `POST`, `DELETE`) for dynamic categories.
* [`src/app/api/banners/route.js`](file:///D:/vincent2/vincent-and-vintage/src/app/api/banners/route.js): REST API (`GET`, `POST`, `DELETE`) for hero slides and layout promo blocks.
* [`src/app/api/products/route.js`](file:///D:/vincent2/vincent-and-vintage/src/app/api/products/route.js): Aggregated storefront data endpoint & product SKU management.
* [`src/app/api/orders/route.js`](file:///D:/vincent2/vincent-and-vintage/src/app/api/orders/route.js): Guest 1-step checkout, atomic inventory decrement, and status updates.
* [`src/app/api/upload/route.js`](file:///D:/vincent2/vincent-and-vintage/src/app/api/upload/route.js): Automated media upload stream to Cloudinary with on-the-fly WebP compression.
* [`src/components/ImageUploadDropzone.jsx`](file:///D:/vincent2/vincent-and-vintage/src/components/ImageUploadDropzone.jsx): Drag-and-drop file uploader with live thumbnail preview and progress spinner.
* [`src/app/page.jsx`](file:///D:/vincent2/vincent-and-vintage/src/app/page.jsx): 100% modular storefront homepage with dynamic hero slider, categories, bento lookbook, split showcases, and catalog filters.
* [`src/app/admin/page.jsx`](file:///D:/vincent2/vincent-and-vintage/src/app/admin/page.jsx): Admin Control Center featuring 6 dedicated control tabs with instant database persistence.
* [`src/components/Navbar.jsx`](file:///D:/vincent2/vincent-and-vintage/src/components/Navbar.jsx): 3-column Matte White desktop header, razor-sharp logo, sticky right cart, and dynamic category navigation.
* [`src/components/ProductCard.jsx`](file:///D:/vincent2/vincent-and-vintage/src/components/ProductCard.jsx): Dual-image hover swap card with size pills, quick view, and direct checkout.
* [`src/components/Modals.jsx`](file:///D:/vincent2/vincent-and-vintage/src/components/Modals.jsx): Quick view modal, slide-out cart drawer, and 1-page guest phone checkout.
* [`src/utils/invoiceGenerator.js`](file:///D:/vincent2/vincent-and-vintage/src/utils/invoiceGenerator.js): Instant client-side PDF invoice generator with Vincent & Vintage branding.
