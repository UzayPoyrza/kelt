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
- `/create` — Pre-signup flow: fully interactive config (all options unlocked), but clicking "Generate Meditation" shows signup modal. After OAuth, redirects to `/studio?prompt=X`
- `/studio` — **Main app**. Authenticated only. Sessions grid, history, settings, script editor, generation. All generation happens here.
- `/session` — Legacy playback page. Redirects to `/studio?session=X` if session ID present.
- `/login` — Auth page (Google/Apple OAuth)
- `/upgrade` — Pricing page with Personal/Pro subscription plans

### Generation Flow (single flow, all in `/studio`)

The primary and only generation flow:

1. User enters prompt on `/` → goes to `/create?prompt=X` → configures options → clicks Generate
2. Signup modal appears (if not signed in) → OAuth → redirected to `/studio?prompt=X`
3. `/studio` shows the generate config step → user picks duration/voice/category → clicks "Generate Meditation"
4. This calls `handleQuickGenerate` → `/api/generate` (script) → redirect to `/studio?session=X` → auto-render TTS
5. Session loads in studio editor with script, player, sound picker

**The `/create` page is a teaser/funnel only.** It never calls `/api/generate`. The signup modal gates generation. All actual generation happens in `/studio`.

There is also a secondary flow inside the studio session editor: "Generate Audio" / "Regenerate Audio" button (`handleGenerateAudio`) which regenerates from an edited script without leaving the editor.

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

## MindFlow Script Generation API

External API at `https://j6w7gkn6x7.execute-api.us-east-1.amazonaws.com/v1`. Full docs at `/Users/uzaypoyraz/automated-script-session-engine/docs/API.md`.

### `POST /v1/sessions/generate`

Generates a meditation script. Called from `/api/generate/route.ts`. Audio rendering (TTS) is separate via AWS Lambda (`mindflow-tts`).

**Request body:**
| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `prompt` | string | Yes | — | 1-1000 chars |
| `support_choice` | enum | No | `"auto_detect"` | See enums below. Send `"auto_detect"` when user didn't pick — API has LLM-powered detection |
| `duration_min` | enum | No | `7` | **Only accepts: 3, 5, 7, 10, 12, 15**. Clamp invalid values to nearest valid |
| `mode` | enum | No | `"still"` | `"still"`, `"walking"`, `"gentle_movement"` |
| `extra_gentle` | bool | No | `false` | Gentler shape variants |
| `preferred_approach` | enum | No | `"auto"` | See enums below |
| `user_id` | string | No | `null` | **Do NOT pass** — we handle sessions/credits ourselves in Supabase. Passing it causes the API to also save sessions and debit credits |

**Response fields we use:**
| Field | What we do with it |
|-------|-------------------|
| `script` | Stored as `session.script.raw` |
| `final_script` | Stored as `session.script.final` — **use this for TTS/display** |
| `selected_sound_id` | Stored as `session.soundscape` (e.g. `"S04"` = Rain) |
| `sound_options` | `{ recommended: string[], other: string[] }` — stored as `session.sound_options` |
| `routed_protocol` | Stored as `session.protocol` (e.g. `"BREATH_SLOW"`, `"BODY_SCAN"`) |
| `status` | Should be `"script_ready"` on success |
| `timings` | Not used, available for debugging |

**Response fields we don't use:** `session_id` (we create our own), `selected_shape`, `selected_sound_pool`, `packet`, `output_path`.

**The API does NOT return a title.** Session titles come from `deriveSessionName(prompt)` in `lib/generateScript.ts`.

### Other endpoints (not currently used)
- `POST /v1/sessions/validate` — Dry-run routing without script generation
- `GET /v1/options?support_choice=X&mode=Y` — Dynamic approach filtering (we hardcode these in `lib/shared.tsx` instead)
- `GET /v1/protocols`, `GET /v1/shapes`, `GET /v1/sound-pools` — Reference data

