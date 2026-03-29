export type ScriptBlock = {
  id: string;
  type: "voice" | "pause";
  text: string;
  pauseDuration?: number;
};

export function generateScript(prompt: string): ScriptBlock[] {
  return [
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
}

export function deriveSessionName(prompt: string): string {
  // Clean up and title-case the prompt
  const cleaned = prompt.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Meditation Session";

  // Title case: capitalize first letter of each word (skip small words in middle)
  const small = new Set(["a", "an", "the", "and", "but", "or", "for", "in", "on", "at", "to", "of", "with", "my", "me"]);
  const titleCase = cleaned.split(" ").map((w, i) => {
    const lower = w.toLowerCase();
    if (i > 0 && small.has(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(" ");

  // Truncate at ~50 chars on a word boundary
  if (titleCase.length <= 50) return titleCase;
  const truncated = titleCase.slice(0, 50).replace(/\s\S*$/, "");
  return truncated + "\u2026";
}

/**
 * Parse raw TTS script format into ScriptBlock[].
 * Format:
 *   First line: "ID — Title" (title extracted, ID discarded)
 *   <break time="Xs" /> → short pause (≤3s)
 *   [pause: N] → long pause (≥4s)
 *   [skip_point] → ignored
 *   Plain text → voice block
 */
export function parseRawScript(raw: string): { title: string; blocks: ScriptBlock[] } {
  const lines = raw.split("\n");
  const blocks: ScriptBlock[] = [];
  let id = 1;
  let title = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // First non-empty line: extract title (e.g. "U003 — Name the Worry")
    if (id === 1 && !title && /^[A-Z0-9]+\s*[—–-]\s*.+/.test(line)) {
      title = line.replace(/^[A-Z0-9]+\s*[—–-]\s*/, "").trim();
      continue;
    }

    // Skip points — ignore
    if (/^\[skip_point\]$/i.test(line)) continue;

    // Break tag: <break time="1.1s" />
    const breakMatch = line.match(/^<break\s+time="([\d.]+)s"\s*\/>$/);
    if (breakMatch) {
      const dur = parseFloat(breakMatch[1]);
      blocks.push({ id: String(id++), type: "pause", text: "Pause", pauseDuration: Math.round(dur * 10) / 10 });
      continue;
    }

    // Long pause: [pause: 18]
    const pauseMatch = line.match(/^\[pause:\s*(\d+)\]$/);
    if (pauseMatch) {
      blocks.push({ id: String(id++), type: "pause", text: "Pause", pauseDuration: parseInt(pauseMatch[1]) });
      continue;
    }

    // Voice line
    blocks.push({ id: String(id++), type: "voice", text: line });
  }

  return { title, blocks };
}

/**
 * Serialize ScriptBlock[] back to raw TTS format.
 * - pause ≤ 3s → <break time="Xs" />
 * - pause ≥ 4s → [pause: N]
 * - voice → plain text line
 */
export function serializeScript(blocks: ScriptBlock[]): string {
  const lines: string[] = [];
  for (const block of blocks) {
    if (block.type === "voice") {
      lines.push(block.text);
    } else if (block.type === "pause") {
      const dur = block.pauseDuration ?? 0;
      if (dur <= 0) continue;
      if (dur <= 3) {
        lines.push(`<break time="${dur}s" />`);
      } else {
        lines.push(`[pause: ${Math.round(dur)}]`);
      }
    }
  }
  return lines.join("\n");
}

export function estimateDuration(script: ScriptBlock[]): { minutes: number; seconds: number } {
  let totalSeconds = 0;
  for (const block of script) {
    if (block.type === "voice") {
      totalSeconds += Math.ceil((block.text.length / 5) / 150 * 60);
    } else if (block.type === "pause") {
      totalSeconds += block.pauseDuration ?? 0;
    }
  }
  return { minutes: Math.floor(totalSeconds / 60), seconds: Math.round(totalSeconds % 60) };
}
