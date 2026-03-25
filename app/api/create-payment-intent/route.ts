import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser();
  if (error) return error;

  const body = await request.json();
  const { priceId, mode } = body;

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

  if (mode === "subscription") {
    // Look up the price to get the amount for display
    const price = await stripe.prices.retrieve(priceId);

    // Create a subscription with incomplete status to get a client secret
    const sub = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { userId: user!.id },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoice = sub.latest_invoice as any;
    const paymentIntent = invoice.payment_intent as import("stripe").Stripe.PaymentIntent;

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: sub.id,
      amount: price.unit_amount,
      currency: price.currency,
    });
  } else {
    // One-time payment
    const price = await stripe.prices.retrieve(priceId);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount!,
      currency: price.currency,
      customer: customerId,
      metadata: { userId: user!.id, priceId },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: price.unit_amount,
      currency: price.currency,
    });
  }
}
