"use client";

import { useEffect, useState } from "react";
import DoctorCard from "@/components/DoctorCard";
import { useRouter } from "next/navigation";

// Define the Doctor type
type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  // add other fields if necessary
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]); // Typed state
  const router = useRouter();

  useEffect(() => {
    // Ensure you use the correct environment variable in production
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    fetch(`${apiUrl}/api/appointments/doctors`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setDoctors(data);
        } else {
          console.error("API did not return an array:", data);
          setDoctors([]);
        }
      })
      .catch(err => console.error("Error loading doctors:", err));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {doctors.length > 0 ? (
        doctors.map(doc => (
          <DoctorCard
            key={doc._id}
            doctor={doc}
            onBook={() => router.push(`/appointments/book?doctorId=${doc._id}`)}
          />
        ))
      ) : (
        <p className="col-span-3 text-center text-gray-500">No doctors found (or server error).</p>
      )}
    </div>
  );
}