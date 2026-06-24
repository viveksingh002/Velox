const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// CREATE BOOKING
router.post("/booking", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// TEST ROUTE (IMPORTANT for debugging)
router.get("/booking", (req, res) => {
  res.send("Booking route working 🚀");
});

module.exports = router;

router.get("/booking", async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});