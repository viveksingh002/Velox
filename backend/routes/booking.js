const express = require("express");
const router  = express.Router();
const Booking = require("../models/Booking");

// POST - create booking
router.post("/booking", async (req, res) => {
  try {
    const otp     = String(Math.floor(1000 + Math.random() * 9000));
    const booking = await Booking.create({ ...req.body, otp });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.post("/booking/by-ids", async (req, res) => {
  try {
    const { ids } = req.body;
    const bookings = await Booking.find({ 
      _id: { $in: ids } 
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// GET - active booking (BEFORE /:id)
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

// GET - earnings last 7 days for the LOGGED-IN partner only (BEFORE /:id)
router.get("/booking/earnings", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: "email query param is required" });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    
    const bookings = await Booking.find({
      status: "completed",
      driverEmail: email,
      createdAt: { $gte: sevenDaysAgo },
    });

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLabel = days[date.getDay()];
      const dayEarnings = bookings
        .filter((b) => new Date(b.createdAt).toDateString() === date.toDateString())
        .reduce((sum, b) => sum + (b.price || 0), 0);
      result.push({ day: dayLabel, amount: dayEarnings });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET - pending bookings (BEFORE /:id)
router.get("/booking/pending", async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET - all bookings for a customer by their Supabase email (BEFORE /:id)
// This is the primary way "My Bookings" should fetch data — independent
// of localStorage, so it works across devices/browsers for the same login.
router.get("/booking/customer-email/:email", async (req, res) => {
  try {
    const bookings = await Booking.find({
      customerEmail: req.params.email,
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET - all bookings
router.get("/booking", async (req, res) => {
  try {
    const { driverName } = req.query;
    const query = driverName ? { driverName } : {};
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET - booking status
router.get("/booking/:id/status", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false });
    res.json({ success: true, status: booking.status, driverName: booking.driverName, otp: booking.otp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH - accept 
router.patch("/booking/:id/accept", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "accepted",
        driverName: req.body.driverName || "Driver",
        driverEmail: req.body.driverEmail || null, // 👈 naya field
      },
      { new: true }
    );
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH - decline
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

// PATCH - arrive
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

// POST - verify OTP
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

// PATCH - cancel
router.patch("/booking/:id/cancel", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get("/booking/customer/:phone", async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      customerPhone: req.params.phone 
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// PATCH - complete
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