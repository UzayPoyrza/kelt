"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Clock,
  Mic,
  Music,
  BookOpen,
  Loader2,
  ArrowRight,
  Check,
  Shield,
} from "lucide-react";
import svgPaths from "@/lib/svg-paths";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon, AppleIcon } from "@/lib/oauth-icons";

/* ─── Logo ─── */

function Logo() {
  return (
    <svg width={32} height={34} fill="none" viewBox="0 0 36 37.8281">
      <path d={svgPaths.p1c4d2300} fill="currentColor" />
      <path d={svgPaths.p2128f680} fill="currentColor" />
      <path d={svgPaths.p1c2ff500} fill="currentColor" />
    </svg>
  );
}

/* ─── Floating orb background ─── */

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="grain-overlay absolute inset-0" />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.18]"
        style={{ top: "-5%", right: "-8%", background: "var(--color-sage)" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[140px] opacity-[0.12]"
        style={{ bottom: "5%", left: "-5%", background: "var(--color-ocean)" }}
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full blur-[120px] opacity-[0.10]"
        style={{ top: "40%", left: "50%", background: "var(--color-dusk)" }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ─── Perks list ─── */

const perks = [
  { icon: Sparkles, text: "2 sessions every month", detail: "Any length, any topic" },
  { icon: Mic, text: "All 4 AI voices", detail: "Each with unique personality" },
  { icon: Music, text: "34 ambient soundscapes", detail: "Rain, bowls, binaural & more" },
  { icon: BookOpen, text: "Personal session library", detail: "Access past sessions anytime" },
];

/* ─── Session preview card (shown when coming from /create) ─── */

function SessionPreviewCard({
  prompt,
  duration,
  voice,
}: {
  prompt: string;
  duration: string | null;
  voice: string | null;
}) {
  if (!prompt) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full mb-8"
    >
      <div
        className="relative rounded-2xl p-[1px] overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(122,158,126,0.4), rgba(109,154,181,0.3), rgba(139,126,166,0.3), rgba(196,135,108,0.2))",
        }}
      >
        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: "rgba(250,249,247,0.95)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean))",
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] uppercase tracking-widest text-[var(--color-sage)] mb-1"
                style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
              >
                Your meditation is ready
              </p>
              <p
                className="text-[15px] text-[var(--color-sand-900)] leading-snug line-clamp-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                &ldquo;{prompt}&rdquo;
              </p>
              {(duration || voice) && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {duration && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border border-[var(--color-sand-200)]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        color: "var(--color-sand-600)",
                        background: "white",
                      }}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {duration} min
                    </span>
                  )}
                  {voice && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border border-[var(--color-sand-200)]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        color: "var(--color-sand-600)",
                        background: "white",
                      }}
                    >
                      <Mic className="w-2.5 h-2.5" />
                      {voice}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Signup Page ─── */

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/studio";
  const prompt = searchParams.get("prompt");
  const duration = searchParams.get("duration");
  const voice = searchParams.get("voice");

  const [isGoogleHovered, setIsGoogleHovered] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | null>(null);
  const [showPerks, setShowPerks] = useState(false);

  // Stagger perks after mount
  useEffect(() => {
    const t = setTimeout(() => setShowPerks(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setLoadingProvider(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  const showSessionCard = !!prompt;

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: "var(--color-sand-50)" }}
    >
      <FloatingOrbs />

      {/* ─── Header ─── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5"
      >
        <a href="/" className="flex items-center gap-2.5 text-[var(--color-sand-900)] cursor-pointer">
          <Logo />
          <span
            className="text-[17px] tracking-tight"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
          >
            Incraft
          </span>
        </a>
        <button
          onClick={() => router.back()}
          className="text-[12px] text-[var(--color-sand-400)] hover:text-[var(--color-sand-600)] transition-colors cursor-pointer"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Back
        </button>
      </motion.header>

      {/* ─── Main content ─── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 pb-12 -mt-8">
        <div className="w-full max-w-[400px]">
          {/* Session preview card */}
          {showSessionCard && (
            <SessionPreviewCard prompt={prompt} duration={duration} voice={voice} />
          )}

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-8"
          >
            {showSessionCard ? (
              <>
                <h1
                  className="text-[28px] sm:text-[34px] text-[var(--color-sand-900)] leading-[1.15] mb-2.5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Sign up to generate
                </h1>
                <p
                  className="text-[14px] text-[var(--color-sand-500)] leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Free forever. No credit card needed.
                </p>
              </>
            ) : (
              <>
                <h1
                  className="text-[28px] sm:text-[34px] text-[var(--color-sand-900)] leading-[1.15] mb-2.5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Welcome to{" "}
                  <span
                    className="italic bg-clip-text text-transparent bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite]"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))",
                      backgroundSize: "300% 300%",
                    }}
                  >
                    Incraft
                  </span>
                </h1>
                <p
                  className="text-[14px] text-[var(--color-sand-500)] leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  AI-crafted meditations, completely free.
                </p>
              </>
            )}
          </motion.div>

          {/* ─── OAuth buttons ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3 mb-6"
          >
            {/* Google — primary */}
            <motion.button
              onClick={() => handleOAuthLogin("google")}
              disabled={loadingProvider !== null}
              onHoverStart={() => setIsGoogleHovered(true)}
              onHoverEnd={() => setIsGoogleHovered(false)}
              whileHover={loadingProvider ? {} : { y: -1 }}
              whileTap={loadingProvider ? {} : { scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-colors cursor-pointer shadow-lg shadow-[var(--color-sand-900)]/10 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {loadingProvider === "google" ? (
                <Loader2 className="w-[18px] h-[18px] animate-spin" />
              ) : (
                <motion.div
                  animate={{ rotate: isGoogleHovered ? 360 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <GoogleIcon />
                </motion.div>
              )}
              <span className="text-[15px]" style={{ fontWeight: 500 }}>
                {loadingProvider === "google" ? "Connecting..." : "Continue with Google"}
              </span>
              {!loadingProvider && (
                <ArrowRight className="w-4 h-4 ml-1 opacity-40" />
              )}
            </motion.button>

            {/* Apple — secondary */}
            <motion.button
              onClick={() => handleOAuthLogin("apple")}
              disabled={loadingProvider !== null}
              whileHover={loadingProvider ? {} : { y: -1 }}
              whileTap={loadingProvider ? {} : { scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white text-[var(--color-sand-900)] border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] hover:shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {loadingProvider === "apple" ? (
                <Loader2 className="w-[18px] h-[18px] animate-spin" />
              ) : (
                <AppleIcon />
              )}
              <span className="text-[15px]" style={{ fontWeight: 500 }}>
                {loadingProvider === "apple" ? "Connecting..." : "Continue with Apple"}
              </span>
            </motion.button>
          </motion.div>

          {/* ─── Free badge ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-[var(--color-sage)]" />
              <span
                className="text-[11px] text-[var(--color-sand-500)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Free forever
              </span>
            </div>
            <div className="w-px h-3 bg-[var(--color-sand-200)]" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-[var(--color-sage)]" />
              <span
                className="text-[11px] text-[var(--color-sand-500)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                No credit card
              </span>
            </div>
            <div className="w-px h-3 bg-[var(--color-sand-200)]" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[var(--color-sage)]" />
              <span
                className="text-[11px] text-[var(--color-sand-500)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                5 seconds
              </span>
            </div>
          </motion.div>

          {/* ─── Divider ─── */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="h-px w-full mb-7"
            style={{ background: "linear-gradient(90deg, transparent, var(--color-sand-200), transparent)" }}
          />

          {/* ─── What you get ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <p
              className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-sand-400)] text-center mb-4"
              style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
            >
              Included free
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <AnimatePresence>
                {showPerks &&
                  perks.map((perk, i) => (
                    <motion.div
                      key={perk.text}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.05 * i,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="group rounded-xl px-3.5 py-3 border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] transition-all bg-white/60 hover:bg-white"
                    >
                      <perk.icon className="w-4 h-4 text-[var(--color-sage)] mb-2" />
                      <p
                        className="text-[12px] text-[var(--color-sand-800)] leading-snug"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                      >
                        {perk.text}
                      </p>
                      <p
                        className="text-[10px] text-[var(--color-sand-400)] mt-0.5 leading-snug"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {perk.detail}
                      </p>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ─── Terms ─── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-[11px] text-[var(--color-sand-400)] text-center leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="underline underline-offset-2 decoration-[var(--color-sand-300)] hover:text-[var(--color-sand-600)] transition-colors"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline underline-offset-2 decoration-[var(--color-sand-300)] hover:text-[var(--color-sand-600)] transition-colors"
            >
              Privacy Policy
            </a>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
