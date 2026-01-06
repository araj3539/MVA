export const startSpeechRecognition = (onResult, lang = "en-US") => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log("🎙️ Listening... Speak now");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    console.log("🗣️ Transcript:", transcript);
    if (transcript) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (event.error === "no-speech") {
      console.log("ℹ️ No speech detected (normal)");
      return; // ignore silently
    }
    console.error("❌ Speech error:", event.error);
  };

  recognition.onend = () => {
    console.log("🛑 Listening stopped");
  };

  recognition.start();
};
