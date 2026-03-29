"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Runs once on app load. If no user session exists, signs in anonymously.
 * Supabase persists the session in cookies, so subsequent loads reuse
 * the same anonymous user.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const supabase = createClient();

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        console.log(`[auth] Existing session: ${user.is_anonymous ? "anonymous" : "signed in"} (${user.id.slice(0, 8)})`);
        try {
          const res = await fetch("/api/user");
          if (res.ok) {
            const profile = await res.json();
            if (user.is_anonymous) {
              console.log(`[auth] Anonymous user — ${profile.generations_today ?? 0}/2 daily sessions used`);
            } else {
              console.log(`[auth] OAuth user — ${profile.credits_remaining} credits remaining, plan: ${profile.plan}`);
            }
          }
        } catch { /* ignore */ }
        return;
      }

      console.log("[auth] No session — signing in anonymously");
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error || !data.user) {
          console.log("[auth] Anonymous auth unavailable:", error?.message);
          return;
        }
        console.log("[auth] Anonymous session created:", data.user.id);
        await fetch("/api/anon-profile", { method: "POST" });

        try {
          const res = await fetch("/api/user");
          if (res.ok) {
            const profile = await res.json();
            console.log(`[auth] Anonymous user — ${profile.generations_today ?? 0}/2 daily sessions used`);
          }
        } catch { /* ignore */ }
      } catch {
        // Anonymous auth disabled — user can still browse
      }
    };

    init();
  }, []);

  return <>{children}</>;
}
