const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const patientId = req.auth.userId;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const slot = doctor.slots.find(
      (s) => s.date === date && s.time === time && !s.isBooked
    );

    if (!slot) return res.status(400).json({ error: "Slot not available" });

    slot.isBooked = true;
    await doctor.save();

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time
    });

    res.json({ message: "Appointment booked", appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Booking failed" });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const { userId } = req.auth;
    const appointments = await Appointment.find({ patientId: userId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
};