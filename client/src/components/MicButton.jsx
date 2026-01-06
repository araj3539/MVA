import { useState } from "react";
import { startSpeechRecognition } from "../utils/recorder";
import { sendTextToAI } from "../services/voiceApi";
import { speakText } from "../utils/speak";
import { cleanAIText } from "../utils/cleanText";

export default function MicButton({ addMessage, setShowDoctorCTA }) {
  const [listening, setListening] = useState(false);

  const handleClick = () => {
    if (listening) return;

    setListening(true);
    console.log("🎤 Mic button clicked");

    startSpeechRecognition(async (userText) => {
      setListening(false);

      addMessage(userText, "user");

      try {
        const res = await sendTextToAI(userText);
        const cleanedText = cleanAIText(res.aiText);

        addMessage(cleanedText, "ai");
        speakText(cleanedText);

        if (res.escalate) setShowDoctorCTA(true);
      } catch {
        addMessage("Something went wrong. Please try again.", "ai");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: "12px 20px",
        fontSize: "16px",
        background: listening ? "#aaa" : "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: listening ? "not-allowed" : "pointer",
      }}
    >
      {listening ? "🎙️ Listening..." : "🎤 Speak"}
    </button>
  );
}
