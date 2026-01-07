"use client";

import { motion } from "framer-motion";

type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  experience?: number;
};

type Props = {
  doctor: Doctor;
  onBook: () => void;
  onCall?: () => void; // New prop for Calling
  isRecommendation?: boolean; // Style differently if recommended
};

export default function DoctorCard({ doctor, onBook, onCall, isRecommendation }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`
        relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all
        ${isRecommendation 
          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200 shadow-md" 
          : "bg-white border-gray-100 hover:shadow-md"}
      `}
    >
      {/* "Recommended" Badge */}
      {isRecommendation && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
          BEST MATCH
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar Placeholder */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold
          ${isRecommendation ? "bg-emerald-100 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
          {doctor.name.charAt(4)}
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{doctor.name}</h3>
          <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
          <p className="text-xs text-gray-500 mt-1">{doctor.experience}+ Years Experience</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        {onCall && (
           <button 
             onClick={onCall}
             className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-xl flex items-center justify-center gap-2 animate-pulse"
           >
             <span>📞</span> Call Now
           </button>
        )}
        
        <button
          onClick={onBook}
          className={`flex-1 text-sm font-semibold py-2 rounded-xl border
            ${isRecommendation 
              ? "bg-white border-green-200 text-green-700 hover:bg-green-50" 
              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}
          `}
        >
          Book Visit
        </button>
      </div>
    </motion.div>
  );
}