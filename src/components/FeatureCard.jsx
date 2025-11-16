import React from 'react'


export default function FeatureCard({ icon, title, children }) {
    return (
        <div className="bg-white rounded-xl p-6 card-shadow">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 feature-icon-bg">
                <img src={icon} alt="" className="w-10 h-10" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-gray-500 text-sm">{children}</p>
        </div>
    )
}