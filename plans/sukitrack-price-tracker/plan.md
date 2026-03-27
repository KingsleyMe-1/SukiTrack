# SukiTrack – Price Tracker Application

**Branch:** `main`
**Description:** Full implementation of SukiTrack, a neighborhood sari-sari store price tracker web app built on React Router v7, Tailwind CSS v4, and localStorage.

## Goal
Build a Philippine neighborhood store ("sari-sari") price tracking application that lets store owners manage products, track price changes over time, and get insights into store performance — faithful to the "Precision Editorial" design system defined in Stitch.

## Design System (from Stitch MCP)
- **Creative North Star:** "The Financial Curator" — luxury editorial feel, no cheap borders, tonal surface layering
- **Typefaces:** Manrope (headlines/numbers) + Inter (body/labels)
- **Primary palette:** Black #000000 → Deep navy #00174b (gradient), surface #f7f9fb
- **Accents:** Blue #0053db (focus/tint), Green #009668 (price drops), Red #ba1a1a (price increases/errors)
- **Rule:** No 1px solid borders. Use surface background shifts for separation.

## Application Screens (from Stitch)
1. **Dashboard** – "Your Neighborhood Ledger Summary" — stat cards, live price ticker, quick inventory, stock trends
2. **Product Catalog** – CRUD table with search, category filter, add/delete modals
3. **Item Price Editor** – Edit product details, pricing ledger, price history chart (Recharts), live preview, inventory forecast
4. **Store Trends & Insights** – Revenue leaders, category price change bar chart, high-frequency items, new arrivals

## Implementation Steps

### Step 1: Project Setup & Dependencies
**Files:** `package.json`, `app/app.css`, `app/root.tsx`
**What:** Install `recharts` + `lucide-react`; add Manrope font from Google Fonts; set up Tailwind CSS design tokens/utilities (surface colors, font-display class, ticker animation).
**Testing:** `npm run dev` starts without errors; Manrope font loads.

### Step 2: Data Layer
**Files:** `app/lib/types.ts`, `app/lib/store.ts`, `app/lib/seed-data.ts`
**What:** Define `Product`, `PriceEntry`, `StockStatus` types; create localStorage helpers (`getProducts`, `upsertProduct`, `deleteProduct`); seed 15 sari-sari store products with realistic price histories.
**Testing:** Open browser console, call `localStorage.getItem('sukitrack_products')` after first page load — should have 15 products.

### Step 3: Layout Component
**Files:** `app/components/Layout.tsx`
**What:** Persistent sidebar with gradient store badge, nav links (Dashboard / Catalog / Trends), glassmorphic sticky header, notification bell, and store initial avatar.
**Testing:** All nav links render; active link shows gradient background.

### Step 4: Dashboard Route
**Files:** `app/routes/home.tsx`
**What:** Auto-seeds localStorage on first load; shows live price ticker, 3 stat cards (total items, price drops today, avg margin), quick inventory list, stock trends sidebar panel.
**Testing:** Navigate to `/`; all cards show real numbers from seed data.

### Step 5: Catalog Route
**Files:** `app/routes/catalog.tsx`
**What:** Product table with category filter chips, search, hover-reveal edit/delete actions, delete confirmation row inline, Add Product modal with full form.
**Testing:** Add a product via modal → appears in table; delete a product → removed.

### Step 6: Item Price Editor Route
**Files:** `app/routes/catalog.$id.tsx`
**What:** Edit or create a product. Shows pricing ledger with current/target price inputs, smart hint text, Recharts LineChart for price history, live catalog preview card, inventory forecast, save/delete with confirm.
**Testing:** Edit price of a product → new price entry added to history; chart updates.

### Step 7: Trends Route
**Files:** `app/routes/trends.tsx`
**What:** Revenue leaders list (weekly units × price), Category Price Change Recharts BarChart (green for drops, red for increases), high-frequency items panel, new arrivals panel, demand alert banner.
**Testing:** Page renders all panels; bar chart shows categories with color-coded bars.

### Step 8: Routes Config
**Files:** `app/routes.ts`
**What:** Register all routes: `index`, `catalog`, `catalog/:id`, `trends`.
**Testing:** Navigating between all 4 routes works without 404.
