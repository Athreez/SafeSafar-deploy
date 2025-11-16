"""
Weather-based Safety Score Calculator with Air Quality Integration
Uses Open-Meteo API for weather data and OpenAQ API for air quality
"""

import requests
from datetime import datetime
from air_quality import get_location_air_quality_score

OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"

def get_weather_data(lat, lon):
    """
    Get current and forecast weather data from Open-Meteo API
    """
    try:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,precipitation,rain,showers,snowfall,wind_speed_10m,wind_direction_10m,weather_code",
            "hourly": "precipitation,weather_code",
            "timezone": "auto"
        }
        
        response = requests.get(OPEN_METEO_BASE, params=params, timeout=5)
        response.raise_for_status()
        
        return response.json()
    
    except Exception as e:
        print(f"Weather API error for ({lat}, {lon}): {e}")
        return None

def interpret_weather_code(code):
    """
    Interpret WMO weather code
    """
    if code == 0:
        return "clear", 0
    elif code in [1, 2, 3]:
        return "cloudy", 0.05
    elif code in [45, 48]:
        return "foggy", 0.15
    elif code in [51, 53, 55, 61, 63, 65]:
        return "rain", 0.25
    elif code in [67, 80, 81, 82]:
        return "heavy_rain", 0.5
    elif code in [71, 73, 75]:
        return "snow", 0.4
    elif code in [77, 85, 86]:
        return "heavy_snow", 0.6
    elif code >= 80 and code <= 99:
        return "thunderstorm", 0.7
    else:
        return "unknown", 0.1

def calculate_weather_safety_score(lat, lon):
    """
    Calculate safety score based on weather conditions and air quality
    
    Factors considered:
    - Precipitation (rain, snow) - reduces safety (40% weight)
    - Wind speed - extreme wind reduces safety (30% weight)
    - Visibility (fog) - reduces safety
    - Temperature extremes - affects travel conditions
    - Air Quality Index (AQI) - poor air quality reduces safety (20% weight)
    
    Returns:
        dict: Safety score (0-1, where 1 = safest) with detailed breakdown
    """
    try:
        weather_data = get_weather_data(lat, lon)
        
        if not weather_data or "current" not in weather_data:
            print(f"No weather data for ({lat}, {lon})")
            return {
                "safety_score": 0.5,
                "error": "No weather data",
                "weather_type": "unknown"
            }
        
        current = weather_data["current"]
        
        safety_score = 1.0
        
        # 1. Weather code impact (precipitation, storms, etc.) - STRICTER: 50% -> 55%
        weather_code = current.get("weather_code", 0)
        weather_type, code_impact = interpret_weather_code(weather_code)
        safety_score -= code_impact * 0.55  # Weather impact is 55% of score (was 40%)
        
        # 2. Wind speed impact (km/h) - STRICTER
        wind_speed = current.get("wind_speed_10m", 0)
        if wind_speed > 40:
            wind_impact = 0.4  # was 0.3
        elif wind_speed > 20:
            wind_impact = 0.2  # was 0.15
        elif wind_speed > 10:
            wind_impact = 0.1  # NEW threshold
        else:
            wind_impact = 0
        safety_score -= wind_impact * 0.35  # Wind impact is 35% of score (was 30%)
        
        # 3. Precipitation amount (mm) - STRICTER
        precipitation = current.get("precipitation", 0)
        if precipitation > 5:
            precip_impact = 0.4  # was 0.3
        elif precipitation > 2:
            precip_impact = 0.25  # was 0.15
        elif precipitation > 0.5:
            precip_impact = 0.1  # NEW threshold
        else:
            precip_impact = 0
        safety_score -= precip_impact * 0.25  # Precipitation impact is 25% of score (was 20%)
        
        # 4. Humidity (comfort and visibility) - STRICTER
        humidity = current.get("relative_humidity_2m", 50)
        humidity_impact = 0
        if humidity > 95:
            humidity_impact = 0.15  # was 0.1
        elif humidity > 85:
            humidity_impact = 0.08  # NEW threshold
        
        safety_score -= humidity_impact * 0.15  # Humidity impact added (was optional)
        
        # 5. Temperature extremes - STRICTER
        temperature = current.get("temperature_2m", 20)
        temp_impact = 0
        if temperature < -10 or temperature > 45:
            temp_impact = 0.2  # was 0.1
            safety_score -= temp_impact
        elif temperature < 0 or temperature > 35:
            temp_impact = 0.1  # was 0.05
            safety_score -= temp_impact
        elif temperature < 5 or temperature > 30:
            temp_impact = 0.05  # NEW threshold
            safety_score -= temp_impact
        
        # 6. Air Quality Impact - STRICTER: 20% -> 45%
        aq_score = get_location_air_quality_score(lat, lon)
        aq_reduction = aq_score.get("safety_reduction", 0)
        aq_warnings = aq_score.get("warnings", [])
        aq_pollutants = aq_score.get("pollutants", {})
        aq_available = aq_score.get("data_available", False)
        aq_location = aq_score.get("location_name", "Unknown")
        
        safety_score -= aq_reduction * 0.45  # AQI impact is 45% of score (was 20%) - MAJOR INCREASE
        
        # Ensure score is within 0.05-1.0 range (stricter minimum)
        safety_score = max(0.05, min(1.0, safety_score))
        
        return {
            "safety_score": safety_score,
            "weather_type": weather_type,
            "temperature": temperature,
            "wind_speed": wind_speed,
            "precipitation": precipitation,
            "humidity": humidity,
            "air_quality": {
                "available": aq_available,
                "warnings": aq_warnings,
                "pollutants": aq_pollutants,
                "location": aq_location
            },
            "details": {
                "weather_impact": code_impact * 0.4,
                "wind_impact": wind_impact * 0.3,
                "precipitation_impact": precip_impact * 0.2,
                "humidity_impact": humidity_impact,
                "temperature_impact": temp_impact,
                "air_quality_impact": aq_reduction * 0.2
            }
        }
    
    except Exception as e:
        print(f"Safety score calculation error: {e}")
        return {
            "safety_score": 0.5,
            "error": str(e),
            "weather_type": "unknown"
        }

