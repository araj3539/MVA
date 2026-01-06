"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function DoctorDashboard() {
  const { user } = useUser();
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const addSlot = async () => {
    await fetch("http://localhost:5000/api/doctor/slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkUserId: user?.id,
        date,
        time
      })
    });
    alert("Slot added");
  };

  return (
    <div>
      <h2>Doctor Dashboard</h2>

      <h3>Add Availability</h3>
      <input type="date" onChange={e => setDate(e.target.value)} />
      <input type="time" onChange={e => setTime(e.target.value)} />
      <button onClick={addSlot}>Add Slot</button>
    </div>
  );
}
