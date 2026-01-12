const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

exports.addSlot = async (req, res) => {
  try {
    const { date, time } = req.body;
    
    // ✅ SECURE: Get ID from the authenticated token, not the body
    const clerkUserId = req.auth.userId; 

    const doctor = await Doctor.findOne({ clerkUserId });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found. Please contact admin." });
    }

    // Check for duplicates
    const exists = doctor.slots.some(s => s.date === date && s.time === time);
    if (exists) {
      return res.status(400).json({ error: "Slot already exists" });
    }

    doctor.slots.push({ date, time });
    await doctor.save();

    res.json({ message: "Slot added successfully" });
  } catch (err) {
    console.error("Add Slot Error:", err);
    res.status(500).json({ error: "Error adding slot" });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // 1. Find the doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // 2. Fetch ALL existing bookings for this doctor (to filter them out)
    const existingAppointments = await Appointment.find({ doctorId });
    
    // Create a Set for fast lookup: "2024-10-12-09:00"
    const bookedSlots = new Set(
      existingAppointments.map(app => `${app.date}-${app.time}`)
    );

    // 3. Generate Slots for the Next 7 Days
    const slots = [];
    const today = new Date();
    const daysToGen = 14; // How many days ahead to show
    const startHour = 9;  // 9 AM
    const endHour = 17;   // 5 PM

    for (let i = 0; i < daysToGen; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      // if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;

      const dateStr = currentDate.toISOString().split('T')[0]; // "YYYY-MM-DD"

      // Generate hourly slots
      for (let hour = startHour; hour < endHour; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`; // "09:00"
        const slotKey = `${dateStr}-${timeStr}`;

        // ONLY add if not booked
        if (!bookedSlots.has(slotKey)) {
          slots.push({
            _id: slotKey, // Unique key for React key prop
            date: dateStr,
            time: timeStr,
            isBooked: false,
            doctorId: doctor // Pass doctor info if needed
          });
        }
      }
    }

    res.json(slots);

  } catch (err) {
    console.error("Dynamic Slot Error:", err);
    res.status(500).json({ error: "Error generating schedule" });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    // 1. Get the Clerk User ID from the token
    const clerkUserId = req.auth.userId;

    // 2. Find the Doctor profile associated with this user
    const doctor = await Doctor.findOne({ clerkUserId });
    
    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    // 3. Find appointments using the Doctor's MongoDB _id
    const appointments = await Appointment.find({ doctorId: doctor._id });
    
    res.json(appointments);
  } catch (err) {
    console.error("Fetch Appointments Error:", err);
    res.status(500).json({ error: "Error fetching appointments" });
  }
};