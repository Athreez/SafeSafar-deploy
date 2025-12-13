import express from "express";

const router = express.Router();

/**
 * Reverse Geocoding - Get location name from coordinates
 * POST /api/geocoding/reverse
 * Body: { lat, lon }
 * Returns: { name, address }
 */
router.post("/reverse", async (req, res) => {
  try {
    const { lat, lon } = req.body;

    if (lat === undefined || lon === undefined) {
      return res.status(400).json({ error: "lat and lon are required" });
    }

    // Call Nominatim API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SafeSafar-App (Student Project)",
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status}`);
      return res.status(response.status).json({ error: "Nominatim API error" });
    }

    const data = await response.json();

    // Extract best location name
    const shortName =
      data.address?.suburb ||
      data.address?.neighbourhood ||
      data.address?.road ||
      data.address?.city ||
      data.display_name ||
      "Unknown Location";

    // Shorten to 50 chars max
    const displayName = shortName.length > 50 ? shortName.slice(0, 50) + "..." : shortName;

    return res.json({
      name: displayName,
      lat: lat,
      lon: lon,
      address: data.address || {},
      display_name: data.display_name
    });
  } catch (err) {
    console.error("Reverse geocoding error:", err.message);
    return res.status(500).json({ error: "Reverse geocoding failed", details: err.message });
  }
});

/**
 * Search Location - Get coordinates from location name
 * POST /api/geocoding/search
 * Body: { query }
 * Returns: { lat, lon, name }
 */
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: "query is required" });
    }

    // Call Nominatim API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "SafeSafar-App (Student Project)",
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status}`);
      return res.status(response.status).json({ error: "Nominatim API error" });
    }

    const data = await response.json();

    if (data.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    const result = data[0];
    return res.json({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      name: result.display_name,
      boundingbox: result.boundingbox
    });
  } catch (err) {
    console.error("Location search error:", err.message);
    return res.status(500).json({ error: "Location search failed", details: err.message });
    return res.status(500).json({ error: "Location search failed" });
  }
});

export default router;
