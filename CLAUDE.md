# MindFlow — AI Guided Meditation

## Generate Flows

There are **two separate generate flows** that must stay in sync:

1. **Public flow** (`app/create/page.tsx`) — The landing page generate flow. User enters a prompt on the homepage, gets redirected to `/create` to configure duration, voice, and optionally override the protocol via Advanced. Clicking "Generate Meditation" goes to `/session`.

2. **Studio flow** (`app/studio/page.tsx`, inside the "Generate" nav tab) — The in-app generate flow for logged-in users. Same steps (prompt → configure → generate) but includes an "Open in Studio" button that goes to the script editor, plus a "Quick Generate" option that skips the editor.

These two flows share the same UI components (duration pills, voice cards, advanced protocol selector) but are **not** extracted into shared components — they are duplicated. When updating one, update the other. Key differences:
- Studio flow has "Open in Studio" and "Quick Generate" buttons instead of a single "Generate Meditation" button
- Studio flow's back button goes to "All Sessions" view, not the homepage
- Studio flow uses `genConfig` state object; public flow uses individual state variables

## Tech Stack
- Next.js 15 App Router, all pages are `"use client"`
- Tailwind CSS 4.x with CSS variables (sand palette, sage/ocean/dusk/ember accents)
- `motion/react` (Motion library) for animations
- Shared data and components in `lib/shared.tsx`
