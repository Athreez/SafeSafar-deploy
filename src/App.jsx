import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import CTASection from "./components/CTASection";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";




export default function App() {
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
                        element={
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
                        }
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


                </Routes>
            </div>
        </div>
    );
}
