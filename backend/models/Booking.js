const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  pickup: String,
  drop: String,
  vehicle: String,
  price: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);