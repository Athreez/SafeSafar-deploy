import React from 'react'
import FeatureCard from './FeatureCard'
import iconSafety from "../assets/icon-safety.svg";
import iconTrack from "../assets/icon-tracking.svg";
import iconAlerts from "../assets/icon-alerts.svg";
import iconHistory from "../assets/icon-history.svg";


export default function Features() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            <FeatureCard icon={iconSafety} title="Safety Scores">Get instant safety ratings for your routes based on crime data and weather conditions</FeatureCard>
            <FeatureCard icon={iconTrack} title="Real-Time Tracking">Monitor your journey live with GPS tracking and location logging</FeatureCard>
            <FeatureCard icon={iconAlerts} title="Smart Alerts">Receive instant notifications when entering potentially unsafe areas</FeatureCard>
            <FeatureCard icon={iconHistory} title="Trip History">Review past journeys with detailed safety analytics and insights</FeatureCard>
        </div>
    )
}