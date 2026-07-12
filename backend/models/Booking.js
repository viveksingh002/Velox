const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  pickup:             String,
  drop:               String,
  vehicle:            String,
  model:              { type: String, default: "" },
  registrationNumber: { type: String, default: "" },
  price:              Number,
  status:             { type: String, default: "pending" },
  driverName:         { type: String, default: "" },
  customerName:       { type: String, default: "Customer" },
  customerPhone:      { type: String, default: "" },
  paymentStatus:      { type: String, default: "cash" },
  otp:                { type: String, default: "" },
  createdAt:          { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);