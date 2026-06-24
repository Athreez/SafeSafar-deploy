import express from "express";

const router = express.Router();

const PHOTON_BASE = "https://photon.komoot.io";

function photonRequest(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

function buildDisplayName(props) {
  return [props.name, props.city || props.district || props.locality, props.state, props.country]
    .filter(Boolean)
    .join(", ");
}

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

    const url = `${PHOTON_BASE}/api/?q=${encodeURIComponent(query)}&limit=1`;
    const response = await photonRequest(url);

    if (!response.ok) {
      return res.status(502).json({ error: "Geocoding service error" });
    }

    const data = await response.json();

    if (!data.features?.length) {
      return res.status(404).json({ error: "Location not found" });
    }

    const feature = data.features[0];
    const [lon, lat] = feature.geometry.coordinates;
    const props = feature.properties;

    return res.json({
      lat,
      lon,
      name: buildDisplayName(props),
      boundingbox: props.extent || null,
    });
  } catch (err) {
    console.error("Location search error:", err.message);
    return res.status(500).json({ error: "Location search failed", details: err.message });
  }
});

/**
 * Reverse Geocoding - Get location name from coordinates
 * POST /api/geocoding/reverse
 * Body: { lat, lon }
 * Returns: { name, lat, lon, address, display_name }
 */
router.post("/reverse", async (req, res) => {
  try {
    const { lat, lon } = req.body;

    if (lat === undefined || lon === undefined) {
      return res.status(400).json({ error: "lat and lon are required" });
    }

    const url = `${PHOTON_BASE}/reverse?lat=${lat}&lon=${lon}`;
    const response = await photonRequest(url);

    if (!response.ok) {
      return res.status(502).json({ error: "Geocoding service error" });
    }

    const data = await response.json();

    if (!data.features?.length) {
      return res.json({ name: "Unknown Location", lat, lon, address: {}, display_name: "" });
    }

    const feature = data.features[0];
    const props = feature.properties;

    const shortName =
      props.name ||
      props.locality ||
      props.district ||
      props.city ||
      props.state ||
      "Unknown Location";

    const displayName = buildDisplayName(props);
    const clipped = shortName.length > 50 ? shortName.slice(0, 50) + "..." : shortName;

    return res.json({
      name: clipped,
      lat,
      lon,
      address: props,
      display_name: displayName,
    });
  } catch (err) {
    console.error("Reverse geocoding error:", err.message);
    return res.status(500).json({ error: "Reverse geocoding failed", details: err.message });
  }
});

export default router;
