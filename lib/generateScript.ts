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
  const lower = prompt.toLowerCase();
  if (/sleep|insomnia|bed|night|dream|tired/i.test(lower)) return "Deep Sleep Session";
  if (/focus|concentrat|work|study|morning|productivity/i.test(lower)) return "Focus & Clarity";
  if (/stress|anxi|worry|overwhelm|calm|relax|tension/i.test(lower)) return "Calm & Release";
  if (/breath/i.test(lower)) return "Breathing Reset";
  if (/body scan|muscle/i.test(lower)) return "Body Scan";
  const words = prompt.split(/\s+/).slice(0, 4).join(" ");
  return words.length > 30 ? words.slice(0, 30) + "\u2026" : words;
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
  return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 };
}
