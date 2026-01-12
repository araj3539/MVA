"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type Slot = {
  _id: string;
  date: string;
  time: string;
  status: "available" | "booked";
  doctorId: { _id: string; name: string; specialization: string };
};

export default function BookAppointment() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const { getToken } = useAuth();
  const router = useRouter();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null); // Store full Slot object
  const [booking, setBooking] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!doctorId) return;
    const fetchSlots = async () => {
      try {
        // Ensure this URL matches your backend port (default 5000)
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
          }/api/appointments/available/${doctorId}`
        );
        if (res.ok) {
          const data = await res.json();
          setSlots(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [doctorId]);

  // --- Calendar Helpers ---
  const daysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const changeMonth = (offset: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1)
    );
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const slotsByDate = useMemo(() => {
    const map: Record<string, Slot[]> = {};
    slots.forEach((slot) => {
      if (!map[slot.date]) map[slot.date] = [];
      map[slot.date].push(slot);
    });
    return map;
  }, [slots]);

  const formatDateKey = (date: Date) => date.toISOString().split("T")[0];
  const activeSlots = slotsByDate[formatDateKey(selectedDate)] || [];

  const handleBook = async () => {
    if (!selectedSlot || !doctorId) return;
    setBooking(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/appointments/book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorId,
            date: selectedSlot.date,
            time: selectedSlot.time,
          }),
        }
      );

      if (res.ok) {
        alert("Appointment Confirmed!");
        router.push("/patient/dashboard");
      } else {
        const err = await res.json();
        alert(err.error || "Booking failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error booking appointment");
    } finally {
      setBooking(false);
    }
  };

  const renderCalendarDays = () => {
    const totalDays = daysInMonth(currentMonth);
    const startDay = firstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 md:h-14" />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        d
      );
      const dateKey = formatDateKey(date);
      const hasSlots = slotsByDate[dateKey]?.length > 0;
      const isSelected = isSameDay(date, selectedDate);
      const isToday = isSameDay(date, new Date());

      days.push(
        <button
          key={d}
          onClick={() => {
            setSelectedDate(date);
            setSelectedSlot(null);
          }}
          className={`
            relative h-10 md:h-14 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200
            ${
              isSelected
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/30 scale-105 z-10"
                : "hover:bg-slate-100 text-slate-700"
            }
            ${
              isToday && !isSelected
                ? "border border-sky-400 text-sky-600 bg-sky-50"
                : ""
            }
          `}
        >
          {d}
          {hasSlots && !isSelected && (
            <span className="absolute bottom-1 md:bottom-2 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          )}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center bg-slate-50">
      <div className="max-w-5xl w-full grid lg:grid-cols-12 gap-8">
        {/* Left: Calendar */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-100">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">
                Select Date
              </h2>
              <p className="text-slate-500 text-sm">
                Timezone: Local System Time
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded-full p-1 border border-slate-200">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-bold text-slate-800 w-32 text-center">
                {currentMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div
                key={i}
                className="text-xs font-bold text-slate-400 uppercase py-2"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2 relative z-10">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Right: Slots */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border-l-4 border-sky-500">
            <h3 className="text-lg font-bold text-slate-800">
              Booking Summary
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
              <CalendarIcon size={16} />
              <span>
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 min-h-[300px] flex flex-col">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-sky-600" />
              Available Slots
            </h3>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
              </div>
            ) : activeSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 content-start">
                {activeSlots.map((slot) => (
                  <button
                    key={slot._id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`
                       py-3 px-4 rounded-xl text-sm font-bold transition-all border
                       ${
                         selectedSlot?._id === slot._id
                           ? "bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-500/30 scale-105"
                           : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600"
                       }
                     `}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <AlertCircle size={32} className="opacity-50" />
                <p className="text-sm">No slots available.</p>
              </div>
            )}

            <div className="mt-auto pt-6">
              <button
                onClick={handleBook}
                disabled={!selectedSlot || booking}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-600 transition-colors"
              >
                {booking ? (
                  "Processing..."
                ) : (
                  <>
                    Confirm Booking <CheckCircle size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
