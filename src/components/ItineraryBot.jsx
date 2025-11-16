import React, { useState } from "react";

export default function ItineraryBot({ open, onClose, onApply, start, destination }) {
  const [days, setDays] = useState(1);
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!open) return null;

  const generate = async () => {
    if (!start || !destination) {
      setError("Select start and destination first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, destination, days, preferences }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate");
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl">
        <h3 className="text-lg font-semibold mb-3">Itinerary Assistant</h3>
        <p className="text-sm text-gray-600">Generate a suggested itinerary between your start and destination. You can accept suggestions to add stops to your trip.</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Days</label>
            <input type="number" min={1} max={7} value={days} onChange={(e) => setDays(e.target.value)} className="mt-1 p-2 border rounded w-full" />
          </div>
          <div>
            <label className="block text-sm">Preferences</label>
            <input value={preferences} onChange={(e) => setPreferences(e.target.value)} className="mt-1 p-2 border rounded w-full" placeholder="e.g., scenic, food, short walks" />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Close</button>
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}

        {result && (
          <div className="mt-4">
            <h4 className="font-semibold">{result.summary}</h4>
            <div className="mt-2 space-y-3 max-h-64 overflow-auto">
              {result.itinerary.map((day) => (
                <div key={day.day} className="p-3 border rounded">
                  <strong>Day {day.day}</strong>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {day.stops.map((s, idx) => (
                      <li key={idx}>{s.name} — {s.note}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  // Flatten stops and call onApply to set stops in CreateTrip
                  const allStops = result.itinerary.flatMap(d => d.stops).map((s, i) => ({ name: s.name, coords: s.coords }));
                  onApply({ stops: allStops, suggestedSummary: result.summary });
                  onClose();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Use This Itinerary
              </button>
              <button onClick={() => { setResult(null); setError(null); }} className="px-4 py-2 bg-gray-200 rounded">Generate Again</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
