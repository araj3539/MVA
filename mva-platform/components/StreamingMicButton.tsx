"use client";

import { useAssemblyAI } from "@/lib/useAssemblyAI";
import { cleanAIText } from "@/lib/cleanText";
import { sendTextToAI } from "@/lib/voiceApi";
import { speakText } from "@/lib/speak";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs"; // Import useAuth here

type Props = {
  addMessage: (text: string, sender: "user" | "ai") => void;
  setShowDoctorCTA: (v: boolean) => void;
};

export default function StreamingMicButton({
  addMessage,
  setShowDoctorCTA
}: Props) {
  const [transcribing, setTranscribing] = useState(false);
  const { getToken } = useAuth(); // Get the hook here

  const { start, stop, isRecording } = useAssemblyAI(
    async (finalText) => {
      setTranscribing(true);
      addMessage(finalText, "user");

      try {
        // FIX: Get the token here (inside the component/callback)
        const token = await getToken();
        if (!token) throw new Error("No authentication token found");

        // Pass the token to the API function
        const res = await sendTextToAI(finalText, token);
        
        const clean = cleanAIText(res.aiText);

        addMessage(clean, "ai");
        speakText(clean);

        if (res.escalate) setShowDoctorCTA(true);
      } catch (err) {
        console.error("AI Error", err);
        addMessage("Sorry, I encountered an error connecting to the AI.", "ai");
      } finally {
        setTranscribing(false);
      }
    },
    (partial) => {
      // Optional: Log partials if you want
      // console.log("📝 Partial:", partial);
    }
  );

  const toggleRecording = () => {
    if (isRecording) {
      stop();
    } else {
      start();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        {/* Animated Glow Effect */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-red-500 rounded-full blur-xl"
            />
          )}
        </AnimatePresence>

        {/* The Main Button */}
        <button
          onClick={toggleRecording}
          className={`
            relative z-10 flex items-center justify-center w-16 h-16 rounded-full 
            transition-all duration-300 shadow-lg border-2
            ${
              isRecording
                ? "bg-red-600 border-red-400 text-white"
                : "bg-blue-600 border-blue-400 text-white hover:bg-blue-700"
            }
          `}
        >
          {transcribing ? (
            <span className="animate-spin text-xl">⏳</span>
          ) : isRecording ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ⏹
            </motion.div>
          ) : (
            <span className="text-2xl">🎙️</span>
          )}
        </button>
      </div>

      <p className="text-sm font-medium text-gray-600">
        {isRecording ? "Listening..." : "Tap to Speak"}
      </p>
    </div>
  );
}