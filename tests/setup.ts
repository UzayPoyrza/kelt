import { vi } from "vitest";

// Set required env vars before any imports
process.env.STRIPE_SECRET_KEY = "sk_test_fake";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_fake";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fake.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "fake-service-role-key";
process.env.NEXT_PUBLIC_PRICE_PERSONAL_MONTHLY = "price_personal_monthly";
process.env.NEXT_PUBLIC_PRICE_PERSONAL_YEARLY = "price_personal_yearly";
process.env.NEXT_PUBLIC_PRICE_CREATOR_MONTHLY = "price_creator_monthly";
process.env.NEXT_PUBLIC_PRICE_CREATOR_YEARLY = "price_creator_yearly";

// ── Supabase admin mock ──
const mockSupabaseChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  single: vi.fn().mockResolvedValue({ data: { credits_remaining: 10 }, error: null }),
};

const mockFrom = vi.fn(() => ({ ...mockSupabaseChain }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom })),
}));

// ── Supabase server mock (for getAuthUser) ──
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      }),
    },
    from: mockFrom,
  })),
}));

// ── Stripe mock ──
vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        retrieve: vi.fn(),
      },
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

export { mockFrom, mockSupabaseChain };
