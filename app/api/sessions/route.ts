import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";

export async function GET(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("sessions")
    .select("*, generations(count)")
    .eq("user_id", user!.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`title.ilike.%${search}%,prompt.ilike.%${search}%`);
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const sessions = (data || []).map((s: Record<string, unknown>) => ({
    ...s,
    has_generation: Array.isArray(s.generations) && s.generations.length > 0
      ? (s.generations[0] as { count: number }).count > 0
      : false,
    generations: undefined,
  }));

  return NextResponse.json(sessions);
}

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser();
  if (error) return error;

  const body = await request.json();

  const { data, error: dbError } = await supabase
    .from("sessions")
    .insert({
      user_id: user!.id,
      title: body.title || null,
      prompt: body.prompt || null,
      voice: body.voice || null,
      duration: body.duration || null,
      protocol: body.protocol || null,
      soundscape: body.soundscape || null,
      script: body.script || null,
      category: body.category || null,
      intent: body.intent || null,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
