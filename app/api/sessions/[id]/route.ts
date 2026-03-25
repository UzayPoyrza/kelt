import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, error } = await getAuthUser();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, error } = await getAuthUser();
  if (error) return error;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) updates.title = body.title;
  if (body.script !== undefined) updates.script = body.script;
  if (body.voice !== undefined) updates.voice = body.voice;
  if (body.soundscape !== undefined) updates.soundscape = body.soundscape;
  if (body.duration !== undefined) updates.duration = body.duration;
  if (body.protocol !== undefined) updates.protocol = body.protocol;
  if (body.prompt !== undefined) updates.prompt = body.prompt;
  if (body.category !== undefined) updates.category = body.category;
  if (body.intent !== undefined) updates.intent = body.intent;

  const { data, error: dbError } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, error } = await getAuthUser();
  if (error) return error;

  const { error: dbError } = await supabase
    .from("sessions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
