const VOICE_MAP: Record<string, string> = {
  aria: "Graham",
  james: "Claire",
  lin: "Luna",
  aditya: "Silas",
};

export function toTtsVoiceId(frontendVoice: string): string {
  return VOICE_MAP[frontendVoice] || "Graham";
}
