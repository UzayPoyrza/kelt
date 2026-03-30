const VOICE_MAP: Record<string, string> = {
  aria: "Claire",
  james: "Graham",
  lin: "Luna",
  aditya: "Silas",
};

export function toTtsVoiceId(frontendVoice: string): string {
  return VOICE_MAP[frontendVoice] || "Claire";
}
