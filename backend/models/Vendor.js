const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  email:           { type: String, required: true, unique: true },
  phone:           { type: String, required: true },
  vendorStatus:    { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  rejectionReason: { type: String, default: "" },
  vehicle: {
    type:   { type: String },
    model:  { type: String },
    number: { type: String },
  },
  documents: {
    aadhaarUrl: { type: String, default: "" },
    licenseUrl: { type: String, default: "" },
    rcUrl:      { type: String, default: "" },
  },
  bank: {
    accountHolderName: { type: String, default: "" },
    accountNumber:     { type: String, default: "" },
    ifsc:              { type: String, default: "" },
    upi:               { type: String, default: "" },
  },
  videoKycStatus: { type: String, enum: ["pending","in_progress","completed"], default: "pending" },
  videoKycRoomId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
