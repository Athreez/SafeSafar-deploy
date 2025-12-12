import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/trip.js";

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

// ======== ROUTES ========
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

// ======== DATABASE + SERVER START ========
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    // Start Server
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch(err => console.log("DB Error:", err));
