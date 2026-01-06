"use client";

import { useAssemblyAI } from "@/lib/useAssemblyAI";
import { cleanAIText } from "@/lib/cleanText";
import { sendTextToAI } from "@/lib/voiceApi";
import { speakText } from "@/lib/speak";

type Props = {
  addMessage: (text: string, sender: "user" | "ai") => void;
  setShowDoctorCTA: (v: boolean) => void;
};

export default function StreamingMicButton({
  addMessage,
  setShowDoctorCTA
}: Props) {
  const { start, stop } = useAssemblyAI(
    async (finalText) => {
      addMessage(finalText, "user");

      const res = await sendTextToAI(finalText);
      const clean = cleanAIText(res.aiText);

      addMessage(clean, "ai");
      speakText(clean);

      if (res.escalate) setShowDoctorCTA(true);
    },
    (partial) => {
      console.log("📝 Partial:", partial);
    }
  );

  return (
    <div className="flex gap-2">
      <button onClick={start}>🎙️ Start</button>
      <button onClick={stop}>⏹ Stop</button>
    </div>
  );
}
