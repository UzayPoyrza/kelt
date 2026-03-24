"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Volume2,
  Layers,
  Wand2,
  Clock,
  Mic,
} from "lucide-react";
import svgPaths from "@/lib/svg-paths";

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

/* ─── Studio Timeline Track ─── */

function TimelineTrack({
  label,
  icon: Icon,
  color,
  segments,
  delay,
}: {
  label: string;
  icon: React.ElementType;
  color: string;
  segments: { start: number; width: number; opacity?: number }[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-3"
    >
      <div className="w-24 flex items-center gap-2 shrink-0">
        <Icon className="w-3.5 h-3.5 text-[var(--color-sand-500)]" />
        <span className="text-xs text-[var(--color-sand-600)] truncate" style={{ fontFamily: "var(--font-body)" }}>
          {label}
        </span>
      </div>
      <div className="flex-1 h-8 rounded-lg bg-[var(--color-sand-100)] relative overflow-hidden">
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            className="absolute top-1 bottom-1 rounded-md"
            style={{
              left: `${seg.start}%`,
              width: `${seg.width}%`,
              background: color,
              opacity: seg.opacity ?? 0.7,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: delay + 0.1 + i * 0.08, duration: 0.4, ease: "easeOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Interactive Studio Preview ─── */

function StudioPreview() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPos, setPlayheadPos] = useState(32);
  const [activeTab, setActiveTab] = useState<"timeline" | "mix">("timeline");

  return (
    <div className="w-full h-full flex flex-col">
      {/* Studio Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between mb-5"
      >
        <div>
          <h3 className="text-lg text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-display)" }}>
            Kilt Studio
          </h3>
          <p className="text-xs text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>
            Edit, remix, and perfect your meditations
          </p>
        </div>
        <div className="flex gap-1">
          {(["timeline", "mix"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)]"
                  : "text-[var(--color-sand-500)] hover:bg-[var(--color-sand-100)]"
              }`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Session Info Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2 mb-4"
      >
        <span className="px-2.5 py-1 rounded-full bg-[var(--color-sage-light)] text-[var(--color-sage)] text-xs" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
          Stress Relief
        </span>
        <span className="px-2.5 py-1 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs" style={{ fontFamily: "var(--font-body)" }}>
          10 min
        </span>
        <span className="px-2.5 py-1 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs" style={{ fontFamily: "var(--font-body)" }}>
          Serene voice
        </span>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "timeline" ? (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Timeline Ruler */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 mb-3"
            >
              <div className="w-24 shrink-0" />
              <div className="flex-1 flex justify-between px-1">
                {["0:00", "2:30", "5:00", "7:30", "10:00"].map((t) => (
                  <span key={t} className="text-[10px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Tracks */}
            <div className="flex-1 space-y-2 relative">
              <TimelineTrack
                label="Voice"
                icon={Mic}
                color="var(--color-sage)"
                segments={[
                  { start: 2, width: 22 },
                  { start: 28, width: 18 },
                  { start: 52, width: 25 },
                  { start: 82, width: 15 },
                ]}
                delay={0.5}
              />
              <TimelineTrack
                label="Guidance"
                icon={Wand2}
                color="var(--color-dusk)"
                segments={[
                  { start: 0, width: 30, opacity: 0.5 },
                  { start: 35, width: 20, opacity: 0.7 },
                  { start: 60, width: 35, opacity: 0.5 },
                ]}
                delay={0.6}
              />
              <TimelineTrack
                label="Pauses"
                icon={Clock}
                color="var(--color-sand-400)"
                segments={[
                  { start: 24, width: 4, opacity: 0.4 },
                  { start: 47, width: 5, opacity: 0.4 },
                  { start: 78, width: 4, opacity: 0.4 },
                ]}
                delay={0.7}
              />
              <TimelineTrack
                label="Ambient"
                icon={Volume2}
                color="var(--color-ocean)"
                segments={[{ start: 0, width: 100, opacity: 0.3 }]}
                delay={0.8}
              />
              <TimelineTrack
                label="Binaural"
                icon={Layers}
                color="var(--color-ember)"
                segments={[
                  { start: 5, width: 40, opacity: 0.4 },
                  { start: 50, width: 45, opacity: 0.5 },
                ]}
                delay={0.9}
              />

              {/* Playhead */}
              <motion.div
                className="absolute top-0 bottom-0 w-[2px] bg-[var(--color-sand-900)] z-10 pointer-events-none"
                style={{ left: `calc(${playheadPos}% + 108px - ${playheadPos * 1.08}px + ${playheadPos}% * 0)` }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  left: isPlaying ? "calc(100%)" : `calc(24px + ${playheadPos}% * 0.76 + 72px)`,
                }}
                transition={isPlaying ? { duration: 8, ease: "linear" } : { duration: 0.3 }}
              >
                <div className="w-2 h-2 rounded-full bg-[var(--color-sand-900)] -translate-x-[3px] -translate-y-1" />
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="mix"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col gap-3"
          >
            {/* Mix Sliders */}
            {[
              { label: "Voice Volume", value: 80, color: "var(--color-sage)" },
              { label: "Ambient Level", value: 45, color: "var(--color-ocean)" },
              { label: "Binaural Depth", value: 30, color: "var(--color-ember)" },
              { label: "Reverb", value: 55, color: "var(--color-dusk)" },
              { label: "Fade In/Out", value: 65, color: "var(--color-sand-500)" },
            ].map((slider, i) => (
              <motion.div
                key={slider.label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex items-center gap-3"
              >
                <span className="w-28 text-xs text-[var(--color-sand-600)] shrink-0" style={{ fontFamily: "var(--font-body)" }}>
                  {slider.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-[var(--color-sand-100)] relative overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: slider.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${slider.value}%` }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>
                  {slider.value}%
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transport Controls */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-5 pt-4 border-t border-[var(--color-sand-200)] flex items-center justify-between"
      >
        <div className="flex items-center gap-1">
          {[
            { icon: Scissors, label: "Split" },
            { icon: Wand2, label: "Regenerate" },
            { icon: Layers, label: "Layers" },
          ].map((tool) => (
            <button
              key={tool.label}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[var(--color-sand-500)] hover:bg-[var(--color-sand-100)] hover:text-[var(--color-sand-700)] transition-all cursor-pointer"
            >
              <tool.icon className="w-3.5 h-3.5" />
              <span className="text-[10px]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{tool.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-sand-500)] hover:bg-[var(--color-sand-100)] transition-colors cursor-pointer">
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-colors cursor-pointer shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-sand-500)] hover:bg-[var(--color-sand-100)] transition-colors cursor-pointer">
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-xs text-[var(--color-sand-500)] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>
          3:12 / 10:00
        </span>
      </motion.div>
    </div>
  );
}

/* ─── Login Page ─── */

export default function LoginPage() {
  const [isHovered, setIsHovered] = useState(false);

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
      <div className="hidden md:flex relative w-[55%] lg:w-[60%] min-h-screen items-center justify-center p-8 lg:p-12">
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

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative z-10 w-full max-w-2xl bg-white rounded-3xl p-7 lg:p-9 shadow-sm border border-[var(--color-sand-200)]"
          style={{ minHeight: 420 }}
        >
          <StudioPreview />
        </motion.div>
      </div>

      {/* ─── Right: Sign In ─── */}
      <div className="relative z-10 w-full md:w-[45%] lg:w-[40%] min-h-screen flex flex-col items-center justify-center px-8 md:px-12 lg:px-16">
        {/* Logo on mobile only */}
        <motion.a
          href="/"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="absolute top-6 left-6 flex md:hidden items-center gap-2 text-[var(--color-sand-900)] cursor-pointer"
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
            <h1 className="text-[2.25rem] md:text-[2.75rem] text-[var(--color-sand-900)] leading-tight mb-3">
              Welcome to
              <br />
              <span className="italic">Kilt Studio</span>
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
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-colors cursor-pointer shadow-sm"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <GoogleIcon />
              </motion.div>
              <span className="text-sm font-medium">Continue with Google</span>
            </motion.button>

            {/* Apple Button */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-white/60 text-[var(--color-sand-900)] border border-[var(--color-sand-200)] hover:bg-white hover:shadow-sm transition-all cursor-pointer mt-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <AppleIcon />
              <span className="text-sm font-medium">Continue with Apple</span>
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
