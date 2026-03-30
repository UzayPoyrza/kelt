# SEO Audit Report: incraft.io

**Date:** 2026-03-30 | **Business Type:** SaaS (AI Meditation Generator) | **Platform:** Next.js 16 on Vercel

---

## SEO Health Score: 31/100

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Technical SEO | 25% | 28/100 | 7.0 |
| Content Quality | 25% | 38/100 | 9.5 |
| On-Page SEO | 20% | 25/100 | 5.0 |
| Schema / Structured Data | 10% | 0/100 | 0.0 |
| Performance (CWV) | 10% | 55/100 | 5.5 |
| Images | 5% | 70/100 | 3.5 |
| AI Search Readiness | 5% | 15/100 | 0.75 |
| **Total** | | | **31.3** |

---

## Critical Issues (Fix Immediately)

These are likely **preventing the site from being indexed at all**.

### 1. Homepage prerender serves 404 + noindex

The SSR shell for `incraft.io` contains `<meta name="robots" content="noindex"/>` and a 404 title. Googlebot may be treating the homepage as a non-indexable 404 page. This is the single most damaging issue.

**Root cause:** The `app/page.tsx` is `"use client"` and the prerender falls back to a 404 shell. The `x-nextjs-prerender: 1` header confirms static prerendering, but what gets prerendered is the loading/error shell, not actual content.

### 2. ~~No robots.txt~~ FIXED

Created `app/robots.ts`. Allows public pages, disallows `/studio`, `/session`, `/api/`, `/auth/`, `/audio-test`, `/script-preview`, `/signup`. References sitemap.

### 3. ~~No sitemap.xml~~ FIXED

Created `app/sitemap.ts` with 5 public URLs: `/`, `/create`, `/upgrade`, `/login`, `/contact`.

### 4. ~~No canonical tags on any page~~ FIXED

Added `metadataBase` and `alternates.canonical` to `app/layout.tsx`. Per-page canonical tags added via route-level `layout.tsx` files.

---

## High Priority Issues (Fix This Week)

### 5. ~~All pages share identical title and description~~ FIXED

Created route-level `layout.tsx` with unique metadata for `/create`, `/upgrade`, `/login`, `/contact`. Layout uses `title.template: "%s | Incraft"` for consistent branding.

### 6. ~~No Open Graph or Twitter Card tags~~ FIXED

Added `openGraph` and `twitter` metadata to `app/layout.tsx` and per-page `openGraph` overrides in route layouts. Created `app/opengraph-image.tsx` (edge runtime) for social sharing preview image.

### 7. Non-www redirect uses 307 (temporary) instead of 301

`incraft.io` -> `www.incraft.io` uses HTTP 307. Google treats this as temporary and won't consolidate link equity. Should be 301 (permanent).

**Fix:** Change redirect type in Vercel project settings (Settings > Domains).

### 8. ~~`/create` and `/login` bail out to client-side rendering~~ ALREADY FIXED

Both pages already have `<Suspense>` boundaries wrapping the component that uses `useSearchParams()`. No changes needed.

### 9. ~~Extremely sparse internal linking~~ FIXED

Added `<Link>` components to homepage footer for `/create`, `/upgrade`, `/contact`. Wrapped in a `<nav>` element for semantic HTML.

### 10. ~~Font loading issues (LCP + CLS impact)~~ FIXED

Switched to `next/font/google` for DM Sans and Playfair Display. Removed raw `@font-face` declarations from `globals.css`. Fonts now auto-preload, self-host as woff2, and use `size-adjust` to prevent CLS.

### 11. Missing Privacy Policy and Terms of Service pages

Linked from the `/upgrade` footer but the pages don't exist (404). Dead links = trust and compliance failure (GDPR/CCPA risk).

**Fix:** Create `/privacy` and `/terms` pages with actual legal content.

---

## Medium Priority (Fix Within 1 Month)

### 12. ~~Zero structured data~~ FIXED

Created `lib/schema.tsx` with JSON-LD components. Integrated into pages:
- Organization + WebSite+SearchAction in `app/layout.tsx` (global)
- WebApplication + Review (x3) in `app/page.tsx` (homepage)
- Product/Offer (x3 plans) + BreadcrumbList in `app/upgrade/page.tsx`
- BreadcrumbList in `app/create/page.tsx` and `app/contact/page.tsx`

