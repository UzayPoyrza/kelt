# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server with Turbopack (recommended)
npm run dev:clean    # Clean .next cache + dev server (use when pages 404 or white screen)
npm run build        # Production build
npm run lint         # Next.js linter
```

## Architecture

**Incraft** (incraft.io) is an AI-guided meditation generator. Users enter a prompt, configure voice/duration/protocol, and generate a meditation session with script, ambient soundscapes, and playback.

### Routes

- `/` — Landing page with hero, samples, testimonials, CTA
- `/create` — Public generate flow (prompt → configure → session)
- `/session` — Playback page with soundscape picker, waveform visualization
- `/studio` — Authenticated studio: sessions grid, history, settings, script editor, generation
- `/login` — Auth page (Google/Apple OAuth, mock)
- `/upgrade` — Pricing page with Personal/Creator credit-based plans

### Two Generate Flows (must stay in sync)

1. **Public flow** (`app/create/page.tsx`) — Simpler UX, "Generate Meditation" button, redirects to `/session`
2. **Studio flow** (`app/studio/page.tsx`, "Generate" nav tab) — Adds "Open in Studio" (script editor) and "Quick Generate" options

These flows are **duplicated, not shared**. When updating UI in one, update the other. Differences:
- Studio has "Open in Studio" + "Quick Generate" vs single "Generate Meditation"
- Studio uses `genConfig` state object; public uses individual state variables
- Studio back button → "All Sessions"; public back → homepage

### Key Files

- `lib/shared.tsx` — Shared data arrays (voices, durations, protocols, soundscapePresets, samples) and components (Logo, AmbientBackground, FadeIn, Header). Modify here for global data changes.
- `lib/svg-paths.ts` — Logo SVG path data
- `app/globals.css` — Design system: CSS variables, fonts, animations

### State & Navigation

- All pages are `"use client"` — no server components
- `/create` and `/session` pass state via URL search params (`useSearchParams`)
- Studio uses local React state with `activeNav` for tab switching
- Intent detection (`detectIntent()` in shared.tsx) auto-selects soundscapes and protocols based on user prompt

## Tech Stack

- **Next.js 16** (App Router) with **Turbopack** for dev
- **React 18**
- **Tailwind CSS 4.x** with `@tailwindcss/postcss`, CSS variables for theming
- **motion/react** (Framer Motion) for animations
- **Radix UI** primitives (used directly, no component library wrapper)
- **Lucide React** for icons

## Design System

### Fonts
- Display: `Instrument Serif` (headings, brand text)
- Body: `DM Sans` (UI text, buttons, labels)

### Colors
- **Sand palette** (neutral): `sand-50` (#faf9f7) through `sand-900` (#1a1614)
- **Accents**: sage (#7a9e7e, green), ocean (#6d9ab5, blue), dusk (#8b7ea6, purple), ember (#c4876c, orange)
- Each accent has a `-light` variant for backgrounds
- Dark sections use `sand-900` (#1a1614) or `#2d2926`

### Animations (globals.css)
- `breathe` — Scale + opacity pulse (6s)
- `float` — Vertical drift (4s)
- `border-glow` — Animated gradient position (4s), used for gradient text and glowing borders

### Animated Gradient Text Pattern
```jsx
className="bg-clip-text text-transparent bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite]"
style={{ backgroundImage: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}
```

## Patterns

- **Page-scoped components**: Complex UI lives inline within page files (e.g., studio's SessionCard, PlayerBar, StudioSession are all in `studio/page.tsx`). Don't extract unless reused across routes.
- **Inline styles for dynamic values**: `style={{ fontFamily: "var(--font-body)" }}` is used extensively alongside Tailwind classes.
- **Protocol-color mapping**: CBT-I/sleep → dusk, MBSR/focus → sage, PMR/stress → ember, HRV-BF → ocean
- **Grain overlay**: `.grain-overlay` class adds animated SVG noise texture
