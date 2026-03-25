# Kelt (MindFlow) — Backend TODO

> **Stack:** Supabase (Auth + Postgres) · Cloudflare R2 (Audio Storage) · Stripe (Payments) · Claude API + ElevenLabs (Generation)

## Phase 1: Foundation (Supabase)

- [ ] Create Supabase project
- [ ] Install `@supabase/supabase-js` and `@supabase/ssr`
- [ ] Set up `.env.local` with Supabase URL, anon key, service role key
- [ ] Create database tables (SQL migrations):
  - [ ] `users` (id, email, name, avatar, plan, created_at)
  - [ ] `sessions` (id, user_id, title, prompt, voice, duration, protocol, soundscape, script_json, created_at, updated_at, accessed_at, deleted_at)
  - [ ] `generations` (id, session_id, user_id, prompt, voice_model, duration, protocol, status, audio_url, credit_cost, created_at, completed_at)
  - [ ] `subscriptions` (id, user_id, stripe_subscription_id, plan, billing_cycle, credits_per_month, current_period_start, current_period_end, status)
  - [ ] `credit_ledger` (id, user_id, amount, reason, generation_id, created_at)
- [ ] Enable Row Level Security (RLS) — users can only access their own data
- [ ] Configure Supabase Auth with Google OAuth provider
- [ ] Configure Supabase Auth with Apple OAuth provider
- [ ] Create Supabase auth helpers for Next.js (middleware + server/client utils)
- [ ] Add Next.js middleware for protected routes (`/studio`, `/session`)
- [ ] Replace mock login buttons with real Supabase OAuth flow
- [ ] Add auth state to studio (user profile, avatar, logout)

## Phase 2: Session CRUD

- [ ] Install Zod for API request validation
- [ ] `POST /api/sessions` — Create new session
- [ ] `GET /api/sessions` — List user's sessions (with search/filter/pagination)
- [ ] `GET /api/sessions/:id` — Get single session with script
- [ ] `PUT /api/sessions/:id` — Update session (title, script blocks, metadata)
- [ ] `DELETE /api/sessions/:id` — Soft delete session
- [ ] Wire up studio to fetch real sessions instead of mock data
- [ ] Wire up auto-save in script editor to `PUT /api/sessions/:id`
- [ ] Wire up session page to load real session data from URL params

## Phase 3: AI Generation

- [ ] Install `@anthropic-ai/sdk` (Claude API)
- [ ] Build prompt template for meditation script generation (using intent, protocol, duration, voice)
- [ ] `POST /api/generate` — Trigger generation (validate credits, create generation record, call Claude)
- [ ] Parse Claude response into script blocks (voice/pause segments)
- [ ] Install ElevenLabs SDK (or Google Cloud TTS)
- [ ] Text-to-speech: convert script voice blocks to audio
- [ ] Audio mixing: layer TTS output with selected ambient soundscape
- [ ] Set up async job queue (Inngest or Bull) for generation pipeline
- [ ] `GET /api/generations/:id` — Poll generation status
- [ ] Wire up public flow (`/create`) to real generation endpoint
- [ ] Wire up studio flow to real generation endpoint
- [ ] Implement "Regenerate section" for individual script blocks
- [ ] Handle failed generations (mark as failed, don't deduct credit)

## Phase 4: File Storage (Cloudflare R2)

- [ ] Create R2 bucket for MindFlow audio files
- [ ] Install `@aws-sdk/client-s3` (R2 is S3-compatible)
- [ ] Set up `.env.local` with R2 account ID, access key, secret key, bucket name
- [ ] Upload generated audio to R2 after generation completes
- [ ] `GET /api/audio/:id` — Generate presigned URL for audio streaming
- [ ] Wire up session playback page to stream real audio from R2
- [ ] Configure R2 custom domain or Cloudflare CDN for public access
- [ ] Clean up orphaned audio files on session delete

## Phase 5: Payments & Credits (Stripe)

- [ ] Install `stripe` SDK
- [ ] Create Stripe products & prices (Free, Personal $9/mo, Creator $29/mo, Single $0.99)
- [ ] `POST /api/checkout` — Create Stripe Checkout session for subscription or single credit
- [ ] `POST /api/webhooks/stripe` — Handle subscription lifecycle events
  - [ ] `checkout.session.completed` — Activate subscription, set credits
  - [ ] `invoice.paid` — Monthly credit refresh
  - [ ] `customer.subscription.updated` — Plan changes
  - [ ] `customer.subscription.deleted` — Cancellation
- [ ] Build credit ledger system (deduct on generation, refund on failure, refresh monthly)
- [ ] `GET /api/user/credits` — Current credit balance & usage history
- [ ] Wire up upgrade page to real Stripe Checkout
- [ ] Wire up studio credit display to real balance
- [ ] Enforce credit check before allowing generation
- [ ] Handle single credit purchases (non-expiring)
- [ ] Subscription management portal (cancel, change plan)

## Phase 6: Polish & Production

- [ ] Rate limiting on generation endpoints (`@upstash/ratelimit`)
- [ ] Error tracking (Sentry)
- [ ] Analytics integration (PostHog or Mixpanel)
- [ ] Email notifications (SendGrid) — welcome, generation complete, low credits
- [ ] Health check endpoint (`GET /api/health`)
- [ ] Input sanitization across all endpoints
- [ ] Logging (structured JSON logs)
- [ ] Deploy to Vercel (connect Supabase + R2 env vars)
- [ ] Set up CI/CD pipeline
