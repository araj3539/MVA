export function speakText(text: string) {
  if (typeof window === "undefined") return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
