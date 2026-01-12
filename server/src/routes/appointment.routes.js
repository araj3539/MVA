const express = require("express");
const { requireAuth } = require("../middlewares/requireAuth");
const {
  getDoctors,
  bookAppointment,
  getMyAppointments,
  getAvailableSlots // <--- Import the new function
} = require("../controllers/appointment.controller");

const router = express.Router();

router.get("/doctors", getDoctors);
router.post("/book", requireAuth, bookAppointment);
router.get("/my", requireAuth, getMyAppointments);

// --- NEW ROUTE for Dynamic Slots ---
router.get("/available/:doctorId", getAvailableSlots);

module.exports = router;