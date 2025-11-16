import React, { useState } from "react";

export default function LocationSearchBox({ setSelectedLocation }) {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const searchLocation = async () => {
        if (!query.trim()) {
            setMessage("Please enter a location name");
            return;
        }

        setIsLoading(true);
        setMessage("");
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];

                setSelectedLocation({
                    coords: [parseFloat(lat), parseFloat(lon)],
                    name: display_name
                });
                setMessage("Location found!");
            } else {
                setMessage("Location not found. Please try a different name.");
            }
        } catch (err) {
            console.error("Location search failed:", err);
            setMessage("Error searching location. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="mb-3">
            <div className="flex gap-2 mb-2">
                <input
                    className="w-full border p-2 rounded-xl"
                    placeholder="Search place (e.g., BMSIT, Delhi Airport)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                />
                <button
                    onClick={searchLocation}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Loading
                        </>
                    ) : (
                        "Go"
                    )}
                </button>
            </div>
            {message && (
                <p className={`text-sm px-2 py-1 rounded ${
                    message.includes("not found") || message.includes("Error")
                        ? "text-red-600 bg-red-50"
                        : "text-green-600 bg-green-50"
                }`}>
                    {message}
                </p>
            )}
        </div>
    );
}

