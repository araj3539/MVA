"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, User, Plus, Stethoscope } from "lucide-react";

type Appointment = {
  _id: string;
  date: string;
  time: string;
  patientId: string;
};

export default function DoctorDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctors/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAppointments(await res.json());
      }
    };
    loadData();
  }, [getToken]);

  const addSlot = async () => {
    if (!date || !time) return alert("Select date and time");
    setLoading(true);
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctors/slot`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ date, time })
      });
      alert("Slot added!");
    } catch (e) {
      alert("Failed to add slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
          <Stethoscope size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Dr. {user?.lastName}</h1>
          <p className="text-slate-500">Medical Portal • {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left: Schedule Management (4 cols) */}
        <div className="lg:col-span-4">
          <div className="glass p-8 rounded-3xl sticky top-24">
            <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-indigo-600" />
              Add Availability
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="date" 
                    onChange={e => setDate(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="time" 
                    onChange={e => setTime(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <button 
                onClick={addSlot} 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Publishing..." : "Publish Slot"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Appointments List (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            <CalendarDays size={20} className="text-indigo-600" />
            Upcoming Appointments
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full border border-indigo-100">
              {appointments.length}
            </span>
          </h3>

          {appointments.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <p className="text-slate-400 font-medium">Your schedule is currently clear.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((apt, i) => (
                <motion.div 
                  key={apt._id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <User size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        Patient Appointment
                        <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">ID: {apt.patientId.slice(-4)}</span>
                      </div>
                      <div className="text-sm text-slate-500 flex gap-4 mt-1">
                        <span className="flex items-center gap-1"><CalendarDays size={14}/> {apt.date}</span>
                        <span className="flex items-center gap-1"><Clock size={14}/> {apt.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}