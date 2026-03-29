import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/studio";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure a profile row exists (fallback if DB trigger didn't fire)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const admin = createAdminClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("id, is_anonymous")
          .eq("id", user.id)
          .single();

        if (profile && profile.is_anonymous) {
          // Anonymous user linking to a real account — upgrade credits
          await admin.rpc("upgrade_anonymous_to_free", { target_user_id: user.id });
          // Update profile with real user info from OAuth
          await admin
            .from("profiles")
            .update({
              email: user.email,
              display_name:
                user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
              avatar_url: user.user_metadata?.avatar_url ?? null,
            })
            .eq("id", user.id);
        } else if (!profile) {
          await admin.from("profiles").insert({
            id: user.id,
            email: user.email,
            display_name:
              user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
          });
        }
      }

      // Validate next param to prevent open redirects
      const safePath = next.startsWith("/") && !next.startsWith("//") ? next : "/studio";
      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  // Auth error — redirect to login with error indicator
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