### 13. ~~Missing security headers~~ FIXED

Added to `next.config.ts` via `headers()`: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy (camera/mic/geo denied). CSP still needs to be added separately.

### 14. E-E-A-T gaps

**E-E-A-T Score: 28/100**

| Factor | Score | Issues |
|--------|-------|--------|
| Experience | 25/100 | No about page, no team info, no founder story |
| Expertise | 30/100 | Clinical claims without citations, no advisory board |
| Authoritativeness | 20/100 | No external endorsements, no backlink-worthy content |
| Trustworthiness | 35/100 | Dead legal links, contact email on different domain (launchspace.org) |

**Key fixes:**
- Create an About page with team/founder information
- Add citations to clinical research for each protocol
- Move contact email to `@incraft.io` domain
- Link testimonials to verifiable sources (LinkedIn, professional directories)

### 15. ~~Thin content on key pages~~ NOT APPLICABLE

`/upgrade`, `/create`, and `/contact` are utility pages accessed from within the app, not SEO landing pages. Thin content on these does not affect site-wide rankings. No action needed.

### 16. ~~Small touch targets on mobile~~ PARTIALLY FIXED

Submit button bumped to 44x44px on mobile (`w-11 h-11 sm:w-9 sm:h-9`). Sound pills bumped to larger padding on mobile (`px-2.5 py-1 sm:px-2 sm:py-[3px]`).

| Element | Before | After | Status |
|---------|--------|-------|--------|
| Input submit button | 36x36px | 44x44px mobile | Fixed |
| Sound selection buttons | ~40x18px | ~48x28px mobile | Improved |
| Suggestion pills | ~32px height | — | Not changed |
| Volume slider | 48x2px | — | Not changed |

### 17. ~~Input font size causes iOS auto-zoom~~ FIXED

Changed input to `text-base sm:text-sm` — 16px on mobile (prevents zoom), 14px on desktop.

### 18. Large JS bundle (~1 MB uncompressed)

12 script chunks totaling ~1 MB on the homepage. All content behind a Suspense boundary means users see a loading spinner until JS hydrates.

**Fix:** Convert homepage to server component shell with client islands for interactivity. Use `@next/bundle-analyzer` to identify unnecessary code in the homepage bundle.

---

## Low Priority (Backlog)

| # | Issue | Category | Status |
|---|-------|----------|--------|
| 19 | ~~No `theme-color` meta tag~~ | Mobile | FIXED — added `Viewport` export in layout.tsx |
| 20 | `/session` legacy route returns 200 instead of 301 redirect | URL Structure | Mitigated — blocked in robots.txt |
| 21 | No hamburger menu on mobile (nav links hidden below 640px) | Mobile UX | |
| 22 | ~~Floating nav logo has no accessible text on mobile~~ | Accessibility | FIXED — added `aria-label="Incraft home"` |
| 23 | ~~Text as small as 9-10px in sample cards and testimonials~~ | Mobile UX | FIXED — bumped to 10-12px on mobile |
| 24 | No blog/resource center for informational keyword targeting | Content | |
| 25 | No `<noscript>` fallback for JS-disabled users | Accessibility | |
| 26 | Wildcard CORS on static assets | Security | |
| 27 | `/signup` page may duplicate `/login` (consolidate or noindex) | URL Structure | Mitigated — blocked in robots.txt |

---

## Content Gaps

| Missing Page | Priority | Impact |
|-------------|----------|--------|
| Privacy Policy (`/privacy`) | P0 | Legal compliance — linked from footer but returns 404 |
| Terms of Service (`/terms`) | P0 | Legal compliance — linked from footer but returns 404 |
| About page (`/about`) | P1 | E-E-A-T entity identity — no one knows who runs this site |
| Blog / Resources | P2 | Informational keyword rankings (e.g., "what is CBT-I meditation") |
| FAQ standalone page | P2 | Long-tail search query capture |

---

## Core Web Vitals Estimate

| Metric | Estimated | Target | Status |
|--------|-----------|--------|--------|
| **LCP** | 2.0-3.5s | <=2.5s | Needs Improvement |
| **INP** | 100-250ms | <=200ms | Borderline |
| **CLS** | 0.05-0.15 | <=0.1 | Borderline |

