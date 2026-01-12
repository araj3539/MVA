"use client";

import { useEffect, useState, useRef } from "react";
import DoctorCard from "@/components/DoctorCard";
import { useRouter } from "next/navigation";
import StreamingMicButton from "@/components/StreamingMicButton";
import { motion, AnimatePresence } from "framer-motion";
import CallOverlay from "@/components/CallOverlay";
import { Sparkles } from "lucide-react";

type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  experience?: number;
};

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
  const [activeCallDoctor, setActiveCallDoctor] = useState<Doctor | null>(null);

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
      text: "Hello! I'm your medical AI assistant. Describe your symptoms, and I can help find the right specialist for you.", 
      sender: "ai",
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const addMessage = (text: string, sender: "user" | "ai", recommendedDoctor?: Doctor) => {
    setMessages((prev) => [
      ...prev, 
      { text, sender, timestamp: new Date(), recommendedDoctor }
    ]);
  };

  const handleCall = (doctorName: string, fullDoctor?: Doctor) => {
    if (fullDoctor) setActiveCallDoctor(fullDoctor);
    else {
      const found = doctors.find(d => d.name === doctorName);
      if (found) setActiveCallDoctor(found);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      
      {/* --- Page Header --- */}
      <div className="text-center space-y-4 py-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">
          Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">Specialist</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Connect with top-rated doctors instantly using our AI-powered matching system.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT: AI Chat Section (Takes 7 cols on large screens) --- */}
        <section className="lg:col-span-7 glass rounded-[2.5rem] p-1 shadow-2xl shadow-sky-900/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 via-indigo-400 to-teal-400" />
          
          <div className="bg-white/50 backdrop-blur-sm rounded-[2.2rem] p-6 md:p-8 h-[600px] flex flex-col relative">
            
            {/* Chat Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">AI Health Assistant</h2>
                <p className="text-xs text-slate-500 font-medium">Powered by AssemblyAI</p>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <div
                    className={`px-6 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm backdrop-blur-sm ${
                      msg.sender === "user"
                        ? "bg-slate-900 text-white rounded-br-none shadow-slate-500/20"
                        : "bg-white text-slate-700 border border-slate-200/60 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.recommendedDoctor && (
                    <div className="mt-4 w-full max-w-sm">
                       <DoctorCard 
                         doctor={msg.recommendedDoctor}
                         isRecommendation={true}
                         onBook={() => router.push(`/appointments/book?doctorId=${msg.recommendedDoctor?._id}`)}
                         onCall={() => handleCall(msg.recommendedDoctor!.name, msg.recommendedDoctor)}
                       />
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 mt-2 px-1 font-medium">
                    {msg.sender === "ai" ? "AI Assistant" : "You"} • {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </motion.div>
              ))}

              {streamingText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col max-w-[80%] self-end items-end"
                >
                  <div className="px-6 py-4 rounded-2xl rounded-br-none bg-sky-50 text-sky-800 border border-sky-100 shadow-inner">
                    <span className="animate-pulse">{streamingText}</span>
                    <span className="inline-block w-1.5 h-4 ml-1 bg-sky-500 animate-blink align-middle" />
                  </div>
                  <span className="text-[10px] text-sky-400 mt-1 px-1 font-bold">Listening...</span>
                </motion.div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Mic Button Area */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
               <StreamingMicButton 
                 addMessage={addMessage} 
                 onPartial={(text) => setStreamingText(text)} 
                 setShowDoctorCTA={setShowDoctorCTA} 
               />
            </div>
          </div>
        </section>

        {/* --- RIGHT: Doctor Grid (Takes 5 cols) --- */}
        <section className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-sky-500 rounded-full"></span>
              Available Doctors
            </h3>
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              {doctors.length} Online
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4 max-h-[800px] overflow-y-auto pr-2 pb-10">
              {doctors.map((doc) => (
                <DoctorCard
                  key={doc._id}
                  doctor={doc}
                  onBook={() => router.push(`/appointments/book?doctorId=${doc._id}`)}
                  onCall={() => handleCall(doc.name, doc)}
                />
              ))}
          </div>
        </section>

      </div>

      {/* --- Alert Popup --- */}
      <AnimatePresence>
        {showDoctorCTA && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-xl border border-amber-200 p-4 rounded-2xl shadow-2xl shadow-amber-500/20 flex items-center gap-4 max-w-md w-full mx-4"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">⚠️</div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Action Required</h3>
              <p className="text-slate-500 text-xs">Based on your symptoms, please consult a specialist immediately.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Call Overlay --- */}
      <AnimatePresence>
        {activeCallDoctor && (
           <CallOverlay 
             doctor={activeCallDoctor}
             onEndCall={() => setActiveCallDoctor(null)}
           />
        )}
      </AnimatePresence>

    </div>
  );
}