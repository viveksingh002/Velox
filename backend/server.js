require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// logger (IMPORTANT)
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// connect DB
connectDB();

// routes
const bookingRoutes = require("./routes/booking");
app.use("/api", bookingRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// server start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});