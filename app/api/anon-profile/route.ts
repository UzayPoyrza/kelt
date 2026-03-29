import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Safety-net endpoint called by AuthProvider after anonymous sign-in.
 * The handle_new_user trigger normally creates the profile, but if it
 * didn't fire or set wrong values, this ensures the profile is correct.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const isAnon = !!user.is_anonymous;
  const credits = isAnon ? 0 : 2;

  const { data: existing } = await admin
    .from("profiles")
    .select("id, is_anonymous, credits_remaining")
    .eq("id", user.id)
    .single();

  if (existing) {
    // Trigger already created the profile — ensure is_anonymous is correct
    if (isAnon && !existing.is_anonymous) {
      await admin
        .from("profiles")
        .update({ is_anonymous: true, display_name: "Guest", credits_remaining: 0 })
        .eq("id", existing.id);
    }
    return NextResponse.json({ ok: true, existing: true });
  }

  // Fallback: trigger didn't fire — create profile manually
  const { error: insertError } = await admin.from("profiles").insert({
    id: user.id,
    email: user.email ?? null,
    display_name: isAnon ? "Guest" : (user.user_metadata?.full_name ?? user.user_metadata?.name ?? "User"),
    avatar_url: user.user_metadata?.avatar_url ?? null,
    is_anonymous: isAnon,
    credits_remaining: credits,
    plan: "free",
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ ok: true, existing: true });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await admin.from("credit_ledger").insert({
    user_id: user.id,
    amount: credits,
    reason: isAnon ? "anonymous_signup" : "signup",
  });

  return NextResponse.json({ ok: true });
}
