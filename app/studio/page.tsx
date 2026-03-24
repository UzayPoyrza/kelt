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
} from "lucide-react";
import svgPaths from "@/lib/svg-paths";
import { suggestions, voices as sharedVoices, durations as sharedDurations, detectIntent, rotatingPhrases } from "@/lib/shared";

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

const soundPresets = ["Sanctuary", "Deep Night", "Flow State", "Still Water", "Safe Harbor"];

const mockSessions = [
  { id: "1", title: "Deep sleep after a long day", duration: "15 min", voice: "Aria", protocol: "CBT-I + NSDR", sound: "Deep Night", createdAt: "2 hours ago", category: "sleep", icon: Moon },
  { id: "2", title: "Morning focus before standup", duration: "10 min", voice: "James", protocol: "MBSR", sound: "Flow State", createdAt: "Yesterday", category: "focus", icon: Sun },
  { id: "3", title: "Calm my nerves before the flight", duration: "8 min", voice: "Kai", protocol: "HRV-BF + ACT", sound: "Still Water", createdAt: "2 days ago", category: "anxiety", icon: Heart },
  { id: "4", title: "Stress relief after deadline", duration: "20 min", voice: "Luna", protocol: "PMR + ACT", sound: "Safe Harbor", createdAt: "3 days ago", category: "stress", icon: Wind },
  { id: "5", title: "Quick breathing reset", duration: "5 min", voice: "Aria", protocol: "HRV-BF", sound: "Sanctuary", createdAt: "Last week", category: "focus", icon: Brain },
  { id: "6", title: "Wind down for bed", duration: "15 min", voice: "Luna", protocol: "NSDR", sound: "Soft Drift", createdAt: "Last week", category: "sleep", icon: Moon },
];

const navItems = [
  { id: "sessions" as const, label: "All Sessions", icon: LayoutGrid },
  { id: "history" as const, label: "History", icon: Clock },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

type NavId = (typeof navItems)[number]["id"] | "generate";

type ScriptBlock = {
  id: string;
  type: "voice" | "pause" | "breath";
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
      totalSeconds += block.pauseDuration || 2;
    } else if (block.type === "breath") {
      // Extract seconds from text like "Inhale — 4 seconds"
      const match = block.text.match(/(\d+)/);
      totalSeconds += match ? parseInt(match[1]) : 4;
    }
  }
  return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 };
}

const generateScript = (prompt: string): ScriptBlock[] => [
  { id: "1", type: "voice", text: "Find a comfortable position. Let your body settle into wherever you are right now." },
  { id: "2", type: "pause", text: "Settle in", pauseDuration: 2 },
  { id: "3", type: "voice", text: "Gently close your eyes. Take a moment to notice how you\u2019re feeling without judgment." },
  { id: "4", type: "pause", text: "Awareness", pauseDuration: 5 },
  { id: "5", type: "voice", text: "Now take a slow, deep breath in through your nose\u2026" },
  { id: "6", type: "breath", text: "Inhale \u2014 4 seconds" },
  { id: "7", type: "voice", text: "And release it slowly through your mouth. Let everything go." },
  { id: "8", type: "breath", text: "Exhale \u2014 6 seconds" },
  { id: "9", type: "voice", text: "Notice any tension in your shoulders. With each exhale, let them drop a little lower." },
  { id: "10", type: "pause", text: "Body responds", pauseDuration: 5 },
  { id: "11", type: "voice", text: "You\u2019re doing great. There\u2019s nowhere else you need to be right now." },
  { id: "12", type: "pause", text: "Rest", pauseDuration: 2 },
  { id: "13", type: "voice", text: "Let\u2019s continue with another deep breath. In through the nose\u2026" },
  { id: "14", type: "breath", text: "Inhale \u2014 4 seconds" },
  { id: "15", type: "voice", text: "And out through the mouth. Feel your body becoming heavier, more relaxed." },
  { id: "16", type: "breath", text: "Exhale \u2014 6 seconds" },
  { id: "17", type: "pause", text: "Integration", pauseDuration: 4 },
  { id: "18", type: "voice", text: "When you\u2019re ready, slowly begin to bring your awareness back. Take your time." },
];

/* ─── Session Card ─── */

