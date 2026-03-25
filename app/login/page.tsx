"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  LayoutGrid,
  PenLine,
  Download,
  Shield,
  History,
  Wand2,
  Loader2,
} from "lucide-react";
import svgPaths from "@/lib/svg-paths";
import { createClient } from "@/lib/supabase/client";

/* ─── Logo ─── */

function Logo() {
  return (
    <svg width={36} height={38} fill="none" viewBox="0 0 36 37.8281">
      <path d={svgPaths.p1c4d2300} fill="currentColor" />
      <path d={svgPaths.p2128f680} fill="currentColor" />
      <path d={svgPaths.p1c2ff500} fill="currentColor" />
    </svg>
  );
}

/* ─── Icons ─── */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

/* ─── Script blocks for the mock editor ─── */

const mockBlocks = [
  { id: 1, type: "voice" as const, text: "Find a comfortable position. Let your body settle into wherever you are right now." },
  { id: 2, type: "pause" as const, label: "Pause", duration: "5s" },
  { id: 3, type: "voice" as const, text: "Gently close your eyes. Notice how you're feeling without judgment." },
  { id: 4, type: "pause" as const, label: "Pause", duration: "3s" },
  { id: 5, type: "voice" as const, text: "Take a slow, deep breath in through your nose…", selected: true },
  { id: 6, type: "pause" as const, label: "Pause", duration: "6s" },
  { id: 7, type: "voice" as const, text: "Release it slowly through your mouth. Let everything go." },
];

/* ─── Studio Preview — simplified, readable mock of the script editor ─── */

function StudioPreview() {
  let voiceNum = 0;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[var(--color-sand-200)] shadow-sm" style={{ background: "white" }}>
      {/* ─── Mock toolbar ─── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-sand-200)]"
        style={{ background: "var(--color-sand-50)" }}
      >
        <div className="flex items-center gap-2.5">
          <svg width={16} height={17} fill="none" viewBox="0 0 36 37.8281" className="text-[var(--color-sand-400)]">
            <path d={svgPaths.p1c4d2300} fill="currentColor" />
            <path d={svgPaths.p2128f680} fill="currentColor" />
            <path d={svgPaths.p1c2ff500} fill="currentColor" />
          </svg>
          <div className="w-px h-4 bg-[var(--color-sand-200)]" />
          <span className="text-[13px] text-[var(--color-sand-900)] italic" style={{ fontFamily: "var(--font-display)" }}>
            Deep sleep after a long day
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[var(--color-sage)] flex items-center gap-1" style={{ fontFamily: "var(--font-body)" }}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M6.5 12L2 7.5l1.4-1.4L6.5 9.2l6.1-6.1L14 4.5 6.5 12z" fill="currentColor"/></svg>
            Saved
          </span>
          <span className="text-[10px] text-[var(--color-sand-400)] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>
            4 segments · ~10 min
          </span>
        </div>
      </motion.div>

      {/* ─── Script blocks ─── */}
      <div className="px-5 py-4 space-y-0" style={{ background: "#fafaf9" }}>
        {mockBlocks.map((block, i) => {
          if (block.type === "pause") {
            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 + i * 0.06 }}
                className="flex items-center py-1.5 ml-10"
              >
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-px bg-[var(--color-sand-200)]" />
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-sand-50)] border border-[var(--color-sand-200)]">
                    <svg width="8" height="8" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.5 }}>
                      <rect x="2" y="2" width="3.5" height="10" rx="1" fill="var(--color-sand-400)" />
                      <rect x="8.5" y="2" width="3.5" height="10" rx="1" fill="var(--color-sand-400)" />
                    </svg>
                    <span className="text-[10px] text-[var(--color-sand-500)] tabular-nums" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{block.duration}</span>
                  </div>
                  <div className="flex-1 h-px bg-[var(--color-sand-200)]" />
                </div>
              </motion.div>
            );
          }

          const num = ++voiceNum;
          const isSelected = "selected" in block && block.selected;

          return (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-3 py-1"
            >
              {/* Number badge */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 text-[11px] tabular-nums transition-all"
                style={{
                  fontFamily: "var(--font-body)", fontWeight: 600,
                  background: isSelected ? "var(--color-sage)" : "white",
                  color: isSelected ? "#fff" : "var(--color-sand-500)",
                  border: isSelected ? "2px solid var(--color-sage)" : "2px solid var(--color-sand-200)",
                  boxShadow: isSelected ? "0 0 12px rgba(122,158,126,0.2)" : "none",
                }}
              >
                {num}
              </div>

              {/* Card */}
              <div
                className={`flex-1 rounded-xl px-4 py-3 transition-all ${
                  isSelected
                    ? "shadow-[0_2px_12px_rgba(122,158,126,0.12)]"
                    : ""
                }`}
                style={{
                  background: isSelected ? "var(--color-sage-light)" : "white",
                  border: isSelected ? "1px solid rgba(122,158,126,0.3)" : "1px solid var(--color-sand-200)",
                  borderLeft: isSelected ? "3px solid var(--color-sage)" : "3px solid transparent",
                }}
              >
                <p
                  className={`text-[13px] leading-relaxed ${isSelected ? "text-[var(--color-sand-900)]" : "text-[var(--color-sand-600)]"}`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {block.text}
                </p>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.3 }}
                    className="flex items-center gap-2 mt-2.5"
                  >
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] text-white" style={{ fontFamily: "var(--font-body)", fontWeight: 500, background: "var(--color-sage)" }}>
                      <PenLine className="w-2.5 h-2.5" /> Editing
                    </div>
                    <span className="text-[10px] text-[var(--color-sand-400)] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>
                      {90 - (block.text?.length || 0)} chars left
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Bottom bar ─── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-sand-200)]"
        style={{ background: "white" }}
      >
        <div className="flex items-center gap-3">
          {/* Voice pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-sage-light)] border border-[rgba(122,158,126,0.2)]">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-sage)" }} />
            <span className="text-[11px] text-[var(--color-sand-700)]" style={{ fontFamily: "var(--font-body)" }}>Aria</span>
          </div>
          {/* Sound pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(109,154,181,0.08)", border: "1px solid rgba(109,154,181,0.15)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-ocean)" }} />
            <span className="text-[11px] text-[var(--color-sand-700)]" style={{ fontFamily: "var(--font-body)" }}>Deep Night</span>
          </div>
        </div>

        {/* Generate button */}
        <div className="relative">
          <div
            className="absolute -inset-[2px] rounded-[10px] bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-70 blur-[1px]"
            style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}
          />
          <div
            className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] text-[var(--color-sand-50)] shadow-sm"
            style={{ fontFamily: "var(--font-body)", fontWeight: 600, background: "var(--color-sand-900)" }}
          >
            <Sparkles className="w-3 h-3" />
            Generate Audio
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Login Page ─── */

