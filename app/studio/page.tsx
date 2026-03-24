"use client";

import { useState, useCallback } from "react";
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
} from "lucide-react";
import svgPaths from "@/lib/svg-paths";
import { suggestions, voices as sharedVoices, durations as sharedDurations, detectIntent } from "@/lib/shared";

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

type NavId = (typeof navItems)[number]["id"];

type ScriptBlock = {
  id: string;
  type: "voice" | "pause" | "breath";
  text: string;
  pauseLength?: "short" | "long";
};

const generateScript = (prompt: string): ScriptBlock[] => [
  { id: "1", type: "voice", text: "Find a comfortable position. Let your body settle into wherever you are right now." },
  { id: "2", type: "pause", text: "Settle in", pauseLength: "short" },
  { id: "3", type: "voice", text: "Gently close your eyes. Take a moment to notice how you\u2019re feeling without judgment." },
  { id: "4", type: "pause", text: "Awareness", pauseLength: "long" },
  { id: "5", type: "voice", text: "Now take a slow, deep breath in through your nose\u2026" },
  { id: "6", type: "breath", text: "Inhale \u2014 4 seconds" },
  { id: "7", type: "voice", text: "And release it slowly through your mouth. Let everything go." },
  { id: "8", type: "breath", text: "Exhale \u2014 6 seconds" },
  { id: "9", type: "voice", text: "Notice any tension in your shoulders. With each exhale, let them drop a little lower." },
  { id: "10", type: "pause", text: "Body responds", pauseLength: "long" },
  { id: "11", type: "voice", text: "You\u2019re doing great. There\u2019s nowhere else you need to be right now." },
  { id: "12", type: "pause", text: "Rest", pauseLength: "short" },
  { id: "13", type: "voice", text: "Let\u2019s continue with another deep breath. In through the nose\u2026" },
  { id: "14", type: "breath", text: "Inhale \u2014 4 seconds" },
  { id: "15", type: "voice", text: "And out through the mouth. Feel your body becoming heavier, more relaxed." },
  { id: "16", type: "breath", text: "Exhale \u2014 6 seconds" },
  { id: "17", type: "pause", text: "Integration", pauseLength: "long" },
  { id: "18", type: "voice", text: "When you\u2019re ready, slowly begin to bring your awareness back. Take your time." },
];

/* ─── Session Card ─── */

