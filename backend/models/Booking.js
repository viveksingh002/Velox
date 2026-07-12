const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  pickup:             String,
  drop:               String,
  vehicle:            String,
  model:              { type: String, default: "" },
  registrationNumber: { type: String, default: "" },
  price:              Number,
  status:             { type: String, default: "pending" }, // pending, accepted, arrived, in_progress, completed, cancelled
  driverName:         { type: String, default: "" },
  customerName:       { type: String, default: "Customer" },
  customerPhone:      { type: String, default: "" },
  paymentStatus:      { type: String, default: "cash" },    // cash, paid
  otp:                { type: String, default: "" },
  createdAt:          { type: Date, default: Date.now },
});
