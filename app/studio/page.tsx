"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
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
  MoreVertical,
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
  ChevronUp,
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
  Menu,
  Pencil,
} from "lucide-react";
import svgPaths from "@/lib/svg-paths";
import { suggestions, voices as sharedVoices, durations as sharedDurations, detectIntent, rotatingPhrases, protocols } from "@/lib/shared";
import { ProfileProvider, useProfile } from "@/lib/hooks/useProfile";
import { generateScript as generateScriptFn, deriveSessionName, estimateDuration, serializeScript, parseRawScript, type ScriptBlock } from "@/lib/generateScript";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
  { id: "lin", name: "Lin", desc: "Soft, dreamy, gentle", color: "var(--color-dusk)" },
  { id: "aditya", name: "Aditya", desc: "Clear, focused, present", color: "var(--color-ember)" },
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

type HistoryFilter = "all" | "sessions" | "generations";
type ScriptEntry = { type: string; text?: string; content?: string; pauseDuration?: number; label?: string };
type SessionItem = { id: string; title: string; duration: string; voice: string; protocol: string; sound: string; createdAt: string; createdAtRaw: string; createdAtShort: string; accessedAt: string; category: string; icon: typeof Moon; hasGeneration: boolean; script: ScriptEntry[] | null };
type GenerationItem = { id: string; prompt: string; voice: string; duration: string; protocol: string; status: "completed" | "failed" | "pending" | "processing"; timestamp: string; creditUsed: number; sessionId: string | null };

