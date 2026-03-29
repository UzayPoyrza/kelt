"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Volume2, Layers, BookOpen, Loader2, X } from "lucide-react";
import { GoogleIcon, AppleIcon } from "@/lib/oauth-icons";
import { createClient } from "@/lib/supabase/client";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  sessionSummary: {
    prompt: string;
    duration: number;
    voiceLabel: string;
    focusArea?: string;
  };
}

const perks = [
  { icon: Sparkles, text: "2 sessions per month, any length" },
  { icon: Volume2, text: "All 4 voices unlocked" },
  { icon: Layers, text: "All focus areas & advanced options" },
  { icon: BookOpen, text: "Personal session library" },
];

export default function SignupModal({ open, onClose, sessionSummary }: SignupModalProps) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setLoadingProvider(provider);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/create?prompt=${encodeURIComponent(sessionSummary.prompt)}`)}`;
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
  };

  // Build the session context line
  const contextParts = [`${sessionSummary.duration}-min`];
  if (sessionSummary.focusArea) contextParts.push(sessionSummary.focusArea.toLowerCase());
  contextParts.push("meditation");
  const sessionDescription = contextParts.join(" ");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-sm rounded-2xl border border-[var(--color-sand-200)] shadow-2xl overflow-hidden"
            style={{ background: "var(--color-sand-50)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-sand-400)] hover:text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] transition-all cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 pt-6 pb-5">
              {/* Session context */}
              <p
                className="text-[12px] text-[var(--color-sand-500)] text-center mb-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Your {sessionDescription} with {sessionSummary.voiceLabel} is ready
              </p>

              {/* Headline */}
              <h2
                className="text-[22px] text-[var(--color-sand-900)] text-center mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Create your free account
              </h2>

              {/* Value props */}
              <div className="space-y-2.5 mb-6">
                {perks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "color-mix(in srgb, var(--color-sage) 12%, transparent)" }}
                    >
                      <perk.icon className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                    </div>
                    <span
                      className="text-[13px] text-[var(--color-sand-700)]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {perk.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Google Button */}
              <motion.button
                onClick={() => handleOAuthLogin("google")}
                disabled={loadingProvider !== null}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                whileHover={loadingProvider ? {} : { y: -1 }}
                whileTap={loadingProvider ? {} : { scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-colors cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {loadingProvider === "google" ? (
                  <Loader2 className="w-[18px] h-[18px] animate-spin" />
                ) : (
                  <motion.div
                    animate={{ rotate: isHovered ? 360 : 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <GoogleIcon />
                  </motion.div>
                )}
                <span className="text-sm font-medium">
                  {loadingProvider === "google" ? "Connecting..." : "Continue with Google"}
                </span>
              </motion.button>

              {/* Apple Button */}
              <motion.button
                onClick={() => handleOAuthLogin("apple")}
                disabled={loadingProvider !== null}
                whileHover={loadingProvider ? {} : { y: -1 }}
                whileTap={loadingProvider ? {} : { scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-white/60 text-[var(--color-sand-900)] border border-[var(--color-sand-200)] hover:bg-white hover:shadow-sm transition-all cursor-pointer mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {loadingProvider === "apple" ? (
                  <Loader2 className="w-[18px] h-[18px] animate-spin" />
                ) : (
                  <AppleIcon />
                )}
                <span className="text-sm font-medium">
                  {loadingProvider === "apple" ? "Connecting..." : "Continue with Apple"}
                </span>
              </motion.button>

              {/* Reassurance */}
              <p
                className="text-[10px] text-[var(--color-sand-400)] text-center mt-4"
                style={{ fontFamily: "var(--font-body)" }}
              >
                No credit card required
              </p>

              {/* Maybe later */}
              <button
                onClick={onClose}
                className="w-full text-center text-[11px] text-[var(--color-sand-400)] hover:text-[var(--color-sand-600)] transition-colors mt-2 cursor-pointer"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
