"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid,
  Clock,
  Sparkles,
  Settings,
  Play,
  Pause,
  Download,
  MoreHorizontal,
  Search,
  LogOut,
  Moon,
  Sun,
  Brain,
  Wind,
  Heart,
} from "lucide-react";
import svgPaths from "@/lib/svg-paths";

/* ─── Logo ─── */

function Logo() {
  return (
    <svg width={28} height={30} fill="none" viewBox="0 0 36 37.8281">
      <path d={svgPaths.p1c4d2300} fill="currentColor" />
      <path d={svgPaths.p2128f680} fill="currentColor" />
      <path d={svgPaths.p1c2ff500} fill="currentColor" />
    </svg>
  );
}

/* ─── Mock Data ─── */

const mockSessions = [
  {
    id: "1",
    title: "Deep sleep after a long day",
    duration: "15 min",
    voice: "Aria",
    protocol: "CBT-I + NSDR",
    sound: "Deep Night",
    createdAt: "2 hours ago",
    category: "sleep",
    icon: Moon,
  },
  {
    id: "2",
    title: "Morning focus before standup",
    duration: "10 min",
    voice: "James",
    protocol: "MBSR",
    sound: "Flow State",
    createdAt: "Yesterday",
    category: "focus",
    icon: Sun,
  },
  {
    id: "3",
    title: "Calm my nerves before the flight",
    duration: "8 min",
    voice: "Kai",
    protocol: "HRV-BF + ACT",
    sound: "Still Water",
    createdAt: "2 days ago",
    category: "anxiety",
    icon: Heart,
  },
  {
    id: "4",
    title: "Stress relief after deadline",
    duration: "20 min",
    voice: "Luna",
    protocol: "PMR + ACT",
    sound: "Safe Harbor",
    createdAt: "3 days ago",
    category: "stress",
    icon: Wind,
  },
  {
    id: "5",
    title: "Quick breathing reset",
    duration: "5 min",
    voice: "Aria",
    protocol: "HRV-BF",
    sound: "Sanctuary",
    createdAt: "Last week",
    category: "focus",
    icon: Brain,
  },
  {
    id: "6",
    title: "Wind down for bed",
    duration: "15 min",
    voice: "Luna",
    protocol: "NSDR",
    sound: "Soft Drift",
    createdAt: "Last week",
    category: "sleep",
    icon: Moon,
  },
];

