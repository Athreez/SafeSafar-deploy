import React from 'react'
import hero from '../assets/hero-bg.png'
import { useNavigate } from "react-router-dom";



export default function Hero() {
    const navigate = useNavigate();
    return (
        <header className="relative">
            <div className="h-[520px] md:h-[99vh] bg-cover bg-center" style={{ backgroundImage: `url(${hero})` }}>
                <div className="h-full w-full hero-overlay flex items-center">
                    <div className="max-w-4xl mx-8 md:mx-16">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-md border border-blue-200 flex items-center justify-center bg-white/60">
                                {/* small shield icon could be inline SVG */}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5v5c0 5.25 3.5 10.2 8 12 4.5-1.8 8-6.75 8-12V5l-8-3z" stroke="#0b76ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900">SafeSafar</h1>
                        </div>


                        <h2 className="text-3xl md:text-4xl font-bold text-sky-600 md:leading-tight">Travel Smart, Travel Safe</h2>
                        <p className="mt-4 text-black max-w-2xl">Plan your journeys with confidence using real-time safety scores and intelligent route monitoring</p>


                        <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => navigate(localStorage.getItem("token") ? "/dashboard" : "/login")}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                            >
                            Get Started
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}