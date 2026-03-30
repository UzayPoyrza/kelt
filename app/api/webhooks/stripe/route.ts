import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

const CREDIT_AMOUNTS: Record<string, number> = {
  personal: 30,
  creator: 100,
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) break;

      // Idempotency: skip if already processed (e.g. by verify-checkout)
      const { data: alreadyProcessed } = await supabase
        .from("credit_ledger")
        .select("id")
        .eq("user_id", userId)
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (alreadyProcessed) break;

      if (session.mode === "subscription") {
        const subscriptionId = session.subscription as string;
        // Ensure userId is set on the subscription metadata for future events
        await stripe.subscriptions.update(subscriptionId, {
          metadata: { userId },
        });
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);
        const recurring = sub.items.data[0]?.price.recurring;
        const billing = recurring && "interval" in recurring && recurring.interval === "year" ? "yearly" : "monthly";
        const credits = CREDIT_AMOUNTS[plan] || 30;

        // Get period dates from the subscription item (new Stripe API versions moved them here)
        const item0 = sub.items.data[0] as unknown as Record<string, unknown>;
        const periodStart = (item0?.current_period_start as number | undefined);
        const periodEnd = (item0?.current_period_end as number | undefined);

        // Upsert subscription
        await supabase.from("subscriptions").upsert({
          user_id: userId,
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
          .eq("id", userId);

        // Ledger entry
        await supabase.from("credit_ledger").insert({
          user_id: userId,
          amount: credits,
          reason: `${plan}_subscription`,
          stripe_session_id: session.id,
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId || await getUserIdFromCustomer(supabase, sub.customer as string);
      if (!userId) break;

      const priceId = sub.items.data[0]?.price.id;
      const plan = getPlanFromPriceId(priceId);
      const recurring = sub.items.data[0]?.price.recurring;
      const billing = recurring && "interval" in recurring && recurring.interval === "year" ? "yearly" : "monthly";
      // Get period dates from subscription item (new Stripe API versions moved them here)
      const item0Updated = sub.items.data[0] as unknown as Record<string, unknown>;
      const pStart = (item0Updated?.current_period_start as number | undefined);
      const pEnd = (item0Updated?.current_period_end as number | undefined);

      // Detect canceling state: subscription is still active but set to cancel at period end
      const isCanceling = sub.status === "active" && sub.cancel_at_period_end === true;
      const resolvedStatus = isCanceling ? "canceling" : sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : sub.status as string;

      await supabase
        .from("subscriptions")
        .update({
          plan,
          billing_cycle: billing,
          status: resolvedStatus,
          credits_per_month: CREDIT_AMOUNTS[plan] || 30,
          current_period_start: pStart ? new Date(pStart * 1000).toISOString() : null,
          current_period_end: pEnd ? new Date(pEnd * 1000).toISOString() : null,
        })
        .eq("user_id", userId);

      // Update profile plan and adjust credits on plan change
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("plan, credits_remaining")
        .eq("id", userId)
        .single();

      const updates: Record<string, unknown> = { plan };

      // If plan changed, add new plan's credits on top of existing balance
      if (currentProfile && currentProfile.plan !== plan) {
        const planCredits = CREDIT_AMOUNTS[plan] || 2;
        const existing = currentProfile.credits_remaining || 0;
        updates.credits_remaining = existing + planCredits;

        await supabase.from("credit_ledger").insert({
          user_id: userId,
          amount: planCredits,
          reason: `plan_change_${currentProfile.plan}_to_${plan}`,
        });
      }

      await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId || await getUserIdFromCustomer(supabase, sub.customer as string);
      if (!userId) break;

      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("user_id", userId);

      await supabase
        .from("profiles")
        .update({ plan: "free" })
        .eq("id", userId);
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceAny = invoice as unknown as Record<string, unknown>;
      const subscriptionId = invoiceAny.subscription as string | null;
      if (!subscriptionId || invoiceAny.billing_reason !== "subscription_cycle") break;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id, plan, credits_per_month")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

      if (!sub) break;

      const { data: profile } = await supabase
        .from("profiles")
        .select("credits_remaining")
        .eq("id", sub.user_id)
        .single();

      await supabase
        .from("profiles")
        .update({ credits_remaining: (profile?.credits_remaining || 0) + sub.credits_per_month })
        .eq("id", sub.user_id);

      await supabase.from("credit_ledger").insert({
        user_id: sub.user_id,
        amount: sub.credits_per_month,
        reason: "monthly_renewal",
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function getPlanFromPriceId(priceId: string): "personal" | "creator" {
  const personalPrices = [
    process.env.NEXT_PUBLIC_PRICE_PERSONAL_MONTHLY,
    process.env.NEXT_PUBLIC_PRICE_PERSONAL_YEARLY,
  ];
  if (personalPrices.includes(priceId)) return "personal";
  return "creator";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUserIdFromCustomer(supabase: any, customerId: string): Promise<string | null> {
  // First try the subscriptions table
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (data?.user_id) return data.user_id;

  // Fallback: check Stripe customer metadata
  try {
    const stripe = getStripe();
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted && customer.metadata?.userId) {
      return customer.metadata.userId;
    }
  } catch {
    // ignore
  }
  return null;
}
