import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { mockSupabaseChain } from "./setup";

import { POST } from "@/app/api/create-payment-intent/route";

const stripe = getStripe();

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin: "http://localhost:3000" },
    body: JSON.stringify(body),
  });
}

// Mock stripe.customers.create and stripe.checkout.sessions.create
vi.mocked(stripe).customers = {
  create: vi.fn().mockResolvedValue({ id: "cus_new" }),
} as never;

vi.mocked(stripe).checkout = {
  ...vi.mocked(stripe).checkout,
  sessions: {
    ...vi.mocked(stripe).checkout.sessions,
    create: vi.fn().mockResolvedValue({ client_secret: "cs_secret_123" }),
    retrieve: vi.mocked(stripe).checkout.sessions.retrieve,
  },
} as never;

describe("POST /api/create-payment-intent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseChain.maybeSingle.mockResolvedValue({ data: null, error: null });
    mockSupabaseChain.single.mockResolvedValue({ data: { email: "test@test.com" }, error: null });
    vi.mocked(stripe.customers.create).mockResolvedValue({ id: "cus_new" } as never);
    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({ client_secret: "cs_secret_123" } as never);
  });

  it("returns 400 if priceId is missing", async () => {
    const res = await POST(makeRequest({ mode: "payment" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if mode is missing", async () => {
    const res = await POST(makeRequest({ priceId: "price_123" }));
    expect(res.status).toBe(400);
  });

  it("creates checkout session with quantity=1 when not specified", async () => {
    const res = await POST(makeRequest({ priceId: "price_123", mode: "subscription" }));
    expect(res.status).toBe(200);

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_123", quantity: 1 }],
        mode: "subscription",
      })
    );
  });

  it("creates checkout session with correct quantity for single credits", async () => {
    const res = await POST(makeRequest({ priceId: "price_single", mode: "payment", quantity: 7 }));
    expect(res.status).toBe(200);

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_single", quantity: 7 }],
        mode: "payment",
      })
    );
  });

  it("creates checkout session with quantity=15 for 15 credits", async () => {
    const res = await POST(makeRequest({ priceId: "price_single", mode: "payment", quantity: 15 }));
    expect(res.status).toBe(200);

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_single", quantity: 15 }],
      })
    );
  });

  it("returns clientSecret from Stripe session", async () => {
    const res = await POST(makeRequest({ priceId: "price_123", mode: "payment" }));
    const json = await res.json();
    expect(json.clientSecret).toBe("cs_secret_123");
  });

  it("sets userId in session metadata", async () => {
    await POST(makeRequest({ priceId: "price_123", mode: "payment" }));

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { userId: "user-123" },
      })
    );
  });

  it("creates Stripe customer if none exists", async () => {
    // No existing subscription/customer
    mockSupabaseChain.maybeSingle.mockResolvedValue({ data: null, error: null });

    await POST(makeRequest({ priceId: "price_123", mode: "payment" }));

    expect(stripe.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@test.com",
        metadata: { userId: "user-123" },
      })
    );
  });

  it("reuses existing Stripe customer if available", async () => {
    mockSupabaseChain.maybeSingle.mockResolvedValue({
      data: { stripe_customer_id: "cus_existing" },
      error: null,
    });

    await POST(makeRequest({ priceId: "price_123", mode: "payment" }));

    expect(stripe.customers.create).not.toHaveBeenCalled();
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_existing",
      })
    );
  });
});
