"use client";

import { useAuth, useUser } from "@clerk/nextjs"; // Import useAuth
import { useState } from "react";

export default function DoctorDashboard() {
  const { getToken } = useAuth(); // hook to get the token
  const { user } = useUser();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const addSlot = async () => {
    if (!date || !time) return alert("Please select date and time");
    
    setLoading(true);
    try {
      const token = await getToken(); // 🔑 Get fresh token
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // 1. Fixed URL: /api/doctors (plural)
      // 2. Added Authorization Header
      const res = await fetch(`${apiUrl}/api/doctors/slot`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          // No need to send clerkUserId, backend gets it from token
          date,
          time
        })
      });

      if (res.ok) {
        alert("Slot added successfully!");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add slot");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Doctor Dashboard</h1>
      <p className="mb-4 text-gray-600">Welcome, Dr. {user?.firstName}</p>

      <div className="border p-4 rounded-lg max-w-sm bg-white shadow-sm">
        <h3 className="font-semibold mb-3">Add Availability</h3>
        
        <div className="flex flex-col gap-3">
          <label className="text-sm">
            Date:
            <input 
              type="date" 
              className="border p-2 rounded w-full mt-1"
              onChange={e => setDate(e.target.value)} 
            />
          </label>
          
          <label className="text-sm">
            Time:
            <input 
              type="time" 
              className="border p-2 rounded w-full mt-1"
              onChange={e => setTime(e.target.value)} 
            />
          </label>

          <button 
            onClick={addSlot}
            disabled={loading}
            className="bg-indigo-600 text-white p-2 rounded mt-2 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}