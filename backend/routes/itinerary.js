import express from "express";
const router = express.Router();

// Simple heuristic itinerary generator.
// Accepts JSON: { start: { name, coords:[lat,lon] }, destination: { name, coords }, days: number, preferences: string }
// Returns: { itinerary: [ { day, stops: [{name, coords, note}] } ], summary }

router.post("/generate", async (req, res) => {
  try {
    const { start, destination, days = 1, preferences = "" } = req.body;

    if (!start?.coords || !destination?.coords) {
      return res.status(400).json({ message: "start and destination with coords required" });
    }

    const s = start.coords;
    const d = destination.coords;
    const numDays = Math.max(1, Math.min(7, parseInt(days) || 1));

    // Simple linear interpolation to create stops between start & destination.
    const totalStops = Math.max(1, numDays * 2 - 1); // ~2 stops per day
    const stops = [];
    for (let i = 1; i <= totalStops; i++) {
      const t = i / (totalStops + 1);
      const lat = s[0] + (d[0] - s[0]) * t;
      const lon = s[1] + (d[1] - s[1]) * t;
      stops.push({ name: `Suggested stop ${i}`, coords: [lat, lon], note: `Stop ${i} — based on preferences: ${preferences || "general"}` });
    }

    // Split stops into days
    const itinerary = [];
    const perDay = Math.ceil(stops.length / numDays);
    for (let day = 0; day < numDays; day++) {
      const slice = stops.slice(day * perDay, (day + 1) * perDay);
      itinerary.push({ day: day + 1, stops: slice });
    }

    const summary = `Generated ${itinerary.length} day(s) itinerary with ${stops.length} stops based on preferences: ${preferences}`;

    return res.json({ itinerary, summary });
  } catch (err) {
    console.error("Itinerary generate error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
