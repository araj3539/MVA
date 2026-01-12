"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, Activity, Search, ChevronRight } from "lucide-react";

type Appointment = {
  _id: string;
  date: string;
  time: string;
  status: string;
  doctorId: string;
};

export default function PatientDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [getToken]);

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-serif font-bold text-slate-900"
          >
            My Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">Dashboard</span>
          </motion.h1>
          <p className="text-slate-500 font-medium">Welcome back, {user?.firstName}. Here is your schedule.</p>
        </div>

        <Link 
          href="/patient/doctors"
          className="group flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-300 hover:bg-sky-600 hover:shadow-sky-500/30 transition-all duration-300"
        >
          <Search size={18} />
          Find a Doctor
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Upcoming Appointments</h2>
          </div>
          
          {loading ? (
             <div className="space-y-4">
               {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse shadow-sm" />)}
             </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Calendar size={32} />
              </div>
              <p className="text-slate-500 font-medium">No upcoming appointments.</p>
              <Link href="/patient/doctors" className="text-sky-600 font-bold hover:underline mt-2 inline-block">
                Book your first visit
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt, i) => (
                <motion.div 
                  key={apt._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 hover:shadow-lg hover:border-sky-200 transition-all group"
                >
                  <div className="flex items-center gap-5 w-full">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 text-sky-600 flex flex-col items-center justify-center border border-sky-100 shadow-sm group-hover:scale-105 transition-transform">
                      <span className="text-xs font-bold uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-bold">{new Date(apt.date).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">General Checkup</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Clock size={14} /> {apt.time}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-sky-600 font-medium">Dr. Available</span> 
                      </div>
                    </div>
                  </div>

                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border
                    ${apt.status === 'booked' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {apt.status}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Quick Stats / Info */}
        <div className="space-y-6">
           <div className="glass p-6 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/50 rounded-full blur-2xl -mr-10 -mt-10"></div>
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                 <Activity size={20} />
               </div>
               <h3 className="font-bold text-slate-800">Health Overview</h3>
             </div>
             
             <div className="space-y-4 relative z-10">
               <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                 <span className="text-sm text-slate-500">Total Visits</span>
                 <span className="font-bold text-slate-900">{appointments.length}</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                 <span className="text-sm text-slate-500">Next Visit</span>
                 <span className="font-bold text-sky-600">
                   {appointments.length > 0 ? appointments[0].date : "N/A"}
                 </span>
               </div>
             </div>
           </div>
           
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl">
             <h3 className="font-serif font-bold text-xl mb-2">Need Help?</h3>
             <p className="text-slate-300 text-sm mb-4">
               Our AI assistant can help you check symptoms before your visit.
             </p>
             <Link href="/patient/doctors" className="block w-full text-center py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors text-sm border border-white/10">
               Start Chat
             </Link>
           </div>
        </div>

      </div>
    </div>
  );
}