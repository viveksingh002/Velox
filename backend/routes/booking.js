const express = require("express");
const router  = express.Router();
const Booking = require("../models/Booking");

router.post("/booking", async (req, res) => {
  try {
    const otp     = String(Math.floor(1000 + Math.random() * 9000));
    const booking = await Booking.create({ ...req.body, otp });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/booking/active", async (req, res) => {
  try {
    const booking = await Booking.findOne({
      status: { $in: ["accepted", "arrived", "in_progress"] }
    }).sort({ createdAt: -1 });
    if (!booking) return res.json({ success: true, data: null });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/booking", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/booking/pending", async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/booking/:id/status", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false });
    res.json({ success: true, status: booking.status, driverName: booking.driverName, otp: booking.otp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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

router.patch("/booking/:id/decline", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "declined" },
      { new: true }
    );
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch("/booking/:id/arrive", async (req, res) => {
  try {
    const existing = await Booking.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Booking not found" });

    const updateData = { status: "arrived" };
    if (!existing.otp || existing.otp.trim() === "") {
      updateData.otp = String(Math.floor(1000 + Math.random() * 9000));
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/booking/:id/verify-otp", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.otp !== req.body.otp) return res.status(400).json({ success: false, message: "Incorrect OTP" });
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "in_progress" },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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