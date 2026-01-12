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
  onCall?: () => void;
  isRecommendation?: boolean;
};

export default function DoctorCard({ doctor, onBook, onCall, isRecommendation }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`
        relative overflow-hidden rounded-2xl p-6 transition-all duration-300
        ${isRecommendation 
          ? "bg-white/80 backdrop-blur-xl border-2 border-emerald-400/30 shadow-xl shadow-emerald-500/10" 
          : "glass hover:border-sky-200/60 hover:shadow-xl hover:shadow-sky-500/10"}
      `}
    >
      {/* "Recommended" Badge */}
      {isRecommendation && (
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl shadow-sm z-10">
          TOP MATCH
        </div>
      )}

      <div className="flex items-center gap-5 mb-5">
        {/* Avatar */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner
          ${isRecommendation ? "bg-emerald-100 text-emerald-600" : "bg-sky-50 text-sky-600"}`}>
          {doctor.name.charAt(4)}
        </div>
        
        <div className="flex-1">
          <h3 className="font-serif font-bold text-lg text-slate-900 leading-tight">{doctor.name}</h3>
          <p className="text-sm text-sky-600 font-semibold mb-1">{doctor.specialization}</p>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            {doctor.experience || 5}+ Years Experience
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {onCall && (
           <button 
             onClick={onCall}
             className="col-span-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all
               bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20"
           >
             <span>📞</span> Call
           </button>
        )}
        
        <button
          onClick={onBook}
          className={`col-span-1 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm
            ${isRecommendation 
              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30" 
              : "bg-slate-900 text-white hover:bg-sky-600 hover:shadow-sky-500/30"}
          `}
        >
          Book
        </button>
      </div>
    </motion.div>
  );
}