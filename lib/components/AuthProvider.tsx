"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Runs once on app load. Checks for an existing session and logs status.
 * Visitors browse without auth until they sign up via OAuth.
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
        console.log(`[auth] Existing session: signed in (${user.id.slice(0, 8)})`);
        try {
          const res = await fetch("/api/user");
          if (res.ok) {
            const profile = await res.json();
            console.log(`[auth] OAuth user - ${profile.credits_remaining} credits remaining, plan: ${profile.plan}`);
          }
        } catch { /* ignore */ }
        return;
      }

      console.log("[auth] No session - user is browsing as guest");
    };

    init();
  }, []);

  return <>{children}</>;
}
