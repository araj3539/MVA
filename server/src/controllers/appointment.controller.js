const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// --- NEW: Dynamic Slot Generator ---
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // 1. Validate Doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // 2. Fetch existing bookings to filter them out
    const existingAppointments = await Appointment.find({ doctorId });
    const bookedSet = new Set(
      existingAppointments.map(app => `${app.date}-${app.time}`)
    );

    // 3. Generate Slots
    const slots = [];
    const now = new Date();
    const daysToGen = 14; 
    const startHour = 9;  // 9:00 AM
    const endHour = 17;   // 5:00 PM

    for (let i = 0; i < daysToGen; i++) {
      const currentDate = new Date(now);
      currentDate.setDate(now.getDate() + i);
      
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD

      for (let hour = startHour; hour < endHour; hour++) {
        // Format time as HH:00
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        
        // Skip past hours if the date is Today
        if (i === 0) {
          const currentHour = now.getHours();
          if (hour <= currentHour) continue;
        }

        const slotKey = `${dateStr}-${timeStr}`;

        // Add slot if NOT booked
        if (!bookedSet.has(slotKey)) {
          slots.push({
            _id: slotKey, // Unique ID for React keys
            date: dateStr,
            time: timeStr,
            status: "available",
            doctorId: doctor // Include doctor info for the UI
          });
        }
      }
    }

    res.json(slots);

  } catch (err) {
    console.error("Slot Generation Error:", err);
    res.status(500).json({ error: "Failed to generate schedule" });
  }
};

// --- NEW: Conflict-Based Booking ---
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body; // Expects "YYYY-MM-DD" and "HH:mm"
    const patientId = req.auth.userId;

    // 1. Check for real conflicts in the DB
    const conflict = await Appointment.findOne({ doctorId, date, time });
    if (conflict) {
      return res.status(400).json({ error: "Sorry, this slot was just booked!" });
    }

    // 2. Create Appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time
    });

    res.json({ message: "Appointment confirmed", appointment });

  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: "Booking failed" });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doctors" });
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