"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAssemblyAI } from "@/lib/useAssemblyAI";
import { cleanAIText } from "@/lib/cleanText";
import { useAuth } from "@clerk/nextjs";

type Doctor = {
  _id: string;
  name: string;
  specialization: string;
};

type Props = {
  doctor: Doctor;
  onEndCall: () => void;
};

export default function CallOverlay({ doctor, onEndCall }: Props) {
  const [transcript, setTranscript] = useState<
    { sender: "user" | "doctor"; text: string }[]
  >([]);
  const [isMuted, setIsMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false); // Visual state

  // Ref to track speaking state instantly without re-render lag
  const isAiSpeakingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();

  // --- Helper: Speak with State Management ---
  const speakWithState = (text: string) => {
    if (typeof window === "undefined") return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // 1. Lock Mic when AI starts
    utterance.onstart = () => {
      isAiSpeakingRef.current = true;
      setAiSpeaking(true);
    };

    // 2. Unlock Mic when AI ends
    utterance.onend = () => {
      isAiSpeakingRef.current = false;
      setAiSpeaking(false);
    };

    // Error safety: Unlock if speech fails
    utterance.onerror = () => {
      isAiSpeakingRef.current = false;
      setAiSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const { start, stop, isRecording } = useAssemblyAI(
    async (text) => {
      // --- CRITICAL FIX: Ignore input if AI is currently talking ---
      if (isAiSpeakingRef.current) {
        console.log("Ignored echo:", text);
        return;
      }

      // 1. User speaks -> Show in transcript
      addTranscript("user", text);

      try {
        const token = await getToken();
        if (!token) return;

        // 2. Send to Backend
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
          }/api/voice`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              text,
              isCallMode: true,
              doctorId: doctor._id,
            }),
          }
        );

        const data = await res.json();
        const aiResponse = cleanAIText(data.aiText);

        // 3. AI responds
        addTranscript("doctor", aiResponse);

        // 4. Speak response (locks mic internally)
        speakWithState(aiResponse);
      } catch (err) {
        console.error("Call Error", err);
      }
    },
    () => {} // Partial results ignored for simplicity
  );

  // Auto-start call on mount
  useEffect(() => {
    start();
    // Delay the greeting slightly to ensure mic is ready, but lock immediately
    setTimeout(() => {
      speakWithState(
        `Hello, I am Dr. ${doctor.name.split(" ")[1]}. How can I help you?`
      );
    }, 500);

    return () => {
      stop();
      window.speechSynthesis.cancel(); // Stop talking on close
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const addTranscript = (sender: "user" | "doctor", text: string) => {
    setTranscript((prev) => [...prev, { sender, text }]);
  };

  const toggleMute = () => {
    if (isRecording) stop();
    else start();
    setIsMuted(!isMuted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden font-sans"
    >
      {/* Header */}
      <div
        className={`transition-colors duration-500 p-6 text-white flex flex-col items-center pt-10 relative ${
          aiSpeaking ? "bg-indigo-600" : "bg-blue-600"
        }`}
      >
        <button
          onClick={onEndCall}
          className="absolute top-4 right-4 text-white/80 hover:text-white"
        >
          ✕
        </button>

        {/* Avatar with Speaking Animation */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold shadow-lg z-10 relative">
            {doctor.name.charAt(4)}
          </div>
          {aiSpeaking && (
            <motion.div
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-white rounded-full z-0"
            />
          )}
        </div>

        <h3 className="text-lg font-bold mt-3">{doctor.name}</h3>
        <p className="text-blue-100 text-sm">{doctor.specialization}</p>

        {/* Status Badge */}
        <div className="mt-2 flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
          {aiSpeaking ? (
            <>
              <span className="text-xs font-semibold">Speaking...</span>
              <span className="text-xs">🔊</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs uppercase tracking-wider">
                Listening
              </span>
            </>
          )}
        </div>
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {transcript.map((msg, index) => {
          const isUser = msg.sender === "user"; // Or however you identify the user
          return (
            <div
              key={index}
              className={`flex w-full ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  isUser
                    ? "bg-blue-600 text-white rounded-tr-none" // User: Right, Blue
                    : "bg-gray-200 text-gray-800 rounded-tl-none" // Doctor: Left, Gray
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="p-4 bg-white border-t flex justify-center gap-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-all ${
            isMuted
              ? "bg-red-100 text-red-500"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {isMuted ? "🔇" : "🎙️"}
        </button>
        <button
          onClick={onEndCall}
          className="p-4 rounded-full bg-red-500 text-white shadow-lg hover:scale-110 transition-transform"
        >
          📞
        </button>
      </div>
    </motion.div>
  );
}
