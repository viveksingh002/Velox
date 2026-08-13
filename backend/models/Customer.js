const mongoose = require("mongoose");

// Supabase handles login/auth for customers (name, email come from there).
// This collection only stores the extra profile fields the app needs
// that Supabase doesn't track — phone, avatar, and booking stats.
const customerSchema = new mongoose.Schema({
  email:          { type: String, required: true, unique: true },
  phone:          { type: String, default: "" },
  avatar:         { type: String, default: "" }, // base64 or hosted URL
  totalBookings:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.models.Customer || mongoose.model("Customer", customerSchema);