function SessionCard({ session, delay }: { session: (typeof mockSessions)[number]; delay: number }) {
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-xl border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] hover:shadow-md transition-all cursor-pointer overflow-hidden">
      <div className="h-1 w-full" style={{ background: colors.text, opacity: 0.15 }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: colors.bg }}>
              <Icon className="w-4 h-4" style={{ color: colors.text }} />
            </div>
            <div>
              <h3 className="text-sm text-[var(--color-sand-900)] leading-snug" style={{ fontFamily: "var(--font-display)" }}>{session.title}</h3>
              <p className="text-[10px] text-[var(--color-sand-400)] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>{session.createdAt}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
              className="w-7 h-7 rounded-full bg-[var(--color-sand-900)] text-[var(--color-sand-50)] flex items-center justify-center hover:bg-[var(--color-sand-800)] transition-colors">
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>
            <button className="w-7 h-7 rounded-full hover:bg-[var(--color-sand-100)] flex items-center justify-center text-[var(--color-sand-400)] transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ fontFamily: "var(--font-body)", background: colors.bg, color: colors.text }}>{session.protocol}</span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-600)] text-[10px]" style={{ fontFamily: "var(--font-body)" }}>{session.duration}</span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-600)] text-[10px]" style={{ fontFamily: "var(--font-body)" }}>{session.voice}</span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-600)] text-[10px]" style={{ fontFamily: "var(--font-body)" }}>{session.sound}</span>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-sand-100)] flex items-center justify-center mb-5">
        <Sparkles className="w-6 h-6 text-[var(--color-sand-400)]" />
      </div>
      <h3 className="text-lg text-[var(--color-sand-900)] mb-2" style={{ fontFamily: "var(--font-display)" }}>{label}</h3>
      <p className="text-sm text-[var(--color-sand-500)] max-w-xs" style={{ fontFamily: "var(--font-body)" }}>Generate your first meditation to see it here.</p>
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

  const selectedVoice = voices.find(v => v.id === sessionVoice) || voices[0];

  const togglePauseLength = useCallback((id: string) => {
    setScript(prev => prev.map(b =>
      b.id === id ? { ...b, pauseLength: b.pauseLength === "short" ? "long" : "short" } : b
    ));
  }, []);

  const updateBlockText = useCallback((id: string, text: string) => {
    setScript(prev => prev.map(b => b.id === id ? { ...b, text } : b));
  }, []);

  return (
    <div className="flex h-[calc(100vh-65px)]" style={{ background: "var(--color-sand-100)" }}>
      {/* ─── Script Editor (left) ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Script toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-sand-200)]" style={{ background: "var(--color-sand-50)" }}>
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)] transition-colors cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>
              {script.filter(b => b.type === "voice").length} segments · {script.filter(b => b.type === "pause").length} pauses · {script.filter(b => b.type === "breath").length} breaths
            </span>
          </div>
        </div>

        {/* Prompt display */}
        <div className="px-6 py-4 border-b border-[var(--color-sand-200)]/60">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-1" style={{ fontFamily: "var(--font-body)" }}>Prompt</p>
          <p className="text-sm text-[var(--color-sand-700)] italic" style={{ fontFamily: "var(--font-display)" }}>&ldquo;{prompt}&rdquo;</p>
        </div>

        {/* Script blocks */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
          {script.map((block) => {
            const isSelected = selectedBlock === block.id;

            if (block.type === "pause" || block.type === "breath") {
              return (
                <div key={block.id}
                  onClick={() => setSelectedBlock(isSelected ? null : block.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${
                    isSelected ? "bg-white shadow-sm border border-[var(--color-sand-200)]" : "hover:bg-white/60"
                  }`}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: block.type === "pause" ? "var(--color-dusk-light)" : "var(--color-ocean-light)" }}>
                    <div className="w-1.5 h-1.5 rounded-full"
                      style={{ background: block.type === "pause" ? "var(--color-dusk)" : "var(--color-ocean)" }} />
                  </div>
                  <span className="text-xs italic flex-1" style={{ fontFamily: "var(--font-body)", color: block.type === "pause" ? "var(--color-dusk)" : "var(--color-ocean)" }}>
                    {block.type === "pause" ? `⏸ ${block.text}` : `🫁 ${block.text}`}
                  </span>
                  {block.type === "pause" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePauseLength(block.id); }}
                      className="text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer"
                      style={{
                        fontFamily: "var(--font-body)",
                        borderColor: block.pauseLength === "long" ? "var(--color-dusk)" : "var(--color-sand-300)",
                        color: block.pauseLength === "long" ? "var(--color-dusk)" : "var(--color-sand-500)",
                        background: block.pauseLength === "long" ? "var(--color-dusk-light)" : "transparent",
                      }}>
                      {block.pauseLength === "long" ? "Long pause" : "Short pause"}
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div key={block.id}
                onClick={() => setSelectedBlock(isSelected ? null : block.id)}
                className={`group/block px-4 py-3 rounded-lg cursor-pointer transition-all ${
                  isSelected ? "bg-white shadow-sm border border-[var(--color-sand-200)]" : "hover:bg-white/60"
                }`}>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "var(--color-sage-light)" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-sage)" }} />
                  </div>
                  {isSelected ? (
                    <textarea
                      value={block.text}
                      onChange={(e) => updateBlockText(block.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-sm text-[var(--color-sand-800)] bg-transparent outline-none resize-none leading-relaxed"
                      style={{ fontFamily: "var(--font-body)" }}
                      rows={Math.max(2, Math.ceil(block.text.length / 70))}
                    />
                  ) : (
                    <p className="flex-1 text-sm text-[var(--color-sand-700)] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                      {block.text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--color-sand-200)]" style={{ background: "var(--color-sand-50)" }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>
              3 credits remaining
            </span>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-colors text-sm cursor-pointer shadow-sm"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
            <Sparkles className="w-3.5 h-3.5" />
            Generate Audio
          </button>
        </div>
      </div>

      {/* ─── Settings Panel (right) ─── */}
      <div className="w-72 shrink-0 border-l border-[var(--color-sand-200)] flex flex-col overflow-y-auto" style={{ background: "var(--color-sand-50)" }}>
        <div className="px-5 py-4 border-b border-[var(--color-sand-200)]">
          <h3 className="text-sm text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Settings</h3>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* Voice */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2.5 block" style={{ fontFamily: "var(--font-body)" }}>Voice</label>
            <div className="relative">
              <button
                onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] transition-colors cursor-pointer text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: selectedVoice.color + "20" }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: selectedVoice.color }} />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)" }}>{selectedVoice.name}</p>
                    <p className="text-[10px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>{selectedVoice.desc}</p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--color-sand-400)]" />
              </button>
              {showVoiceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[var(--color-sand-200)] shadow-lg z-20 overflow-hidden">
                  {voices.map(v => (
                    <button key={v.id} onClick={() => { setSessionVoice(v.id); setShowVoiceDropdown(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[var(--color-sand-50)] transition-colors cursor-pointer text-left">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: v.color + "20" }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: v.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)" }}>{v.name}</p>
                        <p className="text-[10px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>{v.desc}</p>
                      </div>
                      {v.id === sessionVoice && <Check className="w-3.5 h-3.5 text-[var(--color-sage)]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sound */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2.5 block" style={{ fontFamily: "var(--font-body)" }}>Ambient Sound</label>
            <div className="relative">
              <button
                onClick={() => setShowSoundDropdown(!showSoundDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] transition-colors cursor-pointer text-left">
                <div className="flex items-center gap-2.5">
                  <Music className="w-4 h-4 text-[var(--color-sand-400)]" />
                  <span className="text-sm text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)" }}>{sessionSound}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--color-sand-400)]" />
              </button>
              {showSoundDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[var(--color-sand-200)] shadow-lg z-20 overflow-hidden">
                  {soundPresets.map(s => (
                    <button key={s} onClick={() => { setSessionSound(s); setShowSoundDropdown(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--color-sand-50)] transition-colors cursor-pointer text-left">
                      <span className="text-sm text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)" }}>{s}</span>
                      {s === sessionSound && <Check className="w-3.5 h-3.5 text-[var(--color-sage)]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Duration display */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2.5 block" style={{ fontFamily: "var(--font-body)" }}>Duration</label>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white border border-[var(--color-sand-200)]">
              <Timer className="w-4 h-4 text-[var(--color-sand-400)]" />
              <span className="text-sm text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)" }}>{duration} min</span>
            </div>
          </div>

          {/* Pause controls */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2.5 block" style={{ fontFamily: "var(--font-body)" }}>All Pauses</label>
            <div className="flex gap-2">
              <button
                onClick={() => setScript(prev => prev.map(b => b.type === "pause" ? { ...b, pauseLength: "short" } : b))}
                className="flex-1 px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer text-center"
                style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-sand-200)", color: "var(--color-sand-600)" }}>
                All Short
              </button>
              <button
                onClick={() => setScript(prev => prev.map(b => b.type === "pause" ? { ...b, pauseLength: "long" } : b))}
                className="flex-1 px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer text-center"
                style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-sand-200)", color: "var(--color-sand-600)" }}>
                All Long
              </button>
            </div>
          </div>

          {/* Legend */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2.5 block" style={{ fontFamily: "var(--font-body)" }}>Legend</label>
            <div className="space-y-2">
              {[
                { color: "var(--color-sage)", label: "Voice segment", desc: "Click to edit text" },
                { color: "var(--color-dusk)", label: "Pause", desc: "Toggle short / long" },
                { color: "var(--color-ocean)", label: "Breathing cue", desc: "Guided breath" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color, opacity: 0.5 }} />
                  <div>
                    <span className="text-[11px] text-[var(--color-sand-700)]" style={{ fontFamily: "var(--font-body)" }}>{item.label}</span>
                    <span className="text-[10px] text-[var(--color-sand-400)] ml-1" style={{ fontFamily: "var(--font-body)" }}>— {item.desc}</span>
                  </div>
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
  const [activeNav, setActiveNav] = useState<NavId>("sessions");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [voicePlaying, setVoicePlaying] = useState<string | null>(null);

  // Generate flow: "input" → "choose" → "studio"
  const [genStep, setGenStep] = useState<"input" | "choose" | "studio">("input");
  const [genConfig, setGenConfig] = useState({ prompt: "", voice: "aria", duration: 10, sound: "Sanctuary" });

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

  // Full-screen studio view — no sidebar chrome
  if (activeNav === "generate" && genStep === "studio") {
    return (
      <div className="min-h-screen flex" style={{ background: "var(--color-sand-50)" }}>
        {/* Sidebar (slim) */}
        <aside className="w-56 shrink-0 border-r border-[var(--color-sand-200)] bg-white flex flex-col" style={{ minHeight: "100vh" }}>
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

        {/* Studio content */}
        <main className="flex-1 min-h-screen flex flex-col">
          <header className="sticky top-0 z-10 bg-[var(--color-sand-50)]/80 backdrop-blur-md border-b border-[var(--color-sand-200)] px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-display)" }}>Studio</h1>
            </div>
          </header>
          <StudioSession
            prompt={genConfig.prompt}
            voice={genConfig.voice}
            duration={genConfig.duration}
            sound={genConfig.sound}
            onBack={() => setGenStep("configure")}
          />
        </main>
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
          className="sticky top-0 z-10 bg-[var(--color-sand-50)]/80 backdrop-blur-md border-b border-[var(--color-sand-200)] px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-display)" }}>
              {activeNav === "sessions" && "All Sessions"}
              {activeNav === "history" && "History"}
              {activeNav === ("generate" as NavId) && "Generate"}
              {activeNav === "settings" && "Settings"}
            </h1>
            <div className={`relative transition-opacity ${activeNav === "sessions" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-sand-400)]" />
              <input type="text" placeholder="Search sessions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-9 pr-3 py-2 rounded-lg bg-white border border-[var(--color-sand-200)] text-sm text-[var(--color-sand-900)] placeholder:text-[var(--color-sand-400)] focus:outline-none focus:border-[var(--color-sand-400)] transition-colors"
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
                <div className="space-y-2">
                  {mockSessions.map((session, i) => (
                    <motion.div key={session.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04, duration: 0.25 }}
                      className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-[var(--color-sand-200)] transition-all cursor-pointer group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: session.category === "sleep" ? "var(--color-dusk-light)" : session.category === "focus" ? "var(--color-sage-light)" : session.category === "anxiety" ? "var(--color-ocean-light)" : "var(--color-ember-light)" }}>
                        <session.icon className="w-4 h-4"
                          style={{ color: session.category === "sleep" ? "var(--color-dusk)" : session.category === "focus" ? "var(--color-sage)" : session.category === "anxiety" ? "var(--color-ocean)" : "var(--color-ember)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--color-sand-900)] truncate" style={{ fontFamily: "var(--font-body)" }}>{session.title}</p>
                        <p className="text-[10px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>{session.duration} · {session.voice} · {session.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-7 h-7 rounded-full bg-[var(--color-sand-900)] text-[var(--color-sand-50)] flex items-center justify-center"><Play className="w-3 h-3 ml-0.5" /></button>
                        <button className="w-7 h-7 rounded-full hover:bg-[var(--color-sand-100)] flex items-center justify-center text-[var(--color-sand-400)]"><Download className="w-3.5 h-3.5" /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Generate — Step 1: Prompt Input (identical to homepage) */}
            {activeNav === ("generate" as NavId) && genStep === "input" && (
              <motion.div key="gen-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="max-w-xl mx-auto py-16">
                <div className="text-center mb-10">
                  <h2 className="text-3xl text-[var(--color-sand-900)] mb-3" style={{ fontFamily: "var(--font-display)" }}>What do you need right now?</h2>
                  <p className="text-sm text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>Describe how you&apos;re feeling and we&apos;ll create your session.</p>
                </div>
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
                  <div className="flex gap-2">
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
                  <button onClick={() => { /* TODO: quick generate */ }}
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
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="max-w-lg">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-[var(--color-sand-200)] p-5">
                    <h3 className="text-sm text-[var(--color-sand-900)] mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Account</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-sand-200)] flex items-center justify-center">
                        <span className="text-sm text-[var(--color-sand-600)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>U</span>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)" }}>user@example.com</p>
                        <p className="text-xs text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>Free plan · 3 credits remaining</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-[var(--color-sand-900)] text-[var(--color-sand-50)] text-xs hover:bg-[var(--color-sand-800)] transition-colors cursor-pointer"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Upgrade to Pro</button>
                  </div>
                  <div className="bg-white rounded-xl border border-[var(--color-sand-200)] p-5">
                    <h3 className="text-sm text-[var(--color-sand-900)] mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Preferences</h3>
                    <div className="space-y-3">
                      {[{ label: "Default voice", value: "Aria" }, { label: "Default duration", value: "10 min" }, { label: "Auto-download after generation", value: "Off" }].map((pref) => (
                        <div key={pref.label} className="flex items-center justify-between">
                          <span className="text-sm text-[var(--color-sand-700)]" style={{ fontFamily: "var(--font-body)" }}>{pref.label}</span>
                          <span className="text-sm text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>{pref.value}</span>
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
