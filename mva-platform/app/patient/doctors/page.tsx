"use client";

import { useEffect, useState } from "react";
import DoctorCard from "@/components/DoctorCard";
import { useRouter } from "next/navigation";
import StreamingMicButton from "@/components/StreamingMicButton";
import { motion, AnimatePresence } from "framer-motion";

type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  // Add other fields if needed
};

type Message = {
  text: string;
  sender: "user" | "ai";
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showDoctorCTA, setShowDoctorCTA] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch doctors from backend
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
    
    // Initial greeting
    setMessages([{ text: "Hello! I am your medical AI assistant. How can I help you today?", sender: "ai" }]);
  }, []);

  const addMessage = (text: string, sender: "user" | "ai") => {
    setMessages((prev) => [...prev, { text, sender }]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* --- AI Section --- */}
      <section className="flex flex-col items-center gap-6 p-8 bg-gradient-to-br from-blue-50 to-white rounded-3xl shadow-lg border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-800">AI Medical Assistant</h1>
        
        {/* Chat Log */}
        <div className="w-full max-w-2xl h-64 overflow-y-auto bg-white rounded-xl p-4 shadow-inner border border-gray-100 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg max-w-[80%] text-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white self-end rounded-br-none"
                  : "bg-gray-100 text-gray-800 self-start rounded-bl-none"
              }`}
            >
              <strong>{msg.sender === "ai" ? "🤖 AI" : "👤 You"}:</strong> {msg.text}
            </motion.div>
          ))}
        </div>

        {/* Mic Button */}
        <StreamingMicButton 
          addMessage={addMessage} 
          setShowDoctorCTA={setShowDoctorCTA} 
        />
      </section>

      {/* --- Doctor Recommendation Section --- */}
      <AnimatePresence>
        {showDoctorCTA && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md"
          >
            <p className="text-yellow-700 font-medium">
              ⚠️ Based on your symptoms, we recommend consulting a specialist immediately.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Available Doctors</h2>
        {doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <DoctorCard
                key={doc._id}
                doctor={doc}
                onBook={() => router.push(`/appointments/book?doctorId=${doc._id}`)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">No doctors available at the moment.</p>
        )}
      </section>
    </div>
  );
}