def get_route_weather_safety(waypoints):
    """
    Calculate safety for multiple waypoints along a route using weather and AQI data
    
    Args:
        waypoints (list): List of {'lat', 'lon', 'name'} dicts
    
    Returns:
        dict: Safety analysis with individual waypoint scores and route status
    """
    try:
        waypoint_results = []
        unsafe_areas = []
        
        for wp in waypoints:
            lat = float(wp.get("lat"))
            lon = float(wp.get("lon"))
            name = wp.get("name", "Unknown Location")
            
            safety_info = calculate_weather_safety_score(lat, lon)
            safety_score = safety_info["safety_score"]
            
            # Determine status based on score
            if safety_score >= 0.7:
                status = "SAFE"
            elif safety_score >= 0.4:
                status = "MODERATE"
            else:
                status = "RISKY"
            
            result = {
                "lat": lat,
                "lon": lon,
                "name": name,
                "safety_score": safety_score,
                "status": status,
                "weather_type": safety_info.get("weather_type", "unknown"),
                "temperature": safety_info.get("temperature", 0),
                "wind_speed": safety_info.get("wind_speed", 0),
                "precipitation": safety_info.get("precipitation", 0),
                "humidity": safety_info.get("humidity", 0),
                "air_quality": safety_info.get("air_quality", {}),
                "details": safety_info.get("details", {})
            }
            
            waypoint_results.append(result)
            
            if status != "SAFE":
                unsafe_areas.append(result)
        
        # Calculate average safety
        avg_safety = sum([w["safety_score"] for w in waypoint_results]) / len(waypoint_results) if waypoint_results else 0.5
        
        # Determine overall route status
        if len(unsafe_areas) == 0:
            route_status = "SAFE"
        elif len(unsafe_areas) <= len(waypoint_results) / 2:
            route_status = "MODERATE"
        else:
            route_status = "RISKY"
        
        return {
            "waypoints": waypoint_results,
            "average_safety": avg_safety,
            "unsafe_areas": unsafe_areas,
            "route_status": route_status,
            "unsafe_count": len(unsafe_areas)
        }
    
    except Exception as e:
        print(f"Route safety error: {e}")
        return {
            "error": str(e),
            "waypoints": [],
            "unsafe_areas": [],
            "route_status": "UNKNOWN"
        }
