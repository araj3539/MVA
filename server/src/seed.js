const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");
const path = require("path");

// Fix: explicit path to .env file (up one level from src/)
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const doctors = [
  // 1. Heart Specialist
  {
    clerkUserId: "user_doc_cardio_01",
    name: "Dr. Sarah Smith",
    specialization: "Cardiologist",
    experience: 15,
    slots: [
      { date: "2024-03-01", time: "10:00", isBooked: false },
      { date: "2024-03-01", time: "11:00", isBooked: false },
      { date: "2024-03-02", time: "09:00", isBooked: false }
    ],
  },
  // 2. Skin Specialist
  {
    clerkUserId: "user_doc_derm_02",
    name: "Dr. James Wilson",
    specialization: "Dermatologist",
    experience: 8,
    slots: [
      { date: "2024-03-01", time: "14:00", isBooked: false },
      { date: "2024-03-03", time: "10:30", isBooked: false }
    ],
  },
  // 3. Child Specialist
  {
    clerkUserId: "user_doc_pedia_03",
    name: "Dr. Emily Chen",
    specialization: "Pediatrician",
    experience: 12,
    slots: [
      { date: "2024-03-01", time: "09:00", isBooked: false },
      { date: "2024-03-01", time: "09:30", isBooked: false }
    ],
  },
  // 4. General Health (Fever, Flu, etc.)
  {
    clerkUserId: "user_doc_gp_04",
    name: "Dr. Robert Brown",
    specialization: "General Physician",
    experience: 20,
    slots: [
      { date: "2024-03-01", time: "08:00", isBooked: false },
      { date: "2024-03-01", time: "12:00", isBooked: false },
      { date: "2024-03-02", time: "16:00", isBooked: false }
    ],
  },
  // 5. Bone & Joint Specialist
  {
    clerkUserId: "user_doc_ortho_05",
    name: "Dr. Linda Garcia",
    specialization: "Orthopedist",
    experience: 10,
    slots: [
      { date: "2024-03-04", time: "11:00", isBooked: false },
      { date: "2024-03-05", time: "15:00", isBooked: false }
    ],
  },
  // 6. Brain & Nerve Specialist
  {
    clerkUserId: "user_doc_neuro_06",
    name: "Dr. William Lee",
    specialization: "Neurologist",
    experience: 18,
    slots: [
      { date: "2024-03-02", time: "10:00", isBooked: false }
    ],
  },
  // 7. Mental Health Specialist
  {
    clerkUserId: "user_doc_psych_07",
    name: "Dr. Karen White",
    specialization: "Psychiatrist",
    experience: 14,
    slots: [
      { date: "2024-03-03", time: "13:00", isBooked: false },
      { date: "2024-03-03", time: "14:00", isBooked: false }
    ],
  },
  // 8. Women's Health Specialist
  {
    clerkUserId: "user_doc_gyn_08",
    name: "Dr. Patricia Miller",
    specialization: "Gynecologist",
    experience: 16,
    slots: [
      { date: "2024-03-01", time: "11:30", isBooked: false },
      { date: "2024-03-04", time: "09:00", isBooked: false }
    ],
  },
  // 9. Eye Specialist
  {
    clerkUserId: "user_doc_eye_09",
    name: "Dr. Thomas Anderson",
    specialization: "Ophthalmologist",
    experience: 9,
    slots: [
      { date: "2024-03-02", time: "15:30", isBooked: false }
    ],
  },
  // 10. Ear, Nose, Throat Specialist
  {
    clerkUserId: "user_doc_ent_10",
    name: "Dr. Jennifer Taylor",
    specialization: "ENT Specialist",
    experience: 11,
    slots: [
      { date: "2024-03-01", time: "10:00", isBooked: false },
      { date: "2024-03-02", time: "11:00", isBooked: false }
    ],
  }
];

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is undefined. Check your .env file path.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Doctor.deleteMany({}); // Clear existing data
    console.log("Cleared Doctor collection");

    await Doctor.insertMany(doctors);
    console.log(`Added ${doctors.length} sample doctors from diverse fields.`);

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

seedDB();