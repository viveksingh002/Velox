const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// POST - create booking
router.post("/booking", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET - active booking (MUST be before /:id routes)
router.get("/booking/active", async (req, res) => {
  try {
    const booking = await Booking.findOne({ status: "accepted" }).sort({ createdAt: -1 });
    if (!booking) return res.json({ success: true, data: null });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET - all bookings
router.get("/booking", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET - booking status (customer polling)
router.get("/booking/:id/status", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false });
    res.json({ success: true, status: booking.status, driverName: booking.driverName });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH - partner accepts booking
router.patch("/booking/:id/accept", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "accepted", driverName: req.body.driverName || "Driver" },
      { new: true }
    );
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH - end ride
router.patch("/booking/:id/complete", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;