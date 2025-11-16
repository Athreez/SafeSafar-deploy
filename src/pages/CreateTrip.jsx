import React, { useState } from "react";
import LocationPickerModal from "../components/LocationPickerModal";
import Toast from "../components/Toast";
import { createTripAPI } from "../api/trips";
import { useNavigate } from "react-router-dom";


const truncateName = (text, n = 50) => {
  if (!text) return "";
  return text.length > n ? text.slice(0, n) + "..." : text;
};

export default function CreateTrip() {
  const [start, setStart] = useState(null);
  const [stops, setStops] = useState([]);
  const [destination, setDestination] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();


  const openModal = (type) => {
    setModalType(type);
    setSelectedLocation(null);
    setModalOpen(true);
  };

  const createTrip = async () => {
    if (!start || !destination) {
      setToast({ message: "Please select start and destination", type: "error" });
      return;
    }

    const token = localStorage.getItem("token");

    const payload = {
      startLocation: start,
      stops: stops,
      destination: destination,
    };


    console.log("Sending trip payload:", payload);

    const res = await createTripAPI(token, payload);

    if (res.error) {
      setToast({ message: `Trip creation failed: ${res.error}`, type: "error" });
      return;
    }

    setToast({ message: "Trip created successfully! Redirecting...", type: "success" });
    console.log("Trip response:", res.trip);

    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };


  const confirmLocation = () => {
    if (!selectedLocation) return;

    if (modalType === "start") {
      setStart(selectedLocation);
    } else if (modalType === "stop") {
      setStops([...stops, selectedLocation]);
    } else if (modalType === "destination") {
      setDestination(selectedLocation);
    }

    setModalOpen(false);
  };

  const removeStop = (index) => {
    const updated = [...stops];
    updated.splice(index, 1);
    setStops(updated);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto mt-10 space-y-10">

      {/* Header with Exit Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-sky-700">Create Trip</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
        >
          ✕
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={4000}
          onClose={() => setToast(null)}
        />
      )}

      {/* ================= START LOCATION ================= */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Starting Location</h3>

        {!start ? (
          <button
            onClick={() => openModal("start")}
            className="w-full bg-green-200 text-green-900 py-3 rounded-md hover:bg-green-400"
          >
            Select Location
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1 border p-3 rounded-md bg-gray-50">
              {truncateName(start.name)}
            </div>
            <button
              onClick={() => openModal("start")}
              className="px-3 py-2 bg-blue-600 text-white rounded-md"
            >
              Change
            </button>
          </div>
        )}
      </section>

      {/* ================= STOP LOCATIONS ================= */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Stops</h3>

        {stops.length === 0 ? (
          <button
            onClick={() => openModal("stop")}
            className="w-full bg-green-200 text-green-900 py-3 rounded-md hover:bg-green-400"
          >
            Add Stop
          </button>
        ) : (
          <div className="space-y-3">
            {stops.map((stop, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1 border p-3 rounded-md bg-gray-50">
                  {truncateName(stop.name)}
                </div>
                <button
                  onClick={() => removeStop(index)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              onClick={() => openModal("stop")}
              className="w-full bg-green-200 text-green-900 py-3 rounded-md hover:bg-green-400"
            >
              Add Stop
            </button>
          </div>
        )}
      </section>

      {/* ================= DESTINATION ================= */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Destination</h3>

        {!destination ? (
          <button
            onClick={() => openModal("destination")}
            className="w-full bg-green-200 text-green-900 py-3 rounded-md hover:bg-green-400"
          >
            Select Destination
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1 border p-3 rounded-md bg-gray-50">
              {truncateName(destination.name)}
            </div>
            <button
              onClick={() => openModal("destination")}
              className="px-3 py-2 bg-blue-600 text-white rounded-md"
            >
              Change
            </button>
          </div>
        )}
      </section>

      {/* ================= FINAL SUBMIT ================= */}
      <button
        onClick={createTrip}
        className="w-full bg-black text-white py-2 rounded-xl mt-4"
      >
        Create Trip
      </button>


      {/* ================= MODAL ================= */}
      <LocationPickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmLocation}
        title={
          modalType === "start"
            ? "Pick Start Location"
            : modalType === "stop"
              ? "Pick Stop Location"
              : "Pick Destination"
        }
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
    </div>
  );
}
