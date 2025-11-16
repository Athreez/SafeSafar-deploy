#!/usr/bin/env python3
"""
Test script for WAQI integration
Run after adding your WAQI token to backend/.env
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from air_quality import get_air_quality_data, calculate_aqi_from_pm25
from weather_safety import calculate_weather_safety_score

def test_waqi_single_location():
    """Test WAQI data fetch for a single location"""
    print("\n" + "="*60)
    print("TEST 1: Single Location WAQI Data")
    print("="*60)
    
    test_locations = [
        (28.7041, 77.1025, "New Delhi, India"),
        (40.7128, -74.0060, "New York, USA"),
        (51.5074, -0.1278, "London, UK"),
    ]
    
    for lat, lon, name in test_locations:
        print(f"\n📍 {name} ({lat}, {lon})")
        result = get_air_quality_data(lat, lon)
        
        if result.get("data_available"):
            print(f"   ✅ Location: {result.get('location_name')}")
            print(f"   📊 AQI: {result.get('aqi')}")
            
            measurements = result.get('measurements', [])
            for measurement in measurements:
                param = measurement.get('parameter')
                value = measurement.get('lastValue')
                
                if param == 'pm25':
                    aqi, category = calculate_aqi_from_pm25(value)
                    print(f"   {param.upper()}: {value:.1f} μg/m³ (AQI: {aqi:.0f}, {category})")
                elif param == 'aqi':
                    print(f"   {param.upper()}: {value}")
                else:
                    print(f"   {param.upper()}: {value:.2f}")
        else:
            print(f"   ❌ No data available (WAQI token may not be configured)")

def test_weather_safety_with_aqi():
    """Test integrated weather + AQI safety scoring"""
    print("\n" + "="*60)
    print("TEST 2: Weather + AQI Safety Scoring")
    print("="*60)
    
    locations = [
        (28.7041, 77.1025, "New Delhi"),
        (19.0760, 72.8777, "Mumbai"),
        (13.0827, 80.2707, "Chennai"),
    ]
    
    for lat, lon, name in locations:
        print(f"\n📍 {name}")
        result = calculate_weather_safety_score(lat, lon)
        
        safety_score = result['safety_score']
        status = "🟢 SAFE" if safety_score >= 0.7 else "🟡 MODERATE" if safety_score >= 0.4 else "🔴 RISKY"
        
        print(f"   {status} - Score: {safety_score:.2f}")
        print(f"   🌡️  Weather: {result.get('weather_type')} ({result.get('temperature')}°C)")
        print(f"   💨 Wind: {result.get('wind_speed')} km/h")
        print(f"   🌧️  Precipitation: {result.get('precipitation')} mm")
        print(f"   💧 Humidity: {result.get('humidity')}%")
        
        aq = result.get('air_quality', {})
        if aq.get('available'):
            print(f"   💚 Air Quality: Available")
            warnings = aq.get('warnings', [])
            if warnings:
                for warning in warnings:
                    print(f"      ⚠️  {warning}")
        else:
            print(f"   ⚪ Air Quality: Not available (using weather-only scoring)")

def test_route_safety():
    """Test safety scoring for a multi-waypoint route"""
    print("\n" + "="*60)
    print("TEST 3: Route Safety (Multi-waypoint)")
    print("="*60)
    
    # Example route: Delhi -> Gurgaon -> Noida
    waypoints = [
        {"lat": 28.7041, "lon": 77.1025, "name": "New Delhi"},
        {"lat": 28.4595, "lon": 77.0266, "name": "Gurgaon"},
        {"lat": 28.5921, "lon": 77.0489, "name": "Noida"},
    ]
    
    print("\n📍 Route: Delhi → Gurgaon → Noida\n")
    
    safety_scores = []
    for i, waypoint in enumerate(waypoints, 1):
        lat, lon = waypoint['lat'], waypoint['lon']
        name = waypoint['name']
        
        result = calculate_weather_safety_score(lat, lon)
        score = result['safety_score']
        safety_scores.append(score)
        
        status = "🟢" if score >= 0.7 else "🟡" if score >= 0.4 else "🔴"
        print(f"   {i}. {name:15} {status} {score:.2f} (Weather: {result.get('weather_type')})")
    
    avg_score = sum(safety_scores) / len(safety_scores)
    avg_status = "🟢 SAFE" if avg_score >= 0.7 else "🟡 MODERATE" if avg_score >= 0.4 else "🔴 RISKY"
    print(f"\n   Average Route Safety: {avg_status} ({avg_score:.2f})")

if __name__ == "__main__":
    print("\n🚗 SafeSafar - WAQI Integration Test Suite")
    print("=" * 60)
    print("Make sure you've added your WAQI token to backend/.env first!")
    
    try:
        test_waqi_single_location()
        test_weather_safety_with_aqi()
        test_route_safety()
        
        print("\n" + "="*60)
        print("✅ All tests completed!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        print("\nTroubleshooting:")
        print("1. Check that backend/.env has your WAQI token")
        print("2. Run: python -m pip install python-dotenv requests")
        print("3. Verify internet connection for API calls")
