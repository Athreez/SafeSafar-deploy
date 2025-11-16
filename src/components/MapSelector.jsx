import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";

const markerIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Component to handle map click
function LocationMarker({ setSelectedLocation }) {
  useMapEvents({
    click(e) {
      setSelectedLocation({
        coords: [e.latlng.lat, e.latlng.lng],
        name: "Pinned Location"
      });
    },
  });
  return null;
}

// Component that zooms when a new location is selected
function FlyToLocation({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location?.coords) {
      map.flyTo(location.coords, 15, { duration: 1 });
    }
  }, [location]);

  return null;
}

export default function MapSelector({ selectedLocation, setSelectedLocation }) {
  useEffect(() => {
    // Fix Leaflet icon issue
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={[20.5937, 78.9629]} // India center
      zoom={5}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Fly to searched location */}
      <FlyToLocation location={selectedLocation} />

      {/* Click handler */}
      <LocationMarker setSelectedLocation={setSelectedLocation} />

      {/* Marker */}
      {selectedLocation?.coords && (
        <Marker position={selectedLocation.coords} icon={markerIcon} />
      )}
    </MapContainer>
  );
}
