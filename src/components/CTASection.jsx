import React from 'react'
import { useNavigate } from "react-router-dom";



export default function CTASection() {
    const navigate = useNavigate();
    return (
        <section className="mt-16 bg-gradient-to-r from-blue-600 to-cyan-400 text-white py-20">
            <div className="max-w-4xl mx-auto text-center px-6">
                <h3 className="text-4xl font-extrabold">Ready to Travel Safer?</h3>
                <p className="mt-4 text-white/90">Join thousands of travelers who trust SafeSafar for their journeys</p>
                <div className="mt-8">
                <button
                    onClick={() => navigate(localStorage.getItem("token") ? "/dashboard" : "/login")}
                    className="bg-white text-sky-700 px-6 py-3 rounded-xl shadow hover:bg-gray-100"
                    >
                    Start Your First Trip
                </button>
                </div>
            </div>
        </section>
    )
}