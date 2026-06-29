const express = require("express");
const router  = express.Router();
const Vendor  = require("../models/Vendor");

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, vehicle, documents, bank } = req.body;
    const existing = await Vendor.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Email already registered" });
    const vendor = await Vendor.create({ name, email, phone, vehicle, documents, bank, vendorStatus: "pending" });
    res.status(201).json({ success: true, message: "Application submitted!", vendor });
  } catch (err) {
    console.error("Vendor register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/status/:email", async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ email: req.params.email }).select("-__v");
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, status: vendor.vendorStatus, rejectionReason: vendor.rejectionReason });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
