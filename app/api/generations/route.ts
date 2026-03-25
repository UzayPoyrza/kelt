import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";

export async function GET(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");
  const status = searchParams.get("status");
  const sessionIdFilter = searchParams.get("session_id");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("generations")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }
  if (sessionIdFilter) {
    query = query.eq("session_id", sessionIdFilter);
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
