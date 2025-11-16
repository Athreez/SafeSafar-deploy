import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";

import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/trip.js";
import { initBlockchain } from "./services/blockchain.js";

dotenv.config();

const app = express();
let provider;

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

// ======== BLOCKCHAIN TRANSACTION QUERY ========
app.get("/api/tx/:hash", async (req, res) => {
  try {
    if (!provider) {
      return res.status(503).json({ error: "Blockchain provider not initialized" });
    }

    const txHash = req.params.hash;
    
    // Validate hash format
    if (!ethers.isHexString(txHash) || txHash.length !== 66) {
      return res.status(400).json({ error: "Invalid transaction hash format" });
    }

    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const receipt = await provider.getTransactionReceipt(txHash);

    res.json({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      gasPrice: tx.gasPrice.toString(),
      gasLimit: tx.gasLimit.toString(),
      data: tx.data,
      blockNumber: tx.blockNumber,
      status: receipt ? (receipt.status === 1 ? "success" : "failed") : "pending",
      blockHash: receipt?.blockHash,
      gasUsed: receipt?.gasUsed?.toString(),
      cumulativeGasUsed: receipt?.cumulativeGasUsed?.toString(),
      contractAddress: receipt?.contractAddress,
    });
  } catch (err) {
    console.error("TX query error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======== DATABASE + SERVER START ========
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    // Start Server
    app.listen(5000, () => {
      console.log("Server running on port 5000");

      // Initialize blockchain connection AFTER server starts
      initBlockchain();
      
      // Set provider for tx queries
      const rpc = process.env.RPC_URL;
      if (rpc) {
        provider = new ethers.JsonRpcProvider(rpc);
      }
    });
  })
  .catch(err => console.log("DB Error:", err));
