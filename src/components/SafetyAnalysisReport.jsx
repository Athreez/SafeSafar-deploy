import React, { useState } from "react";

export default function SafetyAnalysisReport({ trip }) {
  const [showReport, setShowReport] = useState(false);

  if (!trip || trip.status !== "COMPLETED") {
    return null;
  }

  // Get safety history from the completed trip
  const safetyHistory = trip.safetyHistory || [];
  const averageScore = trip.averageSafetyScore || 0;

  if (safetyHistory.length === 0) {
    return (
      <div className="mt-4">
        <button
          onClick={() => setShowReport(!showReport)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
        >
          📊 View Safety Analysis
        </button>
        {showReport && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
            <p className="text-gray-600 text-sm">No safety data recorded during this trip.</p>
          </div>
        )}
      </div>
    );
  }

  const getSafetyColor = (score) => {
    if (score >= 0.75) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 0.5) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getSafetyIcon = (score) => {
    if (score >= 0.75) return "✅";
    if (score >= 0.5) return "⚠️";
    return "🚨";
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowReport(!showReport)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-semibold"
      >
        📊 {showReport ? "Hide Safety Analysis" : "View Safety Analysis"}
      </button>

      {showReport && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-bold text-gray-800 mb-4">📊 Safety Analysis Report</h3>

          {/* Average Safety Score */}
          <div className={`p-4 rounded-lg border-2 mb-4 ${getSafetyColor(averageScore)}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getSafetyIcon(averageScore)}</span>
              <div>
                <p className="font-bold">Average Safety Score</p>
                <p className="text-2xl font-bold">{(averageScore * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Safety Checks Timeline */}
          <div className="border rounded-lg p-3 bg-white">
            <p className="font-semibold text-gray-800 mb-3">Safety Checks During Trip:</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {safetyHistory.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${getSafetyColor(entry.score)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {getSafetyIcon(entry.score)} Check #{idx + 1}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </p>
                      {entry.location && (
                        <p className="text-xs text-gray-600 mt-1">
                          📍 {entry.location.lat?.toFixed(4)}, {entry.location.lng?.toFixed(4)}
                        </p>
                      )}
                    </div>
                    <p className="text-lg font-bold">{(entry.score * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Duration and Checks */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-blue-50 rounded-lg border">
              <p className="text-xs text-gray-600">Total Checks</p>
              <p className="text-xl font-bold text-blue-600">{safetyHistory.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border">
              <p className="text-xs text-gray-600">Safe Checks</p>
              <p className="text-xl font-bold text-green-600">
                {safetyHistory.filter(s => s.score >= 0.75).length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border">
              <p className="text-xs text-gray-600">Unsafe Checks</p>
              <p className="text-xl font-bold text-red-600">
                {safetyHistory.filter(s => s.score < 0.5).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
