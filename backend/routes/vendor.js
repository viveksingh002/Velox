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
    res.json({
      success: true,
      status: vendor.vendorStatus,
      vendorId: vendor._id.toString(),
      rejectionReason: vendor.rejectionReason,
      videoKycStatus: vendor.videoKycStatus,
      videoKycRoomId: vendor.videoKycRoomId,
      videoKycResult: vendor.videoKycResult,
      pricingStatus: vendor.pricingStatus,
      pricingRejectReason: vendor.pricingRejectReason,
      baseFare: vendor.baseFare,
      pricePerKm: vendor.pricePerKm,
      waitingCharge: vendor.waitingCharge,
      vehicleImage: vendor.vehicleImage,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/pricing/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { baseFare, pricePerKm, waitingCharge, vehicleImage } = req.body;

    if (baseFare === undefined || pricePerKm === undefined) {
      return res.status(400).json({ success: false, message: "Base fare and price per km are required" });
    }

    const updateData = {
      baseFare: Number(baseFare),
      pricePerKm: Number(pricePerKm),
      waitingCharge: Number(waitingCharge) || 0,
      pricingStatus: "submitted",
    };

    if (vehicleImage) {
      updateData.vehicleImage = vehicleImage;
    }

    const vendor = await Vendor.findOneAndUpdate({ email }, updateData, { new: true });

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.json({ success: true, vendor });
  } catch (err) {
    console.error("Pricing submit error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;