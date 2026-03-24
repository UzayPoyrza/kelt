"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Moon,
  Sun,
  Brain,
  Wind,
  Heart,
  ChevronDown,
  Timer,
  Music,
  Check,
  Zap,
  PenLine,
  Headphones,
  ChevronLeft,
  Info,
  Trash2,
  X,
  RotateCcw,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  AlertCircle,
  FileText,
  Volume2,
  VolumeX,
  FlaskConical,
  Plus,
  GripVertical,
  Type,
  Clock3,
} from "lucide-react";
import svgPaths from "@/lib/svg-paths";
import { suggestions, voices as sharedVoices, durations as sharedDurations, detectIntent, rotatingPhrases, protocols } from "@/lib/shared";

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

/* ─── Data ─── */

const voices = [
  { id: "aria", name: "Aria", desc: "Warm, calm, nurturing", color: "var(--color-sage)" },
  { id: "james", name: "James", desc: "Deep, grounding, steady", color: "var(--color-ocean)" },
  { id: "luna", name: "Luna", desc: "Soft, dreamy, gentle", color: "var(--color-dusk)" },
  { id: "kai", name: "Kai", desc: "Clear, focused, present", color: "var(--color-ember)" },
];

const durations = [
  { value: 5, label: "5 min", desc: "Quick reset" },
  { value: 10, label: "10 min", desc: "Standard session" },
  { value: 15, label: "15 min", desc: "Deep practice" },
  { value: 20, label: "20 min", desc: "Extended journey" },
];

const soundCategories = {
  recommended: { label: "Recommended", items: ["Deep Night"] },
  alternatives: { label: "Alternatives", items: ["Soft Drift", "Safe Harbor", "Flow State", "Still Water"] },
  others: { label: "Others", items: ["Sanctuary", "Open Sky", "Forest Floor", "Letting Go", "Morning Clear"] },
};

const mockSessions = [
  { id: "1", title: "Deep sleep after a long day", duration: "15 min", voice: "Aria", protocol: "CBT-I + NSDR", sound: "Deep Night", createdAt: "Mar 24, 2026 · 12:34 PM", createdAtShort: "2 hours ago", accessedAt: "Just now", category: "sleep", icon: Moon },
  { id: "2", title: "Morning focus before standup", duration: "10 min", voice: "James", protocol: "MBSR", sound: "Flow State", createdAt: "Mar 23, 2026 · 8:15 AM", createdAtShort: "Yesterday", accessedAt: "3 hours ago", category: "focus", icon: Sun },
  { id: "3", title: "Calm my nerves before the flight", duration: "8 min", voice: "Kai", protocol: "HRV-BF + ACT", sound: "Still Water", createdAt: "Mar 22, 2026 · 3:47 PM", createdAtShort: "2 days ago", accessedAt: "Yesterday", category: "anxiety", icon: Heart },
  { id: "4", title: "Stress relief after deadline", duration: "20 min", voice: "Luna", protocol: "PMR + ACT", sound: "Safe Harbor", createdAt: "Mar 21, 2026 · 6:22 PM", createdAtShort: "3 days ago", accessedAt: "2 days ago", category: "stress", icon: Wind },
  { id: "5", title: "Quick breathing reset", duration: "5 min", voice: "Aria", protocol: "HRV-BF", sound: "Sanctuary", createdAt: "Mar 17, 2026 · 10:05 AM", createdAtShort: "Last week", accessedAt: "4 days ago", category: "focus", icon: Brain },
  { id: "6", title: "Wind down for bed", duration: "15 min", voice: "Luna", protocol: "NSDR", sound: "Soft Drift", createdAt: "Mar 16, 2026 · 11:12 PM", createdAtShort: "Last week", accessedAt: "Last week", category: "sleep", icon: Moon },
  { id: "7", title: "Body scan for tension release", duration: "12 min", voice: "Aria", protocol: "PMR", sound: "Letting Go", createdAt: "Mar 14, 2026 · 7:45 PM", createdAtShort: "Last week", accessedAt: "Last week", category: "stress", icon: Heart },
  { id: "8", title: "Pre-presentation confidence boost", duration: "8 min", voice: "Kai", protocol: "ACT", sound: "Open Sky", createdAt: "Mar 13, 2026 · 9:00 AM", createdAtShort: "2 weeks ago", accessedAt: "Last week", category: "anxiety", icon: Heart },
  { id: "9", title: "Late night overthinking reset", duration: "20 min", voice: "Luna", protocol: "CBT-I", sound: "Deep Night", createdAt: "Mar 11, 2026 · 11:55 PM", createdAtShort: "2 weeks ago", accessedAt: "2 weeks ago", category: "sleep", icon: Moon },
  { id: "10", title: "Post-workout recovery calm", duration: "10 min", voice: "James", protocol: "NSDR", sound: "Still Water", createdAt: "Mar 10, 2026 · 6:30 PM", createdAtShort: "2 weeks ago", accessedAt: "2 weeks ago", category: "focus", icon: Sun },
  { id: "11", title: "Midday energy recharge", duration: "5 min", voice: "Kai", protocol: "HRV-BF", sound: "Flow State", createdAt: "Mar 8, 2026 · 1:15 PM", createdAtShort: "2 weeks ago", accessedAt: "2 weeks ago", category: "focus", icon: Brain },
  { id: "12", title: "Sunday evening wind down", duration: "15 min", voice: "Aria", protocol: "PMR + NSDR", sound: "Safe Harbor", createdAt: "Mar 7, 2026 · 9:20 PM", createdAtShort: "2 weeks ago", accessedAt: "2 weeks ago", category: "sleep", icon: Moon },
];

const mockGenerations = [
  { id: "g1", prompt: "Help me fall asleep after a stressful day", voice: "Aria", duration: "15 min", protocol: "CBT-I + NSDR", status: "completed" as const, timestamp: "Mar 24, 2026 · 12:34 PM", creditUsed: 1, sessionId: "1" },
  { id: "g2", prompt: "Morning focus session before my standup meeting", voice: "James", duration: "10 min", protocol: "MBSR", status: "completed" as const, timestamp: "Mar 23, 2026 · 8:15 AM", creditUsed: 1, sessionId: "2" },
  { id: "g3", prompt: "Calm my nerves, I have a flight in 2 hours", voice: "Kai", duration: "8 min", protocol: "HRV-BF + ACT", status: "completed" as const, timestamp: "Mar 22, 2026 · 3:47 PM", creditUsed: 1, sessionId: "3" },
  { id: "g4", prompt: "I just finished a massive deadline, need to decompress", voice: "Luna", duration: "20 min", protocol: "PMR + ACT", status: "completed" as const, timestamp: "Mar 21, 2026 · 6:22 PM", creditUsed: 1, sessionId: "4" },
  { id: "g5", prompt: "Quick 5 minute breathing exercise", voice: "Aria", duration: "5 min", protocol: "HRV-BF", status: "completed" as const, timestamp: "Mar 17, 2026 · 10:05 AM", creditUsed: 1, sessionId: "5" },
  { id: "g6", prompt: "Wind down before bed with gentle guidance", voice: "Luna", duration: "15 min", protocol: "NSDR", status: "completed" as const, timestamp: "Mar 16, 2026 · 11:12 PM", creditUsed: 1, sessionId: "6" },
  { id: "g7", prompt: "Deep relaxation for muscle tension in my neck", voice: "James", duration: "10 min", protocol: "PMR", status: "failed" as const, timestamp: "Mar 15, 2026 · 2:30 PM", creditUsed: 0, sessionId: null },
  { id: "g8", prompt: "Body scan to release shoulder and neck tension", voice: "Aria", duration: "12 min", protocol: "PMR", status: "completed" as const, timestamp: "Mar 14, 2026 · 7:45 PM", creditUsed: 1, sessionId: "7" },
  { id: "g9", prompt: "I have a big presentation in an hour, help me feel confident", voice: "Kai", duration: "8 min", protocol: "ACT", status: "completed" as const, timestamp: "Mar 13, 2026 · 9:00 AM", creditUsed: 1, sessionId: "8" },
  { id: "g10", prompt: "Can't stop overthinking, need to shut my brain off for sleep", voice: "Luna", duration: "20 min", protocol: "CBT-I", status: "completed" as const, timestamp: "Mar 11, 2026 · 11:55 PM", creditUsed: 1, sessionId: "9" },
  { id: "g11", prompt: "Cool down mentally after an intense gym session", voice: "James", duration: "10 min", protocol: "NSDR", status: "completed" as const, timestamp: "Mar 10, 2026 · 6:30 PM", creditUsed: 1, sessionId: "10" },
  { id: "g12", prompt: "Quick midday reset to get through the afternoon", voice: "Kai", duration: "5 min", protocol: "HRV-BF", status: "completed" as const, timestamp: "Mar 8, 2026 · 1:15 PM", creditUsed: 1, sessionId: "11" },
  { id: "g13", prompt: "Gentle Sunday evening session before the new week", voice: "Aria", duration: "15 min", protocol: "PMR + NSDR", status: "completed" as const, timestamp: "Mar 7, 2026 · 9:20 PM", creditUsed: 1, sessionId: "12" },
  { id: "g14", prompt: "Breathing exercise during a panic moment", voice: "Luna", duration: "5 min", protocol: "HRV-BF", status: "failed" as const, timestamp: "Mar 5, 2026 · 4:10 PM", creditUsed: 0, sessionId: null },
];

type HistoryFilter = "all" | "sessions" | "generations";

const navItems = [
  { id: "sessions" as const, label: "All Sessions", icon: LayoutGrid },
  { id: "history" as const, label: "History", icon: Clock },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

type NavId = (typeof navItems)[number]["id"] | "generate";

type ScriptBlock = {
  id: string;
  type: "voice" | "pause";
  text: string;
  pauseDuration?: number; // seconds — under 3s is "short", 3s+ is "long"
};

function deriveSessionName(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (/sleep|insomnia|bed|night|dream|tired/i.test(lower)) return "Deep Sleep Session";
  if (/focus|concentrat|work|study|morning|productivity/i.test(lower)) return "Focus & Clarity";
  if (/stress|anxi|worry|overwhelm|calm|relax|tension/i.test(lower)) return "Calm & Release";
  if (/breath/i.test(lower)) return "Breathing Reset";
  if (/body scan|muscle/i.test(lower)) return "Body Scan";
  // Fallback: capitalize first few words
  const words = prompt.split(/\s+/).slice(0, 4).join(" ");
  return words.length > 30 ? words.slice(0, 30) + "…" : words;
}

function estimateDuration(script: ScriptBlock[]): { minutes: number; seconds: number } {
  let totalSeconds = 0;
  for (const block of script) {
    if (block.type === "voice") {
      // ~150 words per minute, avg 5 chars per word
      totalSeconds += Math.ceil((block.text.length / 5) / 150 * 60);
    } else if (block.type === "pause") {
      totalSeconds += block.pauseDuration ?? 0;
    }
  }
  return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 };
}

