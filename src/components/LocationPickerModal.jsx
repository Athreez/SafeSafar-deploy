import React, { useState } from "react";
import MapSelector from "./MapSelector";
import LocationSearchBox from "./LocationSearchBox";

export default function LocationPickerModal({
  open,
  onClose,
  onConfirm,
  title,
  selectedLocation,
  setSelectedLocation,
}) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  if (!open) return null;

  // 🔍 Shorten location name (max 50 characters)
  const shortenName = (fullName, maxLen = 50) => {
    if (!fullName) return "Unnamed Location";
    return fullName.length > maxLen ? fullName.slice(0, maxLen) + "..." : fullName;
  };

  // 🌍 Reverse Geocoding Function (OpenStreetMap / Nominatim)
  const getActualLocationName = async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "SafeSafar-App (Student Project)",
        },
      });

      const data = await response.json();

      // Prefer short meaningful name
      const shortName =
        data.address?.suburb ||
        data.address?.neighbourhood ||
        data.address?.road ||
        data.address?.city ||
        data.display_name ||
        "Unknown Location";

      return shortenName(shortName);
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      return "Unknown Location";
    }
  };

  // 📍 Use current GPS location
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Geolocation is not supported on this device.");
      return;
    }

    setIsLoadingLocation(true);
    setLocationMessage("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Reverse geocode to get actual name
        const actualName = await getActualLocationName(lat, lon);

        setSelectedLocation({
          coords: [lat, lon],
          name: actualName,
        });
        setLocationMessage("Location found successfully!");
        setIsLoadingLocation(false);
      },
      () => {
        setLocationMessage("Unable to fetch your location. Please enable GPS or try searching manually.");
        setIsLoadingLocation(false);
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-2xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        {/* Search box */}
        <LocationSearchBox setSelectedLocation={setSelectedLocation} />

        {/* Use current location */}
        <button
          onClick={useCurrentLocation}
          disabled={isLoadingLocation}
          className="mb-3 w-full bg-green-200 text-green-900 py-2 rounded-xl hover:bg-green-400 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoadingLocation ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-green-900 border-t-transparent rounded-full animate-spin"></span>
              Getting Location...
            </>
          ) : (
            "Use Current Location"
          )}
        </button>

        {locationMessage && (
          <p className={`text-sm px-3 py-2 rounded-lg mb-3 ${
            locationMessage.includes("Unable") || locationMessage.includes("not supported")
              ? "text-red-600 bg-red-50"
              : "text-green-600 bg-green-50"
          }`}>
            {locationMessage}
          </p>
        )}

        {/* Map */}
        <div className="h-80 rounded-xl overflow-hidden mt-3">
          <MapSelector
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