### Enums

**Support choices:** `auto_detect`, `mindfulness`, `burnout`, `anxiety`, `panic`, `adhd_focus`, `sleep`, `depression`, `addiction_support`, `self_compassion`, `just_meditate`

**Preferred approaches:** `auto`, `focused_attention`, `open_monitoring`, `breathwork`, `body_scan_pmr`, `grounding`, `nsdr`, `cbt`, `cbt_i` (sleep only), `mbct`, `mbrp` (addiction only), `cft_msc`, `visualization`, `mantra`, `sound_meditation`, `movement`, `interoceptive_exposure` (panic only)

**Sound IDs:** S01 Chimes and Tones, S02 Fireplace, S03 Peaceful Moment, S04 Rain, S05 River, S06 Safe Haven, S07 Shower, S08 Spring Field, S09 Static Noise, S10 Summer Night, S11 Waves, S12 Distant Wind Chimes, S13 Athens Street Cafe, S14 Binaural Focus, S15 Binaural Calm, S16 Night Train, S17 Singing Bowls, S18 Snowfall, S19 Soft Piano, S20 Deep Space, S21 Brown Noise, S22 Underwater, S23 Rainforest Rain, S24 Soft Metronome, S25 Hard Metronome, S26 Low Tone, S27 Mid Tone, S28 4-6 Breath Pacer, S29 Quiet Room Tone, S30 Pink Noise, S31 Stereo Focus Drone, S32 Stereo Calm Drone, S33 Clean Bell, S34 Shamanic Drum Loop

## Auth & Credits

### Anonymous users (no OAuth)
- AuthProvider auto-creates anonymous Supabase session on first visit
- **No credits** — rate-limited to 2 generations/day instead
- Restricted to: 2-3 min duration, 2 voices (Aria/James), 4 categories (mindfulness/anxiety/sleep/just_meditate)
- Daily limit returns 429 from `/api/generate` with `code: "daily_limit"`
- Cannot access `/studio` (middleware redirects to `/login`)

### OAuth users (Google/Apple)
- 2 credits/month on free plan
- Full access to all voices, durations, categories, advanced options
- `/studio` access with script editing, session history

### Anonymous → OAuth upgrade
- Supabase links anonymous account to OAuth identity (same user ID preserved)
- `upgrade_anonymous_to_free` RPC sets `credits_remaining = 2`, `is_anonymous = false`
- Previous anonymous sessions/generations carry over, don't consume credits (had `credit_cost: 0`)

### Supabase RPC functions
- `deduct_credit(user_id_input)` — Atomic decrement, returns boolean
- `refund_credit(user_id_input)` — Atomic increment
- `upgrade_anonymous_to_free(target_user_id)` — Converts anonymous profile to free plan with 2 credits

## Stripe Products & Pricing

Two subscription plans (no single-credit purchases):

| Product | Monthly | Yearly | Credits |
|---------|---------|--------|---------|
| **Incraft Personal** | $8/mo | $72/yr ($6/mo) | 30/month |
| **Incraft Pro** | $24/mo | $216/yr ($18/mo) | 100/month |

Stripe account: `acct_1TEi9M1eQq0tmKNS` (Kelt). Currently in **test mode** — switch to live API keys (`sk_live_*` / `pk_live_*`) before launch.

## Patterns

- **Page-scoped components**: Complex UI lives inline within page files (e.g., studio's SessionCard, PlayerBar, StudioSession are all in `studio/page.tsx`). Don't extract unless reused across routes.
- **Inline styles for dynamic values**: `style={{ fontFamily: "var(--font-body)" }}` is used extensively alongside Tailwind classes.
- **Protocol-color mapping**: CBT-I/sleep → dusk, MBSR/focus → sage, PMR/stress → ember, HRV-BF → ocean
- **Grain overlay**: `.grain-overlay` class adds animated SVG noise texture
