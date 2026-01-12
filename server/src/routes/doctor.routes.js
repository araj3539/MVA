const express = require("express");
const { requireAuth } = require("../middlewares/requireAuth");
const {
  addSlot,
  getAvailableSlots, // <--- Import the new function
  getDoctorAppointments
} = require("../controllers/doctor.controller");

const router = express.Router();

router.post("/slot", requireAuth, addSlot);

// Change getMySlots -> getAvailableSlots
router.get("/slots/:doctorId", getAvailableSlots); 

router.get("/appointments", requireAuth, getDoctorAppointments);

module.exports = router;