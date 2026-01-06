export function cleanAIText(text: string): string {
  if (!text) return "";

  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/__|_/g, "")
    .replace(/•/g, "")
    .replace(/- /g, "")
    .replace(/\d+\./g, "")
    .replace(/\n+/g, " ")
    .trim();
}
