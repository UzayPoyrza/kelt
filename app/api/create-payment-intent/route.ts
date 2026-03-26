import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser();
  if (error) return error;

  try {
    const body = await request.json();
    const { priceId, mode, quantity } = body;

    if (!priceId || !mode) {
      return NextResponse.json(
        { error: "priceId and mode are required" },
        { status: 400 }
      );
    }

    // Look up or create Stripe customer
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user!.id)
      .maybeSingle();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user!.id)
        .single();

      const customer = await stripe.customers.create({
        email: profile?.email || undefined,
        metadata: { userId: user!.id },
      });
      customerId = customer.id;
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Use embedded Checkout Session — works for both subscriptions and one-time
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: mode as "subscription" | "payment",
      line_items: [{ price: priceId, quantity: quantity || 1 }],
      ui_mode: "embedded",
      return_url: `${origin}/studio?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      metadata: { userId: user!.id },
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
    });
  } catch (err: unknown) {
    console.error("create-payment-intent error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
