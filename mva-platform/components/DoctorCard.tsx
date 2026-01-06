import { motion } from "framer-motion";

type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  experience?: number;
};

type DoctorCardProps = {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
};

export default function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-xl border shadow"
    >
      <h3 className="text-lg font-semibold">{doctor.name}</h3>
      <p className="text-sm text-gray-600">
        {doctor.specialization}
      </p>

      <button
        onClick={() => onBook(doctor)}
        className="mt-3 px-4 py-2 rounded bg-blue-600 text-white"
      >
        Book Appointment
      </button>
    </motion.div>
  );
}
