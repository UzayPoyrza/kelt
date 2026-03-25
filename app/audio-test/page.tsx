"use client";

import { useState, useRef, useEffect } from "react";
import { audioCatalog } from "@/lib/shared";
import { Play, Pause, Volume2 } from "lucide-react";

interface TrackState {
  playing: boolean;
  volume: number;
  audio: HTMLAudioElement | null;
}

export default function AudioTestPage() {
  const [tracks, setTracks] = useState<Record<string, TrackState>>({});
  const [filter, setFilter] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(audioCatalog.map((t) => t.category)))];

  const filtered = filter === "all" ? audioCatalog : audioCatalog.filter((t) => t.category === filter);

  function getTrack(id: string): TrackState {
    return tracks[id] || { playing: false, volume: 0.5, audio: null };
  }

  function togglePlay(id: string, src: string) {
    const track = getTrack(id);

    if (track.audio) {
      if (track.playing) {
        track.audio.pause();
        setTracks((prev) => ({ ...prev, [id]: { ...track, playing: false } }));
      } else {
        track.audio.play();
        setTracks((prev) => ({ ...prev, [id]: { ...track, playing: true } }));
      }
    } else {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = track.volume;
      audio.play();
      audio.addEventListener("error", () => {
        console.error(`Failed to load: ${src}`);
      });
      setTracks((prev) => ({ ...prev, [id]: { playing: true, volume: track.volume, audio } }));
    }
  }

  function setVolume(id: string, volume: number) {
    const track = getTrack(id);
    if (track.audio) {
      track.audio.volume = volume;
    }
    setTracks((prev) => ({ ...prev, [id]: { ...track, volume } }));
  }

  function stopAll() {
    Object.values(tracks).forEach((t) => {
      if (t.audio) {
        t.audio.pause();
        t.audio.currentTime = 0;
      }
    });
    setTracks((prev) => {
      const next: Record<string, TrackState> = {};
      for (const [k, v] of Object.entries(prev)) {
        next[k] = { ...v, playing: false };
      }
      return next;
    });
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(tracks).forEach((t) => {
        if (t.audio) {
          t.audio.pause();
          t.audio.src = "";
        }
      });
    };
  }, []);

  const playingCount = Object.values(tracks).filter((t) => t.playing).length;

  return (
    <div className="min-h-screen p-6 sm:p-10" style={{ background: "var(--color-sand-50)", fontFamily: "var(--font-body)" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl text-[var(--color-sand-900)]" style={{ fontFamily: "var(--font-display)" }}>
              Audio Library Test
            </h1>
            <p className="text-sm text-[var(--color-sand-500)] mt-1">
              {audioCatalog.length} sounds &middot; {playingCount} playing
            </p>
          </div>
          <button
            onClick={stopAll}
            className="px-4 py-2 rounded-xl text-sm bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-colors cursor-pointer"
          >
            Stop All
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all cursor-pointer ${
                filter === cat
                  ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)]"
                  : "bg-[var(--color-sand-100)] text-[var(--color-sand-600)] hover:bg-[var(--color-sand-200)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Track Grid */}
        <div className="grid gap-3">
          {filtered.map((item) => {
            const track = getTrack(item.id);
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  track.playing
                    ? "bg-white border-[var(--color-sage)] shadow-sm"
                    : "bg-white/60 border-[var(--color-sand-200)]"
                }`}
              >
                {/* Play button */}
                <button
                  onClick={() => togglePlay(item.id, item.src)}
                  className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                    track.playing
                      ? "bg-[var(--color-sage)] text-white"
                      : "bg-[var(--color-sand-100)] text-[var(--color-sand-600)] hover:bg-[var(--color-sand-200)]"
                  }`}
                >
                  {track.playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--color-sand-900)] font-medium truncate">{item.label}</p>
                  <p className="text-xs text-[var(--color-sand-500)] capitalize">{item.category}</p>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2 shrink-0">
                  <Volume2 className="w-3.5 h-3.5 text-[var(--color-sand-400)]" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={track.volume}
                    onChange={(e) => setVolume(item.id, parseFloat(e.target.value))}
                    className="w-24 sm:w-32 accent-[var(--color-sage)]"
                  />
                  <span className="text-xs text-[var(--color-sand-500)] w-8 text-right tabular-nums">
                    {Math.round(track.volume * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
