"use client";

import { useEffect, useState, useRef } from "react";
import DoctorCard from "@/components/DoctorCard";
import { useRouter } from "next/navigation";
import StreamingMicButton from "@/components/StreamingMicButton";
import { motion, AnimatePresence } from "framer-motion";

type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  experience?: number;
};

// 1. UPDATE: Add recommendedDoctor to the Message type
type Message = {
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  recommendedDoctor?: Doctor; 
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState(""); 
  const [showDoctorCTA, setShowDoctorCTA] = useState(false);
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${apiUrl}/api/appointments/doctors`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setDoctors(data);
      })
      .catch((err) => console.error("Error loading doctors:", err));
    
    setMessages([{ 
      text: "Hello! I am your medical AI assistant. Describe your symptoms, and I can help you.", 
      sender: "ai",
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // 2. UPDATE: Accept the recommendedDoctor argument
  const addMessage = (text: string, sender: "user" | "ai", recommendedDoctor?: Doctor) => {
    setMessages((prev) => [
      ...prev, 
      { text, sender, timestamp: new Date(), recommendedDoctor }
    ]);
  };

  const handleCall = (doctorName: string) => {
    alert(`Calling Dr. ${doctorName}...`); // Replace with real VOIP/Phone logic
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-10">
      
      {/* --- AI Chat Section --- */}
      <section className="flex flex-col items-center gap-8 p-8 bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        <div className="text-center space-y-2">
           <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
             AI Health Assistant
           </h1>
           <p className="text-gray-500">Powered by AssemblyAI & Gemini</p>
        </div>
        
        <div className="w-full max-w-3xl h-[500px] overflow-y-auto bg-gray-50 rounded-2xl p-6 shadow-inner border border-gray-200 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col max-w-[80%] ${
                msg.sender === "user" ? "self-end items-end" : "self-start items-start"
              }`}
            >
              {/* Message Bubble */}
              <div
                className={`px-5 py-3 rounded-2xl text-md leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>

              {/* 3. UPDATE: Render DoctorCard if recommendation exists */}
              {msg.recommendedDoctor && (
                <div className="mt-3 w-full max-w-sm">
                   <DoctorCard 
                     doctor={msg.recommendedDoctor}
                     isRecommendation={true}
                     onBook={() => router.push(`/appointments/book?doctorId=${msg.recommendedDoctor?._id}`)}
                     onCall={() => handleCall(msg.recommendedDoctor!.name)}
                   />
                </div>
              )}

              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {msg.sender === "ai" ? "AI Assistant" : "You"} • {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </motion.div>
          ))}

          {/* Streaming Ghost Bubble */}
          {streamingText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col max-w-[80%] self-end items-end"
            >
              <div className="px-5 py-3 rounded-2xl rounded-br-none bg-blue-100 text-blue-800 border border-blue-200 shadow-sm animate-pulse">
                {streamingText}
                <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-blink align-middle" />
              </div>
              <span className="text-[10px] text-blue-400 mt-1 px-1">Listening...</span>
            </motion.div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Mic Control */}
        <StreamingMicButton 
          addMessage={addMessage} 
          onPartial={(text) => setStreamingText(text)} 
          setShowDoctorCTA={setShowDoctorCTA} 
        />
      </section>

      {/* --- Doctor Recommendation Popup (Optional: You can keep or remove this since the card is now in chat) --- */}
      <AnimatePresence>
        {showDoctorCTA && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-800">Medical Attention Recommended</h3>
                <p className="text-amber-700 text-sm">
                  Based on your symptoms, we suggest consulting a specialist.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Doctors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <DoctorCard
                key={doc._id}
                doctor={doc}
                onBook={() => router.push(`/appointments/book?doctorId=${doc._id}`)}
              />
            ))}
        </div>
      </section>
    </div>
  );
}