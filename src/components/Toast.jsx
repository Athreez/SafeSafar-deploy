import React, { useEffect, useState } from "react";

export default function Toast({ message, type = "success", duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          setIsVisible(false);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible && onClose) {
      onClose();
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const progressPercent = (timeLeft / duration) * 100;

  return (
    <div className={`fixed top-6 right-6 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg min-w-80 animate-in`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">{type === "success" ? "✓" : "✕"}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:opacity-75"
        >
          ✕
        </button>
      </div>
      <p className="text-sm">{message}</p>
      
      {/* Progress bar */}
      <div className="mt-2 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