export default function LoginPage() {
  const [isHovered, setIsHovered] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | null>(null);

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setLoadingProvider(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex" style={{ background: "var(--color-sand-50)" }}>
      {/* Ambient bg for right side */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="grain-overlay absolute inset-0" />
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[180px] opacity-25"
          style={{ top: "10%", right: "-10%", background: "#c8d5ca" }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[140px] opacity-20"
          style={{ bottom: "10%", right: "20%", background: "#e8e4de" }}
        />
      </div>

      {/* ─── Left: Studio Preview ─── */}
      <div className="hidden lg:flex relative w-[60%] min-h-screen items-center justify-center p-8 xl:p-12 overflow-y-auto">
        {/* Background for left panel */}
        <div className="absolute inset-0 bg-white/40 border-r border-[var(--color-sand-200)]" />

        {/* Back to home */}
        <motion.a
          href="/"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-[var(--color-sand-900)] cursor-pointer"
        >
          <Logo />
          <span className="text-lg tracking-tight" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
            MindFlow
          </span>
        </motion.a>

        <div className="relative z-10 w-full max-w-2xl flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full"
          >
            <StudioPreview />
          </motion.div>

          {/* Studio features */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="grid grid-cols-2 xl:grid-cols-3 gap-3"
          >
            {[
              { icon: PenLine, title: "Edit scripts", desc: "Refine every word, pause, and breath cue", color: "#7a9e7e" },
              { icon: LayoutGrid, title: "All sessions", desc: "Access everything you've created in one place", color: "#6d9ab5" },
              { icon: History, title: "Full history", desc: "Revisit and replay any past session", color: "#8b7ea6" },
              { icon: Wand2, title: "Regenerate", desc: "Tweak and regenerate any section instantly", color: "#c4876c" },
              { icon: Download, title: "Download audio", desc: "Export sessions as high-quality audio files", color: "#7a9e7e" },
              { icon: Shield, title: "Commercial use", desc: "Full rights to every session you generate", color: "#6d9ab5" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-xl p-5 cursor-default transition-all duration-300 bg-white border border-[var(--color-sand-200)] shadow-sm hover:shadow-md"
              >
                {/* Accent glow on hover */}
                <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl" style={{ background: feature.color }} />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}25` }}>
                    <feature.icon className="w-[18px] h-[18px]" style={{ color: feature.color }} />
                  </div>
                  <p className="text-[14px] text-[var(--color-sand-900)] mb-1.5" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{feature.title}</p>
                  <p className="text-[12px] text-[var(--color-sand-500)] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ─── Right: Sign In ─── */}
      <div className="relative z-10 w-full lg:w-[40%] min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Logo on mobile only */}
        <motion.a
          href="/"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="absolute top-6 left-6 flex lg:hidden items-center gap-2 text-[var(--color-sand-900)] cursor-pointer"
        >
          <Logo />
          <span className="text-lg tracking-tight" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
            MindFlow
          </span>
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[2.75rem] text-[var(--color-sand-900)] leading-tight mb-3">
              Welcome to
              <br />
              <span className="italic bg-clip-text text-transparent bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite]" style={{ backgroundImage: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}>Kelt Studio</span>
            </h1>
            <p className="text-[var(--color-sand-500)] text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Sign in to edit, remix, and perfect your AI-generated meditations.
            </p>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-full"
          >
            <p
              className="text-xs uppercase tracking-widest text-[var(--color-sand-500)] mb-4 font-medium"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Sign in to continue
            </p>

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

            {/* Terms */}
            <p
              className="text-[var(--color-sand-500)] text-xs mt-6 leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              By continuing, you agree to our{" "}
              <a href="#" className="underline underline-offset-2 decoration-[var(--color-sand-400)] hover:text-[var(--color-sand-700)] transition-colors">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="underline underline-offset-2 decoration-[var(--color-sand-400)] hover:text-[var(--color-sand-700)] transition-colors">
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
