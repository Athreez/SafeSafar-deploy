import express from "express";
import Trip from "../models/Trip.js";
import jwt from "jsonwebtoken";

// Blockchain service
import {
  createTripOnChain,
  updateStatusOnChain,
} from "../services/blockchain.js";

const router = express.Router();

// Middleware to check token
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id; // keep your existing behavior
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

/* -------------------------------------------------
   CREATE TRIP (DB + BLOCKCHAIN)
--------------------------------------------------- */
router.post("/create", auth, async (req, res) => {
  try {
    const { startLocation, stops, destination } = req.body;

    if (!startLocation?.name || !startLocation?.coords) {
      return res.status(400).json({ message: "Invalid start location data" });
    }

    if (!destination?.name || !destination?.coords) {
      return res.status(400).json({ message: "Invalid destination data" });
    }


    // if (!startLocation || !destination)
    //   return res.status(400).json({ message: "Start & destination required" });

    // Your existing local trip ID
    const tripId = "TRIP-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    // 1️⃣ Create DB trip with default status PENDING
    const trip = new Trip({
      userId: req.user,
      startLocation,
      stops,
      destination,
      tripId,
      status: "PENDING", // NEW
      chain: {},         // NEW (to be filled)
    });

    await trip.save();

    // 2️⃣ Prepare metadata for blockchain
    const meta = JSON.stringify({
      localTripId: tripId,
      dbId: trip._id.toString(),
      startLocation,
      stops,
      destination,
      timestamp: Date.now(),
    });

    // 3️⃣ Push to blockchain
    const chainData = await createTripOnChain(meta); // returns { txHash, tripId }

    // 4️⃣ Save blockchain info in DB
    trip.chain = {
      txHash: chainData.txHash,
      contractTripId: chainData.tripId,
      contractAddress: process.env.CONTRACT_ADDR,
    };

    await trip.save();

    res.json({
      message: "Trip created and stored on blockchain",
      trip,
    });
  } catch (err) {
    console.error("Trip create error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------
   UPDATE TRIP STATUS (PENDING → ACTIVE → COMPLETED)
--------------------------------------------------- */
router.post("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["PENDING", "ACTIVE", "COMPLETED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (!trip.chain?.contractTripId && trip.chain?.contractTripId !== 0) {
      return res.status(400).json({ message: "Trip not synced with blockchain" });
    }

    // Map text → smart contract enum
    const map = { PENDING: 0, ACTIVE: 1, COMPLETED: 2 };

    // 1️⃣ Update blockchain
    const txHash = await updateStatusOnChain(
      trip.chain.contractTripId,
      map[status]
    );

    // 2️⃣ Update DB
    trip.status = status;
    await trip.save();

    res.json({
      message: "Trip status updated",
      status,
      txHash,
    });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------
   GET LOGGED-IN USER'S TRIPS
--------------------------------------------------- */
router.get("/my", auth, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user }).sort({ createdAt: -1 });

    res.json({ trips });
  } catch (err) {
    console.error("Fetch trips error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------
   GET SINGLE TRIP BY ID
--------------------------------------------------- */
router.get("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Allow viewing own trips or trips from same user (ownership check)
    if (trip.userId.toString() !== req.user) {
      return res.status(403).json({ message: "Not authorized to view this trip" });
    }

    res.json({ trip });
  } catch (err) {
    console.error("Get trip error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------
   UPDATE TRIP (ONLY IF PENDING)
--------------------------------------------------- */
router.put("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.userId.toString() !== req.user) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (trip.status !== "PENDING") {
      return res.status(400).json({ message: "Can only edit PENDING trips" });
    }

    const { startLocation, stops, destination } = req.body;

    if (startLocation) trip.startLocation = startLocation;
    if (stops) trip.stops = stops;
    if (destination) trip.destination = destination;

    await trip.save();

    res.json({
      message: "Trip updated",
      trip,
    });
  } catch (err) {
    console.error("Trip update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------
   DELETE TRIP (ONLY IF PENDING)
--------------------------------------------------- */
router.delete("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.userId.toString() !== req.user) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (trip.status !== "PENDING") {
      return res.status(400).json({ message: "Can only delete PENDING trips" });
    }

    await Trip.findByIdAndDelete(req.params.id);

    res.json({
      message: "Trip deleted",
    });
  } catch (err) {
    console.error("Trip delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------
   CHECK TRIP SAFETY (CALLS ML SERVICE)
--------------------------------------------------- */
router.post("/:id/check-safety", auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Prepare waypoints from trip
    const waypoints = [];

    // Start location
    if (trip.startLocation?.coords) {
      waypoints.push({
        lat: trip.startLocation.coords[0],
        lon: trip.startLocation.coords[1],
        label: "Start",
        name: trip.startLocation.name
      });
    }

    // Stops
    if (trip.stops && trip.stops.length > 0) {
      trip.stops.forEach((stop, idx) => {
        if (stop.coords) {
          waypoints.push({
            lat: stop.coords[0],
            lon: stop.coords[1],
            label: `Stop ${idx + 1}`,
            name: stop.name
          });
        }
      });
    }

    // Destination
    if (trip.destination?.coords) {
      waypoints.push({
        lat: trip.destination.coords[0],
        lon: trip.destination.coords[1],
        label: "Destination",
        name: trip.destination.name
      });
    }

    if (waypoints.length === 0) {
      return res.status(400).json({ message: "No valid waypoints in trip" });
    }

    // Call ML service on port 5002
    try {
      const mlResponse = await fetch("http://localhost:5002/route_safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waypoints })
      });

      const safetyData = await mlResponse.json();

      // Merge location names back into waypoints and unsafe_areas
      safetyData.waypoints = safetyData.waypoints.map((wp, idx) => ({
        ...wp,
        name: waypoints[idx]?.name || wp.name,
        label: waypoints[idx]?.label || wp.label
      }));

      safetyData.unsafe_areas = safetyData.unsafe_areas.map(area => {
        const matchingWaypoint = waypoints.find(wp => 
          Math.abs(wp.lat - area.lat) < 0.0001 && Math.abs(wp.lon - area.lon) < 0.0001
        );
        return {
          ...area,
          name: matchingWaypoint?.name || area.name
        };
      });

      res.json({
        message: "Safety check completed",
        trip: {
          id: trip._id,
          name: `${trip.startLocation.name} → ${trip.destination.name}`
        },
        safety: safetyData
      });
    } catch (mlErr) {
      console.error("ML service error:", mlErr);
      res.status(500).json({ 
        message: "ML service unavailable",
        error: mlErr.message
      });
    }
  } catch (err) {
    console.error("Safety check error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------
   ACTIVATE TRIP (CHANGE STATUS TO ACTIVE + BLOCKCHAIN)
--------------------------------------------------- */
router.patch("/:id/activate", auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.userId.toString() !== req.user) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (trip.status !== "PENDING") {
      return res.status(400).json({ message: "Can only activate PENDING trips" });
    }

    // Update status to ACTIVE
    trip.status = "ACTIVE";
    trip.startedAt = new Date();

    // Update on blockchain if contract trip exists
    if (trip.chain?.contractTripId) {
      try {
        const { updateStatusOnChain } = await import("../services/blockchain.js");
        const txHash = await updateStatusOnChain(trip.chain.contractTripId, 1); // 1 = ACTIVE
        
        trip.chain.activatedTxHash = txHash;
      } catch (blockchainErr) {
        console.error("Blockchain update error:", blockchainErr);
        // Continue anyway - blockchain is optional
      }
    }

    await trip.save();

    res.json({
      message: "Trip activated",
      trip,
    });
  } catch (err) {
    console.error("Trip activation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------
   COMPLETE TRIP (CHANGE STATUS TO COMPLETED + BLOCKCHAIN)
--------------------------------------------------- */
router.patch("/:id/complete", auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.userId.toString() !== req.user) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (trip.status !== "ACTIVE") {
      return res.status(400).json({ message: "Can only complete ACTIVE trips" });
    }

    const { safetyHistory, locationHistory, duration } = req.body;

    // Update status to COMPLETED
    trip.status = "COMPLETED";
    trip.completedAt = new Date();
    trip.safetyHistory = safetyHistory || [];
    trip.locationHistory = locationHistory || [];
    trip.duration = duration || 0;

    // Calculate average safety score
    if (safetyHistory && safetyHistory.length > 0) {
      trip.averageSafetyScore = 
        safetyHistory.reduce((sum, entry) => sum + entry.score, 0) / safetyHistory.length;
    }

    // Update on blockchain if contract trip exists
    if (trip.chain?.contractTripId) {
      try {
        const { updateStatusOnChain } = await import("../services/blockchain.js");
        const txHash = await updateStatusOnChain(trip.chain.contractTripId, 2); // 2 = COMPLETED
        
        trip.chain.completedTxHash = txHash;
      } catch (blockchainErr) {
        console.error("Blockchain update error:", blockchainErr);
        // Continue anyway - blockchain is optional
      }
    }

    await trip.save();

    res.json({
      message: "Trip completed",
      trip,
    });
  } catch (err) {
    console.error("Trip completion error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
