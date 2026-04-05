import { type NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Include subscription status for non-free plans
  if (data && data.plan !== "free") {
    const admin = createAdminClient();
    const { data: sub } = await admin
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (sub) {
      return NextResponse.json({
        ...data,
        subscription_status: sub.status,
        subscription_period_end: sub.current_period_end,
      });
    }
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser();
  if (error) return error;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.display_name !== undefined) updates.display_name = body.display_name;
  if (body.preferences !== undefined) updates.preferences = body.preferences;

  const { data, error: dbError } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user!.id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
