// backend/routes/admin.js

const express = require("express");
const router  = express.Router();
const Vendor  = require("../models/Vendor");

// ── GET /api/admin/vendors/video-kyc/pending ──
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

// ── GET /api/admin/vendors/pricing/pending ──
// YEH BHI /:id SE PEHLE HONA CHAHIYE
router.get("/vendors/pricing/pending", async (req, res) => {
  try {
    const vendors = await Vendor.find({
      pricingStatus: "submitted",
    }).select("name email vehicle baseFare pricePerKm waitingCharge vehicleImage pricingStatus createdAt");
    res.json(vendors);
  } catch (err) {
    console.error("Pricing pending error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── GET /api/admin/dashboard ──
router.get("/dashboard", async (req, res) => {
  try {
    const [allVendors, pendingVendors, pendingPricing] = await Promise.all([
      Vendor.find({}).select("vendorStatus"),
      Vendor.find({ vendorStatus: "pending" })
        .select("name email vendorStatus videoKycStatus videoKycRoomId vehicle createdAt")
        .sort({ createdAt: -1 })
        .limit(20),
      Vendor.find({ pricingStatus: "submitted" })
        .select("name email vehicle baseFare pricePerKm waitingCharge vehicleImage pricingStatus createdAt")
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    const totalVendors = allVendors.length;
    const approved     = allVendors.filter(v => v.vendorStatus === "approved").length;
    const pending      = allVendors.filter(v => v.vendorStatus === "pending").length;
    const rejected     = allVendors.filter(v => v.vendorStatus === "rejected").length;

    res.json({
      success: true,
      stats: { totalVendors, approved, pending, rejected },
      pendingVendors,
      pendingVehicles: pendingPricing,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── GET /api/admin/vendors/:id ──
router.get("/vendors/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── POST /api/admin/vendors/:id/approve ──
router.post("/vendors/:id/approve", async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { vendorStatus: "approved", rejectionReason: "" },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, message: "Vendor approved successfully", vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── POST /api/admin/vendors/:id/reject ──
router.post("/vendors/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) {
      return res.status(400).json({ success: false, message: "Rejection reason required" });
    }
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


// ── GET /api/admin/vehicles/:id ──
router.get("/vehicles/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

    res.json({
      success: true,
      vehicle: {
        owner: { name: vendor.name, email: vendor.email },
        type: vendor.vehicle?.type || "—",
        number: vendor.vehicle?.number || "—",
        model: vendor.vehicle?.model || "—",
        baseFare: vendor.baseFare,
        pricePerKm: vendor.pricePerKm,
        waitingCharge: vendor.waitingCharge,
        imageUrl: vendor.vehicleImage,
        status: vendor.pricingStatus === "submitted" ? "pending" : vendor.pricingStatus,
      },
    });
  } catch (err) {
    console.error("Vehicle review fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── POST /api/admin/vehicles/:id/approve ──
router.post("/vehicles/:id/approve", async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { pricingStatus: "approved", pricingRejectReason: "" },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, message: "Pricing approved", vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── POST /api/admin/vehicles/:id/reject ──
router.post("/vehicles/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) {
      return res.status(400).json({ success: false, message: "Rejection reason required" });
    }
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { pricingStatus: "rejected", pricingRejectReason: reason },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, message: "Pricing rejected", vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// ── PATCH /api/admin/vendors/video-kyc/start/:id ──
router.patch("/vendors/video-kyc/start/:id", async (req, res) => {
  try {
    const roomId = `room_${Date.now()}`;
    await Vendor.findByIdAndUpdate(
      req.params.id,
      { videoKycStatus: "in_progress", videoKycRoomId: roomId },
      { new: true }
    );
    res.json({ success: true, roomId });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── PATCH /api/admin/vendors/video-kyc/complete/:id ──
router.patch("/vendors/video-kyc/complete/:id", async (req, res) => {
  try {
    await Vendor.findByIdAndUpdate(req.params.id, { videoKycStatus: "completed" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── PATCH /api/admin/vendors/video-kyc/approve/:id ──
router.patch("/vendors/video-kyc/approve/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { videoKycStatus: "completed", videoKycResult: "approved" },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── PATCH /api/admin/vendors/video-kyc/reject/:id ──
router.patch("/vendors/video-kyc/reject/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { videoKycStatus: "pending", videoKycResult: "rejected", videoKycRoomId: null },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── PATCH /api/admin/vendors/pricing/:id/approve ──
router.patch("/vendors/pricing/:id/approve", async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { pricingStatus: "approved", pricingRejectReason: "" },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, message: "Pricing approved", vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── PATCH /api/admin/vendors/pricing/:id/reject ──
router.patch("/vendors/pricing/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) {
      return res.status(400).json({ success: false, message: "Rejection reason required" });
    }
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { pricingStatus: "rejected", pricingRejectReason: reason },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, message: "Pricing rejected", vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;