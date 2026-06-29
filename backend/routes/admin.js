const express = require("express");
const router  = express.Router();
const Vendor  = require("../models/Vendor");

router.get("/vendors/video-kyc/pending", async (req, res) => {
  try {
    const vendors = await Vendor.find({
      vendorStatus: "approved",
      videoKycStatus: { $in: ["pending", "in_progress"] },
    }).select("name email videoKycStatus videoKycRoomId createdAt");
    res.json(vendors);
  } catch (err) {
    console.error("Video KYC error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/vendors/video-kyc/start/:id", async (req, res) => {
  try {
    const roomId = `room_${Date.now()}`;
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { videoKycStatus: "in_progress", videoKycRoomId: roomId },
      { new: true }
    );
    res.json({ success: true, roomId });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const all = await Vendor.find().select("vendorStatus videoKycStatus videoKycRoomId name email vehicle createdAt");
    const totalVendors   = all.length;
    const approved       = all.filter(v => v.vendorStatus === "approved").length;
    const pending        = all.filter(v => v.vendorStatus === "pending").length;
    const rejected       = all.filter(v => v.vendorStatus === "rejected").length;
    const pendingVendors = all.filter(v => v.vendorStatus === "pending");
    res.json({ success: true, stats: { totalVendors, approved, pending, rejected }, pendingVendors, pendingVehicles: [] });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/vendors/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/vendors/:id/approve", async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { vendorStatus: "approved", rejectionReason: "" },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, message: "Vendor approved", vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/vendors/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ success: false, message: "Rejection reason required" });
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { vendorStatus: "rejected", rejectionReason: reason },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, message: "Vendor rejected", vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;