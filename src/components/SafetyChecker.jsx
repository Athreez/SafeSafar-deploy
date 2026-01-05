import React, { useState } from "react";

// API URL - production backend
const API_URL = "https://safesafar-backend.onrender.com";

export default function SafetyChecker({ trip, onSafetyCheck, onSafetyDataReceived }) {
  const [isChecking, setIsChecking] = useState(false);
  const [safetyData, setSafetyData] = useState(null);
  const [error, setError] = useState("");
  const [showReport, setShowReport] = useState(false);

  const handleSafetyCheck = async () => {
    setIsChecking(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_URL}/api/trips/${trip._id}/check-safety`,
        {
          method: "POST",
          headers: { Authorization: token },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to check safety");
        setIsChecking(false);
        return;
      }

      setSafetyData(data.safety);
      if (onSafetyCheck) onSafetyCheck(data.safety);
      if (onSafetyDataReceived) onSafetyDataReceived(data.safety);
    } catch (err) {
      setError("Error checking safety: " + err.message);
      console.error("Safety check error:", err);
    }

    setIsChecking(false);
  };

  const getSafetyColor = (status) => {
    switch (status) {
      case "SAFE":
        return "bg-green-100 text-green-800 border-green-300";
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "RISKY":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "SAFE":
        return "✅";
      case "MODERATE":
        return "⚠️";
      case "RISKY":
        return "🚨";
      default:
        return "❓";
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleSafetyCheck}
        disabled={isChecking}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2 text-sm"
      >
        {isChecking ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Checking Safety...
          </>
        ) : (
          "🛡️ Check Route Safety"
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {safetyData && (
        <>
          <button
            onClick={() => setShowReport(!showReport)}
            className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-semibold"
          >
            {showReport ? "Hide Route Safety" : "View Route Safety"}
          </button>

          {showReport && (
            <div className="mt-3 space-y-3">
              {/* Overall Route Status */}
              <div
                className={`p-4 rounded-lg border-2 ${getSafetyColor(
                  safetyData.route_status
                )}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {getStatusIcon(safetyData.route_status)}
                  </span>
                  <div>
                    <p className="font-bold">Route Status: {safetyData.route_status}</p>
                    <p className="text-sm">
                      Average Safety Score: {(safetyData.average_safety * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                {safetyData.unsafe_count > 0 && (
                  <p className="text-sm font-semibold">
                    ⚠️ {safetyData.unsafe_count} unsafe area(s) detected
                  </p>
                )}
              </div>

              {/* Waypoint Details */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="font-semibold text-gray-800 mb-2">Location Details:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {safetyData.waypoints.map((wp, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded text-sm border ${getSafetyColor(wp.status)}`}
                    >
                      <p className="font-semibold">
                        {wp.status} - {(wp.safety_score * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs font-medium mb-1">{wp.name || wp.label || `Waypoint ${idx + 1}`}</p>
                      {wp.description && (
                        <p className="text-xs text-gray-700 bg-white bg-opacity-50 p-1 rounded">
                          {wp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Unsafe Areas Warning */}
              {safetyData.unsafe_areas.length > 0 && (
                <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                  <p className="font-bold text-red-800 mb-2">
                    🚨 Unsafe Areas Detected:
                  </p>
                  <div className="space-y-2">
                    {safetyData.unsafe_areas.map((area, idx) => (
                      <div key={idx} className="text-sm bg-white p-2 rounded border border-red-200">
                        <p className="text-red-700 font-semibold">
                          • {area.status} ({(area.safety_score * 100).toFixed(1)}%) at {area.name || `(${area.lat.toFixed(2)}, ${area.lon.toFixed(2)})`}
                        </p>
                        {area.description && (
                          <p className="text-red-600 text-xs mt-1">
                            {area.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}