const navItems = [
  { id: "sessions" as const, label: "All Sessions", icon: LayoutGrid },
  { id: "history" as const, label: "History", icon: Clock },
  { id: "generate" as const, label: "Generate", icon: Sparkles },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

type NavId = (typeof navItems)[number]["id"];

/* ─── Session Card ─── */

function SessionCard({
  session,
  delay,
}: {
  session: (typeof mockSessions)[number];
  delay: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const Icon = session.icon;

  const categoryColors: Record<string, { bg: string; text: string }> = {
    sleep: { bg: "var(--color-dusk-light)", text: "var(--color-dusk)" },
    focus: { bg: "var(--color-sage-light)", text: "var(--color-sage)" },
    anxiety: { bg: "var(--color-ocean-light)", text: "var(--color-ocean)" },
    stress: { bg: "var(--color-ember-light)", text: "var(--color-ember)" },
  };

  const colors = categoryColors[session.category] || categoryColors.focus;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-xl border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      {/* Top accent */}
      <div className="h-1 w-full" style={{ background: colors.text, opacity: 0.15 }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: colors.bg }}
            >
              <Icon className="w-4 h-4" style={{ color: colors.text }} />
            </div>
            <div>
              <h3
                className="text-sm text-[var(--color-sand-900)] leading-snug"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {session.title}
              </h3>
              <p
                className="text-[10px] text-[var(--color-sand-400)] mt-0.5"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {session.createdAt}
              </p>
            </div>
          </div>

          {/* Actions — visible on hover */}
          <div className={`flex items-center gap-1 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className="w-7 h-7 rounded-full bg-[var(--color-sand-900)] text-[var(--color-sand-50)] flex items-center justify-center hover:bg-[var(--color-sand-800)] transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3 ml-0.5" />
              )}
            </button>
            <button className="w-7 h-7 rounded-full hover:bg-[var(--color-sand-100)] flex items-center justify-center text-[var(--color-sand-400)] transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className="px-2 py-0.5 rounded-full text-[10px]"
            style={{ fontFamily: "var(--font-body)", background: colors.bg, color: colors.text }}
          >
            {session.protocol}
          </span>
          <span
            className="px-2 py-0.5 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-600)] text-[10px]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {session.duration}
          </span>
          <span
            className="px-2 py-0.5 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-600)] text-[10px]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {session.voice}
          </span>
          <span
            className="px-2 py-0.5 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-600)] text-[10px]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {session.sound}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Empty State ─── */

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-sand-100)] flex items-center justify-center mb-5">
        <Sparkles className="w-6 h-6 text-[var(--color-sand-400)]" />
      </div>
      <h3
        className="text-lg text-[var(--color-sand-900)] mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {label}
      </h3>
      <p
        className="text-sm text-[var(--color-sand-500)] max-w-xs"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Generate your first meditation to see it here.
      </p>
    </div>
  );
}

/* ─── Main Studio Page ─── */

export default function StudioPage() {
  const [activeNav, setActiveNav] = useState<NavId>("sessions");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatePrompt, setGeneratePrompt] = useState("");

  const filteredSessions = mockSessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-sand-50)" }}>
      {/* ─── Sidebar ─── */}
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="w-56 shrink-0 border-r border-[var(--color-sand-200)] bg-white flex flex-col"
        style={{ minHeight: "100vh" }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <a href="/" className="flex items-center gap-2 text-[var(--color-sand-900)]">
            <Logo />
            <div>
              <span
                className="text-sm tracking-tight block"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
              >
                Kilt Studio
              </span>
              <span
                className="text-[10px] text-[var(--color-sand-400)] block -mt-0.5"
                style={{ fontFamily: "var(--font-body)" }}
              >
                by MindFlow
              </span>
            </div>
          </a>
        </div>

        {/* Generate — prominent top action */}
        <div className="px-3 mb-4">
          <button
            onClick={() => setActiveNav("generate")}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
              activeNav === "generate"
                ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm"
                : "bg-[var(--color-sage-light)] text-[var(--color-sage)] hover:bg-[var(--color-sage)] hover:text-white"
            }`}
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item, i) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm"
                    : "text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] hover:text-[var(--color-sand-900)]"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom — user + logout */}
        <div className="px-3 pb-5 space-y-2">
          <div className="border-t border-[var(--color-sand-100)] pt-4 px-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-sand-200)] flex items-center justify-center">
                <span
                  className="text-xs text-[var(--color-sand-600)]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                >
                  U
                </span>
              </div>
              <div>
                <p
                  className="text-xs text-[var(--color-sand-900)]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                >
                  User
                </p>
                <p
                  className="text-[10px] text-[var(--color-sand-400)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Free plan
                </p>
              </div>
            </div>
            <a
              href="/"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)] hover:bg-[var(--color-sand-100)] transition-all text-xs"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </a>
          </div>
        </div>
      </motion.aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 min-h-screen">
        {/* Top bar */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="sticky top-0 z-10 bg-[var(--color-sand-50)]/80 backdrop-blur-md border-b border-[var(--color-sand-200)] px-8 py-4"
        >
          <div className="flex items-center justify-between">
            <h1
              className="text-xl text-[var(--color-sand-900)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {activeNav === "sessions" && "All Sessions"}
              {activeNav === "history" && "History"}
              {activeNav === "generate" && "Generate"}
              {activeNav === "settings" && "Settings"}
            </h1>

            {activeNav === "sessions" && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-sand-400)]" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 pl-9 pr-3 py-2 rounded-lg bg-white border border-[var(--color-sand-200)] text-sm text-[var(--color-sand-900)] placeholder:text-[var(--color-sand-400)] focus:outline-none focus:border-[var(--color-sand-400)] transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                />
              </div>
            )}
          </div>
        </motion.header>

        {/* Content Area */}
        <div className="px-8 py-6">
          <AnimatePresence mode="wait">
            {/* All Sessions */}
            {activeNav === "sessions" && (
              <motion.div key="sessions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {filteredSessions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredSessions.map((session, i) => (
                      <SessionCard key={session.id} session={session} delay={i * 0.05} />
                    ))}
                  </div>
                ) : (
                  <EmptyState label={searchQuery ? "No sessions found" : "No sessions yet"} />
                )}
              </motion.div>
            )}

            {/* History */}
            {activeNav === "history" && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="space-y-2">
                  {mockSessions.map((session, i) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-[var(--color-sand-200)] transition-all cursor-pointer group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background:
                            session.category === "sleep"
                              ? "var(--color-dusk-light)"
                              : session.category === "focus"
                                ? "var(--color-sage-light)"
                                : session.category === "anxiety"
                                  ? "var(--color-ocean-light)"
                                  : "var(--color-ember-light)",
                        }}
                      >
                        <session.icon
                          className="w-4 h-4"
                          style={{
                            color:
                              session.category === "sleep"
                                ? "var(--color-dusk)"
                                : session.category === "focus"
                                  ? "var(--color-sage)"
                                  : session.category === "anxiety"
                                    ? "var(--color-ocean)"
                                    : "var(--color-ember)",
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm text-[var(--color-sand-900)] truncate"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {session.title}
                        </p>
                        <p
                          className="text-[10px] text-[var(--color-sand-400)]"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {session.duration} · {session.voice} · {session.createdAt}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-7 h-7 rounded-full bg-[var(--color-sand-900)] text-[var(--color-sand-50)] flex items-center justify-center">
                          <Play className="w-3 h-3 ml-0.5" />
                        </button>
                        <button className="w-7 h-7 rounded-full hover:bg-[var(--color-sand-100)] flex items-center justify-center text-[var(--color-sand-400)]">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Generate */}
            {activeNav === "generate" && (
              <motion.div key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="max-w-xl mx-auto py-16">
                <div className="text-center mb-10">
                  <h2
                    className="text-3xl text-[var(--color-sand-900)] mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    What do you need right now?
                  </h2>
                  <p
                    className="text-sm text-[var(--color-sand-500)]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Describe how you&apos;re feeling and we&apos;ll create your session.
                  </p>
                </div>

                {/* Glowing input — matches landing page */}
                <div className="w-full mb-6 relative rounded-xl group">
                  <div
                    className="absolute -inset-[2px] rounded-xl bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-80 group-focus-within:opacity-100 transition-opacity duration-300 blur-[0.5px]"
                    style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}
                  />
                  <div className="relative bg-white rounded-xl p-3 flex items-center gap-3">
                    <input
                      type="text"
                      value={generatePrompt}
                      onChange={(e) => setGeneratePrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Create a guided meditation on..."
                      className="flex-1 outline-none text-sm text-[var(--color-sand-900)] placeholder:text-[var(--color-sand-400)] bg-transparent"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                    <button
                      disabled={!generatePrompt.trim()}
                      className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all cursor-pointer disabled:opacity-30"
                      style={{ background: generatePrompt.trim() ? "var(--color-sand-900)" : "transparent", color: generatePrompt.trim() ? "var(--color-sand-50)" : "var(--color-sand-400)" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Suggestion pills */}
                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>
                    or try one of these
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["\u201CI can\u2019t fall asleep\u201D", "\u201CAnxious before a meeting\u201D", "\u201CHelp me focus deeply\u201D", "\u201CStress relief after work\u201D"].map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setGeneratePrompt(s.replace(/[\u201C\u201D]/g, ""))}
                        className="text-[var(--color-sand-600)] bg-white/70 hover:bg-white border border-[var(--color-sand-200)] text-xs px-3.5 py-2 rounded-full transition-all cursor-pointer"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settings */}
            {activeNav === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="max-w-lg"
              >
                <div className="space-y-6">
                  {/* Account */}
                  <div className="bg-white rounded-xl border border-[var(--color-sand-200)] p-5">
                    <h3
                      className="text-sm text-[var(--color-sand-900)] mb-4"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                    >
                      Account
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-sand-200)] flex items-center justify-center">
                        <span
                          className="text-sm text-[var(--color-sand-600)]"
                          style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                        >
                          U
                        </span>
                      </div>
                      <div>
                        <p
                          className="text-sm text-[var(--color-sand-900)]"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          user@example.com
                        </p>
                        <p
                          className="text-xs text-[var(--color-sand-500)]"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          Free plan · 3 credits remaining
                        </p>
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 rounded-lg bg-[var(--color-sand-900)] text-[var(--color-sand-50)] text-xs hover:bg-[var(--color-sand-800)] transition-colors cursor-pointer"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                    >
                      Upgrade to Pro
                    </button>
                  </div>

                  {/* Preferences */}
                  <div className="bg-white rounded-xl border border-[var(--color-sand-200)] p-5">
                    <h3
                      className="text-sm text-[var(--color-sand-900)] mb-4"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                    >
                      Preferences
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: "Default voice", value: "Aria" },
                        { label: "Default duration", value: "10 min" },
                        { label: "Auto-download after generation", value: "Off" },
                      ].map((pref) => (
                        <div key={pref.label} className="flex items-center justify-between">
                          <span
                            className="text-sm text-[var(--color-sand-700)]"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {pref.label}
                          </span>
                          <span
                            className="text-sm text-[var(--color-sand-500)]"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {pref.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
