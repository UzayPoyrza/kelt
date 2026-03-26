import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { mockFrom, mockSupabaseChain } from "./setup";

import { POST } from "@/app/api/webhooks/stripe/route";

function makeWebhookRequest(body: string, signature = "sig_test"): NextRequest {
  return new NextRequest("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": signature },
    body,
  });
}

function makeCheckoutEvent(session: Record<string, unknown>) {
  return {
    type: "checkout.session.completed",
    data: { object: session },
  };
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation(() => ({ ...mockSupabaseChain }));
    mockSupabaseChain.select.mockReturnThis();
    mockSupabaseChain.insert.mockReturnThis();
    mockSupabaseChain.update.mockReturnThis();
    mockSupabaseChain.upsert.mockReturnThis();
    mockSupabaseChain.eq.mockReturnThis();
    mockSupabaseChain.maybeSingle.mockResolvedValue({ data: null, error: null });
    mockSupabaseChain.single.mockResolvedValue({ data: { credits_remaining: 10 }, error: null });
  });

  it("returns 400 if signature is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    });
    // Remove stripe-signature header
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 if event construction fails", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Invalid signature");
  });

  it("skips processing if ledger entry already exists (idempotency)", async () => {
    const session = {
      id: "cs_already_done",
      mode: "subscription",
      subscription: "sub_123",
      customer: "cus_123",
      amount_total: 999,
      metadata: { userId: "user-123" },
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeCheckoutEvent(session) as never
    );

    // Simulate existing ledger entry
    mockSupabaseChain.maybeSingle.mockResolvedValue({
      data: { id: "existing-entry" },
      error: null,
    });

    const res = await POST(makeWebhookRequest(JSON.stringify(session)));
    expect(res.status).toBe(200);

    // Should NOT have called upsert or insert for new data
    expect(mockSupabaseChain.upsert).not.toHaveBeenCalled();
    expect(mockSupabaseChain.insert).not.toHaveBeenCalled();
  });

  it("processes subscription checkout when no prior ledger entry", async () => {
    const session = {
      id: "cs_new_sub",
      mode: "subscription",
      subscription: "sub_456",
      customer: "cus_789",
      amount_total: 999,
      metadata: { userId: "user-123" },
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeCheckoutEvent(session) as never
    );

    vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue({
      id: "sub_456",
      items: {
        data: [{ price: { id: "price_personal_monthly", recurring: { interval: "month" } } }],
      },
      current_period_start: 1700000000,
      current_period_end: 1702592000,
    } as never);

    const res = await POST(makeWebhookRequest(JSON.stringify(session)));
    expect(res.status).toBe(200);

    // Should have inserted ledger with stripe_session_id
    expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        stripe_session_id: "cs_new_sub",
        reason: "personal_subscription",
      })
    );
  });

  it("processes payment checkout with stripe_session_id", async () => {
    const session = {
      id: "cs_new_pay",
      mode: "payment",
      customer: "cus_111",
      amount_total: 495,
      metadata: { userId: "user-123" },
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeCheckoutEvent(session) as never
    );

    const res = await POST(makeWebhookRequest(JSON.stringify(session)));
    expect(res.status).toBe(200);

    expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        stripe_session_id: "cs_new_pay",
        reason: "credit_purchase",
        amount: 5,
      })
    );
  });

  it("skips if no userId in session metadata", async () => {
    const session = {
      id: "cs_no_user",
      mode: "subscription",
      metadata: {},
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeCheckoutEvent(session) as never
    );

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(200);

    // Should not process anything
    expect(mockSupabaseChain.upsert).not.toHaveBeenCalled();
    expect(mockSupabaseChain.insert).not.toHaveBeenCalled();
  });
});
