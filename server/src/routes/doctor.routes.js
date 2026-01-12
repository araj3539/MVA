const express = require("express");
const { requireAuth } = require("../middlewares/requireAuth"); // Import Middleware
const {
  addSlot,
  getMySlots,
  getDoctorAppointments
} = require("../controllers/doctor.controller");

const router = express.Router();

// 🔒 Protect this route with requireAuth
router.post("/slot", requireAuth, addSlot);

// You might want to protect these too, or leave them public if patients need to see slots
router.get("/slots/:doctorId", getMySlots); 
router.get("/appointments/:doctorId", requireAuth, getDoctorAppointments);

module.exports = router;