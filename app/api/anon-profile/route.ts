import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // No-op if profile already exists
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ ok: true, existing: true });
  }

  // Create anonymous profile with 1 credit
  const { error: insertError } = await admin.from("profiles").insert({
    id: user.id,
    email: null,
    display_name: "Guest",
    avatar_url: null,
    is_anonymous: true,
    credits_remaining: 1,
    plan: "free",
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Insert credit ledger entry
  await admin.from("credit_ledger").insert({
    user_id: user.id,
    amount: 1,
    reason: "anonymous_signup",
  });

  return NextResponse.json({ ok: true });
}
