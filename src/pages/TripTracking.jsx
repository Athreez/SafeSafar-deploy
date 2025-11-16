import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import Toast from "../components/Toast";

// Custom marker icons
const currentLocationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const startIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function TripTracking() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [safetyScore, setSafetyScore] = useState(null);
  const [safetyHistory, setSafetyHistory] = useState([]);
  const [locationHistory, setLocationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingActive, setTrackingActive] = useState(false);
  const [showEndTrip, setShowEndTrip] = useState(false);
  const [toast, setToast] = useState(null);
  const [tripStartTime, setTripStartTime] = useState(null);
  const [error, setError] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const geolocationRef = useRef(null);
  const safetyCheckIntervalRef = useRef(null);

  const token = localStorage.getItem("token");

  // Fetch trip details
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
          headers: { Authorization: token },
        });
        const data = await res.json();
        if (res.ok) {
          setTrip(data.trip);
          setLoading(false);
        } else {
          setError(data.message || "Failed to load trip");
          setLoading(false);
        }
      } catch (err) {
        console.error("Trip fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (tripId && token) {
      fetchTrip();
    } else if (!token) {
      navigate("/login");
    }
  }, [tripId, token, navigate]);

  // Fetch actual route from OSRM when trip loads
  useEffect(() => {
    if (!trip) return;

    const fetchRoute = async () => {
      try {
        // Build coordinates string for OSRM: lng,lat;lng,lat;...
        const coordinates = [
          `${trip.startLocation.coords[1]},${trip.startLocation.coords[0]}`,
          ...(trip.stops || []).map(stop => `${stop.coords[1]},${stop.coords[0]}`),
          `${trip.destination.coords[1]},${trip.destination.coords[0]}`
        ].join(";");

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinates}?geometries=geojson`
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates;
          // Convert from [lng, lat] to [lat, lng] for Leaflet
          setRouteCoordinates(coordinates.map(coord => [coord[1], coord[0]]));
        }
      } catch (err) {
        console.error("Route fetch error:", err);
        // Fallback to straight line if route service fails
        const fallbackRoute = [
          [trip.startLocation.coords[0], trip.startLocation.coords[1]],
          ...(trip.stops || []).map(stop => [stop.coords[0], stop.coords[1]]),
          [trip.destination.coords[0], trip.destination.coords[1]]
        ];
        setRouteCoordinates(fallbackRoute);
      }
    };

    fetchRoute();
  }, [trip]);

  // Request location permission and start tracking
  useEffect(() => {
    if (!trackingActive || !trip) {
      return;
    }

    const startTracking = () => {
      // First try to get real geolocation
      if ("geolocation" in navigator) {
        const timeoutId = setTimeout(() => {
          useFallbackLocation();
        }, 3000);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            setLocationHistory([{ lat: latitude, lng: longitude, timestamp: Date.now() }]);
            setTripStartTime(Date.now());
            showToast("✅ Tracking started with real location", "success");
          },
          (error) => {
            clearTimeout(timeoutId);
            console.error("Geolocation error:", error.code, error.message);
            useFallbackLocation();
          },
          { enableHighAccuracy: false, timeout: 2000, maximumAge: 0 }
        );

        // Watch position for real-time updates (non-blocking)
        geolocationRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            setLocationHistory((prev) => [
              ...prev,
              { lat: latitude, lng: longitude, timestamp: Date.now() },
            ]);
          },
          (error) => console.warn("Watch position error:", error.message),
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
        );
      } else {
        useFallbackLocation();
      }
    };

    const useFallbackLocation = () => {
      if (trip?.startLocation?.coords) {
        const [baseLat, baseLng] = trip.startLocation.coords;
        // Add small random offset for more realistic test data
        const lat = baseLat + (Math.random() - 0.5) * 0.01;
        const lng = baseLng + (Math.random() - 0.5) * 0.01;
        
        setCurrentLocation({ lat, lng });
        setLocationHistory([{ lat, lng, timestamp: Date.now() }]);
        setTripStartTime(Date.now());
        showToast("⚠️ Using test location mode", "warning");
      } else {
        showToast("❌ No location available", "error");
        setTrackingActive(false);
      }
    };

    startTracking();

    return () => {
      if (geolocationRef.current) {
        navigator.geolocation.clearWatch(geolocationRef.current);
      }
    };
  }, [trackingActive, trip]);

  // Check safety score every 10 minutes
  useEffect(() => {
    if (!trackingActive || !currentLocation) {
      return;
    }

    const checkSafety = async () => {
      try {
        const res = await fetch("http://localhost:5002/safety_score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: currentLocation.lat,
            lon: currentLocation.lng,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setSafetyScore(data.safety_score);
          setSafetyHistory((prev) => [
            ...prev,
            {
              score: data.safety_score,
              timestamp: Date.now(),
              location: { ...currentLocation },
              details: data,
            },
          ]);

          // Alert if safety score is low
          if (data.safety_score < 0.5) {
            showToast(
              `⚠️ Safety Alert! Score: ${(data.safety_score * 100).toFixed(1)}% - Consider changing your route`,
              "warning"
            );
          }
        } else {
          console.error("Safety check failed:", res.status, res.statusText);
          const errorData = await res.json().catch(() => ({}));
          console.error("Error details:", errorData);
          showToast("⚠️ Failed to check safety score", "warning");
        }
      } catch (err) {
        console.error("Safety check error:", err);
        showToast("⚠️ Error checking safety (is Flask running?)", "warning");
      }
    };

    // Check immediately on tracking start
    checkSafety();

    // Check every 10 minutes (600000 ms)
    safetyCheckIntervalRef.current = setInterval(checkSafety, 10 * 60 * 1000); // 10 minutes

    return () => {
      if (safetyCheckIntervalRef.current) {
        clearInterval(safetyCheckIntervalRef.current);
      }
    };
  }, [trackingActive, currentLocation]);

  // Activate trip
  const handleActivateTrip = async () => {
    try {
      // Check if trip is already active
      if (trip?.status !== "PENDING") {
        showToast("⚠️ This trip is already " + trip?.status, "warning");
        setTrackingActive(true); // Still activate locally even if API fails
        return;
      }
      
      // Set tracking active immediately for UX
      setTrackingActive(true);
      
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/activate`, {
        method: "PATCH",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (res.ok) {
        setTrip(data.trip);
        showToast("🚀 Trip activated! Starting location tracking...", "success");
      } else {
        console.error("Activation failed:", data.message);
        showToast("⚠️ " + (data.message || "Could not update server, but tracking is active"), "warning");
      }
    } catch (err) {
      console.error("Activation error:", err);
      showToast("⚠️ Server error but tracking is active: " + err.message, "warning");
    }
  };

  // End trip
  const handleEndTrip = async () => {
    if (!window.confirm("Are you sure you want to end this trip?")) return;

    try {
      // Clear tracking
      if (geolocationRef.current) {
        navigator.geolocation.clearWatch(geolocationRef.current);
      }
      if (safetyCheckIntervalRef.current) {
        clearInterval(safetyCheckIntervalRef.current);
      }

      // Update trip status
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/complete`, {
        method: "PATCH",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          safetyHistory,
          locationHistory,
          duration: Date.now() - tripStartTime,
        }),
      });

      if (res.ok) {
        setTrip({ ...trip, status: "COMPLETED" });
        setTrackingActive(false);
        setShowEndTrip(true);
        showToast("✅ Trip completed!", "success");
      } else {
        showToast("❌ Failed to complete trip", "error");
      }
    } catch (err) {
      console.error("End trip error:", err);
      showToast("❌ Error completing trip", "error");
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getSafetyColor = (score) => {
    if (score >= 0.75) return "text-green-600";
    if (score >= 0.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getSafetyBgColor = (score) => {
    if (score >= 0.75) return "bg-green-100 border-green-300";
    if (score >= 0.5) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Error</h1>
          <p className="text-gray-700 mb-6">{error || "Trip not found"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showEndTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">✅ Trip Completed!</h1>
              <p className="text-gray-600">Here's your trip summary and safety analysis</p>
            </div>

            {/* Trip Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <p className="text-gray-600 text-sm mb-2">Total Duration</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((Date.now() - tripStartTime) / 60000)} mins
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <p className="text-gray-600 text-sm mb-2">Distance Tracked</p>
                <p className="text-2xl font-bold text-green-600">
                  {(locationHistory.length * 0.05).toFixed(2)} km
                </p>
              </div>
              <div className={`${getSafetyBgColor(safetyScore || 0)} p-6 rounded-lg border`}>
                <p className="text-gray-600 text-sm mb-2">Final Safety Score</p>
                <p className={`text-2xl font-bold ${getSafetyColor(safetyScore || 0)}`}>
                  {safetyScore ? `${(safetyScore * 100).toFixed(1)}%` : "N/A"}
                </p>
              </div>
            </div>

            {/* Safety Analysis */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Safety Analysis</h2>
              <div className="space-y-3">
                {safetyHistory.length > 0 ? (
                  safetyHistory.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${getSafetyBgColor(entry.score)} flex justify-between items-center`}
                    >
                      <div>
                        <p className="font-semibold text-gray-700">Check #{idx + 1}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className={`text-lg font-bold ${getSafetyColor(entry.score)}`}>
                        {(entry.score * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No safety checks recorded</p>
                )}
              </div>
            </div>

            {/* Back to Dashboard */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="bg-white shadow-md p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📍 Trip Tracking</h1>
            <p className="text-gray-600">{trip?.destination?.name || "Destination"}</p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${getSafetyColor(safetyScore || 0.5)}`}>
              Safety: {safetyScore ? `${(safetyScore * 100).toFixed(1)}%` : "Calculating..."}
            </p>
            <p className="text-sm text-gray-600">
              {trackingActive ? "🔴 LIVE" : "⚫ NOT TRACKING"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Map */}
        <div className="flex-1 rounded-lg overflow-hidden shadow-lg">
          {trip ? (
            <MapContainer
              center={[trip.startLocation.coords[0], trip.startLocation.coords[1]]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              {/* Start Location */}
              {trip?.startLocation && (
                <Marker
                  position={[trip.startLocation.coords[0], trip.startLocation.coords[1]]}
                  icon={startIcon}
                >
                  <Popup>🟢 Start: {trip.startLocation.name}</Popup>
                </Marker>
              )}

              {/* Destination */}
              {trip?.destination && (
                <Marker
                  position={[trip.destination.coords[0], trip.destination.coords[1]]}
                  icon={destinationIcon}
                >
                  <Popup>🔴 Destination: {trip.destination.name}</Popup>
                </Marker>
              )}

              {/* Stops */}
              {trip?.stops && trip.stops.map((stop, idx) => (
                <Marker
                  key={idx}
                  position={[stop.coords[0], stop.coords[1]]}
                  title={stop.name}
                >
                  <Popup>📍 Stop {idx + 1}: {stop.name}</Popup>
                </Marker>
              ))}

              {/* Route Polyline */}
              {routeCoordinates.length > 0 && (
                <Polyline
                  positions={routeCoordinates}
                  color="blue"
                  weight={3}
                  opacity={0.8}
                />
              )}

              {/* Current Location - only show when tracking */}
              {trackingActive && currentLocation && (
                <>
                  <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
                    <Popup>
                      📍 Current Location
                      <br />
                      Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}
                    </Popup>
                  </Marker>

                  {/* Accuracy Circle */}
                  <Circle center={[currentLocation.lat, currentLocation.lng]} radius={50} />
                </>
              )}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <p className="text-gray-600">Waiting to start the trip...</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
          {/* Trip Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Trip Status</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-xl font-bold text-blue-600">{trip.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Start Location</p>
                <p className="text-sm font-semibold text-gray-800">{trip.startLocation?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="text-sm font-semibold text-gray-800">{trip.destination?.name}</p>
              </div>
              {trip.stops && trip.stops.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Stops ({trip.stops.length})</p>
                  <div className="space-y-1">
                    {trip.stops.map((stop, idx) => (
                      <p key={idx} className="text-xs text-gray-700">• {stop.name}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="space-y-2">
            {!trackingActive ? (
              <>
                <button
                  onClick={() => {
                    console.log("🔴 Button clicked! trackingActive was:", trackingActive);
                    handleActivateTrip();
                  }}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  🚀 Start Tracking
                </button>
                
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition text-sm"
                >
                  ← Back to Dashboard
                </button>
              </>
            ) : (
              <>
                {/* SOS Button */}
                <button
                  onClick={() => alert("🚨 SOS activated! Emergency services would be notified.")}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 shadow-lg hover:shadow-xl transition"
                >
                  🚨 SOS (Emergency)
                </button>

                <button
                  onClick={handleEndTrip}
                  className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                >
                  🏁 End Trip
                </button>
                
                {/* Manual Safety Check Button (for testing) */}
                <button
                  onClick={async () => {
                    if (!currentLocation) {
                      showToast("❌ No location available", "error");
                      return;
                    }
                    try {
                      const res = await fetch("http://localhost:5002/safety_score", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          lat: currentLocation.lat,
                          lon: currentLocation.lng,
                        }),
                      });
                      const data = await res.json();
                      setSafetyScore(data.safety_score);
                      setSafetyHistory((prev) => [
                        ...prev,
                        {
                          score: data.safety_score,
                          timestamp: Date.now(),
                          location: { ...currentLocation },
                          details: data,
                        },
                      ]);
                      showToast(`✅ Safety Check: ${(data.safety_score * 100).toFixed(1)}%`, "success");
                    } catch (err) {
                      showToast("❌ Safety check failed: " + err.message, "error");
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                >
                  🔍 Check Safety Now
                </button>
              </>
            )}
          </div>

          {/* Latest Safety Check */}
          {safetyHistory.length > 0 && (
            <div className={`${getSafetyBgColor(safetyHistory[safetyHistory.length - 1].score)} p-4 rounded-lg border`}>
              <h3 className="font-bold text-gray-800 mb-2">Latest Safety Check</h3>
              <p className={`text-2xl font-bold ${getSafetyColor(safetyHistory[safetyHistory.length - 1].score)}`}>
                {(safetyHistory[safetyHistory.length - 1].score * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 mt-2">
                {new Date(safetyHistory[safetyHistory.length - 1].timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Location Info */}
          {currentLocation && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3">📍 Current Location</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold">Latitude:</span> {currentLocation.lat.toFixed(6)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Longitude:</span> {currentLocation.lng.toFixed(6)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Locations tracked:</span> {locationHistory.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
