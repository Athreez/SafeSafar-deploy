import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import CTASection from "./components/CTASection";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import TripTracking from "./pages/TripTracking";

// HomePage component - available to all users
function HomePage() {
  return (
    <>
      <Hero />
      <main className="max-w-7xl mx-auto px-6 sm:px-8">
        <section className="mt-16">
          <h2 className="text-4xl font-bold text-center">Why SafeSafar?</h2>
          <p className="text-center text-black mt-4 max-w-2xl mx-auto">
            Plan your journeys with confidence using intelligent trip management and location-based organization
          </p>
        </section>

        <section className="mt-12">
          <Features />
        </section>
      </main>

      <CTASection />
    </>
  );
}

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      setLoading(false);

      // Auto-redirect: if on login/signup page and already logged in, go to dashboard
      if (token && (window.location.pathname === "/login" || window.location.pathname === "/signup")) {
        navigate("/dashboard", { replace: true });
      }
    }, [navigate]);

    if (loading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="font-sans text-gray-700">
            <Navbar />
            <div className="pt-20">
                <Routes>
                    <Route
                    path="/create-trip"
                    element={
                        <ProtectedRoute>
                        <CreateTrip />
                        </ProtectedRoute>
                    }
                    />
                    <Route
                        path="/"
                        element={<HomePage />}
                    />

                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                            <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/trip-tracking/:tripId"
                        element={
                            <ProtectedRoute>
                            <TripTracking />
                            </ProtectedRoute>
                        }
                    />

                </Routes>
            </div>
        </div>
    );
}
