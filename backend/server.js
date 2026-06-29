// backend/server.js — UPDATED

require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const connectDB = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// Connect DB
connectDB();

// Routes
const bookingRoutes = require("./routes/booking");
const vendorRoutes  = require("./routes/vendor");
const adminRoutes   = require("./routes/admin");

app.use("/api",       bookingRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/admin",  adminRoutes);

// Test route
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// Start
app.listen(5000, () => console.log("Server running on port 5000"));