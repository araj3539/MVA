const express = require("express");
const { requireAuth } = require("../middlewares/requireAuth");
const {
  getDoctors,
  bookAppointment,
  getMyAppointments
} = require("../controllers/appointment.controller");

const router = express.Router();

router.get("/doctors", getDoctors);
router.post("/book", requireAuth, bookAppointment);
router.get("/my", requireAuth, getMyAppointments);

module.exports = router;