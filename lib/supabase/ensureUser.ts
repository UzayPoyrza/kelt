import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Ensures a Supabase user exists. If no session, creates an anonymous one.
 * Returns the user or null if anonymous auth is unavailable.
 *
 * Call this lazily (e.g., when user clicks Generate) — NOT on page load —
 * to avoid creating unnecessary anonymous users from browsing.
 */
export async function ensureUser(): Promise<User | null> {
  const supabase = createClient();

  // Check existing session first
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return session.user;

  // No session — create anonymous
  console.log("[auth] Creating anonymous session for generation");
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      console.error("[auth] Anonymous sign-in failed:", error?.message);
      return null;
    }
    console.log("[auth] Anonymous session created:", data.user.id);

    // Create profile (safety net if DB trigger didn't fire)
    await fetch("/api/anon-profile", { method: "POST" });

    return data.user;
  } catch {
    return null;
  }
}
