import mongoose from "mongoose";

const coordSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coords: {
    type: [Number], // [lat, lng]
    required: true,
  },
});

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  startLocation: { type: coordSchema, required: true },

  stops: { type: [coordSchema], default: [] },

  destination: { type: coordSchema, required: true },

  tripId: { type: String, unique: true },

  status: {
    type: String,
    enum: ["PENDING", "ACTIVE", "COMPLETED"],
    default: "PENDING",
  },

  chain: {
    txHash: { type: String, default: null },
    contractTripId: { type: Number, default: null },
    contractAddress: { type: String, default: null },
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Trip", tripSchema);