const generateScript = (prompt: string): ScriptBlock[] => [
  { id: "1", type: "voice", text: "Find a comfortable position. Let your body settle into wherever you are right now." },
  { id: "2", type: "pause", text: "Pause", pauseDuration: 2 },
  { id: "3", type: "voice", text: "Gently close your eyes. Take a moment to notice how you\u2019re feeling without judgment." },
  { id: "4", type: "pause", text: "Pause", pauseDuration: 5 },
  { id: "5", type: "voice", text: "Now take a slow, deep breath in through your nose\u2026" },
  { id: "6", type: "pause", text: "Pause", pauseDuration: 4 },
  { id: "7", type: "voice", text: "And release it slowly through your mouth. Let everything go." },
  { id: "8", type: "pause", text: "Pause", pauseDuration: 6 },
  { id: "9", type: "voice", text: "Notice any tension in your shoulders. With each exhale, let them drop a little lower." },
  { id: "10", type: "pause", text: "Pause", pauseDuration: 5 },
  { id: "11", type: "voice", text: "You\u2019re doing great. There\u2019s nowhere else you need to be right now." },
  { id: "12", type: "pause", text: "Pause", pauseDuration: 2 },
  { id: "13", type: "voice", text: "Let\u2019s continue with another deep breath. In through the nose\u2026" },
  { id: "14", type: "pause", text: "Pause", pauseDuration: 4 },
  { id: "15", type: "voice", text: "And out through the mouth. Feel your body becoming heavier, more relaxed." },
  { id: "16", type: "pause", text: "Pause", pauseDuration: 6 },
  { id: "17", type: "voice", text: "Allow this feeling of calm to spread through your entire body. You are safe here." },
  { id: "18", type: "pause", text: "Pause", pauseDuration: 4 },
  { id: "19", type: "voice", text: "When you\u2019re ready, slowly begin to bring your awareness back. Take your time." },
];

/* ─── Session Card ─── */

const categoryColors: Record<string, { accent: string; bg: string }> = {
  sleep: { accent: "#8b7ea6", bg: "rgba(139,126,166,0.08)" },
  focus: { accent: "#6b9a70", bg: "rgba(107,154,112,0.08)" },
  anxiety: { accent: "#6d9ab5", bg: "rgba(109,154,181,0.08)" },
  stress: { accent: "#c4876c", bg: "rgba(196,135,108,0.08)" },
};

