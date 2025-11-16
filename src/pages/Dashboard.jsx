import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TripMap from "../components/TripMap";
import SafetyChecker from "../components/SafetyChecker";
import SafetyAnalysisReport from "../components/SafetyAnalysisReport";

const truncateName = (text, n = 50) => {
  if (!text) return "";
  return text.length > n ? text.slice(0, n) + "..." : text;
};

const getStatusBadge = (status) => {
  const statusConfig = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⏳" },
    ACTIVE: { bg: "bg-green-100", text: "text-green-800", icon: "✅" },
    COMPLETED: { bg: "bg-blue-100", text: "text-blue-800", icon: "✔️" },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.icon} {status}
    </span>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tripDurations, setTripDurations] = useState({});
  const [tripSafetyData, setTripSafetyData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch logged-in user
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: token },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (err) {
        console.error("User fetch error:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    // Fetch user's trips
    const fetchTrips = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/trips/my", {
          headers: { Authorization: token },
        });

        const data = await res.json();
        if (res.ok) {
          setTrips(data.trips);
        }
      } catch (err) {
        console.error("Trips fetch error:", err);
      }
    };

    fetchUser();
    fetchTrips();
  }, [navigate]);

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      if (res.ok) {
        setTrips(trips.filter(t => t._id !== tripId));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete trip");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting trip");
    }
  };

  const filteredTrips = useMemo(() => {
    const filtered = trips.filter((trip) => {
      const matchesSearch = 
        trip.startLocation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || trip.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Create a new array and sort it by status order: ACTIVE -> PENDING -> COMPLETED
    const sorted = filtered.slice().sort((a, b) => {
      const statusOrder = { ACTIVE: 0, PENDING: 1, COMPLETED: 2 };
      const aOrder = statusOrder[a.status] ?? 3;
      const bOrder = statusOrder[b.status] ?? 3;
      return aOrder - bOrder;
    });

    return sorted;
  }, [trips, searchQuery, statusFilter]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };


  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* GRID LAYOUT: Profile + Trips */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* USER PROFILE SECTION */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 text-center mb-1">
                {user?.name || "Loading..."}
              </h3>

              <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">
                <div>
                  <p className="font-semibold text-gray-700">Email</p>
                  <p className="break-all text-xs">{user?.email}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Phone</p>
                  <p>{user?.phone}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Emergency Contact</p>
                  <p>{user?.emergency}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => navigate("/create-trip")}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  ➕ New Trip
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                >
                  🚪 Logout
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-700">
                <p className="font-semibold mb-1">📊 Trip Stats</p>
                <p>Total: <strong>{trips.length}</strong></p>
                <p>Pending: <strong>{trips.filter(t => t.status === "PENDING").length}</strong></p>
                <p>Active: <strong>{trips.filter(t => t.status === "ACTIVE").length}</strong></p>
                <p>Completed: <strong>{trips.filter(t => t.status === "COMPLETED").length}</strong></p>
              </div>
            </div>
          </div>

          {/* TRIPS SECTION */}
          <div className="lg:col-span-3">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Your Trips
              </h2>

              {trips.length === 0 ? (
                <p className="text-gray-500">You have no trips yet.</p>
              ) : (
                <>
                  {/* SEARCH AND FILTER */}
                  <div className="mb-6 space-y-3">
                    <input
                      type="text"
                      placeholder="Search by location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    
                    <div className="flex gap-2 flex-wrap">
                      {["ALL", "PENDING", "ACTIVE", "COMPLETED"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            statusFilter === status
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredTrips.length === 0 ? (
                    <p className="text-gray-500">No trips match your search.</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredTrips.map((trip) => (
                        <div
                          key={trip._id}
                          className="p-4 border rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p><strong>Start:</strong> {truncateName(trip.startLocation.name)}</p>
                              <p><strong>Destination:</strong> {truncateName(trip.destination.name)}</p>
                            </div>
                            {getStatusBadge(trip.status)}
                          </div>

                          {trip.stops.length > 0 && (
                            <div>
                              <strong>Stops:</strong>
                              <ol className="list-decimal list-inside ml-2 text-gray-700">
                                {trip.stops.map((s, idx) => (
                                  <li key={idx}>{truncateName(s.name)}</li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {trip.chain?.txHash && (
                            <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                              <strong>Tx:</strong>
                              <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                                {trip.chain.txHash.substring(0, 20)}...
                              </code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(trip.chain.txHash);
                                  alert("Transaction hash copied!");
                                }}
                                title="Copy transaction hash"
                                className="p-1 hover:bg-gray-200 rounded transition"
                              >
                                📋
                              </button>
                            </p>
                          )}

                          {/* BUTTONS - PENDING, ACTIVE, COMPLETED */}
                          {trip.status === "PENDING" && (
                            <div className="flex gap-2 mt-3 items-center">
                              <button
                                onClick={() => navigate(`/create-trip?editId=${trip._id}`)}
                                className="px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTrip(trip._id)}
                                className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                              >
                                🗑️ Delete
                              </button>
                              <button
                                onClick={() => navigate(`/trip-tracking/${trip._id}`)}
                                className="ml-auto px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-semibold transition"
                              >
                                🚀 Start Trip
                              </button>
                            </div>
                          )}

                          {trip.status === "ACTIVE" && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => navigate(`/trip-tracking/${trip._id}`)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-semibold transition"
                              >
                                📍 Continue Tracking
                              </button>
                            </div>
                          )}

                          <TripMap 
                            trip={trip}
                            safetyData={tripSafetyData[trip._id]}
                            onDurationUpdate={(distance, duration) => {
                              setTripDurations(prev => ({
                                ...prev,
                                [trip._id]: { distance, duration }
                              }));
                            }}
                          />

                          {/* SAFETY CHECK / ANALYSIS */}
                          {trip.status === "COMPLETED" ? (
                            <SafetyAnalysisReport trip={trip} />
                          ) : (
                            <SafetyChecker 
                              trip={trip} 
                              onSafetyDataReceived={(safetyData) => {
                                setTripSafetyData(prev => ({
                                  ...prev,
                                  [trip._id]: safetyData
                                }));
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
