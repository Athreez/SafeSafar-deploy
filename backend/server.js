import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/trip.js";
import { initBlockchain } from "./services/blockchain.js";

dotenv.config();

const app = express();

// ======== MIDDLEWARE ========
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
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

      // Initialize blockchain connection AFTER server starts
      initBlockchain();
    });
  })
  .catch(err => console.log("DB Error:", err));