const navItems = [
  { id: "sessions" as const, label: "All Sessions", icon: LayoutGrid },
  { id: "history" as const, label: "History", icon: Clock },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

type NavId = (typeof navItems)[number]["id"] | "generate";




const generateScript = generateScriptFn;

/* ─── Session Card ─── */

const categoryColors: Record<string, { accent: string; bg: string }> = {
  sleep: { accent: "#8b7ea6", bg: "rgba(139,126,166,0.08)" },
  focus: { accent: "#6b9a70", bg: "rgba(107,154,112,0.08)" },
  anxiety: { accent: "#6d9ab5", bg: "rgba(109,154,181,0.08)" },
  stress: { accent: "#c4876c", bg: "rgba(196,135,108,0.08)" },
};

/* ─── Sessions Loading State ─── */
function SessionsLoadingIcon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="animate-[breathe_6s_ease-in-out_infinite]">
        <svg
          width={36}
          height={38}
          fill="none"
          viewBox="0 0 36 37.8281"
          className="text-[var(--color-sand-300)]"
        >
          <path d={svgPaths.p1c4d2300} fill="currentColor" />
          <path d={svgPaths.p2128f680} fill="currentColor" />
          <path d={svgPaths.p1c2ff500} fill="currentColor" />
        </svg>
      </div>
      <div className="flex gap-1.5 mt-4">
        <span className="w-2 h-2 rounded-full animate-[dot-bounce_1.4s_ease-in-out_infinite]" style={{ backgroundColor: "#c9a96e", animationDelay: "0s" }} />
        <span className="w-2 h-2 rounded-full animate-[dot-bounce_1.4s_ease-in-out_infinite]" style={{ backgroundColor: "#c9a96e", animationDelay: "0.2s" }} />
        <span className="w-2 h-2 rounded-full animate-[dot-bounce_1.4s_ease-in-out_infinite]" style={{ backgroundColor: "#c9a96e", animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}

/* ─── Google Docs-style Session Card ─── */
function SessionCard({ session, delay, isNowPlaying, onPlay, onOpenStudio, onDelete, onRegen, onGenerate }: {
  session: SessionItem; delay: number;
  isNowPlaying: boolean; onPlay: () => void; onOpenStudio: () => void;
  onDelete?: () => void; onRegen?: () => void; onGenerate?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(session.title);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const Icon = session.icon;
  const colors = categoryColors[session.category] || categoryColors.focus;
  const voiceData = voices.find(v => v.name === session.voice);
  const voiceColor = voiceData?.color || "#a1a1aa";

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Build script preview lines from real session data
  const previewLines: string[] = [];
  if (session.script && session.script.length > 0) {
    for (const block of session.script.slice(0, 8)) {
      if (block.type === "voice" || block.type === "text") {
        previewLines.push(block.text || block.content || "");
        previewLines.push("");
      } else if (block.type === "pause") {
        const dur = block.pauseDuration || 0;
        const label = block.label || "pause";
        previewLines.push(`— ${label} · ${dur}s —`);
        previewLines.push("");
      }
    }
  } else {
    previewLines.push("No script yet — open in Studio to generate one.");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-xl border border-[#e0e0e4] hover:border-[#c0c0c8] bg-white hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer flex flex-col"
      onClick={onOpenStudio}
    >
      {/* Preview area — like a document thumbnail */}
      <div className="relative h-[160px] bg-[#f0eee9] border-b border-[#e4e0d8] overflow-hidden rounded-t-xl px-5 pt-4">
        {/* Category accent stripe at top */}
        <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: colors.accent }} />

        {/* Session icon watermark */}
        <div className="absolute top-3 right-3 opacity-[0.06]">
          <Icon className="w-16 h-16" style={{ color: colors.accent }} />
        </div>

        {/* Fake script content preview */}
        <div className="space-y-[3px] select-none pointer-events-none">
          {previewLines.map((line, i) => (
            <div key={i}>
              {line === "" ? (
                <div className="h-[3px]" />
              ) : line.startsWith("—") ? (
                <div className="flex items-center gap-1 my-0.5">
                  <div className="h-[1px] flex-1 bg-[#d4d4d8]" />
                  <span className="text-[7px] text-[#a1a1aa] tracking-wide shrink-0" style={{ fontFamily: "var(--font-body)" }}>{line.replace(/—/g, "").trim()}</span>
                  <div className="h-[1px] flex-1 bg-[#d4d4d8]" />
                </div>
              ) : (
                <p className="text-[8px] leading-[1.5] text-[#71717a] truncate" style={{ fontFamily: "var(--font-body)" }}>{line}</p>
              )}
            </div>
          ))}
        </div>

        {/* Fade-out gradient at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#f8f8fa] to-transparent" />

        {/* Now playing overlay */}
        {isNowPlaying && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
            <div className="flex items-end gap-[3px] h-6">
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{ background: colors.accent }}
                  animate={{ height: ["30%", "100%", "30%"] }}
                  transition={{ duration: 0.5 + i * 0.12, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Hover: Open in Studio overlay */}
        {!isNowPlaying && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
            <span className="px-4 py-2 rounded-lg bg-[#18181b] text-white text-[12px] shadow-lg" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
              Open in Studio
            </span>
          </div>
        )}
      </div>

      {/* Footer — title + voice + opened time + 3-dot menu */}
      <div className="px-3.5 py-3">
        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setIsRenaming(false);
              if (e.key === "Escape") { setRenameValue(session.title); setIsRenaming(false); }
            }}
            onBlur={() => setIsRenaming(false)}
            onClick={(e) => e.stopPropagation()}
            className="text-[13px] text-[#18181b] leading-tight mb-1.5 w-full bg-transparent border-b border-[#a1a1aa] outline-none px-0 py-0"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            autoFocus
          />
        ) : (
          <h3 className="text-[13px] text-[#18181b] truncate leading-tight mb-1.5" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{renameValue}</h3>
        )}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: voiceColor }} />
            <span className="text-[11px] text-[#71717a] truncate" style={{ fontFamily: "var(--font-body)" }}>
              {session.voice} · Opened {session.accessedAt}
            </span>
          </div>
          {/* 3-dot menu */}
          <div className="relative shrink-0 group/menu" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[#a1a1aa] hover:bg-[#f4f4f5] hover:text-[#52525b] transition-all cursor-pointer ${menuOpen ? "bg-[#f4f4f5] text-[#52525b]" : ""}`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {/* Hover tooltip */}
            {!menuOpen && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded bg-[#18181b] text-white text-[9px] whitespace-nowrap opacity-0 group-hover/menu:opacity-100 transition-opacity pointer-events-none z-10" style={{ fontFamily: "var(--font-body)" }}>More actions</span>
            )}
            {/* Dropdown menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-1 w-44 bg-white rounded-lg border border-[#e4e4e7] shadow-lg overflow-hidden z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => { setMenuOpen(false); onOpenStudio(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[#18181b] hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}
                  >
                    <PenLine className="w-3.5 h-3.5 text-[#71717a]" /> Open in Studio
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setIsRenaming(true); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[#18181b] hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}
                  >
                    <Type className="w-3.5 h-3.5 text-[#71717a]" /> Rename
                  </button>
                  {session.hasGeneration ? (
                    <>
                      <button
                        onClick={() => { setMenuOpen(false); onPlay(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[#18181b] hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}
                      >
                        <Play className="w-3.5 h-3.5 text-[#71717a]" /> Play
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[#18181b] hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}
                      >
                        <Download className="w-3.5 h-3.5 text-[#71717a]" /> Download
                      </button>
                      {onRegen && (
                        <button
                          onClick={() => { setMenuOpen(false); onRegen(); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[#18181b] hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                          style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#71717a]" /> Regenerate
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => { setMenuOpen(false); onGenerate?.(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[#18181b] hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#71717a]" /> Generate
                    </button>
                  )}
                  <div className="border-t border-[#f0f0f3]" />
                  {onDelete && (
                    <button
                      onClick={() => { setMenuOpen(false); onDelete(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[#ef4444] hover:bg-[#fef2f2] transition-colors cursor-pointer"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Bottom Player Bar ─── */

function PlayerBar({ session, isPlaying, onTogglePlay, onClose, inline, sound, volume, onSoundChange, onVolumeChange }: {
  session: SessionItem; isPlaying: boolean;
  onTogglePlay: () => void; onClose: () => void; inline?: boolean;
  sound?: string; volume?: number; onSoundChange?: (s: string) => void; onVolumeChange?: (v: number) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [showBgSound, setShowBgSound] = useState(false);
  const [_bgSound, _setBgSound] = useState(session.sound);
  const [_bgVol, _setBgVol] = useState(70);
  const bgSound = sound ?? _bgSound;
  const setBgSound = onSoundChange ?? _setBgSound;
  const bgVol = volume ?? _bgVol;
  const setBgVol = onVolumeChange ?? _setBgVol;
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
      className={inline ? "border-t border-[#e4e4e7] bg-white/95 backdrop-blur-xl" : "fixed bottom-0 left-0 lg:left-56 right-0 z-50 border-t border-[#e4e4e7] bg-white/95 backdrop-blur-xl"}
    >
      {/* Progress bar */}
      <div className="h-[2px] bg-[#f0f0f3]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: colors.accent, width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-5 px-3 sm:px-4 md:px-6 py-3">
        {/* Session info — hidden on very small, icon-only on small, full on md+ */}
        <div className="hidden md:flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: colors.bg }}>
            <Icon className="w-5 h-5" style={{ color: colors.accent }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] text-[#18181b] truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{session.title}</p>
            <p className="text-[11px] text-[#a1a1aa] truncate" style={{ fontFamily: "var(--font-body)" }}>{session.voice} · {session.duration} · {session.protocol}</p>
          </div>
        </div>
        {/* Icon-only session info on small screens */}
        <div className="flex md:hidden items-center shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center" style={{ background: colors.bg }}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: colors.accent }} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-[#f4f4f5] flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer" title="Back 10s">
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute text-[6px] sm:text-[7px] font-bold" style={{ fontFamily: "var(--font-body)" }}>10</span>
          </button>
          <button
            onClick={onTogglePlay}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
            style={{ background: isPlaying ? colors.accent : "#18181b", color: "#fff" }}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-[#f4f4f5] flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer" title="Skip 10s">
            <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute text-[6px] sm:text-[7px] font-bold" style={{ fontFamily: "var(--font-body)" }}>10</span>
          </button>
        </div>

        {/* Right side — background sound + actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-1 justify-end min-w-0">
          <div className="relative flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-full bg-[#f4f4f5] border border-[#e8e8ec] min-w-0">
            <button
              onClick={(e) => { e.stopPropagation(); setShowBgSound(!showBgSound); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-md text-[12px] transition-all cursor-pointer min-w-0 ${showBgSound ? "bg-[#18181b] text-white" : "text-[#3f3f46] hover:bg-[#e8e8ec]"}`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            >
              <Music className={`w-3.5 h-3.5 shrink-0 ${showBgSound ? "text-white/70" : "text-[#71717a]"}`} />
              <span className="truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">{bgSound}</span>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${showBgSound ? "rotate-180 text-white/70" : "text-[#71717a]"}`} />
            </button>

            <div className="w-[1px] h-3.5 bg-[#d4d4d8] hidden sm:block" />

            <div className="hidden sm:flex items-center gap-1">
              <button onClick={() => setBgVol(bgVol > 0 ? 0 : 70)} className="text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer">
                {bgVol === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </button>
              <input
                type="range" min={0} max={100} value={bgVol}
                onChange={(e) => setBgVol(Number(e.target.value))}
                className="w-16 md:w-24 h-[3px] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3f3f46] [&::-webkit-slider-thumb]:cursor-pointer"
                style={{ background: `linear-gradient(to right, #3f3f46 ${bgVol}%, #d4d4d8 ${bgVol}%)` }}
              />
            </div>

            {/* Dropdown */}
            {showBgSound && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowBgSound(false)} />
                <div className="absolute bottom-full right-0 sm:right-auto sm:left-0 mb-2 w-52 bg-white rounded-lg border border-[#e4e4e7] shadow-lg z-[70] max-h-64 overflow-y-auto">
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

          <button className="hidden sm:flex w-8 h-8 rounded-lg hover:bg-[#f4f4f5] items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer shrink-0">
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#f4f4f5] flex items-center justify-center text-[#a1a1aa] hover:text-[#18181b] transition-colors cursor-pointer shrink-0"
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

function StudioSession({ prompt, voice, duration, sound, sessionId, savedScript, savedTitle, savedVolume, onBack, onToggleSidebar, onGenerated, onSessionCreated }: {
  prompt: string; voice: string; duration: number; sound: string; sessionId: string | null; savedScript?: ScriptBlock[] | null; savedTitle?: string | null; savedVolume?: number; onBack: () => void; onToggleSidebar?: () => void; onGenerated?: () => void; onSessionCreated?: (id: string) => void;
}) {
  const { profile } = useProfile();
  const [script, setScript] = useState<ScriptBlock[]>(() => savedScript && savedScript.length > 0 ? savedScript : generateScript(prompt));
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editOriginalText, setEditOriginalText] = useState<string | null>(null);
  const [sessionVoice, setSessionVoice] = useState(voice);
  const [sessionSound, setSessionSound] = useState(sound);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [showSoundDropdown, setShowSoundDropdown] = useState(false);
  const [showSoundInfo, setShowSoundInfo] = useState(false);
  const [soundVolume, setSoundVolume] = useState(savedVolume ?? 70);

  const [showDurationInfo, setShowDurationInfo] = useState(false);
  const [editingPauseId, setEditingPauseId] = useState<string | null>(null);
  const [generateWarning, setGenerateWarning] = useState<string | null>(null);
  const [errorPauseIds, setErrorPauseIds] = useState<Set<string>>(new Set());
  const [newBlockIds, setNewBlockIds] = useState<Set<string>>(new Set());
  const [editingOffScreen, setEditingOffScreen] = useState<"above" | "below" | null>(null);
  const scriptScrollRef = useRef<HTMLDivElement>(null);
  const [swappedUp, setSwappedUp] = useState<string | null>(null);
  const [swappedDown, setSwappedDown] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<"settings" | "history">("settings");
  const [mobilePanel, setMobilePanel] = useState<"settings" | "history" | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studioPlaying, setStudioPlaying] = useState(false);
  const [showStudioPlayer, setShowStudioPlayer] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(!!(savedScript && savedScript.length > 0));
  const [sessionName, setSessionName] = useState(() => savedTitle || deriveSessionName(prompt));
  const [sessionIdState, setSessionIdState] = useState<string | null>(sessionId);
  const onSessionCreatedRef = useRef(onSessionCreated);
  onSessionCreatedRef.current = onSessionCreated;
  const [isRenamingSession, setIsRenamingSession] = useState(false);

  // Session generations history
  type GenHistoryItem = { id: string; prompt: string; voice: string; duration: string; protocol: string; status: string; timestamp: string; creditUsed: number; sessionId: string | null };
  const [sessionGenerations, setSessionGenerations] = useState<GenHistoryItem[]>([]);
  const fetchSessionGenerations = useCallback(async () => {
    if (!sessionIdState) return;
    try {
      const res = await fetch(`/api/generations?session_id=${sessionIdState}&limit=50`);
      if (!res.ok) return;
      const data = await res.json();
      setSessionGenerations(data.map((g: Record<string, unknown>) => ({
        id: g.id,
        prompt: (g.prompt as string) || "",
        voice: (g.voice as string) || "Aria",
        duration: (g.duration as string) || "10 min",
        protocol: "",
        status: g.status as string,
        timestamp: new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(g.created_at as string)),
        creditUsed: (g.credit_cost as number) || 0,
        sessionId: (g.session_id as string) || null,
      })));
    } catch { /* ignore */ }
  }, [sessionIdState]);
  useEffect(() => { fetchSessionGenerations(); }, [fetchSessionGenerations]);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // ─── Undo / Redo history ───
  const scriptHistoryRef = useRef<ScriptBlock[][]>([savedScript && savedScript.length > 0 ? savedScript : generateScript(prompt)]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);

  useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    const history = scriptHistoryRef.current;
    const idx = historyIndexRef.current;
    // Trim any future entries after current index
    scriptHistoryRef.current = [...history.slice(0, idx + 1), script];
    historyIndexRef.current = scriptHistoryRef.current.length - 1;
  }, [script]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < scriptHistoryRef.current.length - 1;

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current -= 1;
    setScript(scriptHistoryRef.current[historyIndexRef.current]);
    setSelectedBlock(null);
    setEditOriginalText(null);
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= scriptHistoryRef.current.length - 1) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current += 1;
    setScript(scriptHistoryRef.current[historyIndexRef.current]);
    setSelectedBlock(null);
    setEditOriginalText(null);
  }, []);

  const estimated = estimateDuration(script);

  // ─── Autosave (triggers on completed actions, not keystrokes) ───
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [ready, setReady] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setReady(true)); }, []);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildSessionPayload = useCallback(() => ({
    sessionId: sessionIdState || "draft",
    name: sessionName,
    prompt,
    script,
    voice: sessionVoice,
    sound: sessionSound,
    soundVolume,
    duration: estimated.minutes,
    hasGenerated,
  }), [sessionIdState, sessionName, prompt, script, sessionVoice, sessionSound, soundVolume, estimated.minutes, hasGenerated]);

  // TODO: Replace with actual API call when database is ready
  const persistSession = useCallback(async (payload: ReturnType<typeof buildSessionPayload>) => {
    const sessionData = {
      title: payload.name,
      prompt: payload.prompt,
      script: payload.script,
      voice: payload.voice,
      soundscape: payload.sound,
      duration: payload.duration,
      sound_volume: payload.soundVolume,
    };
    if (!payload.sessionId || payload.sessionId === "draft") {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
      if (res.ok) {
        const data = await res.json();
        setSessionIdState(data.id);
        onSessionCreatedRef.current?.(data.id);
      }
    } else {
      await fetch(`/api/sessions/${payload.sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
    }
  }, []);

  const triggerAutosave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (savedFadeRef.current) clearTimeout(savedFadeRef.current);
    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(async () => {
      const payload = buildSessionPayload();
      await persistSession(payload);
      setLastSavedAt(new Date());
      setSaveStatus("saved");
      savedFadeRef.current = setTimeout(() => setSaveStatus("idle"), 1500);
    }, 800);
  }, [buildSessionPayload, persistSession]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) { e.preventDefault(); redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); triggerAutosave(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, triggerAutosave]);

  // ─── Debounced autosave on volume change (skip initial mount) ───
  const volumeSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volumeMountedRef = useRef(false);
  useEffect(() => {
    if (!volumeMountedRef.current) { volumeMountedRef.current = true; return; }
    if (volumeSaveRef.current) clearTimeout(volumeSaveRef.current);
    volumeSaveRef.current = setTimeout(() => triggerAutosave(), 1000);
    return () => { if (volumeSaveRef.current) clearTimeout(volumeSaveRef.current); };
  }, [soundVolume, triggerAutosave]);

  // ─── Flush pending save on tab close ───
  useEffect(() => {
    const onBeforeUnload = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        const payload = buildSessionPayload();
        const beaconPayload = {
          title: payload.name,
          prompt: payload.prompt,
          script: payload.script,
          voice: payload.voice,
          soundscape: payload.sound,
          duration: payload.duration,
          sound_volume: payload.soundVolume,
        };
        if (payload.sessionId && payload.sessionId !== "draft") {
          fetch(`/api/sessions/${payload.sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(beaconPayload),
            keepalive: true,
          });
        }
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [buildSessionPayload]);

  // Track whether the editing block is scrolled out of view
  useEffect(() => {
    if (!selectedBlock || !scriptScrollRef.current) { setEditingOffScreen(null); return; }
    const container = scriptScrollRef.current;
    const check = () => {
      const el = container.querySelector(`[data-block-id="${selectedBlock}"]`) as HTMLElement | null;
      if (!el) { setEditingOffScreen(null); return; }
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      if (elRect.bottom < containerRect.top + 10) {
        setEditingOffScreen("above");
      } else if (elRect.top > containerRect.bottom - 10) {
        setEditingOffScreen("below");
      } else {
        setEditingOffScreen(null);
      }
    };
    check();
    container.addEventListener("scroll", check, { passive: true });
    return () => container.removeEventListener("scroll", check);
  }, [selectedBlock, script]);

  const scrollToEditingBlock = useCallback(() => {
    if (!selectedBlock || !scriptScrollRef.current) return;
    const el = scriptScrollRef.current.querySelector(`[data-block-id="${selectedBlock}"]`) as HTMLElement | null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedBlock]);

  const handleGenerateAudio = useCallback(async () => {
    // Check for empty voice blocks
    const emptyVoice = script.find(b => b.type === "voice" && b.text.trim() === "");
    if (emptyVoice) {
      setGenerateWarning("All text fields must have content before generating.");
      setTimeout(() => setGenerateWarning(null), 3000);
      setSelectedBlock(emptyVoice.id);
      setEditOriginalText(emptyVoice.text);
      return;
    }
    // If editing a block with text, save it before generating
    if (selectedBlock) {
      setEditOriginalText(null);
      setSelectedBlock(null);
    }
    const emptyPauses = script.filter(b => b.type === "pause" && (!b.pauseDuration || b.pauseDuration === 0));
    if (emptyPauses.length > 0) {
      setGenerateWarning(`${emptyPauses.length} pause${emptyPauses.length > 1 ? "s have" : " has"} no duration set. Set a value or remove the segment.`);
      setErrorPauseIds(new Set(emptyPauses.map(b => b.id)));
      return;
    }
    // Cancel any pending autosave to prevent race condition
    if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); saveTimerRef.current = null; }
    setGenerateWarning(null);
    setErrorPauseIds(new Set());
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          voice: sessionVoice,
          duration: estimated.minutes,
          soundscape: sessionSound,
          sessionId: sessionIdState,
          script: serializeScript(script),
        }),
      });
      if (res.status === 402) {
        setGenerateWarning("Insufficient credits. Please upgrade your plan.");
        setIsGenerating(false);
        return;
      }
      if (!res.ok) {
        setGenerateWarning("Generation failed. Please try again.");
        setIsGenerating(false);
        return;
      }
      const data = await res.json();
      if (data.session) {
        setSessionIdState(data.session.id);
        onSessionCreatedRef.current?.(data.session.id);
      }
      // Instantly add the new generation to session history
      if (data.generation) {
        const g = data.generation;
        setSessionGenerations(prev => [{
          id: g.id,
          prompt: g.prompt || prompt,
          voice: g.voice || sessionVoice,
          duration: g.duration || `${estimated.minutes}`,
          protocol: "",
          status: g.status || "completed",
          timestamp: new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(g.created_at || Date.now())),
          creditUsed: g.credit_cost || 1,
          sessionId: g.session_id || data.session?.id || sessionIdState,
        }, ...prev]);
      }
      setIsGenerating(false);
      setShowStudioPlayer(true);
      setStudioPlaying(true);
      setHasGenerated(true);
      onGenerated?.();
    } catch {
      setGenerateWarning("Generation failed. Please try again.");
      setIsGenerating(false);
    }
  }, [script, prompt, sessionVoice, estimated.minutes, sessionSound, sessionIdState, onGenerated, selectedBlock]);

  const handlePreviewScript = useCallback(() => {
    const serialized = serializeScript(script);
    sessionStorage.setItem("script-preview", serialized);
    window.open("/script-preview", "_blank");
  }, [script]);

  // Build a mock session for the player
  const intent = prompt.toLowerCase().includes("sleep") ? "sleep" : prompt.toLowerCase().includes("focus") ? "focus" : prompt.toLowerCase().includes("stress") || prompt.toLowerCase().includes("anxi") ? "stress" : "focus";
  const iconMap: Record<string, typeof Moon> = { sleep: Moon, focus: Sun, stress: Heart, anxiety: Heart };
  const studioSession: SessionItem = {
    id: "studio",
    title: sessionName,
    duration: `${estimated.minutes} min`,
    voice: voices.find(v => v.id === sessionVoice)?.name || "Aria",
    protocol: "Custom",
    sound: sessionSound,
    createdAt: "Just now",
    createdAtRaw: new Date().toISOString(),
    createdAtShort: "Just now",
    accessedAt: "Just now",
    category: intent,
    icon: iconMap[intent] || Brain,
    hasGeneration: hasGenerated,
    script: script as unknown as ScriptEntry[] | null,
  };

  const selectedVoice = voices.find(v => v.id === sessionVoice) || voices[0];

  const markEdited = useCallback(() => { setHasGenerated(false); triggerAutosave(); }, [triggerAutosave]);

  const flushAndGoBack = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      const payload = buildSessionPayload();
      persistSession(payload); // fire-and-forget
    }
    onBack();
  }, [buildSessionPayload, persistSession, onBack]);

  const startEditing = useCallback((blockId: string) => {
    const block = script.find(b => b.id === blockId);
    if (block && block.type === "voice") {
      setEditOriginalText(block.text);
      setSelectedBlock(blockId);
    }
  }, [script]);

  const saveEdit = useCallback(() => {
    if (selectedBlock) {
      const block = script.find(b => b.id === selectedBlock);
      if (block && block.text.trim() === "") {
        setGenerateWarning("Write something before saving.");
        setTimeout(() => setGenerateWarning(null), 3000);
        return;
      }
    }
    setEditOriginalText(null);
    setSelectedBlock(null);
    markEdited();
  }, [markEdited, selectedBlock, script]);

  const nextId = useRef(
    Math.max(100, ...((savedScript && savedScript.length > 0 ? savedScript : generateScript(prompt)).map(b => { const n = Number(b.id); return isNaN(n) ? 0 : n + 1; })))
  );
  const addingBlock = useRef(false);

  const setPauseDuration = useCallback((id: string, seconds: number) => {
    setScript(prev => prev.map(b =>
      b.id === id ? { ...b, pauseDuration: Math.max(0, seconds) } : b
    ));
    setSelectedBlock(id);
    setEditOriginalText(null);
    setGenerateWarning(null);
    setErrorPauseIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    markEdited();
  }, [markEdited]);

  const updateBlockText = useCallback((id: string, text: string) => {
    setScript(prev => prev.map(b => b.id === id ? { ...b, text } : b));
    markEdited();
  }, [markEdited]);


  // Delete voice block + its paired pause
  const deleteBlock = useCallback((id: string) => {
    setScript(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1 || prev[idx].type !== "voice") return prev;
      const next = [...prev];
      // Voice always has a pause after it (except last voice)
      if (idx + 1 < next.length && next[idx + 1].type === "pause") {
        next.splice(idx, 2); // remove voice + its pause
      } else if (idx - 1 >= 0 && next[idx - 1].type === "pause") {
        next.splice(idx - 1, 2); // last voice: remove preceding pause + voice
      } else {
        next.splice(idx, 1); // solo voice
      }
      return next;
    });
    setSelectedBlock(null);
    markEdited();
  }, [markEdited]);

  const discardEdit = useCallback(() => {
    if (selectedBlock) {
      const block = script.find(b => b.id === selectedBlock);
      if (block && block.text.trim() === "" && (editOriginalText === null || editOriginalText.trim() === "")) {
        deleteBlock(selectedBlock);
      } else if (editOriginalText !== null) {
        setScript(prev => prev.map(b => b.id === selectedBlock ? { ...b, text: editOriginalText } : b));
      }
    }
    setEditOriginalText(null);
    setSelectedBlock(null);
  }, [selectedBlock, editOriginalText, script, deleteBlock]);

  const handleBackgroundClick = useCallback(() => {
    if (!selectedBlock) return;
    const block = script.find(b => b.id === selectedBlock);
    if (block && block.type === "voice") {
      if (block.text.trim() === "") {
        deleteBlock(selectedBlock);
      } else {
        saveEdit();
      }
    } else {
      setSelectedBlock(null);
    }
  }, [selectedBlock, script, deleteBlock, saveEdit]);

  const markNewBlocks = useCallback((ids: string[]) => {
    setNewBlockIds(new Set(ids));
    setTimeout(() => setNewBlockIds(new Set()), 500);
  }, []);

  // Add voice+pause. Always inserts: newVoice, newPause (voice first, pause after).
  const addBlock = useCallback((referenceId: string, position: "before" | "after") => {
    if (addingBlock.current) return;
    // If currently editing a block, handle it first
    if (selectedBlock) {
      const currentBlock = script.find(b => b.id === selectedBlock);
      if (currentBlock && currentBlock.type === "voice") {
        if (currentBlock.text.trim() === "") {
          // Empty block — show error, don't add
          setGenerateWarning("Write something or cancel the current block first.");
          setTimeout(() => setGenerateWarning(null), 3000);
          return;
        } else {
          // Has text — save it first, then continue adding
          saveEdit();
        }
      }
    }
    addingBlock.current = true;
    const voiceId = String(nextId.current++);
    const pauseId = String(nextId.current++);
    const newVoice: ScriptBlock = { id: voiceId, type: "voice", text: "" };
    const newPause: ScriptBlock = { id: pauseId, type: "pause", text: "Pause", pauseDuration: 3 };
    setScript(prev => {
      if (prev.some(b => b.id === voiceId)) return prev;
      const idx = prev.findIndex(b => b.id === referenceId);
      if (idx === -1) return prev;
      const next = [...prev];
      if (position === "before") {
        // Insert voice+pause before the reference block
        next.splice(idx, 0, newVoice, newPause);
      } else {
        // Insert voice+pause after the reference block
        next.splice(idx + 1, 0, newVoice, newPause);
      }
      return next;
    });
    setSelectedBlock(voiceId);
    setEditOriginalText("");
    markNewBlocks([voiceId, pauseId]);
    markEdited();
    setTimeout(() => { addingBlock.current = false; }, 300);
  }, [markEdited, markNewBlocks, selectedBlock, script, saveEdit]);

  // Swap with the nearest same-type block in the given direction
  const moveBlock = useCallback((id: string, direction: "up" | "down") => {
    let movedUpId: string | null = null;
    let movedDownId: string | null = null;
    setScript(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const blockType = prev[idx].type;
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
      const next = [...prev];
      const temp = { text: next[idx].text, pauseDuration: next[idx].pauseDuration };
      next[idx] = { ...next[idx], text: next[swapIdx].text, pauseDuration: next[swapIdx].pauseDuration };
      next[swapIdx] = { ...next[swapIdx], text: temp.text, pauseDuration: temp.pauseDuration };
      // The block that requested "up" now has its content at swapIdx (above), so swapIdx got the content that moved up
      // idx got content from swapIdx which moved down
      if (direction === "up") {
        movedUpId = next[swapIdx].id; // content moved up into this position
        movedDownId = next[idx].id;   // content moved down into this position
      } else {
        movedDownId = next[swapIdx].id;
        movedUpId = next[idx].id;
      }
      return next;
    });
    setSwappedUp(movedUpId);
    setSwappedDown(movedDownId);
    setTimeout(() => { setSwappedUp(null); setSwappedDown(null); }, 400);
    markEdited();
  }, [markEdited]);

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 relative transition-opacity duration-200" style={{ background: "#ffffff", opacity: ready ? 1 : 0 }}>
      {/* Toast notification */}
      <AnimatePresence>
        {generateWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 shadow-lg"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {generateWarning}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Scroll-to-editing floating button */}
      <AnimatePresence>
        {editingOffScreen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => { e.stopPropagation(); scrollToEditingBlock(); }}
            className="fixed left-1/2 -translate-x-1/2 z-[400] w-10 h-10 rounded-full bg-[#18181b] text-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#27272a] transition-colors"
            style={editingOffScreen === "above" ? { top: 80 } : { bottom: 100 }}
            title="Scroll to editing block"
          >
            {editingOffScreen === "above" ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </motion.button>
        )}
      </AnimatePresence>
      {/* ─── Script Editor (left) ─── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Script toolbar */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 border-b border-[#e4e4e7]" style={{ background: "#fafafa" }}>
          {/* Left: Hamburger (mobile) + Back + Undo/Redo */}
          <div className="flex items-center gap-1 shrink-0">
            {onToggleSidebar && (
              <button onClick={onToggleSidebar} className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-[#52525b] hover:text-[#18181b] hover:bg-[#f4f4f5] transition-colors cursor-pointer mr-1">
                <Menu className="w-4 h-4" />
              </button>
            )}
            <button onClick={flushAndGoBack} className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="w-px h-4 bg-[#e4e4e7] mx-1.5" />
            <button
              onClick={undo}
              disabled={!canUndo}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer disabled:cursor-default disabled:opacity-30 text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f4f5]"
              title="Undo (⌘Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer disabled:cursor-default disabled:opacity-30 text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f4f5]"
              title="Redo (⇧⌘Z)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center: Session title — fills remaining space, truncates */}
          <div className="flex-1 min-w-0 flex justify-center overflow-hidden">
            {isRenamingSession ? (
              <input
                ref={renameInputRef}
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onBlur={() => { setIsRenamingSession(false); triggerAutosave(); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setIsRenamingSession(false); triggerAutosave(); } if (e.key === "Escape") setIsRenamingSession(false); }}
                className="text-sm text-[#18181b] bg-white border border-[#e4e4e7] rounded-md px-2 py-0.5 outline-none focus:border-[#a1a1aa] text-center w-56 max-w-full"
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
                autoFocus
              />
            ) : (
              <h2
                className="text-sm text-[#18181b] cursor-text px-2 py-0.5 rounded-md studio-title-hover truncate whitespace-nowrap"
                style={{ fontFamily: "var(--font-display)", fontWeight: 500, border: "1px solid transparent" }}
                onClick={() => { setIsRenamingSession(true); setTimeout(() => renameInputRef.current?.select(), 0); }}
                title="Click to rename"
              >
                {sessionName}
              </h2>
            )}
          </div>

          {/* Right: Autosave status + stats */}
          <div className="flex items-center gap-2 shrink-0 justify-end">
            <div className="flex items-center gap-1.5 justify-end">
              <AnimatePresence mode="wait">
                {saveStatus === "saving" ? (
                  <motion.span
                    key="saving"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-[10px] text-[#a1a1aa] whitespace-nowrap"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                      <RotateCw className="w-3 h-3" />
                    </motion.div>
                    Saving…
                  </motion.span>
                ) : saveStatus === "saved" ? (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-[10px] text-[var(--color-sage)] whitespace-nowrap"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <Check className="w-3 h-3" />
                    Saved
                  </motion.span>
                ) : lastSavedAt ? (
                  <motion.span
                    key="timestamp"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] text-[#a1a1aa] whitespace-nowrap"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Last saved {lastSavedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase()}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="hidden min-[1160px]:block w-px h-4 bg-[#e4e4e7]" />

            <span className="hidden min-[1160px]:inline text-[10px] text-[#a1a1aa] tabular-nums whitespace-nowrap" style={{ fontFamily: "var(--font-body)" }}>
              {script.filter(b => b.type === "voice").length} seg · {script.filter(b => b.type === "pause").length} pau · ~{estimated.minutes}m{estimated.seconds > 0 ? ` ${estimated.seconds}s` : ""}
            </span>
          </div>
        </div>

        {/* Script blocks — Timeline Editor */}
        <div ref={scriptScrollRef} className="flex-1 overflow-y-auto studio-scroll relative" style={{ background: "#fafaf9" }} onClick={handleBackgroundClick}>
          <div className="max-w-[680px] mx-auto px-8 py-6">
            {/* Add segment at top */}
            {script.length > 0 && (
              <div className="relative flex items-center justify-center group/addtop" style={{ height: "32px", marginLeft: "51px" }}>
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[rgba(122,158,126,0.35)] lg:border-transparent lg:group-hover/addtop:border-[rgba(122,158,126,0.35)] transition-colors" />
                <button
                  onClick={(e) => { e.stopPropagation(); addBlock(script[0].id, "before"); }}
                  className="relative opacity-100 lg:opacity-0 lg:group-hover/addtop:opacity-100 w-5 h-5 rounded-full bg-white border border-[#e4e4e7] hover:border-[var(--color-sage)] hover:bg-[var(--color-sage-light)] flex items-center justify-center text-[#a1a1aa] hover:text-[var(--color-sage)] shadow-sm transition-all cursor-pointer z-10"
                  title="Add segment above"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}

            <AnimatePresence mode="popLayout">
            {(() => {
              let voiceIndex = 0;
              return script.map((block, index) => {
                const isSelected = selectedBlock === block.id;

                if (block.type === "pause") {
                  const dur = block.pauseDuration ?? 0;
                  const isEmpty = dur === 0;
                  const hasError = errorPauseIds.has(block.id);
                  const isLong = dur >= 4;
                  const isEditingDur = editingPauseId === block.id;
                  const swapAnim = swappedUp === block.id ? "swap-up" : swappedDown === block.id ? "swap-down" : undefined;
                  const canMoveUp = script.slice(0, index).some(b => b.type === "pause");
                  const canMoveDown = script.slice(index + 1).some(b => b.type === "pause");

                  const isNewBlock = newBlockIds.has(block.id);
                  return <motion.div
                      key={block.id}
                      layout
                      initial={isNewBlock ? { opacity: 0 } : false}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden", transition: { duration: 0.25, ease: "easeIn" } }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                    <div className="relative flex items-center group/pause" style={{ height: isLong ? "52px" : "40px", animation: swapAnim ? `${swapAnim} 0.35s ease` : undefined }}>
                      {/* Timeline connector */}
                      <div className="absolute left-[19px] top-0 bottom-0 w-px" style={{ background: hasError ? "#fca5a5" : "rgba(122,158,126,0.15)" }} />
                      {/* Timeline dot */}
                      <div className="relative z-10 shrink-0" style={{ width: "39px", display: "flex", justifyContent: "center" }}>
                        <div style={{
                          width: isLong ? "9px" : "7px",
                          height: isLong ? "9px" : "7px",
                          borderRadius: "50%",
                          background: hasError ? "#ef4444" : isEmpty ? "#d4d4d8" : isLong ? "var(--color-sage)" : "#a1a1aa",
                          border: `2px solid ${hasError ? "#fecaca" : isEmpty ? "#e8e8ec" : isLong ? "rgba(122,158,126,0.25)" : "#e4e4e7"}`,
                        }} />
                      </div>

                      {/* Pause content row */}
                      <div
                        onClick={(e) => { e.stopPropagation(); setSelectedBlock(isSelected ? null : block.id); }}
                        className={`flex items-center flex-1 ml-3 rounded-lg px-3 cursor-pointer transition-all ${
                          hasError
                            ? "bg-red-50/80 border border-red-200"
                            : isSelected
                              ? "bg-white border border-[#d4d4d8] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                              : "hover:bg-white/80 border border-transparent hover:border-[#e8e8ec]"
                        }`}
                        style={{ height: isLong ? "36px" : "30px" }}
                      >
                        {/* Pause label */}
                        <div className="flex items-center gap-2 mr-auto">
                          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.7 }}>
                            <rect x="2" y="1" width="3.5" height="12" rx="1" fill={hasError ? "#dc2626" : isEmpty ? "#c4c4c4" : isLong ? "#52525b" : "#a1a1aa"} />
                            <rect x="8.5" y="1" width="3.5" height="12" rx="1" fill={hasError ? "#dc2626" : isEmpty ? "#c4c4c4" : isLong ? "#52525b" : "#a1a1aa"} />
                          </svg>
                          <span style={{
                            fontFamily: "var(--font-body)", fontWeight: 500,
                            fontSize: "11px", letterSpacing: "0.02em",
                            color: hasError ? "#dc2626" : isEmpty ? "#a1a1aa" : "#71717a",
                          }}>
                            {hasError ? "Empty Pause" : isEmpty ? "Empty Pause" : isLong ? "Long Pause" : "Short Pause"}
                          </span>
                        </div>

                        {/* Duration controls */}
                        <div className="flex items-center gap-1">
                          {/* Reorder arrows — hover only */}
                          <div className="flex items-center gap-px opacity-0 group-hover/pause:opacity-100 transition-opacity mr-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); if (canMoveUp) moveBlock(block.id, "up"); }}
                              className={`w-5 h-5 rounded flex items-center justify-center transition-all ${canMoveUp ? "text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f4f5] cursor-pointer" : "text-[#d4d4d8] cursor-default"}`}
                            >
                              <svg width="8" height="5" viewBox="0 0 10 6" fill="none"><path d="M5 0L0 5h10L5 0z" fill="currentColor"/></svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); if (canMoveDown) moveBlock(block.id, "down"); }}
                              className={`w-5 h-5 rounded flex items-center justify-center transition-all ${canMoveDown ? "text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f4f5] cursor-pointer" : "text-[#d4d4d8] cursor-default"}`}
                            >
                              <svg width="8" height="5" viewBox="0 0 10 6" fill="none"><path d="M5 6L0 1h10L5 6z" fill="currentColor"/></svg>
                            </button>
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); setPauseDuration(block.id, dur - 1); }}
                            className="w-5 h-5 rounded flex items-center justify-center text-[#a1a1aa] hover:text-[#52525b] hover:bg-[#f4f4f5] transition-all cursor-pointer text-xs"
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
                              className="w-8 text-center text-[11px] tabular-nums bg-white rounded outline-none py-0.5 border border-[#d4d4d8] focus:border-[#a1a1aa]"
                              style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: "#18181b" }}
                            />
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingPauseId(block.id); }}
                              className="text-[11px] w-8 text-center tabular-nums rounded py-0.5 transition-all cursor-text hover:bg-[#f4f4f5]"
                              style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: isEmpty ? "#c4c4c4" : "#52525b" }}
                              title="Click to edit duration"
                            >
                              {isEmpty ? "—" : `${dur}s`}
                            </button>
                          )}

                          <button
                            onClick={(e) => { e.stopPropagation(); setPauseDuration(block.id, dur + 1); }}
                            className="w-5 h-5 rounded flex items-center justify-center text-[#a1a1aa] hover:text-[#52525b] hover:bg-[#f4f4f5] transition-all cursor-pointer text-xs"
                          >+</button>
                        </div>
                      </div>
                    </div>

                    {/* Add segment — hover zone below pause */}
                    <div className="relative flex items-center justify-center group/addpause" style={{ height: "32px", marginLeft: "51px" }}>
                      <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[rgba(122,158,126,0.35)] lg:border-transparent lg:group-hover/addpause:border-[rgba(122,158,126,0.35)] transition-colors" />
                      <button
                        onClick={(e) => { e.stopPropagation(); addBlock(block.id, "after"); }}
                        className="relative opacity-100 lg:opacity-0 lg:group-hover/addpause:opacity-100 w-5 h-5 rounded-full bg-white border border-[#e4e4e7] hover:border-[var(--color-sage)] hover:bg-[var(--color-sage-light)] flex items-center justify-center text-[#a1a1aa] hover:text-[var(--color-sage)] shadow-sm transition-all cursor-pointer z-10"
                        title="Add segment"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    </motion.div>;
                }

                // Voice block
                const currentVoiceIndex = ++voiceIndex;
                const canMoveVoiceUp = script.slice(0, index).some(b => b.type === "voice");
                const canMoveVoiceDown = script.slice(index + 1).some(b => b.type === "voice");
                const voiceSwapAnim = swappedUp === block.id ? "swap-up" : swappedDown === block.id ? "swap-down" : undefined;
                const isLastVoice = !script.slice(index + 1).some(b => b.type === "voice");
                const isFirstVoice = !script.slice(0, index).some(b => b.type === "voice");
                const isNewVoice = newBlockIds.has(block.id);

                return (
                  <motion.div
                    key={block.id}
                    data-block-id={block.id}
                    layout
                    className="relative flex group/row"
                    style={{ animation: voiceSwapAnim ? `${voiceSwapAnim} 0.35s ease` : undefined }}
                    initial={isNewVoice ? { opacity: 0, y: -10, scale: 0.97 } : false}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5, transition: { duration: 0.25, ease: "easeIn" } }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: isNewVoice ? 0.1 : 0 }}
                  >
                    {/* Timeline connector + number */}
                    <div className="relative shrink-0" style={{ width: "39px" }}>
                      {/* Line above */}
                      {!isFirstVoice && (
                        <div className="absolute left-[19px] top-0 w-px" style={{ height: "20px", background: "rgba(122,158,126,0.15)" }} />
                      )}
                      {/* Line below */}
                      <div className="absolute left-[19px] bottom-0 w-px" style={{ top: "20px", background: "rgba(122,158,126,0.15)" }} />
                      {/* Number badge */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-[14px] z-10 w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] tabular-nums transition-all"
                        style={{
                          fontFamily: "var(--font-body)", fontWeight: 600,
                          background: isSelected ? "var(--color-sage)" : "#eee8f3",
                          color: isSelected ? "#fff" : "#6b5b7b",
                          border: isSelected ? "2px solid var(--color-sage)" : "2px solid #ddd4e8",
                          boxShadow: isSelected ? "0 0 0 3px rgba(122,158,126,0.15)" : "none",
                        }}
                      >
                        {currentVoiceIndex}
                      </div>
                    </div>

                    {/* Card */}
                    <div className="flex-1 min-w-0 ml-3 mb-0">
                      <div
                        onClick={(e) => { e.stopPropagation(); if (isSelected) { saveEdit(); } else { startEditing(block.id); } }}
                        className={`relative rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "bg-white shadow-[0_1px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(122,158,126,0.3)]"
                            : "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_1px_6px_rgba(0,0,0,0.08)] border border-[#eaeae8] hover:border-[#d4d4d2]"
                        }`}
                        style={{
                          borderLeft: isSelected ? "3px solid var(--color-sage)" : undefined,
                        }}
                      >
                        <div className="flex items-center gap-3" style={{ padding: isSelected ? "14px 14px 14px 13px" : "14px 14px 14px 16px" }}>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {isSelected ? (
                              <div>
                                <textarea
                                  value={block.text}
                                  onChange={(e) => { if (e.target.value.length <= 90) updateBlockText(block.id, e.target.value); }}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="Enter text..."
                                  className="w-full text-[13.5px] text-[#1a1614] bg-[#fafaf9] outline-none resize-none leading-[1.7] rounded-md px-3 py-2.5 border border-[#e4e4e7] focus:border-[var(--color-sage)] transition-colors placeholder:text-[#c4c4c4]"
                                  style={{ fontFamily: "var(--font-body)" }}
                                  rows={Math.max(2, Math.ceil((block.text.length || 15) / 55))}
                                  maxLength={90}
                                  autoFocus
                                />
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[var(--color-sage)] text-white hover:opacity-90 transition-all cursor-pointer"
                                      style={{ fontFamily: "var(--font-body)" }}
                                    >
                                      <Check className="w-3 h-3" /> Save
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); discardEdit(); }}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f4f5] transition-all cursor-pointer"
                                      style={{ fontFamily: "var(--font-body)" }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  <span className={`text-[10px] tabular-nums ${block.text.length >= 90 ? "text-red-500 font-semibold" : block.text.length >= 75 ? "text-amber-500" : "text-[#a1a1aa]"}`} style={{ fontFamily: "var(--font-body)" }}>
                                    {block.text.length >= 90 ? "Limit reached" : `${90 - block.text.length}`}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className={`text-[13.5px] leading-[1.7] ${block.text.trim() ? "text-[#2d2926]" : "text-[#c4c4c4]"}`} style={{ fontFamily: "var(--font-body)" }}>
                                {block.text.trim() || "Enter text..."}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          {!isSelected && (
                            <div className="flex items-center gap-0.5 shrink-0">
                              {/* Reorder — hover only */}
                              <div className="flex flex-col opacity-0 group-hover/row:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (canMoveVoiceUp) moveBlock(block.id, "up"); }}
                                  className={`w-7 h-3.5 rounded-t flex items-center justify-center transition-all ${canMoveVoiceUp ? "text-[#a1a1aa] hover:text-[#52525b] cursor-pointer" : "text-[#e4e4e7] cursor-default"}`}
                                  title={canMoveVoiceUp ? "Move up" : "Already at top"}
                                >
                                  <svg width="8" height="5" viewBox="0 0 10 6" fill="none"><path d="M5 0L0 5h10L5 0z" fill="currentColor"/></svg>
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (canMoveVoiceDown) moveBlock(block.id, "down"); }}
                                  className={`w-7 h-3.5 rounded-b flex items-center justify-center transition-all ${canMoveVoiceDown ? "text-[#a1a1aa] hover:text-[#52525b] cursor-pointer" : "text-[#e4e4e7] cursor-default"}`}
                                  title={canMoveVoiceDown ? "Move down" : "Already at bottom"}
                                >
                                  <svg width="8" height="5" viewBox="0 0 10 6" fill="none"><path d="M5 6L0 1h10L5 6z" fill="currentColor"/></svg>
                                </button>
                              </div>
                              {/* Pencil — always visible */}
                              <button
                                onClick={(e) => { e.stopPropagation(); startEditing(block.id); }}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-[#a1a1aa] hover:text-[#52525b] hover:bg-[#f4f4f5] transition-all cursor-pointer"
                                title="Edit text"
                              >
                                <PenLine className="w-3.5 h-3.5" />
                              </button>
                              {/* Trash — always visible, always red */}
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-[#ef4444] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                title="Delete segment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              });
            })()}
            </AnimatePresence>

            {/* Add segment at end */}
            {script.length > 0 && (
              <div className="flex items-start">
                <div className="shrink-0 flex justify-center" style={{ width: "39px" }}>
                  <div className="w-px h-5" style={{ background: "rgba(122,158,126,0.15)" }} />
                </div>
                <div className="ml-3 pt-2 pb-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); addBlock(script[script.length - 1].id, "after"); }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] text-[#71717a] hover:text-[var(--color-sage)] bg-white hover:bg-[var(--color-sage-light)] border border-dashed border-[#d4d4d8] hover:border-[var(--color-sage)] transition-all cursor-pointer shadow-sm"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                  >
                    <Plus className="w-3 h-3" /> Add segment
                  </button>
                </div>
              </div>
            )}
          </div>

          </div>

        {/* Bottom bar — desktop */}
        <div className="hidden lg:flex items-center justify-between px-6 py-3.5 border-t border-[#e8e8e8]" style={{ background: "#ffffff" }}>
          <div className="flex items-center gap-2.5">
            {/* Credit progress ring */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="#e4e4e7" strokeWidth="2" />
              <circle cx="9" cy="9" r="7" stroke="#18181b" strokeWidth="2" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 7}`}
                strokeDashoffset={`${2 * Math.PI * 7 * (1 - (profile?.credits_remaining ?? 0) / Math.max(1, profile?.plan === "creator" ? 200 : profile?.plan === "personal" ? 50 : 10))}`}
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            </svg>
            <span className="text-[13px] text-[#18181b]" style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}>
              {profile?.credits_remaining ?? 0} credits remaining
            </span>
          </div>
          <div className="flex items-center gap-4">
            {generateWarning && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5" style={{ fontFamily: "var(--font-body)" }}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {generateWarning}
              </div>
            )}
          <div className="relative">
            <div
              className="absolute -inset-[2px] rounded-[10px] bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-70 blur-[1px]"
              style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}
            />
            <button
              onClick={handleGenerateAudio}
              disabled={isGenerating}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#18181b] text-white hover:bg-[#27272a] transition-colors text-sm cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
          <button
            onClick={handlePreviewScript}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e4e4e7] bg-white text-[#52525b] hover:bg-[#f4f4f5] transition-colors text-xs cursor-pointer"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
          >
            Preview .txt
          </button>
          </div>
        </div>

        {/* Bottom bar — mobile (sticky at bottom) */}
        <div className="flex lg:hidden flex-col border-t border-[#e8e8e8] shrink-0" style={{ background: "#ffffff" }}>
          {/* Voice indicator + panel toggles */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2">
            <div className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f4f4f5] border border-[#e4e4e7]">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: selectedVoice.color + "20" }}>
                <div className="w-2 h-2 rounded-full" style={{ background: selectedVoice.color }} />
              </div>
              <span className="text-[13px] text-[#18181b] truncate" style={{ fontFamily: "var(--font-body)" }}>{selectedVoice.name}</span>
            </div>
            <button
              onClick={() => setMobilePanel(mobilePanel === "settings" ? null : "settings")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                mobilePanel === "settings" ? "bg-[#18181b] text-white" : "bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7]"
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobilePanel(mobilePanel === "history" ? null : "history")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                mobilePanel === "history" ? "bg-[#18181b] text-white" : "bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7]"
              }`}
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
          {/* Generate button */}
          <div className="px-4 pb-3">
            <div className="relative">
              <div
                className="absolute -inset-[2px] rounded-[10px] bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-70 blur-[1px]"
                style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}
              />
              <button
                onClick={handleGenerateAudio}
                disabled={isGenerating}
                className="relative w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#18181b] text-white hover:bg-[#27272a] transition-colors text-sm cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
          {/* Credits */}
          <div className="flex items-center justify-center gap-2 pb-3 px-4">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="#e4e4e7" strokeWidth="2" />
              <circle cx="9" cy="9" r="7" stroke="#18181b" strokeWidth="2" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 7}`}
                strokeDashoffset={`${2 * Math.PI * 7 * (1 - (profile?.credits_remaining ?? 0) / Math.max(1, profile?.plan === "creator" ? 200 : profile?.plan === "personal" ? 50 : 10))}`}
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            </svg>
            <span className="text-[11px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>
              {profile?.credits_remaining ?? 0} credits remaining
            </span>
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
              sound={sessionSound}
              volume={soundVolume}
              onSoundChange={(s) => { setSessionSound(s); markEdited(); }}
              onVolumeChange={setSoundVolume}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ─── Right Panel (Settings / History) — desktop only ─── */}
      <div className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-[#e4e4e7] hidden lg:flex flex-col overflow-y-auto studio-scroll" style={{ background: "#fafafa" }}>
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
            <label className="text-[11px] uppercase tracking-wider text-[#52525b] mb-2.5 block" style={{ fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: "0.08em" }}>Pause Types</label>
            <div className="p-4 rounded-xl bg-white border border-[#e4e4e7] shadow-sm space-y-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 border-2 border-[#a1a1aa]" style={{ background: "#d4d4d8" }} />
                  <span className="text-[12px] text-[#3f3f46]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Short</span>
                  <span className="text-[10px] text-[#a1a1aa] bg-[#f4f4f5] px-1.5 py-0.5 rounded" style={{ fontFamily: "var(--font-body)" }}>up to 3s</span>
                </div>
                <p className="text-[11.5px] text-[#71717a] leading-relaxed pl-5" style={{ fontFamily: "var(--font-body)" }}>Voice continues naturally, like a brief breath between sentences</p>
              </div>
              <div className="border-t border-[#f0f0f3]" />
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 border-2" style={{ background: "var(--color-sage-light)", borderColor: "var(--color-sage)" }} />
                  <span className="text-[12px]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: "var(--color-sage)" }}>Long</span>
                  <span className="text-[10px] bg-[var(--color-sage-light)] px-1.5 py-0.5 rounded" style={{ fontFamily: "var(--font-body)", color: "var(--color-sage)" }}>4s or more</span>
                </div>
                <p className="text-[11.5px] text-[#71717a] leading-relaxed pl-5" style={{ fontFamily: "var(--font-body)" }}>Creates a distinct break, voice re-entry is slightly more deliberate</p>
              </div>
            </div>
          </div>

          {/* Adding segments */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#52525b] mb-2.5 block" style={{ fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: "0.08em" }}>Adding Segments</label>
            <div className="p-4 rounded-xl bg-white border border-[#e4e4e7] shadow-sm space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#f4f4f5] border border-[#e4e4e7] flex items-center justify-center shrink-0 mt-0.5">
                  <Plus className="w-2.5 h-2.5 text-[#71717a]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#3f3f46] mb-0.5" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Hover between blocks</p>
                  <p className="text-[11.5px] text-[#71717a] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>A <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-[#d4d4d8] text-[8px] text-[#71717a] align-text-bottom">+</span> button appears between any two blocks. Click it to insert a new text segment with an auto-paired pause.</p>
                </div>
              </div>
            </div>
          </div>
        </div>}

        {rightTab === "history" && (
          <div className="flex-1 overflow-y-auto studio-scroll p-4 space-y-3">
            {(() => {
              const sessionGens = sessionGenerations;

              if (sessionGens.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center mb-3">
                      <Clock className="w-4 h-4 text-[#a1a1aa]" />
                    </div>
                    <p className="text-[13px] text-[#71717a] mb-1" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>No generations yet</p>
                    <p className="text-[11px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>Generate audio to see history here</p>
                  </div>
                );
              }

              // Session title = first generation's prompt
              const sessionTitle = sessionGens[0].prompt;

              return (
                <>
                  {/* Session header */}
                  <div className="px-1 pb-1">
                    <p className="text-[11px] text-[#a1a1aa] mb-0.5" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{sessionGens.length} generation{sessionGens.length !== 1 ? "s" : ""} in this session</p>
                    <p className="text-[12px] text-[#52525b] truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 450, fontStyle: "italic" }}>&ldquo;{sessionTitle}&rdquo;</p>
                  </div>

                  {sessionGens.map((gen, i) => {
                    const timePart = gen.timestamp.split(" · ")[1] || "";
                    const datePart = gen.timestamp.split(" · ")[0] || "";
                    const genVoice = voices.find(v => v.name === gen.voice);
                    const voiceColor = genVoice?.color || "#a1a1aa";
                    const isFailed = (gen.status as string) === "failed";

                    return (
                      <motion.div
                        key={gen.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.25 }}
                        className={`group/item rounded-xl border p-3.5 transition-all ${
                          isFailed
                            ? "border-[#fecaca] bg-[#fffbfb]"
                            : "border-[#e8e8ec] bg-white hover:border-[#d0d0d6] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                        }`}
                      >
                        {/* Header: version number + time */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: isFailed ? "#ef4444" : "#a1a1aa" }}>
                            v{sessionGens.length - i}{isFailed ? " · Failed" : ""}
                          </span>
                          <span className="text-[11px] text-[#71717a]" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>{datePart} · {timePart}</span>
                        </div>

                        {/* Prompt */}
                        <p className={`text-[12.5px] leading-snug mb-2 ${isFailed ? "text-[#b91c1c]/70 line-through" : "text-[#18181b]"}`} style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>
                          {gen.prompt}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full flex items-center justify-center shrink-0" style={{ background: voiceColor + "20" }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: voiceColor }} />
                          </div>
                          <span className="text-[10px] text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>
                            {gen.voice} · {gen.protocol} · {gen.duration}
                          </span>
                        </div>

                        {/* Actions */}
                        {!isFailed && (
                          <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-[#f4f4f5]">
                            <div className="relative group/tip">
                              <button
                                onClick={() => { setShowStudioPlayer(true); setStudioPlaying(true); setHasGenerated(true); }}
                                className="h-7 px-2 rounded-md hover:bg-[#f0f0f3] flex items-center justify-center text-[#a1a1aa] hover:text-[#18181b] transition-colors cursor-pointer"
                              >
                                <Play className="w-3 h-3" />
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded bg-[#18181b] text-white text-[9px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10" style={{ fontFamily: "var(--font-body)" }}>Play</span>
                            </div>
                            <div className="relative group/tip">
                              <button className="h-7 px-2 rounded-md hover:bg-[#f0f0f3] flex items-center justify-center text-[#a1a1aa] hover:text-[#18181b] transition-colors cursor-pointer">
                                <Download className="w-3 h-3" />
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded bg-[#18181b] text-white text-[9px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10" style={{ fontFamily: "var(--font-body)" }}>Download</span>
                            </div>
                            <span className="ml-auto" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* ─── Mobile Bottom Sheet (Settings / History) ─── */}
      <AnimatePresence>
        {mobilePanel && (
          <motion.div
            className="fixed inset-0 z-[300] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobilePanel(null)} />
            {/* Sheet */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl flex flex-col"
              style={{ height: "70vh" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-9 h-1 rounded-full bg-[#d4d4d8]" />
              </div>
              {/* Tab bar */}
              <div className="px-4 border-b border-[#e4e4e7] flex items-center justify-between">
                <div className="flex items-center gap-0">
                  <button
                    onClick={() => setMobilePanel("settings")}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-[13px] transition-all cursor-pointer border-b-2 -mb-px ${
                      mobilePanel === "settings" ? "border-[#18181b] text-[#18181b]" : "border-transparent text-[#a1a1aa] hover:text-[#52525b]"
                    }`}
                    style={{ fontFamily: "var(--font-body)", fontWeight: mobilePanel === "settings" ? 600 : 400 }}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </button>
                  <button
                    onClick={() => setMobilePanel("history")}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-[13px] transition-all cursor-pointer border-b-2 -mb-px ${
                      mobilePanel === "history" ? "border-[#18181b] text-[#18181b]" : "border-transparent text-[#a1a1aa] hover:text-[#52525b]"
                    }`}
                    style={{ fontFamily: "var(--font-body)", fontWeight: mobilePanel === "history" ? 600 : 400 }}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    History
                  </button>
                </div>
                <button onClick={() => setMobilePanel(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a1a1aa] hover:text-[#18181b] hover:bg-[#f4f4f5] transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto studio-scroll">
                {mobilePanel === "settings" && <div className="px-5 py-4 space-y-6">
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
                          <div className="fixed inset-0 z-[310]" onClick={() => setShowVoiceDropdown(false)} />
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#e4e4e7] shadow-lg z-[320] max-h-48 overflow-y-auto">
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
                    <label className="text-[10px] uppercase tracking-wider text-[#71717a] mb-2.5 block" style={{ fontFamily: "var(--font-body)" }}>Background Sound</label>
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
                          <div className="fixed inset-0 z-[310]" onClick={() => setShowSoundDropdown(false)} />
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#e4e4e7] shadow-lg z-[320] max-h-48 overflow-y-auto">
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
                    <label className="text-[10px] uppercase tracking-wider text-[#71717a] mb-2.5 block" style={{ fontFamily: "var(--font-body)" }}>Estimated Duration</label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#f9f9fb] border border-transparent">
                      <Timer className="w-4 h-4 text-[#a1a1aa]" />
                      <span className="text-sm text-[#71717a] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>~{estimated.minutes}m {estimated.seconds > 0 ? `${estimated.seconds}s` : ""}</span>
                    </div>
                  </div>
                </div>}

                {mobilePanel === "history" && (
                  <div className="flex-1 overflow-y-auto studio-scroll p-4 space-y-3">
                    {(() => {
                      const sessionGens = sessionGenerations;
                      if (sessionGens.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center mb-3">
                              <Clock className="w-4 h-4 text-[#a1a1aa]" />
                            </div>
                            <p className="text-[13px] text-[#71717a] mb-1" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>No generations yet</p>
                            <p className="text-[11px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>Generate audio to see history here</p>
                          </div>
                        );
                      }
                      const sessionTitle = sessionGens[0].prompt;
                      return (
                        <>
                          <div className="px-1 pb-1">
                            <p className="text-[11px] text-[#a1a1aa] mb-0.5" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{sessionGens.length} generation{sessionGens.length !== 1 ? "s" : ""} in this session</p>
                            <p className="text-[12px] text-[#52525b] truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 450, fontStyle: "italic" }}>&ldquo;{sessionTitle}&rdquo;</p>
                          </div>
                          {sessionGens.map((gen, i) => {
                            const timePart = gen.timestamp.split(" · ")[1] || "";
                            const datePart = gen.timestamp.split(" · ")[0] || "";
                            const genVoice = voices.find(v => v.name === gen.voice);
                            const voiceColor = genVoice?.color || "#a1a1aa";
                            const isFailed = (gen.status as string) === "failed";
                            return (
                              <motion.div
                                key={gen.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.25 }}
                                className={`rounded-xl border p-3.5 transition-all ${
                                  isFailed ? "border-[#fecaca] bg-[#fffbfb]" : "border-[#e8e8ec] bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: isFailed ? "#ef4444" : "#a1a1aa" }}>
                                    v{sessionGens.length - i}{isFailed ? " · Failed" : ""}
                                  </span>
                                  <span className="text-[11px] text-[#71717a]" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>{datePart} · {timePart}</span>
                                </div>
                                <p className={`text-[12.5px] leading-snug mb-2 ${isFailed ? "text-[#b91c1c]/70 line-through" : "text-[#18181b]"}`} style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>
                                  {gen.prompt}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-full flex items-center justify-center shrink-0" style={{ background: voiceColor + "20" }}>
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: voiceColor }} />
                                  </div>
                                  <span className="text-[10px] text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>
                                    {gen.voice} · {gen.protocol} · {gen.duration}
                                  </span>
                                </div>
                                {!isFailed && (
                                  <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-[#f4f4f5]">
                                    <button
                                      onClick={() => { setShowStudioPlayer(true); setStudioPlaying(true); setHasGenerated(true); setMobilePanel(null); }}
                                      className="h-7 px-2 rounded-md hover:bg-[#f0f0f3] flex items-center justify-center text-[#a1a1aa] hover:text-[#18181b] transition-colors cursor-pointer"
                                    >
                                      <Play className="w-3 h-3" />
                                    </button>
                                    <button className="h-7 px-2 rounded-md hover:bg-[#f0f0f3] flex items-center justify-center text-[#a1a1aa] hover:text-[#18181b] transition-colors cursor-pointer">
                                      <Download className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "Last week";
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

/* ─── Main Studio Page ─── */

function StudioPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeNav, setActiveNav] = useState<NavId>("sessions");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const [anonBannerDismissed, setAnonBannerDismissed] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState<string | null>(null);

  // Bottom player state
  const [nowPlayingId, setNowPlayingId] = useState<string | null>(null);
  const [playerPlaying, setPlayerPlaying] = useState(false);
  const nowPlayingGeneration = generations.find(g => g.id === nowPlayingId);
  const nowPlayingSession = sessions.find(s => s.id === nowPlayingId || (nowPlayingGeneration && s.id === nowPlayingGeneration.sessionId)) || null;

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

  // Fetch sessions from API
  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const res = await fetch(`/api/sessions?search=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) return;
      const data = await res.json();
      const iconMap: Record<string, typeof Moon> = { sleep: Moon, focus: Sun, stress: Heart, anxiety: Heart };
      setSessions(data.map((s: Record<string, unknown>) => ({
        id: s.id,
        title: (s.title as string) || "Untitled",
        duration: `${s.duration || 10} min`,
        voice: (s.voice as string) || "Aria",
        protocol: (s.protocol as string) || "Custom",
        sound: (s.soundscape as string) || "Sanctuary",
        createdAt: new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(s.created_at as string)),
        createdAtRaw: s.created_at as string,
        createdAtShort: getRelativeTime(s.created_at as string),
        accessedAt: getRelativeTime(s.updated_at as string),
        category: (s.category as string) || "focus",
        icon: iconMap[(s.category as string) || "focus"] || Brain,
        hasGeneration: !!(s.has_generation),
        script: Array.isArray(s.script) ? s.script as ScriptEntry[] : null,
      })));
    } finally {
      setSessionsLoading(false);
    }
  }, [searchQuery]);

  const [generationsPage, setGenerationsPage] = useState(1);
  const fetchGenerations = useCallback(async () => {
    const res = await fetch(`/api/generations?page=${generationsPage}&limit=5`);
    if (!res.ok) return;
    const data = await res.json();
    setGenerations(data.map((g: Record<string, unknown>) => ({
      id: g.id,
      prompt: (g.prompt as string) || "",
      voice: (g.voice as string) || "Aria",
      duration: (g.duration as string) || "10 min",
      protocol: "",
      status: g.status as "completed" | "failed" | "pending" | "processing",
      timestamp: new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(g.created_at as string)),
      creditUsed: (g.credit_cost as number) || 0,
      sessionId: (g.session_id as string) || null,
    })));
  }, [generationsPage]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => { fetchGenerations(); }, [fetchGenerations]);

  // Refresh all data when browser tab regains focus (e.g. after Stripe checkout, switching tabs)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refetchProfile();
        fetchSessions();
        fetchGenerations();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refetchProfile, fetchSessions, fetchGenerations]);

  // Handle checkout return — verify session with backend before refreshing profile
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      const sessionId = searchParams.get("session_id");
      if (sessionId) {
        fetch("/api/verify-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })
          .catch(() => {}) // webhook is the safety net
          .finally(() => {
            refetchProfile();
            window.history.replaceState({}, "", "/studio");
          });
      } else {
        refetchProfile();
        window.history.replaceState({}, "", "/studio");
      }
    }
  }, [searchParams, refetchProfile]);

  // Open a specific session from URL param (e.g. from /session "Open in Studio", or ?session= deep link)
  useEffect(() => {
    const urlSessionId = searchParams.get("sessionId") || searchParams.get("session");
    if (!urlSessionId) return;
    setLoadingSession(true);
    (async () => {
      try {
        const res = await fetch(`/api/sessions/${urlSessionId}`);
        if (!res.ok) { setLoadingSession(false); return; }
        const full = await res.json();
        setGenConfig({
          prompt: full.prompt || full.title || "",
          voice: (full.voice || "aria").toLowerCase(),
          duration: full.duration || 10,
          sound: full.soundscape || "Sanctuary",
          sessionId: full.id,
          script: full.script || null,
          title: full.title || null,
          soundVolume: full.sound_volume ?? 70,
        });
        setActiveNav("generate" as NavId);
        setGenStep("studio");
        if (searchParams.get("sessionId")) {
          router.replace(`/studio?session=${full.id}`, { scroll: false });
        }
      } catch { /* ignore */ }
      setLoadingSession(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle browser back/forward: if URL loses ?session= while in studio, go back to sessions list
  useEffect(() => {
    const sessionParam = searchParams.get("session") || searchParams.get("sessionId");
    if (!sessionParam && activeNav === "generate" && genStep === "studio") {
      setActiveNav("sessions" as NavId);
      setGenStep("input");
      fetchSessions();
      refetchProfile();
    }
  }, [searchParams]);

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
  const [loadingSession, setLoadingSession] = useState(false);
  const [genConfig, setGenConfig] = useState({ prompt: "", voice: "aria", duration: 10, sound: "Sanctuary", sessionId: null as string | null, script: null as ScriptBlock[] | null, title: null as string | null, soundVolume: 70 });
  const [showGenAdvanced, setShowGenAdvanced] = useState(false);
  const genGenerateRef = useRef<HTMLDivElement>(null);
  const [selectedGenProtocol, setSelectedGenProtocol] = useState<string | null>(null);
  const [showGenProtocolInfo, setShowGenProtocolInfo] = useState(false);
  const [genPromptError, setGenPromptError] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [sessionsPage, setSessionsPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{ type: "regenerate" | "delete" | "generate"; sessionId: string; sessionTitle: string } | null>(null);
  const [settingsVoice, setSettingsVoice] = useState("aria");
  const [settingsDuration, setSettingsDuration] = useState(10);
  const [settingsSound, setSettingsSound] = useState("Sanctuary");
  const [settingsAutoDownload, setSettingsAutoDownload] = useState(false);
  const [settingsAmbientPreview, setSettingsAmbientPreview] = useState(true);

  // Populate settings from profile preferences
  useEffect(() => {
    if (profile?.preferences) {
      const p = profile.preferences;
      if (p.defaultVoice) setSettingsVoice(p.defaultVoice);
      if (p.defaultDuration) setSettingsDuration(p.defaultDuration);
      if (p.defaultSound) setSettingsSound(p.defaultSound);
      if (p.autoDownload !== undefined) setSettingsAutoDownload(p.autoDownload);
      if (p.ambientPreview !== undefined) setSettingsAmbientPreview(p.ambientPreview);
    }
  }, [profile]);

  // Debounced settings persistence
  const settingsSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!profile) return;
    if (settingsSaveRef.current) clearTimeout(settingsSaveRef.current);
    settingsSaveRef.current = setTimeout(() => {
      fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            defaultVoice: settingsVoice,
            defaultDuration: settingsDuration,
            defaultSound: settingsSound,
            autoDownload: settingsAutoDownload,
            ambientPreview: settingsAmbientPreview,
          },
        }),
      });
    }, 500);
    return () => { if (settingsSaveRef.current) clearTimeout(settingsSaveRef.current); };
  }, [settingsVoice, settingsDuration, settingsSound, settingsAutoDownload, settingsAmbientPreview, profile]);

  const [settingsOpenDropdown, setSettingsOpenDropdown] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleQuickGenerate = useCallback(async () => {
    if (!genConfig.prompt.trim()) {
      setGenPromptError(true);
      return;
    }
    setGenPromptError(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: genConfig.prompt,
          voice: genConfig.voice,
          duration: genConfig.duration,
          soundscape: genConfig.sound,
        }),
      });
      if (!res.ok) {
        const intent = detectIntent(genConfig.prompt);
        const params = new URLSearchParams({ prompt: genConfig.prompt, voice: genConfig.voice, duration: String(genConfig.duration), intent });
        router.push(`/session?${params.toString()}`);
        return;
      }
      const data = await res.json();
      refetchProfile();
      router.push(`/session?id=${data.session.id}`);
    } catch {
      const intent = detectIntent(genConfig.prompt);
      const params = new URLSearchParams({ prompt: genConfig.prompt, voice: genConfig.voice, duration: String(genConfig.duration), intent });
      router.push(`/session?${params.toString()}`);
    }
  }, [router, genConfig, refetchProfile]);

  const handlePromptSubmit = (text: string) => {
    if (!text.trim()) return;
    setGenConfig(prev => ({ ...prev, prompt: text.trim() }));
    setGeneratePrompt("");
    setGenStep("choose");
  };

  const navigateTo = (id: NavId) => {
    setActiveNav(id);
    setGenStep("input");
    // Refresh data when navigating to each tab
    if (id === "sessions") fetchSessions();
    if (id === "history") fetchGenerations();
    if (id === "sessions" || id === "history") refetchProfile();
    // Clear session param when navigating away from a session
    router.replace("/studio", { scroll: false });
  };

  // Update URL to reflect the active session (or clear it)
  const updateSessionUrl = useCallback((sessionId: string | null) => {
    if (sessionId) {
      router.push(`/studio?session=${sessionId}`, { scroll: false });
    } else {
      router.replace("/studio", { scroll: false });
    }
  }, [router]);

  const filteredSessions = sessions;

  // Studio view — sidebar stays, top header hidden
  if (activeNav === "generate" && genStep === "studio") {
    return (
      <div className="h-screen flex" style={{ background: "#ffffff" }}>
        {/* Mobile sidebar overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        {/* Sidebar */}
        <aside className={`fixed lg:relative z-50 lg:z-auto w-56 shrink-0 border-r border-[#e4e4e7] flex flex-col h-screen transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`} style={{ background: "#f4f4f5" }}>
          <div className="px-5 pt-6 pb-5 flex items-center justify-between">
            <button onClick={() => { navigateTo("sessions" as NavId); setSidebarOpen(false); }} className="flex items-center gap-2 text-[var(--color-sand-900)] cursor-pointer">
              <Logo />
              <div className="text-left">
                <span className="text-sm tracking-tight block" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Incraft Studio</span>
              </div>
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)] hover:bg-[var(--color-sand-100)] transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Generate button hidden in studio session — use bottom bar Generate Audio instead */}
          <nav className="flex-1 px-3 space-y-0.5">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { navigateTo(item.id); setSidebarOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] hover:text-[var(--color-sand-900)]"
                style={{ fontFamily: "var(--font-body)" }}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto px-0 pb-0">
            <div className="px-4 py-4 border-t border-[#e4e4e7]" style={{ background: "#fdf8f7" }}>
              {profileLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-sand-200)]" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-20 rounded bg-[var(--color-sand-200)]" />
                      <div className="h-2.5 w-14 rounded bg-[var(--color-sand-100)]" />
                    </div>
                  </div>
                  <div className="px-2 space-y-1.5">
                    <div className="h-2.5 w-full rounded bg-[var(--color-sand-100)]" />
                    <div className="h-2.5 w-full rounded bg-[var(--color-sand-100)]" />
                  </div>
                </div>
              ) : (
              <>
              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full shrink-0 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-sand-300)] flex items-center justify-center shrink-0">
                    <span className="text-xs text-[var(--color-sand-700)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{profile?.display_name?.[0]?.toUpperCase() || "U"}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{profile?.display_name || "User"}</p>
                  <p className="text-[10px] text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>{profile?.plan === "free" ? "Free plan" : `${profile?.plan?.charAt(0).toUpperCase()}${profile?.plan?.slice(1)} plan`}</p>
                </div>
                {profile?.plan === "free" && (
                <a href="/upgrade" className="text-[11px] px-3.5 py-1.5 rounded-lg text-white bg-clip-padding bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0" style={{ fontFamily: "var(--font-body)", fontWeight: 600, backgroundImage: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}>
                  Upgrade
                </a>
                )}
              </div>
              <div className="px-2 mb-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>Total</span>
                  <span className="text-[11px] text-[var(--color-sand-900)] tabular-nums" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{profile?.plan === "creator" ? 200 : profile?.plan === "personal" ? 50 : 10} credits</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>Remaining</span>
                  <span className="text-[11px] text-[var(--color-sand-900)] tabular-nums" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{profile?.credits_remaining ?? 0}</span>
                </div>
              </div>
              <button onClick={async () => { await fetch("/api/auth/signout", { method: "POST" }); router.push("/"); }} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-red-600 hover:text-red-700 transition-all text-[11px] cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
              </>
              )}
            </div>
          </div>
        </aside>

        {/* Studio content — no top header */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <StudioSession
            key={genConfig.sessionId || genConfig.prompt}
            prompt={genConfig.prompt}
            voice={genConfig.voice}
            duration={genConfig.duration}
            sound={genConfig.sound}
            sessionId={genConfig.sessionId}
            savedScript={genConfig.script}
            savedTitle={genConfig.title}
            savedVolume={genConfig.soundVolume}
            onBack={() => { setActiveNav("sessions"); setGenStep("input"); fetchSessions(); refetchProfile(); updateSessionUrl(null); }}
            onToggleSidebar={() => setSidebarOpen(true)}
            onGenerated={() => { fetchGenerations(); fetchSessions(); refetchProfile(); }}
            onSessionCreated={(id) => updateSessionUrl(id)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "var(--color-sand-50)" }}>
      {/* Loading overlay */}
      <AnimatePresence>
        {loadingSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[600] flex items-center justify-center"
            style={{ background: "var(--color-sand-50)" }}
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <RotateCw className="w-5 h-5 text-[var(--color-sand-400)]" />
              </motion.div>
              <span className="text-[13px] text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>Loading session...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ─── Mobile sidebar overlay ─── */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {/* ─── Sidebar ─── */}
      <motion.aside initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
        className={`w-56 shrink-0 border-r border-[var(--color-sand-200)] bg-white flex flex-col fixed top-0 left-0 h-screen z-50 transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="px-5 pt-6 pb-5 flex items-center justify-between">
          <button onClick={() => { setActiveNav("sessions" as NavId); setSidebarOpen(false); fetchSessions(); refetchProfile(); updateSessionUrl(null); }} className="flex items-center gap-2 text-[var(--color-sand-900)] cursor-pointer">
            <Logo />
            <div className="text-left">
              <span className="text-sm tracking-tight block" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Incraft Studio</span>
            </div>
          </button>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)] hover:bg-[var(--color-sand-100)] transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
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
            <button onClick={() => { navigateTo("generate" as NavId); setActiveNav("generate" as NavId); setGenStep("input"); setSidebarOpen(false); }}
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
                onClick={() => { navigateTo(item.id); setSidebarOpen(false); }}
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

        <div className="mt-auto px-0 pb-0">
          <div className="px-4 py-4 border-t border-[#e4e4e7]" style={{ background: "#fdf8f7" }}>
            {profileLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-sand-200)]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 rounded bg-[var(--color-sand-200)]" />
                    <div className="h-2.5 w-14 rounded bg-[var(--color-sand-100)]" />
                  </div>
                </div>
                <div className="px-2 space-y-1.5">
                  <div className="h-2.5 w-full rounded bg-[var(--color-sand-100)]" />
                  <div className="h-2.5 w-full rounded bg-[var(--color-sand-100)]" />
                </div>
              </div>
            ) : (
            <>
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full shrink-0 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--color-sand-300)] flex items-center justify-center shrink-0">
                  <span className="text-xs text-[var(--color-sand-700)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{profile?.display_name?.[0]?.toUpperCase() || "U"}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{profile?.display_name || "User"}</p>
                <p className="text-[10px] text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>{profile?.plan === "free" ? "Free plan" : `${profile?.plan?.charAt(0).toUpperCase()}${profile?.plan?.slice(1)} plan`}</p>
              </div>
              {profile?.plan === "free" && (
              <a href="/upgrade" className="text-[11px] px-3.5 py-1.5 rounded-lg text-white bg-clip-padding bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0" style={{ fontFamily: "var(--font-body)", fontWeight: 600, backgroundImage: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}>
                Upgrade
              </a>
              )}
            </div>
            <div className="px-2 mb-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>Total</span>
                <span className="text-[11px] text-[var(--color-sand-800)] tabular-nums" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{profile?.plan === "creator" ? 200 : profile?.plan === "personal" ? 50 : 10} credits</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>Remaining</span>
                <span className="text-[11px] text-[var(--color-sand-800)] tabular-nums" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{profile?.credits_remaining ?? 0}</span>
              </div>
            </div>
            <button onClick={async () => { await fetch("/api/auth/signout", { method: "POST" }); router.push("/"); }} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-red-600 hover:text-red-700 transition-all text-[11px] cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
            </>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 min-h-0 ml-0 lg:ml-56 flex flex-col overflow-hidden">
        <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.3 }}
          className="shrink-0 z-10 border-b border-[#e8e8ec] py-4" style={{ background: "var(--color-sand-50)" }}>
          <div className="px-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#52525b] hover:text-[#18181b] hover:bg-[#f4f4f5] transition-colors cursor-pointer mr-1">
                <Menu className="w-5 h-5" />
              </button>
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
                className="w-40 sm:w-56 pl-9 pr-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[13px] text-[#18181b] placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#a1a1aa] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] transition-all"
                style={{ fontFamily: "var(--font-body)" }} />
            </div>
          </div>
        </motion.header>

        {/* Anonymous user banner */}
        {profile?.is_anonymous && !anonBannerDismissed && (
          <div className="shrink-0 px-4 sm:px-8 pt-3">
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[var(--color-dusk)]/25 bg-[var(--color-dusk)]/5">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                  You&apos;re using Incraft as a guest.
                </p>
                <p className="text-xs text-[var(--color-sand-500)] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
                  Sign up to save your sessions and unlock 3 free credits.
                </p>
              </div>
              <a
                href="/login"
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs text-white bg-[var(--color-dusk)] hover:opacity-90 transition-opacity"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
              >
                Sign up
              </a>
              <button
                onClick={() => setAnonBannerDismissed(true)}
                className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[var(--color-sand-400)] hover:text-[var(--color-sand-700)] hover:bg-white/60 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className={`flex-1 ${activeNav === ("generate" as NavId) && genStep === "input" ? "overflow-hidden" : "overflow-y-auto"}`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-8 pt-6 ${nowPlayingSession ? "pb-28" : "pb-8"}`}>
          <AnimatePresence mode="wait">
            {/* All Sessions */}
            {activeNav === "sessions" && (
              <motion.div key="sessions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {sessionsLoading ? (
                  <SessionsLoadingIcon />
                ) : filteredSessions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {/* New Session card — always pinned first */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.02, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="group rounded-xl border-2 border-dashed border-[#d4d0ca] hover:border-[var(--color-sand-400)] bg-[#faf9f7] hover:bg-[#f5f3f0] transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[236px]"
                      onClick={() => { setActiveNav("generate" as NavId); setGenStep("input"); }}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#ece9e3] group-hover:bg-[#e2dfd8] flex items-center justify-center transition-colors mb-3">
                        <Plus className="w-5 h-5 text-[var(--color-sand-500)] group-hover:text-[var(--color-sand-700)] transition-colors" />
                      </div>
                      <span className="text-[13px] text-[var(--color-sand-500)] group-hover:text-[var(--color-sand-700)] transition-colors" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>New Session</span>
                    </motion.div>
                    {filteredSessions.map((session, i) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        delay={0.04 + i * 0.03}
                        isNowPlaying={nowPlayingId === session.id && playerPlaying}
                        onPlay={() => handlePlaySession(session.id)}
                        onOpenStudio={async () => {
                          setLoadingSession(true);
                          try {
                            fetch(`/api/sessions/${session.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
                            const res = await fetch(`/api/sessions/${session.id}`);
                            if (res.ok) {
                              const full = await res.json();
                              setGenConfig({
                                prompt: full.prompt || session.title,
                                voice: (full.voice || session.voice).toLowerCase(),
                                duration: full.duration || parseInt(session.duration),
                                sound: full.soundscape || session.sound,
                                sessionId: session.id,
                                script: full.script || null,
                                title: full.title || session.title,
                                soundVolume: full.sound_volume ?? 70,
                              });
                            } else {
                              setGenConfig({ prompt: session.title, voice: session.voice.toLowerCase(), duration: parseInt(session.duration), sound: session.sound, sessionId: session.id, script: null, title: session.title, soundVolume: 70 });
                            }
                          } catch {
                            setGenConfig({ prompt: session.title, voice: session.voice.toLowerCase(), duration: parseInt(session.duration), sound: session.sound, sessionId: session.id, script: null, title: session.title, soundVolume: 70 });
                          }
                          setActiveNav("generate" as NavId);
                          setGenStep("studio");
                          setLoadingSession(false);
                          updateSessionUrl(session.id);
                        }}
                        onRegen={() => setConfirmDialog({ type: "regenerate", sessionId: session.id, sessionTitle: session.title })}
                        onGenerate={() => setConfirmDialog({ type: "generate", sessionId: session.id, sessionTitle: session.title })}
                        onDelete={() => setConfirmDialog({ type: "delete", sessionId: session.id, sessionTitle: session.title })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <EmptyState label={searchQuery ? "No sessions found" : "No sessions yet"} />
                    {!searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        onClick={() => { setActiveNav("generate" as NavId); setGenStep("input"); }}
                        className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-colors cursor-pointer text-sm"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                      >
                        <Plus className="w-4 h-4" />
                        Create your first session
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* History */}
            {activeNav === "history" && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {/* Filter tabs */}
                <div className="flex items-center gap-1 mb-6 bg-[#f5f3f0] border border-[#e7e5e4] rounded-lg p-1 w-fit">
                  {([["all", "All"], ["generations", "Generations"], ["sessions", "Sessions"]] as const).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { setHistoryFilter(key); setSessionsPage(1); setGenerationsPage(1); }}
                      className={`px-3.5 py-1.5 rounded-md text-[12px] transition-all cursor-pointer border ${
                        historyFilter === key
                          ? "bg-white text-[var(--color-sand-900)] shadow-sm border-[#e7e5e4]"
                          : "text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)] border-transparent"
                      }`}
                      style={{ fontFamily: "var(--font-body)", fontWeight: historyFilter === key ? 600 : 400 }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Generations section (first) */}
                {(historyFilter === "all" || historyFilter === "generations") && (() => {
                  const perPage = 5;
                  const totalPages = Math.ceil(generations.length / perPage);
                  const paged = generations.slice((generationsPage - 1) * perPage, generationsPage * perPage);
                  return (
                  <div className="mb-6">
                    {historyFilter === "all" && (
                      <h3 className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)] mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
                        <Sparkles className="w-3 h-3" />
                        Generations
                      </h3>
                    )}
                    {paged.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center mb-3"><Sparkles className="w-4 h-4 text-[#a1a1aa]" /></div>
                        <p className="text-[13px] text-[#71717a] mb-1" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>No generations yet</p>
                        <p className="text-[11px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>Generate audio to see history here</p>
                      </div>
                    ) : (<>
                    <div className="bg-white rounded-xl border border-[#e7e5e4] overflow-hidden shadow-sm">
                      <div className="grid grid-cols-[1fr_70px_60px_80px] sm:grid-cols-[1fr_80px_70px_90px_70px_130px] gap-2 sm:gap-4 px-3 sm:px-5 py-3 border-b border-[#e7e5e4] bg-[#f5f3f0]">
                        <span className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Prompt</span>
                        <span className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Voice</span>
                        <span className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Duration</span>
                        <span className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)] hidden sm:block" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Protocol</span>
                        <span className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)] hidden sm:block" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Credit</span>
                        <span className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}></span>
                      </div>
                      {paged.map((gen, i) => {
                        const isGenPlaying = gen.sessionId ? nowPlayingId === gen.id && playerPlaying : false;
                        const genSession = gen.sessionId ? sessions.find(s => s.id === gen.sessionId) : null;
                        const genAccent = genSession ? (categoryColors[genSession.category] || categoryColors.focus).accent : "#18181b";
                        return (
                        <motion.div
                          key={gen.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04, duration: 0.25 }}
                          className="group grid grid-cols-[1fr_70px_60px_80px] sm:grid-cols-[1fr_80px_70px_90px_70px_130px] gap-2 sm:gap-4 items-center px-3 sm:px-5 py-3.5 border-b border-[#f4f4f5] last:border-b-0 hover:bg-[#fafafa] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {gen.status === "failed" ? (
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#ef4444]" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#a1a1aa]" />
                            )}
                            <div className="min-w-0">
                              <span className={`text-[13px] truncate block ${gen.status === "failed" ? "text-[#ef4444]" : "text-[#18181b]"}`} style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>{gen.prompt}</span>
                              <span className="text-[11px] text-[#52525b] block mt-0.5 whitespace-nowrap" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>{gen.timestamp}</span>
                            </div>
                          </div>
                          <span className="text-[11px] text-[#71717a] flex items-center gap-1.5" style={{ fontFamily: "var(--font-body)" }}>
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: voices.find(v => v.name === gen.voice)?.color || "#a1a1aa" }} />
                            {gen.voice}
                          </span>
                          <span className="text-[11px] text-[#71717a] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{gen.duration}</span>
                          <div className="hidden sm:block">
                            <span className="text-[11px] text-[#71717a] truncate block" style={{ fontFamily: "var(--font-body)" }}>{gen.protocol}</span>
                            {gen.status === "failed" && (
                              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#fef2f2] text-[#ef4444] inline-block mt-0.5" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Failed</span>
                            )}
                          </div>
                          <span className="text-[11px] tabular-nums hidden sm:block" style={{ fontFamily: "var(--font-body)", color: gen.creditUsed > 0 ? "#71717a" : "#a1a1aa" }}>{gen.creditUsed > 0 ? `-${gen.creditUsed}` : "0"}</span>
                          <div className="flex items-center justify-end gap-1">
                            <div className="relative group/tip">
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePlaySession(gen.id); }}
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
                                className="w-8 h-8 rounded-lg hover:bg-[#e7e5e4] flex items-center justify-center text-[#3f3f46] hover:text-[#18181b] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
                    </>)}
                  </div>
                  );
                })()}

                {/* Sessions section (second) */}
                {(historyFilter === "all" || historyFilter === "sessions") && (() => {
                  const perPage = 5;
                  const sorted = [...sessions].sort((a, b) => {
                    return new Date(b.createdAtRaw).getTime() - new Date(a.createdAtRaw).getTime();
                  });
                  const totalPages = Math.ceil(sorted.length / perPage);
                  const paged = sorted.slice((sessionsPage - 1) * perPage, sessionsPage * perPage);
                  return (
                  <div className="mb-6">
                    {historyFilter === "all" && (
                      <h3 className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)] mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
                        <FileText className="w-3 h-3" />
                        Sessions Created
                      </h3>
                    )}
                    <div className="bg-white rounded-xl border border-[#e7e5e4] overflow-hidden shadow-sm">
                      <div className="grid grid-cols-[1fr_60px_70px_80px] sm:grid-cols-[1fr_100px_80px_80px_140px_130px] gap-2 sm:gap-4 px-3 sm:px-5 py-3 border-b border-[#e7e5e4] bg-[#f5f3f0]">
                        <span className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Session</span>
                        <span className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)] hidden sm:block" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Protocol</span>
                        <span className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Duration</span>
                        <span className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Voice</span>
                        <span className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)] hidden sm:block" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Created</span>
                        <span className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}></span>
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
                            onClick={async () => {
                              setLoadingSession(true);
                              try {
                                const res = await fetch(`/api/sessions/${session.id}`);
                                if (res.ok) {
                                  const full = await res.json();
                                  setGenConfig({ prompt: full.prompt || session.title, voice: (full.voice || session.voice).toLowerCase(), duration: full.duration || parseInt(session.duration), sound: full.soundscape || session.sound, sessionId: session.id, script: full.script || null, title: full.title || session.title, soundVolume: full.sound_volume ?? 70 });
                                } else {
                                  setGenConfig({ prompt: session.title, voice: session.voice.toLowerCase(), duration: parseInt(session.duration), sound: session.sound, sessionId: session.id, script: null, title: session.title, soundVolume: 70 });
                                }
                              } catch {
                                setGenConfig({ prompt: session.title, voice: session.voice.toLowerCase(), duration: parseInt(session.duration), sound: session.sound, sessionId: session.id, script: null, title: session.title, soundVolume: 70 });
                              }
                              setActiveNav("generate" as NavId);
                              setGenStep("studio");
                              setLoadingSession(false);
                              updateSessionUrl(session.id);
                            }}
                            className="group grid grid-cols-[1fr_60px_70px_80px] sm:grid-cols-[1fr_100px_80px_80px_140px_130px] gap-2 sm:gap-4 items-center px-3 sm:px-5 py-3.5 border-b border-[#f4f4f5] last:border-b-0 hover:bg-[#fafafa] transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: isRowPlaying ? accent : "#d4d4d8" }} />
                              <span className="text-[13px] text-[#18181b] truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>{session.title}</span>
                            </div>
                            <span className="text-[11px] text-[#71717a] truncate hidden sm:block" style={{ fontFamily: "var(--font-body)" }}>{session.protocol}</span>
                            <span className="text-[11px] text-[#71717a] tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{session.duration}</span>
                            <span className="text-[11px] text-[#71717a] flex items-center gap-1.5" style={{ fontFamily: "var(--font-body)" }}>
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: voices.find(v => v.name === session.voice)?.color || "#a1a1aa" }} />
                              {session.voice}
                            </span>
                            <span className="text-[11px] text-[#52525b] whitespace-nowrap hidden sm:block" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>{session.createdAt}</span>
                            <div className="flex items-center justify-end gap-1">
                              <div className="relative group/tip">
                                <button
                                  onClick={async (e) => { e.stopPropagation(); setLoadingSession(true); try { const res = await fetch(`/api/sessions/${session.id}`); if (res.ok) { const full = await res.json(); setGenConfig({ prompt: full.prompt || session.title, voice: (full.voice || session.voice).toLowerCase(), duration: full.duration || parseInt(session.duration), sound: full.soundscape || session.sound, sessionId: session.id, script: full.script || null, title: full.title || session.title, soundVolume: full.sound_volume ?? 70 }); } else { setGenConfig({ prompt: session.title, voice: session.voice.toLowerCase(), duration: parseInt(session.duration), sound: session.sound, sessionId: session.id, script: null, title: session.title, soundVolume: 70 }); } } catch { setGenConfig({ prompt: session.title, voice: session.voice.toLowerCase(), duration: parseInt(session.duration), sound: session.sound, sessionId: session.id, script: null, title: session.title, soundVolume: 70 }); } setActiveNav("generate" as NavId); setGenStep("studio"); setLoadingSession(false); updateSessionUrl(session.id); }}
                                  className="w-8 h-8 rounded-lg hover:bg-[#ededfc] flex items-center justify-center text-[#3f3f46] hover:text-[#18181b] transition-colors cursor-pointer"
                                >
                                  <PenLine className="w-4 h-4" />
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-[#18181b] text-white text-[10px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10" style={{ fontFamily: "var(--font-body)" }}>Edit in Studio</span>
                              </div>
                              <div className="relative group/tip">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConfirmDialog({ type: "regenerate", sessionId: session.id, sessionTitle: session.title }); }}
                                  className="w-8 h-8 rounded-lg hover:bg-[#ededfc] flex items-center justify-center text-[#3f3f46] hover:text-[#18181b] transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-[#18181b] text-white text-[10px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10" style={{ fontFamily: "var(--font-body)" }}>Regenerate</span>
                              </div>
                              <div className="relative group/tip">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConfirmDialog({ type: "delete", sessionId: session.id, sessionTitle: session.title }); }}
                                  className="w-8 h-8 rounded-lg hover:bg-[#fef2f2] flex items-center justify-center text-[#dc2626] hover:text-[#b91c1c] transition-colors cursor-pointer"
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
              <motion.div key="gen-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="max-w-2xl w-full mx-auto px-4 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
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
                {/* Step hint */}
                <p className="text-[11px] text-[var(--color-sand-400)] mb-6 flex items-center justify-center gap-1.5" style={{ fontFamily: "var(--font-body)" }}>
                  <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[10px] !leading-[0] bg-[var(--color-sand-900)] text-[var(--color-sand-50)] font-medium">1</span>
                  <span>Prompt</span>
                  <span className="text-[var(--color-sand-300)]">→</span>
                  <span className="text-[var(--color-sand-300)]">Customize</span>
                  <span className="text-[var(--color-sand-300)]">→</span>
                  <span className="text-[var(--color-sand-300)]">Generate</span>
                </p>

                <div className="w-full mb-8 relative rounded-xl group">
                  <div className="absolute -inset-[2px] rounded-xl bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-80 group-focus-within:opacity-100 transition-opacity duration-300 blur-[0.5px]"
                    style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }} />
                  <div className="relative bg-white rounded-xl p-3 flex items-center gap-3">
                    <input type="text" value={generatePrompt} onChange={(e) => setGeneratePrompt(e.target.value.slice(0, 50))}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePromptSubmit(generatePrompt); } }}
                      maxLength={50}
                      placeholder="Create a guided meditation on..."
                      className="flex-1 outline-none text-sm text-[var(--color-sand-900)] placeholder:text-[var(--color-sand-400)] placeholder:opacity-50 bg-transparent" style={{ fontFamily: "var(--font-body)" }} />
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
              <motion.div key="gen-choose" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-xl mx-auto min-h-[calc(100vh-120px)] flex flex-col justify-center py-8">
                {/* Back button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setGenStep("input")}
                  className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-sand-600)] hover:text-[var(--color-sand-900)] hover:bg-white/60 border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] transition-all cursor-pointer mb-8"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <ChevronLeft className="w-4 h-4" />Back
                </motion.button>

                {/* Step indicator */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="flex items-center justify-center gap-1.5 mb-6 sm:mb-8 text-[11px]" style={{ fontFamily: "var(--font-body)" }}>
                  <span className="text-[var(--color-sand-400)] flex items-center gap-1">
                    <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[10px] !leading-[0] border border-[var(--color-sand-300)] text-[var(--color-sand-400)] font-medium">1</span>
                    Prompt
                  </span>
                  <span className="text-[var(--color-sand-300)]">→</span>
                  <span className="text-[var(--color-sand-900)] flex items-center gap-1 font-medium">
                    <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[10px] !leading-[0] bg-[var(--color-sand-900)] text-[var(--color-sand-50)] font-medium">2</span>
                    Customize
                  </span>
                  <span className="text-[var(--color-sand-300)]">→</span>
                  <span className="text-[var(--color-sand-300)] flex items-center gap-1">
                    <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[10px] !leading-[0] border border-[var(--color-sand-300)] text-[var(--color-sand-300)] font-medium">3</span>
                    Generate
                  </span>
                </motion.div>

                {/* Editable prompt */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center max-w-md mx-auto">
                  <p className="text-2xl text-[var(--color-sand-900)] leading-snug inline" style={{ fontFamily: "var(--font-display)" }}>
                    <span className="text-[var(--color-sand-400)] select-none">&ldquo;</span>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const text = (e.currentTarget.textContent || "").slice(0, 50);
                        e.currentTarget.textContent = text;
                        setGenConfig(prev => ({ ...prev, prompt: text }));
                      }}
                      onInput={(e) => {
                        const text = e.currentTarget.textContent || "";
                        if (text.length > 50) {
                          e.currentTarget.textContent = text.slice(0, 50);
                          const range = document.createRange();
                          const sel = window.getSelection();
                          range.selectNodeContents(e.currentTarget);
                          range.collapse(false);
                          sel?.removeAllRanges();
                          sel?.addRange(range);
                        }
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                      onFocus={() => setGenPromptError(false)}
                      className={`outline-none border-b transition-colors ${genPromptError ? "border-[var(--color-ember)]" : "border-transparent focus:border-[var(--color-sand-300)]"}`}
                    >{genConfig.prompt}</span>
                    <span className="text-[var(--color-sand-400)] select-none">&rdquo;</span>
                    <Pencil className="w-3 h-3 text-[var(--color-sand-400)] inline-block ml-1.5 mb-1" />
                  </p>
                  {genPromptError && (
                    <p className="text-xs text-[var(--color-ember)] mt-2 block" style={{ fontFamily: "var(--font-body)" }}>
                      Write something to describe your meditation
                    </p>
                  )}
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
                    onClick={() => { setShowGenAdvanced(!showGenAdvanced); setTimeout(() => genGenerateRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 300); }}
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
                <motion.div ref={genGenerateRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-col gap-3 items-center">
                  {/* Open in Studio — primary CTA with border glow */}
                  <div className="relative rounded-full group w-full">
                    <div className="absolute -inset-[2.5px] rounded-full bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-90 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }} />
                    <button onClick={() => { if (!genConfig.prompt.trim()) { setGenPromptError(true); return; } setGenPromptError(false); setGenStep("studio"); if (genConfig.sessionId) updateSessionUrl(genConfig.sessionId); }}
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
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="max-w-xl mx-auto" onClick={() => settingsOpenDropdown && setSettingsOpenDropdown(null)}>
                <div className="space-y-6">
                  {/* Account */}
                  <div className="bg-white rounded-2xl border border-[#e7e5e4] shadow-sm">
                    <div className="px-4 sm:px-6 py-4 border-b border-[#e7e5e4] bg-[#f5f3f0]">
                      <h3 className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Account</h3>
                    </div>
                    <div className="p-4 sm:p-6">
                      {profileLoading ? (
                      <div className="animate-pulse">
                        <div className="flex items-center gap-3.5 mb-5">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-sand-200)]" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-40 rounded bg-[var(--color-sand-200)]" />
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-14 rounded-full bg-[var(--color-sand-100)]" />
                              <div className="h-3 w-24 rounded bg-[var(--color-sand-100)]" />
                            </div>
                          </div>
                        </div>
                      </div>
                      ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean))" }}>
                            <span className="text-sm text-white" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>{profile?.display_name?.[0]?.toUpperCase() || "U"}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] text-[var(--color-sand-900)] truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{profile?.email || "user@example.com"}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[var(--color-sand-100)] text-[var(--color-sand-600)] border border-[var(--color-sand-200)]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>{profile?.plan === "free" ? "Free" : profile?.plan?.charAt(0).toUpperCase() + (profile?.plan?.slice(1) || "")}</span>
                              <span className="text-[11px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>{profile?.credits_remaining ?? 0} credits remaining</span>
                            </div>
                          </div>
                        </div>
                        {profile?.plan === "free" ? (
                        <button
                          onClick={() => router.push("/upgrade")}
                          className="px-4 py-2 rounded-full text-[12px] text-white cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.97] shadow-sm shrink-0 self-start sm:self-center"
                          style={{ fontFamily: "var(--font-body)", fontWeight: 600, background: "linear-gradient(135deg, #5a9a62, #6bb070)" }}>
                          Upgrade
                        </button>
                        ) : (
                        <button
                          onClick={() => router.push("/upgrade")}
                          className="px-4 py-2 rounded-full text-[12px] text-[var(--color-sand-600)] border border-[var(--color-sand-200)] hover:bg-[var(--color-sand-50)] cursor-pointer transition-all shrink-0 self-start sm:self-center"
                          style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                          Manage Plan
                        </button>
                        )}
                      </div>
                      )}
                      <div className="pt-4 border-t border-[var(--color-sand-100)]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[12px] text-[var(--color-sand-700)] block" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>Subscription</span>
                            <span className="text-[11px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>Manage billing, invoices, and plan changes</span>
                          </div>
                          <button
                            onClick={() => router.push("/upgrade")}
                            className="px-4 py-2 rounded-full border border-[var(--color-sand-200)] text-[12px] text-[var(--color-sand-600)] hover:bg-[var(--color-sand-50)] hover:border-[var(--color-sand-300)] transition-all cursor-pointer shrink-0 self-start sm:self-center"
                            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Defaults */}
                  <div className="bg-white rounded-2xl border border-[#e7e5e4] shadow-sm relative">
                    <div className="px-4 sm:px-6 py-4 border-b border-[#e7e5e4] bg-[#f5f3f0]">
                      <h3 className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Defaults</h3>
                      <p className="text-[11px] text-[var(--color-sand-400)] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>Set your preferred starting point for new sessions</p>
                    </div>
                    <div className="divide-y divide-[var(--color-sand-100)]">
                      {/* Voice */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-6 py-4 group hover:bg-[var(--color-sand-50)]/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: voices.find(v => v.id === settingsVoice)?.color || "#a1a1aa" }} />
                          <div>
                            <span className="text-[13px] text-[var(--color-sand-900)] block leading-none" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>Voice</span>
                            <span className="text-[11px] text-[var(--color-sand-400)] block mt-0.5 leading-none" style={{ fontFamily: "var(--font-body)" }}>{voices.find(v => v.id === settingsVoice)?.desc || ""}</span>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSettingsOpenDropdown(settingsOpenDropdown === "voice" ? null : "voice"); }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-sand-50)] border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] hover:bg-white transition-all cursor-pointer"
                          >
                            <span className="text-[12px] text-[var(--color-sand-700)]" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>{voices.find(v => v.id === settingsVoice)?.name || "Aria"}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-[var(--color-sand-400)] transition-transform ${settingsOpenDropdown === "voice" ? "rotate-180" : ""}`} />
                          </button>
                          {settingsOpenDropdown === "voice" && (
                            <>
                              <div className="fixed inset-0 z-[200]" onClick={(e) => { e.stopPropagation(); setSettingsOpenDropdown(null); }} />
                              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-[#e4e4e7] shadow-lg z-[210] w-52">
                                {voices.map((v, i) => (
                                  <button key={v.id} onClick={(e) => { e.stopPropagation(); setSettingsVoice(v.id); setSettingsOpenDropdown(null); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#f4f4f5] transition-colors cursor-pointer text-left ${i > 0 ? "border-t border-[#f0f0f3]" : ""}`}>
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: v.color + "20" }}>
                                      <div className="w-2 h-2 rounded-full" style={{ background: v.color }} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm text-[#18181b]" style={{ fontFamily: "var(--font-body)" }}>{v.name}</p>
                                      <p className="text-[10px] text-[#71717a]" style={{ fontFamily: "var(--font-body)" }}>{v.desc}</p>
                                    </div>
                                    {settingsVoice === v.id && <Check className="w-3.5 h-3.5 text-[#6b9a70]" />}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-6 py-4 group hover:bg-[var(--color-sand-50)]/50 transition-colors">
                        <div>
                          <span className="text-[13px] text-[var(--color-sand-900)] block leading-none" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>Duration</span>
                          <span className="text-[11px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>Default session length</span>
                        </div>
                        <div className="flex items-center gap-1 bg-[var(--color-sand-50)] border border-[var(--color-sand-200)] rounded-lg p-0.5 flex-wrap">
                          {[5, 10, 15, 20].map((d) => (
                            <button key={d} onClick={(e) => { e.stopPropagation(); setSettingsDuration(d); }}
                              className={`px-3 py-1.5 rounded-md text-[12px] transition-all cursor-pointer ${settingsDuration === d ? "bg-[var(--color-sand-900)] text-white shadow-sm" : "text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)]"}`}
                              style={{ fontFamily: "var(--font-body)", fontWeight: settingsDuration === d ? 500 : 400 }}>
                              {d}m
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Behavior */}
                  <div className="bg-white rounded-2xl border border-[#e7e5e4] shadow-sm">
                    <div className="px-4 sm:px-6 py-4 border-b border-[#e7e5e4] bg-[#f5f3f0]">
                      <h3 className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Behavior</h3>
                      <p className="text-[11px] text-[var(--color-sand-400)] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>Automate common actions</p>
                    </div>
                    <div className="divide-y divide-[var(--color-sand-100)]">
                      <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
                        <div className="min-w-0">
                          <span className="text-[13px] text-[var(--color-sand-900)] block leading-none" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>Auto-download after generation</span>
                          <span className="text-[11px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>Save audio files automatically</span>
                        </div>
                        <button
                          onClick={() => setSettingsAutoDownload(!settingsAutoDownload)}
                          className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${settingsAutoDownload ? "bg-[var(--color-sage)]" : "bg-[var(--color-sand-200)]"}`}>
                          <motion.div
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                            animate={{ left: settingsAutoDownload ? 22 : 4 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
                        <div className="min-w-0">
                          <span className="text-[13px] text-[var(--color-sand-900)] block leading-none" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>Ambient sound preview</span>
                          <span className="text-[11px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>Play soundscape preview on select</span>
                        </div>
                        <button
                          onClick={() => setSettingsAmbientPreview(!settingsAmbientPreview)}
                          className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${settingsAmbientPreview ? "bg-[var(--color-sage)]" : "bg-[var(--color-sand-200)]"}`}>
                          <motion.div
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                            animate={{ left: settingsAmbientPreview ? 22 : 4 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Support */}
                  <div className="bg-white rounded-2xl border border-[#e7e5e4] shadow-sm">
                    <div className="px-4 sm:px-6 py-4 border-b border-[#e7e5e4] bg-[#f5f3f0]">
                      <h3 className="text-[11px] uppercase tracking-wide text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>Support</h3>
                    </div>
                    <a href="/contact" className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-[var(--color-sand-50)]/50 transition-colors group">
                      <div>
                        <span className="text-[13px] text-[var(--color-sand-900)] block leading-none" style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}>Bugs, feature requests & support</span>
                        <span className="text-[11px] text-[var(--color-sand-400)] block mt-1 leading-none" style={{ fontFamily: "var(--font-body)" }}>Get in touch with our team</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--color-sand-300)] group-hover:text-[var(--color-sand-500)] transition-colors" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
            className="fixed inset-0 lg:left-56 z-[500] flex items-center justify-center"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 lg:-left-56 bg-black/40 backdrop-blur-[2px]" onClick={() => setConfirmDialog(null)} />
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
                  ) : confirmDialog.type === "generate" ? (
                    <Sparkles className="w-5 h-5 text-[#5a9a62]" />
                  ) : (
                    <RotateCcw className="w-5 h-5 text-[#5a9a62]" />
                  )}
                </div>
                <h3 className="text-[15px] text-[#18181b] mb-1.5" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
                  {confirmDialog.type === "delete" ? "Delete Session" : confirmDialog.type === "generate" ? "Generate Audio" : "Regenerate Session"}
                </h3>
                <p className="text-[13px] text-[#52525b] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {confirmDialog.type === "delete" ? (
                    <>Are you sure you want to delete <strong>&ldquo;{confirmDialog.sessionTitle}&rdquo;</strong>? This action is permanent and cannot be undone.</>
                  ) : confirmDialog.type === "generate" ? (
                    <>Generating audio for <strong>&ldquo;{confirmDialog.sessionTitle}&rdquo;</strong> will use <strong>1 credit</strong> from your balance.</>
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
                  onClick={async () => {
                    if (confirmDialog.type === "delete") {
                      await fetch(`/api/sessions/${confirmDialog.sessionId}`, { method: "DELETE" });
                      setSessions(prev => prev.filter(s => s.id !== confirmDialog.sessionId));
                      fetchGenerations();
                    } else if (confirmDialog.type === "generate" || confirmDialog.type === "regenerate") {
                      const session = sessions.find(s => s.id === confirmDialog.sessionId);
                      if (session) {
                        const res = await fetch("/api/generate", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            prompt: session.title,
                            voice: session.voice,
                            duration: parseInt(session.duration),
                            soundscape: session.sound,
                            sessionId: session.id,
                          }),
                        });
                        if (res.ok) {
                          refetchProfile();
                          fetchSessions();
                          fetchGenerations();
                        }
                      }
                    }
                    setConfirmDialog(null);
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-[13px] text-white transition-colors cursor-pointer ${
                    confirmDialog.type === "delete"
                      ? "bg-[#ef4444] hover:bg-[#dc2626]"
                      : "bg-[#5a9a62] hover:bg-[#4a7c50]"
                  }`}
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                >
                  {confirmDialog.type === "delete" ? "Delete Permanently" : confirmDialog.type === "generate" ? "Generate · 1 Credit" : "Regenerate · 1 Credit"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StudioPage() {
  return (
    <ProfileProvider>
      <Suspense fallback={
        <div className="h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "var(--color-sand-50)" }}>
          <div className="animate-[breathe_6s_ease-in-out_infinite]">
            <svg width={36} height={38} fill="none" viewBox="0 0 36 37.8281" className="text-[var(--color-sand-300)]">
              <path d={svgPaths.p1c4d2300} fill="currentColor" />
              <path d={svgPaths.p2128f680} fill="currentColor" />
              <path d={svgPaths.p1c2ff500} fill="currentColor" />
            </svg>
          </div>
          <div className="flex gap-1.5 mt-4">
            <span className="w-2 h-2 rounded-full animate-[dot-bounce_1.4s_ease-in-out_infinite]" style={{ backgroundColor: "#c9a96e", animationDelay: "0s" }} />
            <span className="w-2 h-2 rounded-full animate-[dot-bounce_1.4s_ease-in-out_infinite]" style={{ backgroundColor: "#c9a96e", animationDelay: "0.2s" }} />
            <span className="w-2 h-2 rounded-full animate-[dot-bounce_1.4s_ease-in-out_infinite]" style={{ backgroundColor: "#c9a96e", animationDelay: "0.4s" }} />
          </div>
        </div>
      }>
        <StudioPageContent />
      </Suspense>
    </ProfileProvider>
  );
}