**Positives:**
- Zero third-party scripts (no analytics, no tracking pixels, no chat widgets)
- Zero images on homepage (all SVG/CSS)
- Excellent TTFB (93ms via Vercel edge cache)
- Static prerender enabled

**Negatives:**
- Full client-rendering behind Suspense boundary (~1 MB JS must load before content appears)
- Unoptimized font loading (TTF instead of woff2, no preload, no preconnect)
- Heavy Framer Motion usage (48 independent infinite animations in waveform section)
- No `next/font` optimization

**Priority fixes:**
1. Switch to `next/font` (expected: LCP -300-800ms, CLS -0.05-0.1)
2. Convert homepage to server component shell (expected: LCP -500-1500ms)
3. Reduce Framer Motion on homepage (expected: INP -50-100ms)
4. Add resource hints for fonts and Supabase (expected: LCP -100-300ms)

---

## Route Inventory

| Route | HTTP Status | SSR Content | Auth Required | Sitemap Eligible |
|-------|-------------|-------------|---------------|-----------------|
| `/` | 200 | 404 shell (broken prerender) | No | Yes |
| `/create` | 200 | CSR bailout (loading spinner) | No | Yes |
| `/upgrade` | 200 | Likely prerendered | No | Yes |
| `/login` | 200 | CSR bailout (loading spinner) | No | Yes |
| `/contact` | 200 | Unknown | No | Yes |
| `/studio` | 307 -> /login | N/A | Yes | No |
| `/session` | 200 | Unknown | No | No (legacy) |
| `/signup` | 200 | Unknown | No | No (duplicate of /login) |
| `/audio-test` | 200 | Unknown | No | No (dev page) |
| `/script-preview` | 200 | Unknown | No | No (internal tool) |

---

## Files to Create

### `app/robots.ts`

Dynamic robots.txt allowing public pages, blocking internal/auth/dev routes, referencing sitemap.

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/create", "/upgrade", "/login", "/contact"],
        disallow: ["/studio", "/session", "/api/", "/auth/", "/audio-test", "/script-preview", "/signup"],
      },
    ],
    sitemap: "https://incraft.io/sitemap.xml",
  };
}
```

### `app/sitemap.ts`

Dynamic sitemap with 5 public URLs.

```typescript
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://incraft.io", lastModified: new Date("2026-03-30") },
    { url: "https://incraft.io/create", lastModified: new Date("2026-03-30") },
    { url: "https://incraft.io/upgrade", lastModified: new Date("2026-03-30") },
    { url: "https://incraft.io/login", lastModified: new Date("2026-03-30") },
    { url: "https://incraft.io/contact", lastModified: new Date("2026-03-27") },
  ];
}
```

### `lib/schema.tsx`

Full JSON-LD structured data components: Organization, WebSite+SearchAction, WebApplication, Product/Offer (x3 plans), BreadcrumbList, Review (x3 testimonials).

### Updated `app/layout.tsx` metadata

```typescript
export const metadata: Metadata = {
  metadataBase: new URL("https://incraft.io"),
  title: "Incraft — AI Guided Meditation",
  description: "AI-generated meditations with natural pauses, studio-quality audio, and adaptive guidance that evolves with you.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Incraft — AI Guided Meditation",
    description: "AI-generated meditations with natural pauses, studio-quality audio, and adaptive guidance.",
    url: "https://incraft.io",
    siteName: "Incraft",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Incraft — AI Guided Meditation",
    description: "AI-generated meditations with natural pauses, studio-quality audio, and adaptive guidance.",
  },
};
```

---

## Top 5 Actions by Impact

| Priority | Action | Expected Impact |
|----------|--------|----------------|
| 1 | **Fix homepage prerender 404/noindex** | Unblocks indexation entirely |
| 2 | **Create robots.txt + sitemap.xml** | Enables proper crawling and page discovery |
| 3 | **Add per-page metadata + canonical tags + OG tags** | Enables proper SERP display and social sharing |
| 4 | **Add structured data (JSON-LD)** | Enables rich results (pricing, reviews, sitelinks) |
| 5 | **Switch to `next/font` + server component shell** | Fixes Core Web Vitals (LCP, CLS) |
