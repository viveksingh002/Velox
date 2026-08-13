const express  = require("express");
const router   = express.Router();
const Customer = require("../models/Customer");

// ── GET /api/customer/profile/:email ─────────────────────────────────────────
// Returns the extra profile fields stored for this customer (phone, avatar,
// totalBookings). If no record exists yet, returns success:false so the
// frontend just falls back to whatever Supabase already has.
router.get("/profile/:email", async (req, res) => {
  try {
    const customer = await Customer.findOne({ email: req.params.email }).select("-__v");
    if (!customer) return res.status(404).json({ success: false, message: "Customer profile not found" });

    res.json({
      success: true,
      data: {
        phone: customer.phone || "",
        avatar: customer.avatar || "",
        totalBookings: customer.totalBookings || 0,
      },
    });
  } catch (err) {
    console.error("Customer profile fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── PUT /api/customer/profile/:email ─────────────────────────────────────────
// Creates the record on first save (upsert) since a customer may not have
// one yet, then updates editable fields (phone, avatar).
router.put("/profile/:email", async (req, res) => {
  try {
    const { phone, avatar } = req.body;

    const updateData = {};
    if (phone  !== undefined) updateData.phone  = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    const customer = await Customer.findOneAndUpdate(
      { email: req.params.email },
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      data: {
        phone: customer.phone || "",
        avatar: customer.avatar || "",
        totalBookings: customer.totalBookings || 0,
      },
    });
  } catch (err) {
    console.error("Customer profile update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;