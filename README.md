# MarktPlace Frontend

A production-ready marketplace frontend built with **Next.js App Router**, **TypeScript**, **TailwindCSS**, and **SWR**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | TailwindCSS |
| Data Fetching | SWR |
| Fonts | Syne (display) + DM Sans (body) |
| Icons | Lucide React |

---

## Project Structure

```
app/
  layout.tsx            # Root layout with Navbar + footer
  page.tsx              # Marketplace homepage (/)
  loading.tsx           # Global loading skeleton
  not-found.tsx         # 404 page
  error.tsx             # Error boundary
  store/[slug]/
    page.tsx            # Store page (SSR + SEO)
    StorePageClient.tsx # Client hydration + back nav
    not-found.tsx       # Store-specific 404
  search/
    page.tsx            # Full-text search page (/search)
  category/[id]/
    page.tsx            # Category browse (/category/:id)

components/
  Navbar.tsx            # Sticky top nav
  SearchBar.tsx         # Debounced search input
  FilterSidebar.tsx     # Category + location filters
  StoreCard.tsx         # Marketplace store card
  ProductCard.tsx       # Multi-variant product card
  TemplateRenderer.tsx  # Routes template code → layout

templates/
  GeneralTemplate.tsx   # general_v1
  FashionTemplate.tsx   # fashion_v1
  FoodTemplate.tsx      # food_v1 (menu-style grouped layout)
  ElectronicsTemplate.tsx # electronics_v1

lib/
  types.ts              # All TypeScript interfaces
  api.ts                # API client + WhatsApp + format helpers
  hooks.ts              # SWR data hooks
  utils.ts              # cn() utility
```

---

## Quick Start

```bash
# 1. Clone and install
npm install

# 2. Set environment variables
cp .env.example .env
# Edit values for your local API/site URLs

# 3. Run dev server
npm run dev

# 4. Build for production
npm run build && npm start
```

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_SITE_URL=https://your-frontend-site.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

---

## Netlify Deployment

This project includes `netlify.toml` with:

- Build command: `npm run build`
- Publish directory: `.next`
- Node version: `20.18.1`
- Login page header for Google OAuth popups

Set these environment variables in Netlify:

```env
NEXT_PUBLIC_API_URL=https://your-deployed-api.com/api
NEXT_PUBLIC_SITE_URL=https://your-netlify-site.netlify.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

Deploy the API project separately first, then point `NEXT_PUBLIC_API_URL` to that API domain. For Google sign-in, add your Netlify domain to the Google OAuth allowed origins.

---

## Template System

Each store in the backend has a `template` field. The `TemplateRenderer` component reads this and mounts the correct layout:

| Template Code | Layout |
|--------------|--------|
| `general_v1` | Standard product grid |
| `fashion_v1` | Cinematic hero + portrait grid |
| `food_v1` | Menu-style grouped list |
| `electronics_v1` | Dark tech layout with contain images |

### Adding a New Template

1. Create `templates/MyTemplate.tsx` — accepts `{ store, products }` props
2. Add a `case "my_v1":` in `components/TemplateRenderer.tsx`
3. Add the new code to `lib/types.ts` → `TemplateCode` union

---

## API Layer (`lib/api.ts`)

| Function | Endpoint |
|----------|----------|
| `getStores(params?)` | `GET /api/stores` |
| `getStoreBySlug(slug)` | `GET /api/stores/:slug` |
| `getProductsByStore(storeId)` | `GET /api/products?storeId=` |
| `getCategories()` | `GET /api/categories` |
| `buildWhatsAppLink(phone, name, price)` | Returns `wa.me` URL |
| `formatPrice(price, currency)` | Formats as NGN currency |

---

## WhatsApp Ordering

Every product card contains a WhatsApp CTA:

```
https://wa.me/{phone}?text=Hi! I want to order *{productName}* – NGN {price}
```

---

## Extending for New Verticals

The template system is designed to scale:

- **Churches**: Add `church_v1` template with sermon/event listings
- **Sports Teams**: Add `sports_v1` template with roster/match display  
- **Services**: Add service-specific templates without changing the core

No backend changes needed for new templates.
