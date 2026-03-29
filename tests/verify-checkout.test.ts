import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { mockFrom, mockSupabaseChain } from "./setup";

// Import the route handler
import { POST } from "@/app/api/verify-checkout/route";

const stripe = getStripe();

// Helper to create a NextRequest with JSON body
function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/verify-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Helper for a base Stripe subscription checkout session
function makeSubscriptionSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "cs_test_sub_123",
    payment_status: "paid",
    mode: "subscription",
    subscription: "sub_123",
    customer: "cus_123",
    amount_total: 999,
    metadata: { userId: "user-123" },
    ...overrides,
  };
}

// Helper for a base Stripe payment checkout session
function makePaymentSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "cs_test_pay_123",
    payment_status: "paid",
    mode: "payment",
    customer: "cus_456",
    amount_total: 495, // 5 credits at $0.99
    metadata: { userId: "user-123" },
    ...overrides,
  };
}

// Helper for a Stripe subscription object
function makeStripeSubscription(priceId = "price_personal_monthly") {
  return {
    id: "sub_123",
    items: {
      data: [
        {
          price: {
            id: priceId,
            recurring: { interval: "month" },
          },
        },
      ],
    },
    current_period_start: 1700000000,
    current_period_end: 1702592000,
  };
}

describe("POST /api/verify-checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default mock behaviors
    mockFrom.mockImplementation(() => ({ ...mockSupabaseChain }));
    mockSupabaseChain.select.mockReturnThis();
    mockSupabaseChain.insert.mockReturnThis();
    mockSupabaseChain.update.mockReturnThis();
    mockSupabaseChain.upsert.mockReturnThis();
    mockSupabaseChain.eq.mockReturnThis();
    mockSupabaseChain.maybeSingle.mockResolvedValue({ data: null, error: null });
    mockSupabaseChain.single.mockResolvedValue({ data: { credits_remaining: 10 }, error: null });
  });

  // ─── Auth & Validation ─────────────────────────────────

  it("returns 400 if sessionId is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("sessionId is required");
  });

  it("returns 400 if session is not paid", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makeSubscriptionSession({ payment_status: "unpaid" }) as never
    );

    const res = await POST(makeRequest({ sessionId: "cs_test_123" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Session not paid");
  });

  it("returns 403 if session userId does not match authed user", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makeSubscriptionSession({ metadata: { userId: "other-user-999" } }) as never
    );

    const res = await POST(makeRequest({ sessionId: "cs_test_123" }));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Session does not belong to user");
  });

  // ─── Idempotency ───────────────────────────────────────

  it("returns alreadyProcessed:true if ledger entry exists for this session", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makeSubscriptionSession() as never
    );

    // Simulate existing ledger entry
    mockSupabaseChain.maybeSingle.mockResolvedValue({
      data: { id: "existing-ledger-id" },
      error: null,
    });

    const res = await POST(makeRequest({ sessionId: "cs_test_sub_123" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.alreadyProcessed).toBe(true);

    // Should NOT have called insert (no double-granting)
    expect(mockSupabaseChain.insert).not.toHaveBeenCalled();
  });

  // ─── Subscription Mode ─────────────────────────────────

  it("processes a subscription checkout (personal monthly)", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makeSubscriptionSession() as never
    );
    vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(
      makeStripeSubscription("price_personal_monthly") as never
    );

    const res = await POST(makeRequest({ sessionId: "cs_test_sub_123" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);

    // Should upsert subscription
    expect(mockFrom).toHaveBeenCalledWith("subscriptions");
    expect(mockSupabaseChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-123",
        stripe_customer_id: "cus_123",
        stripe_subscription_id: "sub_123",
        plan: "personal",
        billing_cycle: "monthly",
        credits_per_month: 50,
        status: "active",
      }),
      { onConflict: "user_id" }
    );

    // Should update profile with plan + credits
    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockSupabaseChain.update).toHaveBeenCalledWith({
      plan: "personal",
      credits_remaining: 50,
    });

    // Should insert ledger entry with stripe_session_id
    expect(mockFrom).toHaveBeenCalledWith("credit_ledger");
    expect(mockSupabaseChain.insert).toHaveBeenCalledWith({
      user_id: "user-123",
      amount: 50,
      reason: "personal_subscription",
      stripe_session_id: "cs_test_sub_123",
    });
  });

  it("processes a subscription checkout (creator yearly)", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makeSubscriptionSession() as never
    );
    vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(
      makeStripeSubscription("price_creator_yearly") as never
    );

    // Override recurring interval to year
    const sub = makeStripeSubscription("price_creator_yearly");
    sub.items.data[0].price.recurring.interval = "year";
    vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(sub as never);

    const res = await POST(makeRequest({ sessionId: "cs_test_sub_123" }));
    expect(res.status).toBe(200);

    expect(mockSupabaseChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: "creator",
        billing_cycle: "yearly",
        credits_per_month: 200,
      }),
      { onConflict: "user_id" }
    );

    expect(mockSupabaseChain.update).toHaveBeenCalledWith({
      plan: "creator",
      credits_remaining: 200,
    });

    expect(mockSupabaseChain.insert).toHaveBeenCalledWith({
      user_id: "user-123",
      amount: 200,
      reason: "creator_subscription",
      stripe_session_id: "cs_test_sub_123",
    });
  });

  // ─── Payment Mode (Single Credit Purchase) ─────────────

  it("processes a one-time credit purchase", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makePaymentSession({ amount_total: 495 }) as never // 5 credits at $0.99
    );

    const res = await POST(makeRequest({ sessionId: "cs_test_pay_123" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);

    // Should update profile credits (10 existing + 5 new = 15)
    expect(mockSupabaseChain.update).toHaveBeenCalledWith({
      credits_remaining: 15,
    });

    // Should insert ledger entry
    expect(mockSupabaseChain.insert).toHaveBeenCalledWith({
      user_id: "user-123",
      amount: 5,
      reason: "credit_purchase",
      stripe_session_id: "cs_test_pay_123",
    });
  });

  it("grants at least 1 credit for small amounts", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makePaymentSession({ amount_total: 50 }) as never // less than $0.99
    );

    const res = await POST(makeRequest({ sessionId: "cs_test_pay_123" }));
    expect(res.status).toBe(200);

    expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 1 })
    );
  });

  it("adds credits to existing balance for payment mode", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makePaymentSession({ amount_total: 990 }) as never // 10 credits
    );

    // User has 25 existing credits
    mockSupabaseChain.single.mockResolvedValue({
      data: { credits_remaining: 25 },
      error: null,
    });

    const res = await POST(makeRequest({ sessionId: "cs_test_pay_123" }));
    expect(res.status).toBe(200);

    expect(mockSupabaseChain.update).toHaveBeenCalledWith({
      credits_remaining: 35, // 25 + 10
    });
  });

  it("handles zero existing credits gracefully in payment mode", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makePaymentSession({ amount_total: 297 }) as never // 3 credits
    );

    mockSupabaseChain.single.mockResolvedValue({
      data: { credits_remaining: 0 },
      error: null,
    });

    const res = await POST(makeRequest({ sessionId: "cs_test_pay_123" }));
    expect(res.status).toBe(200);

    expect(mockSupabaseChain.update).toHaveBeenCalledWith({
      credits_remaining: 3,
    });
  });

  it("handles null profile (no existing row) gracefully", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makePaymentSession({ amount_total: 198 }) as never // 2 credits
    );

    mockSupabaseChain.single.mockResolvedValue({
      data: null,
      error: null,
    });

    const res = await POST(makeRequest({ sessionId: "cs_test_pay_123" }));
    expect(res.status).toBe(200);

    expect(mockSupabaseChain.update).toHaveBeenCalledWith({
      credits_remaining: 2, // 0 + 2
    });
  });

  // ─── Error Handling ────────────────────────────────────

  it("returns 500 if Stripe session retrieve fails", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockRejectedValue(
      new Error("No such checkout session")
    );

    const res = await POST(makeRequest({ sessionId: "cs_invalid" }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("No such checkout session");
  });

  it("returns 500 if Stripe subscription retrieve fails", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makeSubscriptionSession() as never
    );
    vi.mocked(stripe.subscriptions.retrieve).mockRejectedValue(
      new Error("No such subscription")
    );

    const res = await POST(makeRequest({ sessionId: "cs_test_sub_123" }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("No such subscription");
  });

  // ─── Stripe Session Retrieval ──────────────────────────

  it("calls stripe.checkout.sessions.retrieve with the correct sessionId", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makeSubscriptionSession() as never
    );
    vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(
      makeStripeSubscription() as never
    );

    await POST(makeRequest({ sessionId: "cs_specific_id_456" }));

    expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith("cs_specific_id_456");
  });

  // ─── Period dates in subscription upsert ───────────────

  it("converts unix timestamps to ISO strings for subscription period dates", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(
      makeSubscriptionSession() as never
    );

    const sub = makeStripeSubscription();
    sub.current_period_start = 1700000000;
    sub.current_period_end = 1702592000;
    vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(sub as never);

    await POST(makeRequest({ sessionId: "cs_test_sub_123" }));

    expect(mockSupabaseChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        current_period_start: new Date(1700000000 * 1000).toISOString(),
        current_period_end: new Date(1702592000 * 1000).toISOString(),
      }),
      expect.anything()
    );
  });
});
