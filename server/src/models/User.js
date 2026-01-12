const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Link to the Clerk User ID (essential for joining data)
  clerkId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  // Optional: Store role here if you want to query it easily in MongoDB
  role: { 
    type: String, 
    enum: ["patient", "doctor", "admin"], 
    default: "patient" 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("User", userSchema);