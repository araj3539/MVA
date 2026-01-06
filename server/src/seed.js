const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");
const path = require("path");

// Fix: explicit path to .env file (up one level from src/)
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const doctors = [
  {
    clerkUserId: "doc_1",
    name: "Dr. Sarah Smith",
    specialization: "Cardiologist",
    experience: 15,
    slots: [
      { date: "2024-02-20", time: "10:00", isBooked: false },
      { date: "2024-02-20", time: "11:00", isBooked: false },
    ],
  },
  {
    clerkUserId: "doc_2",
    name: "Dr. James Wilson",
    specialization: "Dermatologist",
    experience: 8,
    slots: [
      { date: "2024-02-21", time: "09:30", isBooked: false },
    ],
  },
  {
    clerkUserId: "doc_3",
    name: "Dr. Emily Chen",
    specialization: "Pediatrician",
    experience: 12,
    slots: [],
  },
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
    console.log("Added sample doctors");

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

seedDB();