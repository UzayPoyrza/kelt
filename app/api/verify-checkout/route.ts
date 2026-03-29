import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const CREDIT_AMOUNTS: Record<string, number> = {
  personal: 30,
  creator: 100,
};

function getPlanFromPriceId(priceId: string): "personal" | "creator" {
  const personalPrices = [
    process.env.NEXT_PUBLIC_PRICE_PERSONAL_MONTHLY,
    process.env.NEXT_PUBLIC_PRICE_PERSONAL_YEARLY,
  ];
  if (personalPrices.includes(priceId)) return "personal";
  return "creator";
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Session not paid" }, { status: 400 });
    }

    // Verify the session belongs to this user
    if (session.metadata?.userId !== user!.id) {
      return NextResponse.json({ error: "Session does not belong to user" }, { status: 403 });
    }

    const supabase = createAdminClient();

    // Idempotency: check if we already processed this checkout session
    const { data: existing } = await supabase
      .from("credit_ledger")
      .select("id")
      .eq("user_id", user!.id)
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    if (session.mode === "subscription") {
      const subscriptionId = session.subscription as string;
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = sub.items.data[0]?.price.id;
      const plan = getPlanFromPriceId(priceId);
      const recurring = sub.items.data[0]?.price.recurring;
      const billing = recurring && "interval" in recurring && recurring.interval === "year" ? "yearly" : "monthly";
      const credits = CREDIT_AMOUNTS[plan] || 30;

      const subAny = sub as unknown as Record<string, unknown>;
      const periodStart = subAny.current_period_start as number | undefined;
      const periodEnd = subAny.current_period_end as number | undefined;

      // Upsert subscription
      await supabase.from("subscriptions").upsert({
        user_id: user!.id,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        plan,
        billing_cycle: billing,
        credits_per_month: credits,
        status: "active",
        current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      }, { onConflict: "user_id" });

      // Update profile
      await supabase
        .from("profiles")
        .update({ plan, credits_remaining: credits })
        .eq("id", user!.id);

      // Ledger entry with stripe_session_id for idempotency
      await supabase.from("credit_ledger").insert({
        user_id: user!.id,
        amount: credits,
        reason: `${plan}_subscription`,
        stripe_session_id: session.id,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("verify-checkout error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
