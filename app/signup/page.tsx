"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Sparkles,
  Clock,
  Mic,
  Music,
  BookOpen,
  Loader2,
  ArrowRight,
  Check,
  X,
  Zap,
  ShieldCheck,
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
      <div
        className="absolute w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] rounded-full blur-[80px] sm:blur-[160px] opacity-[0.18]"
        style={{ top: "-5%", right: "-8%", background: "var(--color-sage)" }}
      />
      <div
        className="absolute w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] rounded-full blur-[70px] sm:blur-[140px] opacity-[0.12]"
        style={{ bottom: "5%", left: "-5%", background: "var(--color-ocean)" }}
      />
    </div>
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
  const protocol = searchParams.get("protocol");

  const [isGoogleHovered, setIsGoogleHovered] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | null>(null);

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

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

  // Build session description parts
  const sessionParts: string[] = [];
  if (duration) sessionParts.push(`${duration} min`);
  if (protocol) sessionParts.push(protocol);
  if (voice) sessionParts.push(`with ${voice}`);

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
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 pb-16 -mt-4">
        <div className="w-full max-w-[440px]">

          {/* ─── Session waiting card ─── */}
          {showSessionCard && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10"
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{ background: "var(--color-sand-900)" }}
              >
                {/* Gradient accent bar */}
                <div
                  className="h-1 w-full bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite]"
                  style={{ backgroundImage: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}
                />
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles className="w-4 h-4 text-[var(--color-sage)]" />
                    <p
                      className="text-[13px] text-white/90"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
                    >
                      Your meditation is ready to generate
                    </p>
                  </div>
                  <p
                    className="text-[18px] text-white leading-snug line-clamp-2 mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    &ldquo;{prompt}&rdquo;
                  </p>
                  {sessionParts.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {protocol && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] bg-[var(--color-sage)]/15 text-[var(--color-sage)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                          <Zap className="w-2.5 h-2.5" />{protocol}
                        </span>
                      )}
                      {duration && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] bg-white/10 text-white/70" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                          <Clock className="w-2.5 h-2.5" />{duration} min
                        </span>
                      )}
                      {voice && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] bg-white/10 text-white/70" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                          <Mic className="w-2.5 h-2.5" />{voice}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Title ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-6"
          >
            <h1
              className="text-[30px] sm:text-[38px] text-[var(--color-sand-900)] leading-[1.1] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {showSessionCard ? (
                <>Sign up to{" "}
                  <span
                    className="italic bg-clip-text text-transparent bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] py-1 -my-1 px-0.5"
                    style={{
                      backgroundImage: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))",
                      backgroundSize: "300% 300%",
                    }}
                  >generate</span>
                </>
              ) : (
                <>Create your{" "}
                  <span
                    className="italic bg-clip-text text-transparent bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] py-1 -my-1 px-0.5"
                    style={{
                      backgroundImage: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))",
                      backgroundSize: "300% 300%",
                    }}
                  >free account</span>
                </>
              )}
            </h1>
            <p
              className="text-[13px] text-[var(--color-sand-400)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              We only ask you to sign up to verify you&apos;re a real person.
            </p>
          </motion.div>

          {/* ─── Trust signals — big and bold ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-8 mb-8"
          >
            {[
              { text: "Free forever", type: "check" as const },
              { text: "No credit card", type: "x" as const },
              { text: "No emails", type: "x" as const },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5">
                {item.type === "check" ? (
                  <Check className="w-4.5 h-4.5 shrink-0" style={{ color: "var(--color-sage)" }} strokeWidth={3} />
                ) : (
                  <X className="w-4.5 h-4.5 shrink-0 text-red-400" strokeWidth={3} />
                )}
                <span
                  className="text-[14px] sm:text-[15px] text-[var(--color-sand-800)]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </motion.div>

          {/* ─── OAuth buttons ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3 mb-10"
          >
            {/* Google — primary */}
            <motion.button
              onClick={() => handleOAuthLogin("google")}
              disabled={loadingProvider !== null}
              onHoverStart={() => setIsGoogleHovered(true)}
              onHoverEnd={() => setIsGoogleHovered(false)}
              whileHover={loadingProvider ? {} : { y: -1 }}
              whileTap={loadingProvider ? {} : { scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-4.5 px-6 rounded-2xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-colors cursor-pointer shadow-xl shadow-[var(--color-sand-900)]/12 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {loadingProvider === "google" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <motion.div
                  animate={{ rotate: isGoogleHovered ? 360 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <GoogleIcon />
                </motion.div>
              )}
              <span className="text-[16px]" style={{ fontWeight: 500 }}>
                {loadingProvider === "google" ? "Connecting..." : "Continue with Google"}
              </span>
              {!loadingProvider && (
                <ArrowRight className="w-4.5 h-4.5 ml-1 opacity-40" />
              )}
            </motion.button>

            {/* Apple — secondary */}
            <motion.button
              onClick={() => handleOAuthLogin("apple")}
              disabled={loadingProvider !== null}
              whileHover={loadingProvider ? {} : { y: -1 }}
              whileTap={loadingProvider ? {} : { scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-4.5 px-6 rounded-2xl bg-white text-[var(--color-sand-900)] border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] hover:shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {loadingProvider === "apple" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <AppleIcon />
              )}
              <span className="text-[16px]" style={{ fontWeight: 500 }}>
                {loadingProvider === "apple" ? "Connecting..." : "Continue with Apple"}
              </span>
            </motion.button>
          </motion.div>

          {/* ─── Divider ─── */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="h-px w-full mb-8"
            style={{ background: "linear-gradient(90deg, transparent, var(--color-sand-200), transparent)" }}
          />

          {/* ─── Full access — 2x2 grid with checkmarks ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <p
              className="text-[11px] uppercase tracking-[0.15em] text-center text-[var(--color-sand-400)] mb-4"
              style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
            >
              Full access on free plan
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-3 max-w-sm sm:max-w-none mx-auto">
              {[
                { icon: Mic, text: "All 4 AI voices" },
                { icon: Music, text: "34 soundscapes" },
                { icon: Clock, text: "Any session length" },
                { icon: BookOpen, text: "Session library" },
              ].map((perk, i) => (
                <motion.div
                  key={perk.text}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2 sm:w-[160px]"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--color-sage-light)" }}
                  >
                    <perk.icon className="w-3.5 h-3.5" style={{ color: "var(--color-sage)" }} />
                  </div>
                  <span
                    className="text-[13px] text-[var(--color-sand-700)]"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                  >
                    {perk.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ─── Privacy assurance ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-sand-400)]" />
            <span
              className="text-[11px] text-[var(--color-sand-400)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Your data stays private. We never share or sell it.
            </span>
          </motion.div>

          {/* ─── Terms ─── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
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
