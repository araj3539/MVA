"use client";

import { useAssemblyAI } from "@/lib/useAssemblyAI";
import { cleanAIText } from "@/lib/cleanText";
import { sendTextToAI } from "@/lib/voiceApi";
import { speakText } from "@/lib/speak";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { Mic, Square, Loader2, AlertCircle, Sparkles } from "lucide-react"; 

type Props = {
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
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const isProcessingRef = useRef(false);

  const clearError = () => setError(null);

  const { start, stop, isRecording } = useAssemblyAI(
    async (finalText) => {
      if (isProcessingRef.current) return;
      if (!finalText || finalText.trim().length < 2) return;

      isProcessingRef.current = true;
      setTranscribing(true);
      onPartial(""); 
      addMessage(finalText, "user");

      try {
        const token = await getToken();
        if (!token) throw new Error("Token missing");

        const res = await sendTextToAI({ text: finalText, isCallMode: false }, token);

        if (res.ignored) {
            isProcessingRef.current = false; 
            setTranscribing(false);
            return;
        }

        const clean = cleanAIText(res.aiText);
        addMessage(clean, "ai", res.recommendedDoctor);
        speakText(clean);

        if (res.escalate) setShowDoctorCTA(true);

      } catch (err: any) {
        setError("Connection failed.");
        addMessage("Sorry, connection error.", "ai");
      } finally {
        isProcessingRef.current = false;
        setTranscribing(false);
      }
    },
    (partialText) => {
      if (!isProcessingRef.current) onPartial(partialText);
    }
  );

  const toggleRecording = () => {
    clearError();
    if (isProcessingRef.current) return;
    if (isRecording) stop();
    else start();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-6 relative">
       
       <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-10 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-2"
          >
            <AlertCircle size={14} /> {error}
          </motion.div>
        )}
       </AnimatePresence>

       {/* Outer Ripple for Recording State */}
       {isRecording && (
         <motion.div
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute w-20 h-20 rounded-full bg-rose-400/30 z-0 pointer-events-none"
         />
       )}

       <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleRecording}
        disabled={transcribing} 
        className={`
            relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 border-2
            ${isRecording 
                ? "bg-rose-500 border-rose-400 shadow-rose-500/40" 
                : transcribing
                    ? "bg-slate-100 border-slate-200 cursor-not-allowed"
                    : "bg-gradient-to-tr from-sky-600 to-indigo-600 border-white/20 shadow-sky-500/30"
            }
        `}
       >
        {transcribing ? (
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        ) : isRecording ? (
            <Square className="w-6 h-6 text-white fill-current" />
        ) : (
            <Mic className="w-8 h-8 text-white" />
        )}
       </motion.button>

       {/* Status Label */}
       <div className="mt-4 flex items-center gap-2 h-6">
         {transcribing ? (
           <span className="text-xs font-bold text-sky-600 flex items-center gap-1">
             <Sparkles size={12} className="animate-spin-slow" /> AI is Thinking...
           </span>
         ) : isRecording ? (
           <span className="text-xs font-bold text-rose-500 animate-pulse">
             Listening...
           </span>
         ) : (
           <span className="text-xs font-medium text-slate-400">
             Tap to Speak
           </span>
         )}
       </div>
    </div>
  );
}