function SessionCard({ session, delay, isNowPlaying, onPlay, onOpenStudio }: {
  session: (typeof mockSessions)[number]; delay: number;
  isNowPlaying: boolean; onPlay: () => void; onOpenStudio: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = session.icon;
  const colors = categoryColors[session.category] || categoryColors.focus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-white rounded-xl border border-[#e8e8ec] hover:border-[#d0d0d6] transition-all duration-300 cursor-pointer hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      onClick={onOpenStudio}
    >
      {/* Accent line */}
      <div className="absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, ${colors.accent}, transparent)` }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: colors.bg }}>
              <Icon className="w-[18px] h-[18px]" style={{ color: colors.accent }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] text-[#18181b] leading-tight truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{session.title}</h3>
              <p className="text-[11px] text-[#a1a1aa] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>{session.createdAt}</p>
            </div>
          </div>
          {isNowPlaying && (
            <div className="shrink-0 flex items-end gap-[2px] h-4">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{ background: colors.accent }}
                  animate={{ height: ["40%", "100%", "40%"] }}
                  transition={{ duration: 0.5 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Waveform hint */}
        <div className="flex items-end gap-[3px] h-6 mb-4 px-0.5">
          {Array.from({ length: 32 }).map((_, i) => {
            const h = 15 + Math.sin(i * 0.6) * 35 + Math.cos(i * 1.2) * 25;
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-500"
                style={{
                  height: `${Math.max(12, Math.min(95, h))}%`,
                  background: isNowPlaying
                    ? colors.accent
                    : `linear-gradient(180deg, #d4d4d8, #e4e4e7)`,
                  opacity: isNowPlaying ? 0.7 : 0.4,
                }}
              />
            );
          })}
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-md text-[10px] tracking-wide" style={{ fontFamily: "var(--font-body)", fontWeight: 500, background: colors.bg, color: colors.accent }}>
            <Zap className="w-2.5 h-2.5" />
            {session.protocol}
          </span>
          <span className="text-[10px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>·</span>
          <span className="text-[11px] text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>{session.duration}</span>
          <span className="text-[10px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>·</span>
          <span className="text-[11px] text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>{session.voice}</span>
        </div>

        {/* Open in Studio overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#18181b] text-white shadow-lg">
            <PenLine className="w-3.5 h-3.5" />
            <span className="text-[12px]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Open in Studio</span>
          </div>
        </div>
        {/* Play + Options buttons sit above the overlay */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm"
            style={{ background: isNowPlaying ? colors.accent : "#18181b", color: "#fff" }}
          >
            {isNowPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors shadow-sm border border-[#e4e4e7]"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div
                className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg border border-[#e4e4e7] shadow-xl z-30 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {[
                  { label: "Open", icon: PenLine, action: () => { setShowMenu(false); onOpenStudio(); } },
                  { label: "Download", icon: Download, action: () => setShowMenu(false) },
                  { label: "Rename", icon: PenLine, action: () => setShowMenu(false) },
                  { label: "Delete", icon: Trash2, action: () => setShowMenu(false), danger: true },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-colors cursor-pointer ${
                      (item as { danger?: boolean }).danger
                        ? "text-red-500 hover:bg-red-50"
                        : "text-[#3f3f46] hover:bg-[#f4f4f5]"
                    }`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Bottom Player Bar ─── */

function PlayerBar({ session, isPlaying, onTogglePlay, onClose, inline }: {
  session: (typeof mockSessions)[number]; isPlaying: boolean;
  onTogglePlay: () => void; onClose: () => void; inline?: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const [showBgSound, setShowBgSound] = useState(false);
  const [bgSound, setBgSound] = useState(session.sound);
  const [bgVol, setBgVol] = useState(70);
  const colors = categoryColors[session.category] || categoryColors.focus;
  const Icon = session.icon;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress(prev => prev >= 100 ? 0 : prev + 0.3);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
      className={inline ? "border-t border-[#e4e4e7] bg-white/95 backdrop-blur-xl" : "fixed bottom-0 left-56 right-0 z-50 border-t border-[#e4e4e7] bg-white/95 backdrop-blur-xl"}
    >
      {/* Progress bar */}
      <div className="h-[2px] bg-[#f0f0f3]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: colors.accent, width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="flex items-center gap-5 px-6 py-3">
        {/* Session info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: colors.bg }}>
            <Icon className="w-5 h-5" style={{ color: colors.accent }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] text-[#18181b] truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{session.title}</p>
            <p className="text-[11px] text-[#a1a1aa] truncate" style={{ fontFamily: "var(--font-body)" }}>{session.voice} · {session.duration} · {session.protocol}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button className="relative w-9 h-9 rounded-lg hover:bg-[#f4f4f5] flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer" title="Back 10s">
            <RotateCcw className="w-5 h-5" />
            <span className="absolute text-[7px] font-bold" style={{ fontFamily: "var(--font-body)" }}>10</span>
          </button>
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
            style={{ background: isPlaying ? colors.accent : "#18181b", color: "#fff" }}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button className="relative w-9 h-9 rounded-lg hover:bg-[#f4f4f5] flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer" title="Skip 10s">
            <RotateCw className="w-5 h-5" />
            <span className="absolute text-[7px] font-bold" style={{ fontFamily: "var(--font-body)" }}>10</span>
          </button>
        </div>

        {/* Right side — background sound + actions */}
        <div className="flex items-center gap-3 flex-1 justify-end">
        <div className="relative flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#f4f4f5] border border-[#e8e8ec]">
          <button
            onClick={(e) => { e.stopPropagation(); setShowBgSound(!showBgSound); }}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-[12px] transition-all cursor-pointer ${showBgSound ? "bg-[#18181b] text-white" : "text-[#3f3f46] hover:bg-[#e8e8ec]"}`}
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
          >
            <Music className={`w-3.5 h-3.5 ${showBgSound ? "text-white/70" : "text-[#71717a]"}`} />
            <span>{bgSound}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showBgSound ? "rotate-180 text-white/70" : "text-[#71717a]"}`} />
          </button>

          <div className="w-[1px] h-3.5 bg-[#d4d4d8]" />

          <div className="flex items-center gap-1">
            <button onClick={() => setBgVol(bgVol > 0 ? 0 : 70)} className="text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer">
              {bgVol === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
            <input
              type="range" min={0} max={100} value={bgVol}
              onChange={(e) => setBgVol(Number(e.target.value))}
              className="w-24 h-[3px] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3f3f46] [&::-webkit-slider-thumb]:cursor-pointer"
              style={{ background: `linear-gradient(to right, #3f3f46 ${bgVol}%, #d4d4d8 ${bgVol}%)` }}
            />
          </div>

          {/* Dropdown */}
          {showBgSound && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowBgSound(false)} />
              <div className="absolute bottom-full left-0 mb-2 w-52 bg-white rounded-lg border border-[#e4e4e7] shadow-lg z-[70] max-h-64 overflow-y-auto">
                {Object.entries(soundCategories).map(([key, cat], catIdx) => (
                  <div key={key}>
                    <div className={`px-3 py-1.5 bg-[#f7f7f8] ${catIdx > 0 ? "border-t border-[#e4e4e7]" : ""}`}>
                      <span className="text-[9px] uppercase tracking-wider text-[#a1a1aa] font-medium" style={{ fontFamily: "var(--font-body)" }}>
                        {cat.label}{key === "recommended" ? " — Default" : ""}
                      </span>
                    </div>
                    {cat.items.map((s, i) => (
                      <button key={s} onClick={() => { setBgSound(s); setShowBgSound(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#f4f4f5] transition-colors cursor-pointer text-left ${i > 0 ? "border-t border-[#f0f0f3]" : ""}`}>
                        <span className="text-[12px] text-[#18181b]" style={{ fontFamily: "var(--font-body)" }}>{s}</span>
                        {s === bgSound && <Check className="w-3 h-3 text-[#6b9a70]" />}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

          <button className="w-8 h-8 rounded-lg hover:bg-[#f4f4f5] flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer">
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#f4f4f5] flex items-center justify-center text-[#a1a1aa] hover:text-[#18181b] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div className="relative mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#f4f4f5] flex items-center justify-center border border-[#e4e4e7]">
          <Sparkles className="w-5 h-5 text-[#a1a1aa]" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#e4e4e7] border-2 border-[var(--color-sand-50)]" />
      </div>
      <h3 className="text-base text-[#18181b] mb-1.5" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{label}</h3>
      <p className="text-[13px] text-[#a1a1aa] max-w-[260px] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>Generate your first meditation session to see it here.</p>
    </div>
  );
}

/* ─── Studio Session View ─── */

function StudioSession({ prompt, voice, duration, sound, onBack }: {
  prompt: string; voice: string; duration: number; sound: string; onBack: () => void;
}) {
  const [script, setScript] = useState<ScriptBlock[]>(() => generateScript(prompt));
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [sessionVoice, setSessionVoice] = useState(voice);
  const [sessionSound, setSessionSound] = useState(sound);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [showSoundDropdown, setShowSoundDropdown] = useState(false);
  const [showSoundInfo, setShowSoundInfo] = useState(false);
  const [soundVolume, setSoundVolume] = useState(70);

  const [showDurationInfo, setShowDurationInfo] = useState(false);
  const [editingPauseId, setEditingPauseId] = useState<string | null>(null);
  const [generateWarning, setGenerateWarning] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<"settings" | "history">("settings");
  const [isGenerating, setIsGenerating] = useState(false);
  const [studioPlaying, setStudioPlaying] = useState(false);
  const [showStudioPlayer, setShowStudioPlayer] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [sessionName, setSessionName] = useState(() => deriveSessionName(prompt));
  const [isRenamingSession, setIsRenamingSession] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const estimated = estimateDuration(script);

  const handleGenerateAudio = useCallback(() => {
    const emptyPauses = script.filter(b => b.type === "pause" && (!b.pauseDuration || b.pauseDuration === 0));
    if (emptyPauses.length > 0) {
      setGenerateWarning(`${emptyPauses.length} pause${emptyPauses.length > 1 ? "s have" : " has"} no duration set. Set a value or remove the segment.`);
      return;
    }
    setGenerateWarning(null);
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowStudioPlayer(true);
      setStudioPlaying(true);
      setHasGenerated(true);
    }, 2000);
  }, [script]);

  // Build a mock session for the player
  const intent = prompt.toLowerCase().includes("sleep") ? "sleep" : prompt.toLowerCase().includes("focus") ? "focus" : prompt.toLowerCase().includes("stress") || prompt.toLowerCase().includes("anxi") ? "stress" : "focus";
  const iconMap: Record<string, typeof Moon> = { sleep: Moon, focus: Sun, stress: Heart, anxiety: Heart };
  const studioSession = {
    id: "studio",
    title: sessionName,
    duration: `${estimated.minutes} min`,
    voice: voices.find(v => v.id === sessionVoice)?.name || "Aria",
    protocol: "Custom",
    sound: sessionSound,
    createdAt: "Just now",
    createdAtShort: "Just now",
    accessedAt: "Just now",
    category: intent,
    icon: iconMap[intent] || Brain,
  };

  const selectedVoice = voices.find(v => v.id === sessionVoice) || voices[0];

  const markEdited = useCallback(() => setHasGenerated(false), []);

  const nextId = useRef(100);

  const setPauseDuration = useCallback((id: string, seconds: number) => {
    setScript(prev => prev.map(b =>
      b.id === id ? { ...b, pauseDuration: Math.max(0, seconds) } : b
    ));
    setGenerateWarning(null);
    markEdited();
  }, [markEdited]);

  const updateBlockText = useCallback((id: string, text: string) => {
    setScript(prev => prev.map(b => b.id === id ? { ...b, text } : b));
    markEdited();
  }, [markEdited]);


  // Only voice blocks can be deleted — the associated pause is removed with it
  const deleteBlock = useCallback((id: string) => {
    setScript(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1 || prev[idx].type !== "voice") return prev;
      const next = [...prev];
      // Remove the voice block and its following pause (if exists)
      if (idx + 1 < next.length && next[idx + 1].type === "pause") {
        next.splice(idx, 2);
      } else if (idx - 1 >= 0 && next[idx - 1].type === "pause") {
        // Or the preceding pause if no following one
        next.splice(idx - 1, 2);
      } else {
        next.splice(idx, 1);
      }
      return next;
    });
    setSelectedBlock(null);
    markEdited();
  }, [markEdited]);

  const addBlockAfter = useCallback((afterId: string, type: "voice" | "pause") => {
    const voiceBlock: ScriptBlock = {
      id: String(nextId.current++),
      type: "voice",
      text: "New text segment...",
    };
    const pauseBlock: ScriptBlock = {
      id: String(nextId.current++),
      type: "pause",
      text: "Pause",
      pauseDuration: 3,
    };
    setScript(prev => {
      const idx = prev.findIndex(b => b.id === afterId);
      const next = [...prev];
      const currentBlock = prev[idx];
      // Always insert a pair to maintain alternation
      if (currentBlock.type === "voice") {
        // After voice → insert pause then voice
        next.splice(idx + 1, 0, pauseBlock, voiceBlock);
        setSelectedBlock(voiceBlock.id);
      } else {
        // After pause → insert voice then pause
        next.splice(idx + 1, 0, voiceBlock, pauseBlock);
        setSelectedBlock(voiceBlock.id);
      }
      return next;
    });
    markEdited();
  }, [markEdited]);

  // Swap with the nearest same-type block in the given direction
  const moveBlock = useCallback((id: string, direction: "up" | "down") => {
    setScript(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const blockType = prev[idx].type;
      // Find the nearest same-type block
      let swapIdx = -1;
      if (direction === "up") {
        for (let i = idx - 1; i >= 0; i--) {
          if (prev[i].type === blockType) { swapIdx = i; break; }
        }
      } else {
        for (let i = idx + 1; i < prev.length; i++) {
          if (prev[i].type === blockType) { swapIdx = i; break; }
        }
      }
      if (swapIdx === -1) return prev;
      // Swap the content of the two same-type blocks (keep positions intact)
      const next = [...prev];
      const temp = { text: next[idx].text, pauseDuration: next[idx].pauseDuration };
      next[idx] = { ...next[idx], text: next[swapIdx].text, pauseDuration: next[swapIdx].pauseDuration };
      next[swapIdx] = { ...next[swapIdx], text: temp.text, pauseDuration: temp.pauseDuration };
      return next;
    });
    markEdited();
  }, [markEdited]);

  return (
    <div className="flex flex-1 min-h-0" style={{ background: "#ffffff" }}>
      {/* ─── Script Editor (left) ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Script toolbar */}
        <div className="relative flex items-center justify-between px-6 py-3 border-b border-[#e4e4e7]" style={{ background: "#fafafa" }}>
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          {isRenamingSession ? (
            <input
              ref={renameInputRef}
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onBlur={() => setIsRenamingSession(false)}
              onKeyDown={(e) => { if (e.key === "Enter") setIsRenamingSession(false); if (e.key === "Escape") setIsRenamingSession(false); }}
              className="text-sm text-[#18181b] absolute left-1/2 -translate-x-1/2 bg-white border border-[#e4e4e7] rounded-md px-2 py-0.5 outline-none focus:border-[#a1a1aa] text-center w-56"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              autoFocus
            />
          ) : (
            <h2
              className="text-sm text-[#18181b] absolute left-1/2 -translate-x-1/2 cursor-text px-2 py-0.5 rounded-md studio-title-hover"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500, border: "1px solid transparent" }}
              onClick={() => { setIsRenamingSession(true); setTimeout(() => renameInputRef.current?.select(), 0); }}
              title="Click to rename"
            >
              {sessionName}
            </h2>
          )}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#a1a1aa] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>
              {script.filter(b => b.type === "voice").length} segments · {script.filter(b => b.type === "pause").length} pauses · ~{estimated.minutes}m {estimated.seconds > 0 ? `${estimated.seconds}s` : ""}
            </span>
          </div>
        </div>

        {/* Script blocks */}
        <div className="flex-1 overflow-y-auto px-6 py-5 studio-scroll">
          {script.map((block, index) => {
            const isSelected = selectedBlock === block.id;

            if (block.type === "pause") {
              const dur = block.pauseDuration ?? 0;
              const isEmpty = dur === 0;
              const isLong = dur >= 3;
              const isEditingDur = editingPauseId === block.id;
              // Check if reorder is possible
              const canMoveUp = script.slice(0, index).some(b => b.type === "pause");
              const canMoveDown = script.slice(index + 1).some(b => b.type === "pause");
              return (
                <div key={block.id} className="group/pause py-0.5">
                  {/* Pause as a timeline divider */}
                  <div
                    onClick={() => setSelectedBlock(isSelected ? null : block.id)}
                    className="relative flex items-center gap-0 cursor-pointer group/row py-1"
                  >
                    <div className="flex-1 h-px" style={{ background: isEmpty ? "#e8e8ec" : isLong ? "var(--color-dusk)" : "#d4d4d8", opacity: isEmpty ? 0.3 : isLong ? 0.5 : 0.4 }} />

                    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full mx-2 transition-all border ${
                      isEmpty
                        ? "border-dashed border-[#d4d4d8] bg-[#fafafa]"
                        : isSelected
                          ? "border-[var(--color-dusk)] bg-[var(--color-dusk-light)]"
                          : isLong
                            ? "border-[rgba(139,126,166,0.25)] bg-[rgba(139,126,166,0.08)] hover:bg-[var(--color-dusk-light)]"
                            : "border-[#e4e4e7] bg-white hover:bg-[#f9f9fb]"
                    }`}>
                      {/* Reorder arrows — always visible, dim when disabled */}
                      <div className="flex flex-col gap-px">
                        <button
                          onClick={(e) => { e.stopPropagation(); if (canMoveUp) moveBlock(block.id, "up"); }}
                          className={`w-5 h-3.5 flex items-center justify-center rounded-sm transition-all ${
                            canMoveUp
                              ? "text-[var(--color-dusk)] hover:bg-[rgba(139,126,166,0.15)] cursor-pointer"
                              : "text-[#d8d8dc] cursor-default"
                          }`}
                        >
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M5 0L0 5h10L5 0z" fill="currentColor"/></svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (canMoveDown) moveBlock(block.id, "down"); }}
                          className={`w-5 h-3.5 flex items-center justify-center rounded-sm transition-all ${
                            canMoveDown
                              ? "text-[var(--color-dusk)] hover:bg-[rgba(139,126,166,0.15)] cursor-pointer"
                              : "text-[#d8d8dc] cursor-default"
                          }`}
                        >
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M5 6L0 1h10L5 6z" fill="currentColor"/></svg>
                        </button>
                      </div>

                      <span className="text-[11px]" style={{
                        fontFamily: "var(--font-body)", fontWeight: 600,
                        color: isEmpty ? "#c4c4c4" : isLong ? "var(--color-dusk)" : "#91919b",
                      }}>
                        {isEmpty ? "Empty" : isLong ? "Long" : "Short"}
                      </span>

                      <div className="w-px h-3.5" style={{ background: isEmpty ? "#e4e4e7" : isLong ? "rgba(139,126,166,0.25)" : "#e4e4e7" }} />

                      <button
                        onClick={(e) => { e.stopPropagation(); setPauseDuration(block.id, dur - 1); }}
                        className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/80 transition-all cursor-pointer text-sm font-medium"
                        style={{ color: isEmpty ? "#d4d4d4" : isLong ? "var(--color-dusk)" : "#91919b" }}
                      >−</button>
                      {isEditingDur ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          autoFocus
                          value={dur || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setPauseDuration(block.id, val === "" ? 0 : Math.min(99, parseInt(val)));
                          }}
                          onBlur={() => setEditingPauseId(null)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingPauseId(null); }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-7 text-center text-[12px] tabular-nums bg-white border border-[var(--color-dusk)] rounded-md outline-none py-0.5"
                          style={{ fontFamily: "var(--font-body)", fontWeight: 700, color: "var(--color-dusk)" }}
                        />
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingPauseId(block.id); }}
                          className={`text-[12px] w-7 text-center tabular-nums rounded-md py-0.5 transition-all cursor-text ${
                            isEmpty ? "text-[#c4c4c4] hover:bg-white hover:ring-1 hover:ring-[#d4d4d8]" : "hover:bg-white hover:ring-1 hover:ring-[var(--color-dusk)]"
                          }`}
                          style={{ fontFamily: "var(--font-body)", fontWeight: 700, color: isEmpty ? undefined : isLong ? "var(--color-dusk)" : "#52525b" }}
                          title="Click to edit duration"
                        >
                          {isEmpty ? "—" : `${dur}s`}
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setPauseDuration(block.id, dur + 1); }}
                        className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/80 transition-all cursor-pointer text-sm font-medium"
                        style={{ color: isEmpty ? "#d4d4d4" : isLong ? "var(--color-dusk)" : "#91919b" }}
                      >+</button>
                    </div>

                    <div className="flex-1 h-px" style={{ background: isEmpty ? "#e8e8ec" : isLong ? "var(--color-dusk)" : "#d4d4d8", opacity: isEmpty ? 0.3 : isLong ? 0.5 : 0.4 }} />
                  </div>
                </div>
              );
            }

            const canMoveVoiceUp = script.slice(0, index).some(b => b.type === "voice");
            const canMoveVoiceDown = script.slice(index + 1).some(b => b.type === "voice");

            return (
              <div key={block.id} className="group/row">
                <div
                  onClick={() => setSelectedBlock(isSelected ? null : block.id)}
                  className={`relative rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "shadow-[0_2px_12px_rgba(107,154,112,0.12)]"
                      : "hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                  }`}
                  style={{
                    borderLeft: `3.5px solid ${isSelected ? "var(--color-sage)" : "rgba(122,158,126,0.35)"}`,
                    background: isSelected ? "var(--color-sage-light)" : "#fff",
                    border: isSelected ? "1.5px solid rgba(122,158,126,0.3)" : "1.5px solid transparent",
                    borderLeftWidth: "3.5px",
                    borderLeftColor: isSelected ? "var(--color-sage)" : "rgba(122,158,126,0.35)",
                  }}
                >
                  <div className="flex items-start gap-2 pl-4 pr-3 py-3.5">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {isSelected ? (
                        <textarea
                          value={block.text}
                          onChange={(e) => updateBlockText(block.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-[14px] text-[#1a1614] bg-transparent outline-none resize-none leading-[1.75]"
                          style={{ fontFamily: "var(--font-body)" }}
                          rows={Math.max(2, Math.ceil(block.text.length / 60))}
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-start gap-2">
                          <p className="text-[14px] text-[#2d2926] leading-[1.75] flex-1" style={{ fontFamily: "var(--font-body)" }}>
                            {block.text}
                          </p>
                          <PenLine className="w-3.5 h-3.5 text-[#c4c4c8] opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0 mt-1" />
                        </div>
                      )}
                    </div>

                    {/* Reorder + Delete — on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0 mt-0.5">
                      <div className="flex flex-col gap-px">
                        <button
                          onClick={(e) => { e.stopPropagation(); if (canMoveVoiceUp) moveBlock(block.id, "up"); }}
                          className={`w-6 h-4 rounded-sm flex items-center justify-center transition-all ${
                            canMoveVoiceUp
                              ? "text-[var(--color-sage)] hover:bg-[var(--color-sage-light)] cursor-pointer"
                              : "text-[#d8d8dc] cursor-default"
                          }`}
                          title="Move up"
                        >
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M5 0L0 5h10L5 0z" fill="currentColor"/></svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (canMoveVoiceDown) moveBlock(block.id, "down"); }}
                          className={`w-6 h-4 rounded-sm flex items-center justify-center transition-all ${
                            canMoveVoiceDown
                              ? "text-[var(--color-sage)] hover:bg-[var(--color-sage-light)] cursor-pointer"
                              : "text-[#d8d8dc] cursor-default"
                          }`}
                          title="Move down"
                        >
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M5 6L0 1h10L5 6z" fill="currentColor"/></svg>
                        </button>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[#d4d4d4] hover:text-red-400 hover:bg-red-50 transition-all cursor-pointer"
                        title="Delete segment"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add segment — hover zone between voice blocks */}
                <div className="flex items-center justify-center h-5 relative group/add">
                  <div className="absolute inset-x-6 top-1/2 border-t border-dashed border-transparent group-hover/add:border-[rgba(122,158,126,0.3)] transition-colors" />
                  <button
                    onClick={() => addBlockAfter(block.id, "voice")}
                    className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/add:opacity-100 w-6 h-6 rounded-full bg-white border-[1.5px] border-[rgba(122,158,126,0.3)] hover:border-[var(--color-sage)] hover:bg-[var(--color-sage-light)] flex items-center justify-center text-[var(--color-sage)] shadow-sm transition-all cursor-pointer z-10"
                    title="Add segment"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add segment at end — connected to timeline */}
          {script.length > 0 && (
            <div className="flex flex-col items-center pt-1 pb-4">
              <div className="w-px h-4" style={{ background: "rgba(122,158,126,0.2)" }} />
              <button
                onClick={() => addBlockAfter(script[script.length - 1].id, "voice")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] text-[var(--color-sage)] hover:bg-[var(--color-sage-light)] border-[1.5px] border-dashed border-[rgba(122,158,126,0.3)] hover:border-[var(--color-sage)] transition-all cursor-pointer"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
              >
                <Plus className="w-3 h-3" /> Add segment
              </button>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#e4e4e7]" style={{ background: "#fafafa" }}>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>
              3 credits remaining
            </span>
          </div>
          <div className="flex items-center gap-3">
            {generateWarning && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5" style={{ fontFamily: "var(--font-body)" }}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {generateWarning}
              </div>
            )}
          <button
            onClick={handleGenerateAudio}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#18181b] text-white hover:bg-[#27272a] transition-colors text-sm cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
            {isGenerating ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-3.5 h-3.5" />
                </motion.div>
                Generating...
              </>
            ) : hasGenerated ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Regenerate Audio
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Audio
              </>
            )}
          </button>
          </div>
        </div>

        {/* Inline Studio Player */}
        <AnimatePresence>
          {showStudioPlayer && (
            <PlayerBar
              session={studioSession}
              isPlaying={studioPlaying}
              onTogglePlay={() => setStudioPlaying(prev => !prev)}
              onClose={() => { setShowStudioPlayer(false); setStudioPlaying(false); }}
              inline
            />
          )}
        </AnimatePresence>
      </div>

      {/* ─── Right Panel (Settings / History) ─── */}
      <div className="w-72 shrink-0 border-l border-[#e4e4e7] flex flex-col overflow-y-auto studio-scroll" style={{ background: "#fafafa" }}>
        <div className="px-4 pt-1 border-b border-[#e4e4e7] flex items-center gap-0">
          <button
            onClick={() => setRightTab("settings")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] transition-all cursor-pointer border-b-2 -mb-px ${
              rightTab === "settings" ? "border-[#18181b] text-[#18181b]" : "border-transparent text-[#a1a1aa] hover:text-[#52525b]"
            }`}
            style={{ fontFamily: "var(--font-body)", fontWeight: rightTab === "settings" ? 600 : 400 }}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
          <button
            onClick={() => setRightTab("history")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] transition-all cursor-pointer border-b-2 -mb-px ${
              rightTab === "history" ? "border-[#18181b] text-[#18181b]" : "border-transparent text-[#a1a1aa] hover:text-[#52525b]"
            }`}
            style={{ fontFamily: "var(--font-body)", fontWeight: rightTab === "history" ? 600 : 400 }}
          >
            <Clock className="w-3.5 h-3.5" />
            History
          </button>
        </div>

        {rightTab === "settings" && <div className="px-5 py-4 space-y-6">
          {/* Voice */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#71717a] mb-2.5 block" style={{ fontFamily: "var(--font-body)" }}>Voice</label>
            <div className="relative">
              <button
                onClick={() => { setShowVoiceDropdown(!showVoiceDropdown); setShowSoundDropdown(false); setShowSoundInfo(false); setShowDurationInfo(false); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white border border-[#e4e4e7] hover:border-[#d4d4d8] transition-colors cursor-pointer text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: selectedVoice.color + "20" }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: selectedVoice.color }} />
                  </div>
                  <div>
                    <p className="text-sm text-[#18181b]" style={{ fontFamily: "var(--font-body)" }}>{selectedVoice.name}</p>
                    <p className="text-[10px] text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>{selectedVoice.desc}</p>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#a1a1aa] transition-transform ${showVoiceDropdown ? "rotate-180" : ""}`} />
              </button>
              {showVoiceDropdown && (
                <>
                  <div className="fixed inset-0 z-[200]" onClick={() => setShowVoiceDropdown(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#e4e4e7] shadow-lg z-[210]">
                    {voices.map((v, i) => (
                      <button key={v.id} onClick={() => { setSessionVoice(v.id); setShowVoiceDropdown(false); markEdited(); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#f4f4f5] transition-colors cursor-pointer text-left ${i > 0 ? "border-t border-[#f0f0f3]" : ""}`}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: v.color + "20" }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: v.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#18181b]" style={{ fontFamily: "var(--font-body)" }}>{v.name}</p>
                          <p className="text-[10px] text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>{v.desc}</p>
                        </div>
                        {v.id === sessionVoice && <Check className="w-3.5 h-3.5 text-[#6b9a70]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sound */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <label className="text-[10px] uppercase tracking-wider text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>Background Sound</label>
              <div className="relative">
                <button
                  onClick={() => setShowSoundInfo(!showSoundInfo)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[#a1a1aa] hover:text-[#18181b] hover:bg-[#f4f4f5] transition-all cursor-pointer">
                  <Info className="w-3 h-3" />
                </button>
                {showSoundInfo && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-56 p-3 rounded-lg bg-[#18181b] text-white shadow-xl z-30">
                    <p className="text-[11px] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                      Sounds are recommended based on your session&apos;s intent, protocol, and voice. The system matches ambient layers to maximize therapeutic effectiveness.
                    </p>
                    <div className="w-2 h-2 bg-[#18181b] rotate-45 absolute -top-1 left-1/2 -translate-x-1/2" />
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => { setShowSoundDropdown(!showSoundDropdown); setShowVoiceDropdown(false); setShowSoundInfo(false); setShowDurationInfo(false); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white border border-[#e4e4e7] hover:border-[#d4d4d8] transition-colors cursor-pointer text-left">
                <div className="flex items-center gap-2.5">
                  <Music className="w-4 h-4 text-[#71717a]" />
                  <div>
                    <span className="text-sm text-[#18181b] block" style={{ fontFamily: "var(--font-body)" }}>{sessionSound}</span>
                    {soundCategories.recommended.items.includes(sessionSound) && (
                      <span className="text-[9px] uppercase tracking-wider text-[#6b9a70]" style={{ fontFamily: "var(--font-body)" }}>Recommended</span>
                    )}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#a1a1aa] transition-transform ${showSoundDropdown ? "rotate-180" : ""}`} />
              </button>
              {showSoundDropdown && (
                <>
                  <div className="fixed inset-0 z-[200]" onClick={() => setShowSoundDropdown(false)} />
                  <div className="absolute top-[calc(100%+2px)] left-0 right-0 bg-white rounded-lg border border-[#e4e4e7] shadow-lg z-[210] max-h-64 overflow-y-auto">
                    {Object.entries(soundCategories).map(([key, cat], catIdx) => (
                      <div key={key}>
                        <div className={`px-3 py-1.5 bg-[#f7f7f8] ${catIdx > 0 ? "border-t border-[#e4e4e7]" : ""}`}>
                          <span className="text-[9px] uppercase tracking-wider text-[#a1a1aa] font-medium" style={{ fontFamily: "var(--font-body)" }}>
                            {cat.label}{key === "recommended" ? " — Default" : ""}
                          </span>
                        </div>
                        {cat.items.map((s, i) => (
                          <button key={s} onClick={() => { setSessionSound(s); setShowSoundDropdown(false); markEdited(); }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#f4f4f5] transition-colors cursor-pointer text-left ${i > 0 ? "border-t border-[#f0f0f3]" : ""}`}>
                            <span className="text-sm text-[#18181b]" style={{ fontFamily: "var(--font-body)" }}>{s}</span>
                            {s === sessionSound && <Check className="w-3.5 h-3.5 text-[#6b9a70]" />}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Volume */}
            <div className="flex items-center gap-2.5 mt-2.5">
              <button onClick={() => setSoundVolume(soundVolume > 0 ? 0 : 70)} className="shrink-0 text-[#a1a1aa] hover:text-[#18181b] transition-colors cursor-pointer">
                {soundVolume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={soundVolume}
                onChange={(e) => setSoundVolume(Number(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#18181b] [&::-webkit-slider-thumb]:cursor-pointer"
                style={{ background: `linear-gradient(to right, #18181b ${soundVolume}%, #e4e4e7 ${soundVolume}%)` }}
              />
              <span className="text-[10px] text-[#a1a1aa] tabular-nums w-7 text-right" style={{ fontFamily: "var(--font-body)" }}>{soundVolume}%</span>
            </div>
          </div>

          {/* Estimated duration */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <label className="text-[10px] uppercase tracking-wider text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>Estimated Duration</label>
              <div className="relative">
                <button
                  onClick={() => setShowDurationInfo(!showDurationInfo)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[#a1a1aa] hover:text-[#18181b] hover:bg-[#f4f4f5] transition-all cursor-pointer">
                  <Info className="w-3 h-3" />
                </button>
                {showDurationInfo && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-52 p-3 rounded-lg bg-[#18181b] text-white shadow-xl z-30">
                    <p className="text-[11px] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                      Duration is calculated from script length, pause times, and breathing cues. Edit pauses or script text to adjust.
                    </p>
                    <div className="w-2 h-2 bg-[#18181b] rotate-45 absolute -top-1 left-1/2 -translate-x-1/2" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#f9f9fb] border border-transparent">
              <Timer className="w-4 h-4 text-[#a1a1aa]" />
              <span className="text-sm text-[#71717a] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>~{estimated.minutes}m {estimated.seconds > 0 ? `${estimated.seconds}s` : ""}</span>
            </div>
          </div>

          {/* Pause types */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#71717a] mb-2.5 block" style={{ fontFamily: "var(--font-body)" }}>Pause Types</label>
            <div className="p-3 rounded-lg bg-[#f9f9fb] border border-[#f0f0f3] space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#a1a1aa" }} />
                  <span className="text-[11px] text-[#71717a]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Short</span>
                  <span className="text-[10px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>under 3s</span>
                </div>
                <p className="text-[11px] text-[#a1a1aa] leading-relaxed pl-4" style={{ fontFamily: "var(--font-body)" }}>Voice continues naturally, like a brief breath between sentences</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--color-dusk)" }} />
                  <span className="text-[11px]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--color-dusk)" }}>Long</span>
                  <span className="text-[10px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>3s or more</span>
                </div>
                <p className="text-[11px] text-[#a1a1aa] leading-relaxed pl-4" style={{ fontFamily: "var(--font-body)" }}>Creates a distinct break, voice re-entry is slightly more deliberate</p>
              </div>
            </div>
          </div>
        </div>}

        {rightTab === "history" && (
          <div className="flex-1 overflow-y-auto studio-scroll">
            {/* Session created banner */}
            <div className="px-5 py-3 border-b border-[#f0f0f3] bg-white/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#f0f7f1] flex items-center justify-center">
                  <FileText className="w-3 h-3 text-[#5a9a62]" />
                </div>
                <div>
                  <span className="text-[11px] text-[#18181b] block" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Session created</span>
                  <span className="text-[10px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>Just now</span>
                </div>
              </div>
            </div>

            {/* Generation history — grouped by date */}
            {(() => {
              // Group generations by date portion of timestamp
              const groups: { date: string; items: typeof mockGenerations }[] = [];
              let currentDate = "";
              for (const gen of mockGenerations) {
                const datePart = gen.timestamp.split(" · ")[0]; // e.g. "Mar 24, 2026"
                if (datePart !== currentDate) {
                  currentDate = datePart;
                  groups.push({ date: datePart, items: [] });
                }
                groups[groups.length - 1].items.push(gen);
              }
              return groups.map((group) => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex items-center justify-center py-3">
                    <span className="text-[10px] text-[#a1a1aa] px-2.5 py-1 rounded-full bg-white border border-[#e8e8ec]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{group.date}</span>
                  </div>
                  {/* Items */}
                  {group.items.map((gen) => {
                    const timePart = gen.timestamp.split(" · ")[1] || "";
                    const genVoice = voices.find(v => v.name === gen.voice);
                    const voiceColor = genVoice?.color || "#a1a1aa";
                    return (
                      <div
                        key={gen.id}
                        className={`group/item px-5 py-3 border-b border-[#f4f4f5] transition-colors ${(gen.status as string) === "failed" ? "bg-[#fffbfb]" : "hover:bg-white"}`}
                      >
                        {/* Prompt text */}
                        <p className={`text-[13px] leading-snug mb-1.5 ${(gen.status as string) === "failed" ? "text-[#b91c1c]" : "text-[#18181b]"}`} style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>
                          {gen.prompt}
                        </p>
                        {/* Metadata row */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ background: voiceColor + "20" }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: voiceColor }} />
                          </div>
                          <span className="text-[11px] text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>
                            {gen.voice} · {gen.protocol} · {gen.duration}
                          </span>
                          <span className="text-[11px] text-[#c4c4c8] ml-auto" style={{ fontFamily: "var(--font-body)" }}>{timePart}</span>
                        </div>
                        {/* Status badges */}
                        {(gen.status as string) === "failed" && (
                          <div className="mt-1.5">
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#fef2f2] text-[#ef4444]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Generation failed</span>
                          </div>
                        )}
                        {/* Hover actions */}
                        {(gen.status as string) !== "failed" && (
                          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button className="h-7 px-2 rounded-md hover:bg-[#f0f0f3] flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer">
                              <Play className="w-3 h-3" />
                            </button>
                            <button className="h-7 px-2 rounded-md hover:bg-[#f0f0f3] flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer">
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        )}
      </div>

    </div>
  );
}

/* ─── Main Studio Page ─── */

export default function StudioPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState<NavId>("sessions");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [voicePlaying, setVoicePlaying] = useState<string | null>(null);

  // Bottom player state
  const [nowPlayingId, setNowPlayingId] = useState<string | null>(null);
  const [playerPlaying, setPlayerPlaying] = useState(false);
  const nowPlayingSession = mockSessions.find(s => s.id === nowPlayingId) || null;

  const handlePlaySession = useCallback((sessionId: string) => {
    if (nowPlayingId === sessionId) {
      setPlayerPlaying(prev => !prev);
    } else {
      setNowPlayingId(sessionId);
      setPlayerPlaying(true);
    }
  }, [nowPlayingId]);

  const handleClosePlayer = useCallback(() => {
    setNowPlayingId(null);
    setPlayerPlaying(false);
  }, []);

  // Rotating phrases for generate heading
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phraseWidth, setPhraseWidth] = useState<number | null>(null);
  const hasAnimatedRef = useRef(false);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (measureRef.current) {
      setPhraseWidth(measureRef.current.offsetWidth);
    }
  }, [phraseIndex]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const initialDelay = setTimeout(() => {
      hasAnimatedRef.current = true;
      setPhraseIndex(1);
      intervalId = setInterval(() => {
        setPhraseIndex((i) => (i + 1) % rotatingPhrases.length);
      }, 2500);
    }, 7000);
    return () => {
      clearTimeout(initialDelay);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Generate flow: "input" → "choose" → "studio"
  const [genStep, setGenStep] = useState<"input" | "choose" | "studio">("input");
  const [genConfig, setGenConfig] = useState({ prompt: "", voice: "aria", duration: 10, sound: "Sanctuary" });
  const [showGenAdvanced, setShowGenAdvanced] = useState(false);
  const [selectedGenProtocol, setSelectedGenProtocol] = useState<string | null>(null);
  const [showGenProtocolInfo, setShowGenProtocolInfo] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [sessionsPage, setSessionsPage] = useState(1);
  const [generationsPage, setGenerationsPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{ type: "regenerate" | "delete"; sessionId: string; sessionTitle: string } | null>(null);

  const handleQuickGenerate = useCallback(() => {
    const intent = detectIntent(genConfig.prompt);
    const params = new URLSearchParams({
      prompt: genConfig.prompt,
      voice: genConfig.voice,
      duration: String(genConfig.duration),
      intent,
    });
    router.push(`/session?${params.toString()}`);
  }, [router, genConfig]);

  const handlePromptSubmit = (text: string) => {
    if (!text.trim()) return;
    setGenConfig(prev => ({ ...prev, prompt: text.trim() }));
    setGeneratePrompt("");
    setGenStep("choose");
  };

  const navigateTo = (id: NavId) => {
    setActiveNav(id);
    setGenStep("input");
  };

  const filteredSessions = mockSessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Studio view — sidebar stays, top header hidden
  if (activeNav === "generate" && genStep === "studio") {
    return (
      <div className="h-screen flex" style={{ background: "#ffffff" }}>
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-[#e4e4e7] flex flex-col" style={{ background: "#f4f4f5" }}>
          <div className="px-5 pt-6 pb-5">
            <a href="/" className="flex items-center gap-2 text-[var(--color-sand-900)]">
              <Logo />
              <div>
                <span className="text-sm tracking-tight block" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Kilt Studio</span>
                <span className="text-[10px] text-[var(--color-sand-400)] block -mt-0.5" style={{ fontFamily: "var(--font-body)" }}>by MindFlow</span>
              </div>
            </a>
          </div>
          <div className="px-3 mb-4">
            <button onClick={() => { navigateTo("generate" as NavId); setGenStep("input"); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm transition-all cursor-pointer shadow-[0_2px_8px_rgba(107,154,112,0.3)] hover:shadow-[0_4px_16px_rgba(107,154,112,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 600, background: "linear-gradient(135deg, #5a9a62, #6bb070)", color: "#fff" }}>
              <Sparkles className="w-4 h-4" />
              Generate
            </button>
          </div>
          <nav className="flex-1 px-3 space-y-0.5">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => navigateTo(item.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] hover:text-[var(--color-sand-900)]"
                style={{ fontFamily: "var(--font-body)" }}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="px-3 pb-5 space-y-2">
            <div className="border-t border-[var(--color-sand-100)] pt-4 px-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-sand-200)] flex items-center justify-center">
                  <span className="text-xs text-[var(--color-sand-600)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>U</span>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>User</p>
                  <p className="text-[10px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>Free plan</p>
                </div>
              </div>
              <a href="/" className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)] hover:bg-[var(--color-sand-100)] transition-all text-xs" style={{ fontFamily: "var(--font-body)" }}>
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </a>
            </div>
          </div>
        </aside>

        {/* Studio content — no top header */}
        <div className="flex-1 flex flex-col min-h-0">
          <StudioSession
            prompt={genConfig.prompt}
            voice={genConfig.voice}
            duration={genConfig.duration}
            sound={genConfig.sound}
            onBack={() => { setActiveNav("sessions"); setGenStep("input"); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-sand-50)" }}>
      {/* ─── Sidebar ─── */}
      <motion.aside initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
        className="w-56 shrink-0 border-r border-[var(--color-sand-200)] bg-white flex flex-col" style={{ minHeight: "100vh" }}>
        <div className="px-5 pt-6 pb-5">
          <a href="/" className="flex items-center gap-2 text-[var(--color-sand-900)]">
            <Logo />
            <div>
              <span className="text-sm tracking-tight block" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Kilt Studio</span>
              <span className="text-[10px] text-[var(--color-sand-400)] block -mt-0.5" style={{ fontFamily: "var(--font-body)" }}>by MindFlow</span>
            </div>
          </a>
        </div>

        <div className="px-3 mb-4">
          <div className="relative">
            {/* Animated gradient border glow — visible when active */}
            <div
              className={`absolute -inset-[2px] rounded-[14px] bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] transition-opacity duration-500 blur-[1px] ${
                activeNav === ("generate" as NavId) ? "opacity-80" : "opacity-0"
              }`}
              style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}
            />
            <button onClick={() => { navigateTo("generate" as NavId); setActiveNav("generate" as NavId); setGenStep("input"); }}
              className={`relative w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                activeNav === ("generate" as NavId)
                  ? "shadow-[inset_0_2px_4px_rgba(0,0,0,0.15),0_1px_2px_rgba(107,154,112,0.2)]"
                  : "shadow-[0_2px_8px_rgba(107,154,112,0.3)] hover:shadow-[0_4px_16px_rgba(107,154,112,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              }`}
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                background: activeNav === ("generate" as NavId)
                  ? "linear-gradient(135deg, #3d6b43, #4a7c50)"
                  : "linear-gradient(135deg, #5a9a62, #6bb070)",
                color: activeNav === ("generate" as NavId) ? "rgba(255,255,255,0.95)" : "#fff",
              }}>
              <Sparkles className="w-4 h-4" />
              Generate
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item, i) => {
            const isActive = activeNav === item.id;
            return (
              <motion.button key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                  isActive ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm" : "text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] hover:text-[var(--color-sand-900)]"
                }`}
                style={{ fontFamily: "var(--font-body)" }}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </motion.button>
            );
          })}
        </nav>

        <div className="px-3 pb-5 space-y-2">
          <div className="border-t border-[var(--color-sand-100)] pt-4 px-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-sand-200)] flex items-center justify-center">
                <span className="text-xs text-[var(--color-sand-600)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>U</span>
              </div>
              <div>
                <p className="text-xs text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>User</p>
                <p className="text-[10px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>Free plan</p>
              </div>
            </div>
            <a href="/" className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)] hover:bg-[var(--color-sand-100)] transition-all text-xs" style={{ fontFamily: "var(--font-body)" }}>
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </a>
          </div>
        </div>
      </motion.aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 min-h-screen">
        <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.3 }}
          className="sticky top-0 z-10 backdrop-blur-xl border-b border-[#e8e8ec] py-4" style={{ background: "rgba(250,249,247,0.85)" }}>
          <div className="px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-[15px] text-[#18181b]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
                {activeNav === "sessions" && "All Sessions"}
                {activeNav === "history" && "History"}
                {activeNav === ("generate" as NavId) && "Generate"}
                {activeNav === "settings" && "Settings"}
              </h1>
              {activeNav === "sessions" && filteredSessions.length > 0 && (
                <span className="text-[11px] text-[#a1a1aa] px-2 py-0.5 rounded-md bg-[#f4f4f5] border border-[#e8e8ec] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>
                  {filteredSessions.length}
                </span>
              )}
            </div>
            <div className={`relative transition-all ${activeNav === "sessions" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a1a1aa]" />
              <input type="text" placeholder="Search sessions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-9 pr-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[13px] text-[#18181b] placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#a1a1aa] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] transition-all"
                style={{ fontFamily: "var(--font-body)" }} />
            </div>
          </div>
        </motion.header>

        <div className="max-w-6xl mx-auto px-10 pt-20 pb-8">
          <AnimatePresence mode="wait">
            {/* All Sessions */}
            {activeNav === "sessions" && (
              <motion.div key="sessions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {filteredSessions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredSessions.map((session, i) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        delay={i * 0.05}
                        isNowPlaying={nowPlayingId === session.id && playerPlaying}
                        onPlay={() => handlePlaySession(session.id)}
                        onOpenStudio={() => {
                          setGenConfig({ prompt: session.title, voice: session.voice.toLowerCase(), duration: parseInt(session.duration), sound: session.sound });
                          setActiveNav("generate" as NavId);
                          setGenStep("studio");
                        }}
                      />
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
                {/* Filter tabs */}
                <div className="flex items-center gap-1 mb-5 bg-[#f4f4f5] rounded-lg p-1 w-fit">
                  {([["all", "All"], ["generations", "Generations"], ["sessions", "Sessions"]] as const).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { setHistoryFilter(key); setSessionsPage(1); setGenerationsPage(1); }}
                      className={`px-3.5 py-1.5 rounded-md text-[12px] transition-all cursor-pointer ${
                        historyFilter === key
                          ? "bg-white text-[#18181b] shadow-sm"
                          : "text-[#71717a] hover:text-[#18181b]"
                      }`}
                      style={{ fontFamily: "var(--font-body)", fontWeight: historyFilter === key ? 500 : 400 }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Generations section (first) */}
                {(historyFilter === "all" || historyFilter === "generations") && (() => {
                  const perPage = 5;
                  const totalPages = Math.ceil(mockGenerations.length / perPage);
                  const paged = mockGenerations.slice((generationsPage - 1) * perPage, generationsPage * perPage);
                  return (
                  <div className="mb-6">
                    {historyFilter === "all" && (
                      <h3 className="text-[11px] uppercase tracking-wider text-[#a1a1aa] mb-3" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Generations</h3>
                    )}
                    <div className="bg-white rounded-xl border border-[#e8e8ec] overflow-hidden">
                      <div className="grid grid-cols-[1fr_80px_70px_90px_70px_130px] gap-4 px-5 py-3 border-b border-[#f0f0f3] bg-[#fafafa]">
                        {["Prompt", "Voice", "Duration", "Protocol", "Credit", ""].map((h) => (
                          <span key={h} className="text-[10px] uppercase tracking-wider text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{h}</span>
                        ))}
                      </div>
                      {paged.map((gen, i) => {
                        const isGenPlaying = gen.sessionId ? nowPlayingId === gen.sessionId && playerPlaying : false;
                        const genSession = gen.sessionId ? mockSessions.find(s => s.id === gen.sessionId) : null;
                        const genAccent = genSession ? (categoryColors[genSession.category] || categoryColors.focus).accent : "#18181b";
                        return (
                        <motion.div
                          key={gen.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04, duration: 0.25 }}
                          className="group grid grid-cols-[1fr_80px_70px_90px_70px_130px] gap-4 items-center px-5 py-3.5 border-b border-[#f4f4f5] last:border-b-0 hover:bg-[#fafafa] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {gen.status === "failed" ? (
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#ef4444]" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#a1a1aa]" />
                            )}
                            <div className="min-w-0">
                              <span className={`text-[13px] truncate block ${gen.status === "failed" ? "text-[#ef4444]" : "text-[#18181b]"}`} style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>{gen.prompt}</span>
                              <span className="text-[10px] text-[#a1a1aa] block" style={{ fontFamily: "var(--font-body)" }}>{gen.timestamp}</span>
                            </div>
                          </div>
                          <span className="text-[11px] text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>{gen.voice}</span>
                          <span className="text-[11px] text-[#71717a] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{gen.duration}</span>
                          <div>
                            <span className="text-[11px] text-[#71717a] truncate block" style={{ fontFamily: "var(--font-body)" }}>{gen.protocol}</span>
                            {gen.status === "failed" && (
                              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#fef2f2] text-[#ef4444] inline-block mt-0.5" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Failed</span>
                            )}
                          </div>
                          <span className="text-[11px] tabular-nums" style={{ fontFamily: "var(--font-body)", color: gen.creditUsed > 0 ? "#71717a" : "#a1a1aa" }}>{gen.creditUsed > 0 ? `-${gen.creditUsed}` : "0"}</span>
                          <div className="flex items-center justify-end gap-1">
                            <div className="relative group/tip">
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePlaySession(gen.sessionId || ""); }}
                                disabled={!gen.sessionId || (gen.status as string) === "failed"}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#27272a] transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                style={{ background: isGenPlaying ? genAccent : "#18181b", color: "#fff" }}
                              >
                                {isGenPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-[#18181b] text-white text-[10px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10" style={{ fontFamily: "var(--font-body)" }}>{isGenPlaying ? "Pause" : "Play"}</span>
                            </div>
                            <div className="relative group/tip">
                              <button
                                onClick={(e) => { e.stopPropagation(); }}
                                disabled={(gen.status as string) === "failed"}
                                className="w-8 h-8 rounded-lg hover:bg-[#f0f0f3] flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-[#18181b] text-white text-[10px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10" style={{ fontFamily: "var(--font-body)" }}>Download</span>
                            </div>
                          </div>
                        </motion.div>
                        );
                      })}
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 mt-4">
                        <button
                          onClick={() => setGenerationsPage(p => Math.max(1, p - 1))}
                          disabled={generationsPage === 1}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#52525b] hover:text-[#18181b] hover:bg-white border border-[#e4e4e7] hover:border-[#d4d4d8] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-[12px] text-[#52525b] tabular-nums" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                          Page {generationsPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setGenerationsPage(p => Math.min(totalPages, p + 1))}
                          disabled={generationsPage === totalPages}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#52525b] hover:text-[#18181b] hover:bg-white border border-[#e4e4e7] hover:border-[#d4d4d8] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })()}

                {/* Sessions section (second) */}
                {(historyFilter === "all" || historyFilter === "sessions") && (() => {
                  const perPage = 5;
                  const totalPages = Math.ceil(mockSessions.length / perPage);
                  const paged = mockSessions.slice((sessionsPage - 1) * perPage, sessionsPage * perPage);
                  return (
                  <div className="mb-6">
                    {historyFilter === "all" && (
                      <h3 className="text-[11px] uppercase tracking-wider text-[#a1a1aa] mb-3" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Sessions Created</h3>
                    )}
                    <div className="bg-white rounded-xl border border-[#e8e8ec] overflow-hidden">
                      <div className="grid grid-cols-[1fr_100px_80px_80px_140px_130px] gap-4 px-5 py-3 border-b border-[#f0f0f3] bg-[#fafafa]">
                        {["Session", "Protocol", "Duration", "Voice", "Created", ""].map((h) => (
                          <span key={h} className="text-[10px] uppercase tracking-wider text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{h}</span>
                        ))}
                      </div>
                      {paged.map((session, i) => {
                        const accent = (categoryColors[session.category] || categoryColors.focus).accent;
                        const isRowPlaying = nowPlayingId === session.id && playerPlaying;
                        return (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.04, duration: 0.25 }}
                            onClick={() => {
                              setGenConfig({ prompt: session.title, voice: session.voice.toLowerCase(), duration: parseInt(session.duration), sound: session.sound });
                              setActiveNav("generate" as NavId);
                              setGenStep("studio");
                            }}
                            className="group grid grid-cols-[1fr_100px_80px_80px_140px_130px] gap-4 items-center px-5 py-3.5 border-b border-[#f4f4f5] last:border-b-0 hover:bg-[#fafafa] transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: isRowPlaying ? accent : "#d4d4d8" }} />
                              <span className="text-[13px] text-[#18181b] truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>{session.title}</span>
                            </div>
                            <span className="text-[11px] text-[#71717a] truncate" style={{ fontFamily: "var(--font-body)" }}>{session.protocol}</span>
                            <span className="text-[11px] text-[#71717a] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{session.duration}</span>
                            <span className="text-[11px] text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>{session.voice}</span>
                            <span className="text-[11px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>{session.createdAt}</span>
                            <div className="flex items-center justify-end gap-1">
                              <div className="relative group/tip">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setGenConfig({ prompt: session.title, voice: session.voice.toLowerCase(), duration: parseInt(session.duration), sound: session.sound }); setActiveNav("generate" as NavId); setGenStep("studio"); }}
                                  className="w-8 h-8 rounded-lg hover:bg-[#f0f0f3] flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer"
                                >
                                  <PenLine className="w-4 h-4" />
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-[#18181b] text-white text-[10px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10" style={{ fontFamily: "var(--font-body)" }}>Edit in Studio</span>
                              </div>
                              <div className="relative group/tip">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConfirmDialog({ type: "regenerate", sessionId: session.id, sessionTitle: session.title }); }}
                                  className="w-8 h-8 rounded-lg hover:bg-[#f0f0f3] flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-[#18181b] text-white text-[10px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10" style={{ fontFamily: "var(--font-body)" }}>Regenerate</span>
                              </div>
                              <div className="relative group/tip">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConfirmDialog({ type: "delete", sessionId: session.id, sessionTitle: session.title }); }}
                                  className="w-8 h-8 rounded-lg hover:bg-[#fef2f2] flex items-center justify-center text-[#71717a] hover:text-[#ef4444] transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-[#18181b] text-white text-[10px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10" style={{ fontFamily: "var(--font-body)" }}>Delete</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 mt-4">
                        <button
                          onClick={() => setSessionsPage(p => Math.max(1, p - 1))}
                          disabled={sessionsPage === 1}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#52525b] hover:text-[#18181b] hover:bg-white border border-[#e4e4e7] hover:border-[#d4d4d8] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-[12px] text-[#52525b] tabular-nums" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                          Page {sessionsPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setSessionsPage(p => Math.min(totalPages, p + 1))}
                          disabled={sessionsPage === totalPages}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#52525b] hover:text-[#18181b] hover:bg-white border border-[#e4e4e7] hover:border-[#d4d4d8] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })()}
              </motion.div>
            )}

            {/* Generate — Step 1: Prompt Input (identical to homepage) */}
            {activeNav === ("generate" as NavId) && genStep === "input" && (
              <motion.div key="gen-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-120px)] -mt-40">
                {/* Hidden measurer */}
                <span
                  ref={measureRef}
                  className="absolute opacity-0 pointer-events-none text-[2rem] md:text-[2.75rem] italic font-bold whitespace-nowrap"
                  style={{ fontFamily: "var(--font-display)" }}
                  aria-hidden="true"
                >
                  {rotatingPhrases[phraseIndex]}
                </span>

                <h1 className="text-[2rem] md:text-[2.75rem] text-[var(--color-sand-900)] text-center mb-8 leading-[1.2] whitespace-nowrap flex items-baseline justify-center" style={{ fontFamily: "var(--font-display)" }}>
                  <span>Generate&nbsp;</span>
                  <motion.span
                    className="relative inline-block overflow-hidden pl-[0.05em]"
                    style={{ height: "1.2em" }}
                    animate={{ width: phraseWidth ? phraseWidth + 2 : "auto" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={phraseIndex}
                        initial={hasAnimatedRef.current ? { y: "110%", opacity: 0 } : false}
                        animate={{ y: "0%", opacity: 1 }}
                        exit={{ y: "-110%", opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-0 top-0 italic font-bold whitespace-nowrap"
                      >
                        {rotatingPhrases[phraseIndex]}
                      </motion.span>
                    </AnimatePresence>
                    <span className="invisible italic font-bold" aria-hidden="true">
                      {rotatingPhrases[phraseIndex]}
                    </span>
                  </motion.span>
                </h1>
                <div className="w-full mb-8 relative rounded-xl group">
                  <div className="absolute -inset-[2px] rounded-xl bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-80 group-focus-within:opacity-100 transition-opacity duration-300 blur-[0.5px]"
                    style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }} />
                  <div className="relative bg-white rounded-xl p-3 flex items-center gap-3">
                    <input type="text" value={generatePrompt} onChange={(e) => setGeneratePrompt(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePromptSubmit(generatePrompt); } }}
                      placeholder="Create a guided meditation on..."
                      className="flex-1 outline-none text-sm text-[var(--color-sand-900)] placeholder:text-[var(--color-sand-400)] bg-transparent" style={{ fontFamily: "var(--font-body)" }} />
                    <button onClick={() => handlePromptSubmit(generatePrompt)} disabled={!generatePrompt.trim()}
                      className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all cursor-pointer disabled:opacity-30"
                      style={{ background: generatePrompt.trim() ? "var(--color-sand-900)" : "transparent", color: generatePrompt.trim() ? "var(--color-sand-50)" : "var(--color-sand-400)" }}>
                      {generatePrompt.trim() ? <ArrowRight className="w-4 h-4" /> : <MessageCircle className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="w-full flex flex-col items-center gap-3">
                  <span className="text-xs text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>or try one of these</span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map((s, i) => (
                      <motion.button key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
                        onClick={() => handlePromptSubmit(s)}
                        className="text-[var(--color-sand-600)] bg-white/70 hover:bg-white border border-[var(--color-sand-200)] text-xs px-3.5 py-2 rounded-full transition-all cursor-pointer"
                        style={{ fontFamily: "var(--font-body)" }}>{s}</motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Generate — Step 2: Configure (copied from /create page) */}
            {activeNav === ("generate" as NavId) && genStep === "choose" && (
              <motion.div key="gen-choose" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-xl mx-auto pt-[10vh]">
                {/* Back button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setGenStep("input")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-sand-600)] hover:text-[var(--color-sand-900)] hover:bg-white/60 border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] transition-all cursor-pointer mb-8"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <ChevronLeft className="w-4 h-4" />Back
                </motion.button>

                {/* Prompt display */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
                  <p className="text-2xl text-[var(--color-sand-900)] max-w-md mx-auto leading-snug" style={{ fontFamily: "var(--font-display)" }}>&ldquo;{genConfig.prompt}&rdquo;</p>
                </motion.div>

                {/* Duration */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-sand-400)] mb-3" style={{ fontFamily: "var(--font-body)" }}>Duration</p>
                  <div className="flex gap-2 items-end">
                    {sharedDurations.map((d) => (
                      <div key={d} className="flex-1 flex flex-col items-center">
                        <span className={`text-[8px] tracking-wide uppercase mb-1 h-3 ${d === 10 && genConfig.duration !== 10 ? "text-[var(--color-sand-400)]" : "text-transparent select-none"}`} style={{ fontFamily: "var(--font-body)" }}>{d === 10 ? "Popular" : "\u00A0"}</span>
                        <button onClick={() => setGenConfig(prev => ({ ...prev, duration: d }))}
                          className={`w-full py-2.5 rounded-full text-sm transition-all cursor-pointer ${genConfig.duration === d ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm" : "bg-white/60 text-[var(--color-sand-600)] hover:bg-white border border-[var(--color-sand-200)]"}`}
                          style={{ fontFamily: "var(--font-body)" }}>{d}m</button>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Voice */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-sand-400)] mb-3" style={{ fontFamily: "var(--font-body)" }}>Voice</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {sharedVoices.map((v) => {
                      const isActive = genConfig.voice === v.id;
                      const isVoicePlaying = voicePlaying === v.id;
                      return (
                        <button key={v.id} onClick={(e) => { e.stopPropagation(); setGenConfig(prev => ({ ...prev, voice: v.id })); setVoicePlaying(v.id); setTimeout(() => setVoicePlaying((cur) => cur === v.id ? null : cur), 3000); }}
                          className={`relative flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer text-left overflow-hidden ${isActive ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-md" : "bg-white text-[var(--color-sand-900)] hover:shadow-sm border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)]"}`}>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium flex items-center gap-1.5" style={{ fontFamily: "var(--font-body)" }}>
                              {v.label}
                              {v.id === "aria" && isActive && <span className="text-[8px] uppercase tracking-wide opacity-40 font-normal px-1.5 py-px rounded-full bg-white/15">Default</span>}
                            </span>
                            <span className={`text-xs mt-0.5 block ${isActive ? "opacity-50" : "text-[var(--color-sand-500)]"}`} style={{ fontFamily: "var(--font-body)" }}>{v.description}</span>
                            <div className="flex items-end gap-[2px] h-3 mt-2">
                              {isVoicePlaying && Array.from({ length: 12 }).map((_, i) => (
                                <motion.div
                                  key={i}
                                  className={`w-[2px] rounded-full ${isActive ? "bg-white/50" : "bg-[var(--color-sand-400)]"}`}
                                  animate={{ height: [`${20 + Math.random() * 40}%`, `${40 + Math.random() * 60}%`, `${20 + Math.random() * 40}%`] }}
                                  transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, ease: "easeInOut" }}
                                  style={{ height: "30%" }}
                                />
                              ))}
                            </div>
                          </div>
                          <div
                            onClick={(e) => { e.stopPropagation(); setVoicePlaying(voicePlaying === v.id ? null : v.id); }}
                            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-white/20 text-white hover:bg-white/30" : "bg-[var(--color-sand-100)] text-[var(--color-sand-500)] hover:bg-[var(--color-sand-200)]"}`}
                          >
                            {isVoicePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Advanced — Protocol selection */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
                  <button
                    onClick={() => setShowGenAdvanced(!showGenAdvanced)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/60 border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] hover:bg-white transition-all cursor-pointer"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <FlaskConical className="w-4 h-4 text-[var(--color-sand-500)]" />
                    <span className="text-sm text-[var(--color-sand-600)] flex-1 text-left">Advanced options</span>
                    <ChevronDown className={`w-5 h-5 text-[var(--color-sand-400)] transition-transform ${showGenAdvanced ? "rotate-180" : ""}`} />
                  </button>

                  {showGenAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.25 }}
                      className="mt-4"
                    >
                      <div className="flex items-center gap-1.5 mb-3">
                        <p className="text-xs uppercase tracking-widest text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>Protocol</p>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowGenProtocolInfo(!showGenProtocolInfo); }}
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[var(--color-sand-400)] hover:text-[var(--color-sand-700)] hover:bg-white/60 transition-all cursor-pointer"
                          >
                            <Info className="w-3 h-3" />
                          </button>
                          {showGenProtocolInfo && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setShowGenProtocolInfo(false)} />
                              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 p-4 rounded-xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-xl z-20">
                                <p className="text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-body)" }}>How protocols work</p>
                                <p className="text-[11px] leading-relaxed opacity-70" style={{ fontFamily: "var(--font-body)" }}>
                                  Each session is structured around a clinical protocol. Our AI was trained on peer-reviewed techniques — it controls pacing, language patterns, and pause timing to match how each method is practiced by trained therapists.
                                </p>
                                <p className="text-[11px] leading-relaxed opacity-70 mt-2" style={{ fontFamily: "var(--font-body)" }}>
                                  A protocol is chosen automatically during generation. For therapists and advanced users — override here.
                                </p>
                                <div className="w-2.5 h-2.5 bg-[var(--color-sand-900)] rotate-45 absolute -top-1 left-1/2 -translate-x-1/2" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-[var(--color-sand-400)] mb-3 italic" style={{ fontFamily: "var(--font-body)" }}>
                        Auto-chosen during generation. For therapists and advanced users — override below.
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {protocols.map((p) => {
                          const isSelected = selectedGenProtocol === p.abbr;
                          return (
                            <button
                              key={p.abbr}
                              onClick={(e) => { e.stopPropagation(); setSelectedGenProtocol(isSelected ? null : p.abbr); }}
                              className={`relative p-3 rounded-xl text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-md"
                                  : "bg-white/60 text-[var(--color-sand-900)] hover:bg-white border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)]"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>{p.abbr}</span>
                              </div>
                              <span className={`text-[10px] leading-snug block ${isSelected ? "opacity-50" : "text-[var(--color-sand-500)]"}`} style={{ fontFamily: "var(--font-body)" }}>
                                {p.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Action buttons */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-col gap-3 items-center">
                  {/* Open in Studio — primary CTA with border glow */}
                  <div className="relative rounded-full group w-full">
                    <div className="absolute -inset-[2.5px] rounded-full bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-90 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }} />
                    <button onClick={() => setGenStep("studio")}
                      className="relative w-full flex items-center justify-center gap-2.5 py-4 rounded-full bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-all shadow-lg cursor-pointer text-sm"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                      <PenLine className="w-4 h-4" />
                      <span>Open in Studio</span>
                      <span className="opacity-40 text-xs font-normal">· Edit script &amp; pauses</span>
                    </button>
                  </div>

                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>or</span>

                  {/* Quick Generate — secondary */}
                  <button onClick={handleQuickGenerate}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-full text-sm text-[var(--color-sand-900)] bg-white border-2 border-[var(--color-sand-900)] hover:bg-[var(--color-sand-50)] transition-all cursor-pointer"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                    <Zap className="w-4 h-4" />
                    <span>Quick Generate</span>
                    <span className="text-[var(--color-sand-400)] text-xs font-normal">· Create instantly</span>
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* Settings */}
            {activeNav === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="max-w-xl mx-auto">
                <div className="space-y-5">
                  {/* Account */}
                  <div className="bg-white rounded-xl border border-[#e8e8ec] overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-[#f0f0f3] bg-[#fafafa]">
                      <h3 className="text-[13px] text-[#18181b]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Account</h3>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e4e4e7] to-[#d4d4d8] flex items-center justify-center">
                            <span className="text-sm text-[#52525b]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>U</span>
                          </div>
                          <div>
                            <p className="text-[13px] text-[#18181b]" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>user@example.com</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded text-[10px] bg-[#f4f4f5] text-[#71717a] border border-[#e4e4e7]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Free</span>
                              <span className="text-[11px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>3 credits remaining</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push("/upgrade")}
                            className="px-4 py-2 rounded-lg bg-[#18181b] text-white text-[12px] hover:bg-[#27272a] transition-colors cursor-pointer shadow-sm"
                            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                            Upgrade to Pro
                          </button>
                        </div>
                      </div>
                      {/* Subscription management */}
                      <div className="mt-4 pt-4 border-t border-[#f0f0f3]">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[12px] text-[#71717a] block" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>Subscription</span>
                            <span className="text-[11px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>Manage billing, invoices, and plan changes</span>
                          </div>
                          <button
                            onClick={() => router.push("/upgrade")}
                            className="px-3.5 py-1.5 rounded-lg border border-[#e4e4e7] bg-white text-[12px] text-[#3f3f46] hover:bg-[#f4f4f5] hover:border-[#d4d4d8] transition-colors cursor-pointer"
                            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                            Manage Subscription
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="bg-white rounded-xl border border-[#e8e8ec] overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-[#f0f0f3] bg-[#fafafa]">
                      <h3 className="text-[13px] text-[#18181b]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Defaults</h3>
                    </div>
                    <div className="divide-y divide-[#f4f4f5]">
                      {[
                        { label: "Voice", value: "Aria", desc: "Calm, gentle female" },
                        { label: "Duration", value: "10 min", desc: "Standard session length" },
                        { label: "Ambient sound", value: "Sanctuary", desc: "Adaptive all-purpose" },
                      ].map((pref) => (
                        <div key={pref.label} className="flex items-center justify-between px-5 py-3.5 group hover:bg-[#fafafa] transition-colors">
                          <div>
                            <span className="text-[13px] text-[#18181b] block" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>{pref.label}</span>
                            <span className="text-[11px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>{pref.desc}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-[#71717a] px-2.5 py-1 rounded-md bg-[#f4f4f5] border border-[#e8e8ec]" style={{ fontFamily: "var(--font-body)" }}>{pref.value}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-[#a1a1aa]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auto-download toggle */}
                  <div className="bg-white rounded-xl border border-[#e8e8ec] overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-[#f0f0f3] bg-[#fafafa]">
                      <h3 className="text-[13px] text-[#18181b]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Behavior</h3>
                    </div>
                    <div className="divide-y divide-[#f4f4f5]">
                      {[
                        { label: "Auto-download after generation", desc: "Save audio files automatically", on: false },
                        { label: "Ambient sound preview", desc: "Play soundscape preview on select", on: true },
                      ].map((toggle) => (
                        <div key={toggle.label} className="flex items-center justify-between px-5 py-3.5">
                          <div>
                            <span className="text-[13px] text-[#18181b] block" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>{toggle.label}</span>
                            <span className="text-[11px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>{toggle.desc}</span>
                          </div>
                          <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${toggle.on ? "bg-[#18181b]" : "bg-[#d4d4d8]"}`}>
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${toggle.on ? "left-[18px]" : "left-0.5"}`} />
                          </div>
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

      {/* Bottom Player */}
      <AnimatePresence>
        {nowPlayingSession && (
          <PlayerBar
            session={nowPlayingSession}
            isPlaying={playerPlaying}
            onTogglePlay={() => setPlayerPlaying(prev => !prev)}
            onClose={handleClosePlayer}
          />
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 left-56 z-[500] flex items-center justify-center"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 -left-56 bg-black/40 backdrop-blur-[2px]" onClick={() => setConfirmDialog(null)} />
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white rounded-2xl shadow-2xl border border-[#e4e4e7] w-full max-w-sm mx-4 overflow-hidden"
            >
              <div className="px-6 pt-6 pb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  confirmDialog.type === "delete" ? "bg-[#fef2f2]" : "bg-[#f0f7f1]"
                }`}>
                  {confirmDialog.type === "delete" ? (
                    <Trash2 className="w-5 h-5 text-[#ef4444]" />
                  ) : (
                    <RotateCcw className="w-5 h-5 text-[#5a9a62]" />
                  )}
                </div>
                <h3 className="text-[15px] text-[#18181b] mb-1.5" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
                  {confirmDialog.type === "delete" ? "Delete Session" : "Regenerate Session"}
                </h3>
                <p className="text-[13px] text-[#52525b] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {confirmDialog.type === "delete" ? (
                    <>Are you sure you want to delete <strong>&ldquo;{confirmDialog.sessionTitle}&rdquo;</strong>? This action is permanent and cannot be undone.</>
                  ) : (
                    <>Regenerating <strong>&ldquo;{confirmDialog.sessionTitle}&rdquo;</strong> will create a new version of this session. This will use <strong>1 credit</strong> from your balance.</>
                  )}
                </p>
              </div>
              <div className="px-6 pb-5 flex items-center gap-2.5">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-[13px] text-[#52525b] bg-[#f4f4f5] hover:bg-[#e8e8ec] transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Mock action — would trigger API call
                    setConfirmDialog(null);
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-[13px] text-white transition-colors cursor-pointer ${
                    confirmDialog.type === "delete"
                      ? "bg-[#ef4444] hover:bg-[#dc2626]"
                      : "bg-[#5a9a62] hover:bg-[#4a7c50]"
                  }`}
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                >
                  {confirmDialog.type === "delete" ? "Delete Permanently" : "Regenerate · 1 Credit"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
