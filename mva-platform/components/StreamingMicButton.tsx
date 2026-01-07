"use client";

import { useAssemblyAI } from "@/lib/useAssemblyAI";
import { cleanAIText } from "@/lib/cleanText";
import { sendTextToAI } from "@/lib/voiceApi";
import { speakText } from "@/lib/speak";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

type Props = {
  // Update: Accept the optional recommendedDoctor argument
  addMessage: (text: string, sender: "user" | "ai", recommendedDoctor?: any) => void;
  onPartial: (text: string) => void;
  setShowDoctorCTA: (v: boolean) => void;
};

export default function StreamingMicButton({
  addMessage,
  onPartial,
  setShowDoctorCTA
}: Props) {
  const [transcribing, setTranscribing] = useState(false);
  const { getToken } = useAuth();

  const { start, stop, isRecording } = useAssemblyAI(
    // 1. FINAL TRANSCRIPT HANDLER
    async (finalText) => {
      onPartial(""); // Clear the "ghost" text
      setTranscribing(true);
      addMessage(finalText, "user");

      try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token found");

        // Call your backend
        const res = await sendTextToAI(finalText, token);
        const clean = cleanAIText(res.aiText);

        // --- NEW LOGIC: Handle Recommended Doctor ---
        // Pass the 'recommendedDoctor' from the backend response to the chat
        // (We cast 'res' to any in case your voiceApi types aren't updated yet)
        addMessage(clean, "ai", (res as any).recommendedDoctor);
        
        speakText(clean);

        if (res.escalate) setShowDoctorCTA(true);
      } catch (err) {
        console.error("AI Error", err);
        addMessage("Sorry, I encountered an error connecting to the AI.", "ai");
      } finally {
        setTranscribing(false);
      }
    },
    // 2. PARTIAL STREAMING HANDLER
    (partialText) => {
      onPartial(partialText);
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
        {/* Aceternity Style: Glowing Animation when recording */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 bg-red-500 rounded-full blur-xl"
            />
          )}
        </AnimatePresence>

        {/* The Main Button */}
        <button
          onClick={toggleRecording}
          className={`
            relative z-10 flex items-center justify-center w-20 h-20 rounded-full 
            transition-all duration-300 shadow-xl border-[3px]
            ${
              isRecording
                ? "bg-gradient-to-br from-red-500 to-red-600 border-red-300 text-white scale-110"
                : "bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-300 text-white hover:scale-105"
            }
          `}
        >
          {transcribing ? (
            <motion.span 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="text-2xl"
            >
              ⏳
            </motion.span>
          ) : isRecording ? (
            <motion.div
              animate={{ scale: [1, 0.8, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <div className="w-6 h-6 bg-white rounded-sm" />
            </motion.div>
          ) : (
            <span className="text-3xl">🎙️</span>
          )}
        </button>
      </div>

      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
        {isRecording ? "Listening..." : "Tap to Speak"}
      </p>
    </div>
  );
}