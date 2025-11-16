import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Function to get actual route using OSRM (Open Source Routing Machine)
const getRoute = async (coordinates) => {
  if (coordinates.length < 2) return null;

  // Format: lon,lat;lon,lat;... (note: OSRM uses lon,lat format)
  const coordString = coordinates.map(([lat, lon]) => `${lon},${lat}`).join(";");
  
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordString}?geometries=geojson`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        coordinates: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
      };
    }
  } catch (err) {
    console.error("Route fetch error:", err);
  }
  
  return null;
};

const formatDuration = (seconds) => {
  if (!seconds) return "N/A";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatDistance = (meters) => {
  if (!meters) return "N/A";
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
};

export default function TripMap({ trip, isExpanded = false, onDurationUpdate, safetyData }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [showMap, setShowMap] = useState(isExpanded);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    if (!showMap || !mapContainer.current) return;

    const initializeMap = async () => {
      // Initialize map
      if (!map.current) {
        map.current = L.map(mapContainer.current).setView([20, 78], 5);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map.current);
      }

      // Clear existing markers and polylines
      map.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.current.removeLayer(layer);
        }
      });

      setIsLoadingRoute(true);

      // Get all coordinates
      const coords = [];
      const markers = [];

      // Start location
      if (trip.startLocation?.coords) {
        const [lat, lon] = trip.startLocation.coords;
        coords.push([lat, lon]);
        markers.push({ 
          lat, 
          lon, 
          label: "Start", 
          name: trip.startLocation.name,
          color: "green" 
        });
      }

      // Stops
      if (trip.stops && trip.stops.length > 0) {
        trip.stops.forEach((stop, idx) => {
          if (stop.coords) {
            const [lat, lon] = stop.coords;
            coords.push([lat, lon]);
            markers.push({ 
              lat, 
              lon, 
              label: `Stop ${idx + 1}`, 
              name: stop.name,
              color: "blue" 
            });
          }
        });
      }

      // Destination
      if (trip.destination?.coords) {
        const [lat, lon] = trip.destination.coords;
        coords.push([lat, lon]);
        markers.push({ 
          lat, 
          lon, 
          label: "Destination", 
          name: trip.destination.name,
          color: "red" 
        });
      }

      // Get actual route
      if (coords.length > 0) {
        const routeData = await getRoute(coords);
        
        if (routeData) {
          setRouteInfo({
            distance: routeData.distance,
            duration: routeData.duration,
          });
          if (onDurationUpdate) {
            onDurationUpdate(routeData.distance, routeData.duration);
          }
          L.polyline(routeData.coordinates, { 
            color: "#3b82f6", 
            weight: 4, 
            opacity: 0.8 
          }).addTo(map.current);
        } else {
          // Fallback to straight line if routing fails
          L.polyline(coords, { 
            color: "#9ca3af", 
            weight: 2, 
            opacity: 0.5,
            dashArray: "5, 5"
          }).addTo(map.current);
        }
      }

      // Add markers with safety data overlay
      markers.forEach(({ lat, lon, label, name, color }) => {
        // Find corresponding safety data for this marker
        const safetyInfo = safetyData?.waypoints?.find(wp => 
          Math.abs(wp.lat - lat) < 0.0001 && Math.abs(wp.lon - lon) < 0.0001
        );

        // Determine marker color based on safety status if available
        let finalColor = color;
        if (safetyInfo) {
          if (safetyInfo.status === 'SAFE') finalColor = 'green';
          else if (safetyInfo.status === 'MODERATE') finalColor = 'orange';
          else if (safetyInfo.status === 'RISKY') finalColor = 'red';
        }

        const colorMap = {
          green: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
          blue: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
          red: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          orange: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
        };

        const markerIcon = L.icon({
          iconUrl: colorMap[finalColor] || colorMap[color],
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        const popupContent = safetyInfo 
          ? `<div class="text-sm"><strong>${label}</strong><br/><strong>${name}</strong><br/>Safety: ${(safetyInfo.safety_score * 100).toFixed(1)}%<br/>Status: ${safetyInfo.status}</div>`
          : `<div class="text-sm"><strong>${label}</strong><br/><strong>${name}</strong></div>`;

        L.marker([lat, lon], { icon: markerIcon })
          .addTo(map.current)
          .bindPopup(popupContent);
      });

      // Fit bounds
      const allCoords = markers.map(m => [m.lat, m.lon]);
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        map.current.fitBounds(bounds, { padding: [50, 50] });
      }

      setIsLoadingRoute(false);
    };

    initializeMap();

    return () => {
      // Cleanup on unmount
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [showMap, trip, safetyData]);

  return (
    <div className="mt-3">
      {!showMap ? (
        <button
          onClick={() => setShowMap(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
        >
          View Route on Map
        </button>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => setShowMap(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
          >
            Hide Map
          </button>
          {isLoadingRoute && <p className="text-sm text-gray-600">Loading route...</p>}
          {routeInfo && (
            <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
              📍 Distance: {formatDistance(routeInfo.distance)} | ⏱️ Duration: {formatDuration(routeInfo.duration)}
            </div>
          )}
          <div
            ref={mapContainer}
            style={{ height: "300px", borderRadius: "8px", overflow: "hidden" }}
            className="border border-gray-300"
          />
        </div>
      )}
    </div>
  );
}