function SessionCard({ session, delay }: { session: (typeof mockSessions)[number]; delay: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const Icon = session.icon;
  const categoryColors: Record<string, { accent: string; bg: string }> = {
    sleep: { accent: "#8b7ea6", bg: "rgba(139,126,166,0.08)" },
    focus: { accent: "#6b9a70", bg: "rgba(107,154,112,0.08)" },
    anxiety: { accent: "#6d9ab5", bg: "rgba(109,154,181,0.08)" },
    stress: { accent: "#c4876c", bg: "rgba(196,135,108,0.08)" },
  };
  const colors = categoryColors[session.category] || categoryColors.focus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-white rounded-xl border border-[#e8e8ec] hover:border-[#d0d0d6] transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
    >
      {/* Accent line */}
      <div className="absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, ${colors.accent}, transparent)` }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: colors.bg }}>
              <Icon className="w-[18px] h-[18px]" style={{ color: colors.accent }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] text-[#18181b] leading-tight truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{session.title}</h3>
              <p className="text-[11px] text-[#a1a1aa] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>{session.createdAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
            <button
              onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
              className="w-8 h-8 rounded-lg bg-[#18181b] text-white flex items-center justify-center hover:bg-[#27272a] transition-colors shadow-sm"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-[#f4f4f5] flex items-center justify-center text-[#a1a1aa] hover:text-[#71717a] transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
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
                  background: isPlaying
                    ? colors.accent
                    : `linear-gradient(180deg, #d4d4d8, #e4e4e7)`,
                  opacity: isPlaying ? 0.7 : 0.4,
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
          <span className="text-[10px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>·</span>
          <span className="text-[11px] text-[#71717a] flex items-center gap-1" style={{ fontFamily: "var(--font-body)" }}>
            <Music className="w-2.5 h-2.5" />
            {session.sound}
          </span>
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

  const [showDurationInfo, setShowDurationInfo] = useState(false);
  const sessionName = deriveSessionName(prompt);
  const estimated = estimateDuration(script);

  const selectedVoice = voices.find(v => v.id === sessionVoice) || voices[0];

  const setPauseDuration = useCallback((id: string, seconds: number) => {
    setScript(prev => prev.map(b =>
      b.id === id ? { ...b, pauseDuration: Math.max(1, seconds) } : b
    ));
  }, []);

  const togglePauseType = useCallback((id: string) => {
    setScript(prev => prev.map(b =>
      b.id === id ? { ...b, pauseDuration: (b.pauseDuration || 2) < 3 ? 4 : 2 } : b
    ));
  }, []);

  const updateBlockText = useCallback((id: string, text: string) => {
    setScript(prev => prev.map(b => b.id === id ? { ...b, text } : b));
  }, []);

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
          <h2 className="text-sm text-[#18181b] absolute left-1/2 -translate-x-1/2" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>{sessionName}</h2>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>
              {script.filter(b => b.type === "voice").length} segments · {script.filter(b => b.type === "pause").length} pauses · {script.filter(b => b.type === "breath").length} breaths
            </span>
          </div>
        </div>

        {/* Script blocks */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-0.5 studio-scroll">
          {script.map((block, index) => {
            const isSelected = selectedBlock === block.id;

            if (block.type === "pause" || block.type === "breath") {
              return (
                <div key={block.id}
                  onClick={() => setSelectedBlock(isSelected ? null : block.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${
                    isSelected ? "bg-white shadow-sm border border-[#e4e4e7]" : "hover:bg-white/80"
                  }`}>
                  <span className="text-[10px] text-[#a1a1aa] w-5 text-right tabular-nums shrink-0" style={{ fontFamily: "var(--font-body)" }}>{index + 1}</span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: block.type === "pause" ? "#f0ecf5" : "#e8f2f7" }}>
                    <div className="w-1.5 h-1.5 rounded-full"
                      style={{ background: block.type === "pause" ? "#8b7ea6" : "#6d9ab5" }} />
                  </div>
                  <span className="text-xs italic flex-1" style={{ fontFamily: "var(--font-body)", color: block.type === "pause" ? "#7c6f96" : "#5a8aa5" }}>
                    {block.type === "pause" ? `⏸ ${block.text}` : `🫁 ${block.text}`}
                  </span>
                  {block.type === "pause" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePauseType(block.id); }}
                        className="text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer"
                        style={{
                          fontFamily: "var(--font-body)",
                          borderColor: (block.pauseDuration || 2) >= 3 ? "#8b7ea6" : "#d4d4d8",
                          color: (block.pauseDuration || 2) >= 3 ? "#7c6f96" : "#71717a",
                          background: (block.pauseDuration || 2) >= 3 ? "#f0ecf5" : "transparent",
                        }}>
                        {(block.pauseDuration || 2) >= 3 ? "Long" : "Short"}
                      </button>
                      <div className="flex items-center gap-0.5 bg-[#f4f4f5] rounded-md px-1 py-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setPauseDuration(block.id, (block.pauseDuration || 2) - 1); }}
                          className="w-5 h-5 rounded flex items-center justify-center text-[#a1a1aa] hover:text-[#18181b] hover:bg-white transition-all cursor-pointer text-xs"
                        >−</button>
                        <span className="text-[10px] text-[#52525b] w-5 text-center tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{block.pauseDuration || 2}s</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setPauseDuration(block.id, (block.pauseDuration || 2) + 1); }}
                          className="w-5 h-5 rounded flex items-center justify-center text-[#a1a1aa] hover:text-[#18181b] hover:bg-white transition-all cursor-pointer text-xs"
                        >+</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={block.id}
                onClick={() => setSelectedBlock(isSelected ? null : block.id)}
                className={`group/block px-4 py-3 rounded-lg cursor-pointer transition-all ${
                  isSelected ? "bg-white shadow-sm border border-[#e4e4e7]" : "hover:bg-white/80"
                }`}>
                <div className="flex items-start gap-3">
                  <span className="text-[10px] text-[#a1a1aa] w-5 text-right tabular-nums shrink-0 mt-1" style={{ fontFamily: "var(--font-body)" }}>{index + 1}</span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "#e8f0e9" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#6b9a70" }} />
                  </div>
                  {isSelected ? (
                    <textarea
                      value={block.text}
                      onChange={(e) => updateBlockText(block.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-sm text-[#18181b] bg-transparent outline-none resize-none leading-relaxed"
                      style={{ fontFamily: "var(--font-body)" }}
                      rows={Math.max(2, Math.ceil(block.text.length / 70))}
                    />
                  ) : (
                    <p className="flex-1 text-sm text-[#3f3f46] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                      {block.text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#e4e4e7]" style={{ background: "#fafafa" }}>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>
              3 credits remaining
            </span>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#18181b] text-white hover:bg-[#27272a] transition-colors text-sm cursor-pointer shadow-sm"
            style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
            <Sparkles className="w-3.5 h-3.5" />
            Generate Audio
          </button>
        </div>
      </div>

      {/* ─── Settings Panel (right) ─── */}
      <div className="w-72 shrink-0 border-l border-[#e4e4e7] flex flex-col overflow-y-auto studio-scroll" style={{ background: "#fafafa" }}>
        <div className="px-5 py-4 border-b border-[#e4e4e7]">
          <h3 className="text-sm text-[#18181b]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Settings</h3>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* Voice */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#71717a] mb-2.5 block" style={{ fontFamily: "var(--font-body)" }}>Voice</label>
            <div className="relative">
              <button
                onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
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
                <ChevronDown className="w-3.5 h-3.5 text-[#a1a1aa]" />
              </button>
              {showVoiceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#e4e4e7] shadow-lg z-20 overflow-hidden">
                  {voices.map(v => (
                    <button key={v.id} onClick={() => { setSessionVoice(v.id); setShowVoiceDropdown(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#f4f4f5] transition-colors cursor-pointer text-left">
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
              )}
            </div>
          </div>

          {/* Sound */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#71717a] mb-2.5 block" style={{ fontFamily: "var(--font-body)" }}>Ambient Sound</label>
            <div className="relative">
              <button
                onClick={() => setShowSoundDropdown(!showSoundDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white border border-[#e4e4e7] hover:border-[#d4d4d8] transition-colors cursor-pointer text-left">
                <div className="flex items-center gap-2.5">
                  <Music className="w-4 h-4 text-[#71717a]" />
                  <span className="text-sm text-[#18181b]" style={{ fontFamily: "var(--font-body)" }}>{sessionSound}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#a1a1aa]" />
              </button>
              {showSoundDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#e4e4e7] shadow-lg z-20 overflow-hidden">
                  {soundPresets.map(s => (
                    <button key={s} onClick={() => { setSessionSound(s); setShowSoundDropdown(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#f4f4f5] transition-colors cursor-pointer text-left">
                      <span className="text-sm text-[#18181b]" style={{ fontFamily: "var(--font-body)" }}>{s}</span>
                      {s === sessionSound && <Check className="w-3.5 h-3.5 text-[#6b9a70]" />}
                    </button>
                  ))}
                </div>
              )}
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
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white border border-[#e4e4e7]">
              <Timer className="w-4 h-4 text-[#71717a]" />
              <span className="text-sm text-[#18181b] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>~{estimated.minutes}m {estimated.seconds > 0 ? `${estimated.seconds}s` : ""}</span>
            </div>
          </div>

          {/* Legend */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#71717a] mb-2.5 block" style={{ fontFamily: "var(--font-body)" }}>Legend</label>
            <div className="space-y-2.5">
              {[
                { color: "#6b9a70", label: "Voice segment", desc: "Click to edit" },
                { color: "#8b7ea6", label: "Pause", desc: "Adjust duration" },
                { color: "#6d9ab5", label: "Breathing cue", desc: "Guided breath" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-[11px] text-[#3f3f46]" style={{ fontFamily: "var(--font-body)" }}>{item.label}</span>
                  <span className="text-[10px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>— {item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
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
            onBack={() => setGenStep("choose")}
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
          <button onClick={() => { navigateTo("generate" as NavId); setActiveNav("generate" as NavId); setGenStep("input"); }}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
              activeNav === ("generate" as NavId)
                ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm"
                : "bg-[var(--color-sage-light)] text-[var(--color-sage)] hover:bg-[var(--color-sage)] hover:text-white"
            }`}
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
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
          className="sticky top-0 z-10 backdrop-blur-xl border-b border-[#e8e8ec] px-8 py-4" style={{ background: "rgba(250,249,247,0.85)" }}>
          <div className="flex items-center justify-between">
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
                <div className="bg-white rounded-xl border border-[#e8e8ec] overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_100px_80px_80px_100px_72px] gap-4 px-5 py-3 border-b border-[#f0f0f3] bg-[#fafafa]">
                    {["Session", "Protocol", "Duration", "Voice", "Created", ""].map((h) => (
                      <span key={h} className="text-[10px] uppercase tracking-wider text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{h}</span>
                    ))}
                  </div>
                  {/* Rows */}
                  {mockSessions.map((session, i) => {
                    const catColors: Record<string, string> = { sleep: "#8b7ea6", focus: "#6b9a70", anxiety: "#6d9ab5", stress: "#c4876c" };
                    const accent = catColors[session.category] || "#6b9a70";
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                        className="group grid grid-cols-[1fr_100px_80px_80px_100px_72px] gap-4 items-center px-5 py-3.5 border-b border-[#f4f4f5] last:border-b-0 hover:bg-[#fafafa] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
                          <span className="text-[13px] text-[#18181b] truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>{session.title}</span>
                        </div>
                        <span className="text-[11px] text-[#71717a] truncate" style={{ fontFamily: "var(--font-body)" }}>{session.protocol}</span>
                        <span className="text-[11px] text-[#71717a] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{session.duration}</span>
                        <span className="text-[11px] text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>{session.voice}</span>
                        <span className="text-[11px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>{session.createdAt}</span>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button className="w-7 h-7 rounded-lg bg-[#18181b] text-white flex items-center justify-center hover:bg-[#27272a] transition-colors shadow-sm">
                            <Play className="w-3 h-3 ml-0.5" />
                          </button>
                          <button className="w-7 h-7 rounded-lg hover:bg-[#f0f0f3] flex items-center justify-center text-[#a1a1aa] hover:text-[#71717a] transition-colors">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Generate — Step 1: Prompt Input (identical to homepage) */}
            {activeNav === ("generate" as NavId) && genStep === "input" && (
              <motion.div key="gen-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="max-w-2xl mx-auto py-16 flex flex-col items-center">
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
              <motion.div key="gen-choose" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-xl mx-auto">
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

                <div className="mb-10" />

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
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="max-w-xl">
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
                        <button className="px-4 py-2 rounded-lg bg-[#18181b] text-white text-[12px] hover:bg-[#27272a] transition-colors cursor-pointer shadow-sm"
                          style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                          Upgrade to Pro
                        </button>
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
    </div>
  );
}
