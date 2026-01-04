import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/trip.js";
import geocodingRoutes from "./routes/geocoding.js";

dotenv.config();

const app = express();

// ======== MIDDLEWARE ========
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://safe-safar-deploy.vercel.app",
  process.env.FRONTEND_URL || "https://safe-safar-deploy.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  methods: "GET,POST,PUT,PATCH,DELETE",
  credentials: true
}));

app.use(express.json());

// ======== HEALTH CHECK ========
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "SafeSafar Backend is running" });
});

// ======== ROUTES ========
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/geocoding", geocodingRoutes);

// ======== DATABASE + SERVER START ========
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,           // Connection pool size
  minPoolSize: 5,            // Minimum connections
  maxIdleTimeMS: 45000,      // Close idle connections after 45 sec
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority'
})
  .then(() => {
    console.log("MongoDB Connected with pool");

    // Start Server
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch(err => console.log("DB Error:", err));

// ======== CONNECTION MONITORING ========
mongoose.connection.on('disconnected', () => {
  console.log("MongoDB disconnected");
  // Attempt reconnection every 5 seconds
  setTimeout(() => {
    mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
    });
  }, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error("MongoDB connection error:", err);
});
