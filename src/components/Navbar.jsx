import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    navigate("/");
  };


  return (
    <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border border-blue-400 rounded-md flex items-center justify-center bg-blue-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L4 5v5c0 5.25 3.5 10.2 8 12 4.5-1.8 8-6.75 8-12V5l-8-3z"
                stroke="#0b4fae"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span className="text-xl font-bold text-sky-700 tracking-wide">
            SafeSafar
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <a href="/" className="hover:text-blue-600">Home</a>
          <a href="/dashboard" className="hover:text-blue-600">Dashboard</a>

          {!token ? (
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              Login
            </a>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>


        {/* Mobile Menu Button */}
        <div className="md:hidden" onClick={() => setOpen(!open)}>
          <svg
            width="28"
            height="28"
            fill="none"
            stroke="black"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="md:hidden bg-white shadow-md px-6 pb-4">
          <a href="/" className="block py-2 text-gray-700">Home</a>
          <a href="/dashboard" className="block py-2 text-gray-700">Dashboard</a>

          {/* Login / Logout updated here */}
          {!token ? (
            <a
              href="/login"
              className="block py-2 text-white bg-blue-600 rounded-lg px-4 mt-2"
            >
              Login
            </a>
          ) : (
            <button
              onClick={handleLogout}
              className="block py-2 text-white bg-red-600 rounded-lg px-4 mt-2"
            >
              Logout
            </button>
          )}

        </div>
      )}
    </nav>
  );
}
