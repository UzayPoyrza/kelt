export type ScriptBlock = {
  id: string;
  type: "voice" | "pause";
  text: string;
  pauseDuration?: number;
};

/** Returns an empty script — no more hardcoded placeholder content */
export function generateScript(_prompt: string): ScriptBlock[] {
  return [];
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
