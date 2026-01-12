"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAssemblyAI } from "@/lib/useAssemblyAI";
import { cleanAIText } from "@/lib/cleanText";
import { useAuth } from "@clerk/nextjs";
import { sendTextToAI } from "@/lib/voiceApi";

type Doctor = {
  _id: string;
  name: string;
  specialization: string;
};

type Props = {
  doctor: Doctor;
  onEndCall: () => void;
};

// =====================
// CONFIG
// =====================
const INTERRUPT_WORDS = ["stop", "wait", "hold on", "pause"];
const MIN_TEXT_LENGTH = 2;

export default function CallOverlay({ doctor, onEndCall }: Props) {
  const [transcript, setTranscript] = useState<
    { sender: "user" | "doctor"; text: string }[]
  >([]);
  const [isMuted, setIsMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  // =====================
  // REFS
  // =====================
  const isAiSpeakingRef = useRef(false);
  const lastAiSpeechEndRef = useRef(0);
  const lastAiSpeechDurationRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { getToken } = useAuth();

  // =====================
  // ASSEMBLY AI HOOK
  // =====================
  const {
    start,
    stop,       // ONLY used when call ends
    muteMic,    // 🔥 physical mic off
    unmuteMic,  // 🔊 mic back on
    isRecording
  } = useAssemblyAI(
    async (text: string) => {
      const cleaned = text.trim().toLowerCase();
      if (cleaned.length < MIN_TEXT_LENGTH) return;

      // =====================
      // CONFIDENT BARGE-IN
      // =====================
      if (
        isAiSpeakingRef.current &&
        INTERRUPT_WORDS.some(w => cleaned.startsWith(w))
      ) {
        window.speechSynthesis.cancel();
        isAiSpeakingRef.current = false;
        setAiSpeaking(false);
        unmuteMic();
        return;
      }

      // =====================
      // ADAPTIVE COOLDOWN
      // =====================
      const now = Date.now();
      const cooldown =
        lastAiSpeechDurationRef.current < 1500
          ? 300
          : lastAiSpeechDurationRef.current < 4000
          ? 600
          : 900;

      if (
        isAiSpeakingRef.current ||
        now - lastAiSpeechEndRef.current < cooldown
      ) {
        return;
      }

      addTranscript("user", text);

      try {
        const token = await getToken();
        if (!token) return;

        const data = await sendTextToAI(
          {
            text,
            isCallMode: true,
            doctorId: doctor._id,
          },
          token
        );

        const aiResponse = cleanAIText(data.aiText);
        addTranscript("doctor", aiResponse);
        speakWithState(aiResponse);
      } catch (err) {
        console.error("Call Error:", err);
      }
    }
  );

  // =====================
  // AI SPEECH (NO SOCKET TOUCH)
  // =====================
  const speakWithState = (text: string) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => {
      isAiSpeakingRef.current = true;
      setAiSpeaking(true);
      lastAiSpeechDurationRef.current = Date.now();
      muteMic(); // 🔥 ONLY THIS
    };

    utterance.onend = () => {
      isAiSpeakingRef.current = false;
      setAiSpeaking(false);
      lastAiSpeechDurationRef.current =
        Date.now() - lastAiSpeechDurationRef.current;
      lastAiSpeechEndRef.current = Date.now();
      if (!isMuted) unmuteMic();
    };

    utterance.onerror = () => {
      isAiSpeakingRef.current = false;
      setAiSpeaking(false);
      if (!isMuted) unmuteMic();
    };

    window.speechSynthesis.speak(utterance);
  };

  // =====================
  // LIFECYCLE
  // =====================
  useEffect(() => {
    start(); // start listening once
    speakWithState(
      `Hello, I am Dr. ${doctor.name.split(" ")[1]}. How can I help you?`
    );

    return () => {
      stop(); // END CALL ONLY
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // =====================
  // HELPERS
  // =====================
  const addTranscript = (sender: "user" | "doctor", text: string) => {
    setTranscript(prev => [...prev, { sender, text }]);
  };

  const toggleMute = () => {
    if (isAiSpeakingRef.current) return;

    if (isMuted) {
      unmuteMic();
    } else {
      muteMic();
    }

    setIsMuted(m => !m);
  };

  // =====================
  // UI
  // =====================
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-3xl shadow-2xl border z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div
        className={`p-6 text-white flex flex-col items-center relative ${
          aiSpeaking ? "bg-indigo-600" : "bg-blue-600"
        }`}
      >
        <button
          onClick={onEndCall}
          className="absolute top-4 right-4 text-white"
        >
          ✕
        </button>

        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold">
            {doctor.name.charAt(0)}
          </div>
          {aiSpeaking && (
            <motion.div
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-white rounded-full"
            />
          )}
        </div>

        <h3 className="mt-3 font-bold">{doctor.name}</h3>
        <p className="text-sm">{doctor.specialization}</p>

        <div className="mt-2 text-xs">
          {aiSpeaking ? "Speaking…" : "Listening"}
        </div>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3">
        {transcript.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="p-4 border-t flex justify-center gap-6">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full ${
            isMuted ? "bg-red-100 text-red-500" : "bg-gray-100"
          }`}
        >
          {isMuted ? "🔇" : "🎙️"}
        </button>

        <button
          onClick={() => {
            stop();
            onEndCall();
          }}
          className="p-4 rounded-full bg-red-500 text-white"
        >
          📞
        </button>
      </div>
    </motion.div>
  );
}
