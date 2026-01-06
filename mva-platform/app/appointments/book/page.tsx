"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs"; // Change useUser to useAuth for token
import { useRouter, useSearchParams } from "next/navigation";

export default function BookAppointment() {
  const { getToken, userId } = useAuth(); // Get getToken
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Auto-fill doctorId if passed in URL
  const initialDoctorId = searchParams.get("doctorId") || "";

  const [doctorId, setDoctorId] = useState(initialDoctorId);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const book = async () => {
    if (!date || !time || !doctorId) return alert("Please fill all fields");
    
    setLoading(true);
    try {
      const token = await getToken(); // Fetch valid JWT

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/appointments/book`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add Auth Header
        },
        body: JSON.stringify({
          doctorId,
          date,
          time
          // patientId is extracted from token on backend, no need to send it
        })
      });

      if (res.ok) {
        alert("Appointment booked successfully!");
        router.push("/patient/dashboard"); // Redirect after booking
      } else {
        const err = await res.json();
        alert(err.error || "Booking failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>
      
      <div className="flex flex-col gap-4">
        <input 
          placeholder="Doctor ID" 
          value={doctorId}
          onChange={e => setDoctorId(e.target.value)} 
          className="border p-2 rounded"
        />
        <input 
          type="date" 
          onChange={e => setDate(e.target.value)} 
          className="border p-2 rounded"
        />
        <input 
          type="time" 
          onChange={e => setTime(e.target.value)} 
          className="border p-2 rounded"
        />
        
        <button 
          onClick={book} 
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}