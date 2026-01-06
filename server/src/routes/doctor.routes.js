const express = require("express");
const {
  addSlot,
  getMySlots,
  getDoctorAppointments
} = require("../controllers/doctor.controller");

const router = express.Router();

router.post("/slot", addSlot);
router.get("/slots/:doctorId", getMySlots);
router.get("/appointments/:doctorId", getDoctorAppointments);

module.exports = router;