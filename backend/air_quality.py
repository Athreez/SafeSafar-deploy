"""
Air Quality Index (AQI) data calculator
Fetches real data from WAQI (World Air Quality Index) API
Falls back gracefully if API is unavailable or token not configured
"""

import requests
from datetime import datetime
import os
from pathlib import Path

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ[key.strip()] = value.strip()

WAQI_TOKEN = os.getenv("WAQI_TOKEN", "").strip()
WAQI_API_BASE = "https://api.waqi.info"

# Try multiple AQI data sources
def get_air_quality_data(lat, lon):
    """
    Get air quality data from WAQI API
    
    Args:
        lat (float): Latitude
        lon (float): Longitude
    
    Returns:
        dict: Air quality data or fallback dict if unavailable
    """
    try:
        if not WAQI_TOKEN or WAQI_TOKEN == "YOUR_WAQI_API_TOKEN_HERE":
            print(f"WAQI_TOKEN not configured. Using graceful fallback.")
            return get_aqi_fallback(lat, lon)
        
        # Call WAQI Geo API to find nearest station
        url = f"{WAQI_API_BASE}/feed/geo:{lat};{lon}/?token={WAQI_TOKEN}"
        
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("status") == "error":
            print(f"WAQI API error: {data.get('data')}")
            return get_aqi_fallback(lat, lon)
        
        if data.get("status") != "ok" or not data.get("data"):
            return get_aqi_fallback(lat, lon)
        
        station_data = data.get("data", {})
        
        # Extract measurements
        measurements = []
        if station_data.get("aqi"):
            measurements.append({
                "parameter": "aqi",
                "lastValue": station_data.get("aqi")
            })
        
        # Extract pollutant data
        iaqi = station_data.get("iaqi", {})
        pollutants = {
            "pm25": "pm25",
            "pm10": "pm10",
            "o3": "o3",
            "no2": "no2",
            "so2": "so2",
            "co": "co"
        }
        
        for waqi_key, param_name in pollutants.items():
            if waqi_key in iaqi:
                measurements.append({
                    "parameter": param_name,
                    "lastValue": iaqi[waqi_key].get("v")
                })
        
        return {
            "location_name": station_data.get("city", {}).get("name", "Unknown Station"),
            "lat": station_data.get("city", {}).get("geo", [lat, lon])[0],
            "lon": station_data.get("city", {}).get("geo", [lat, lon])[1],
            "measurements": measurements,
            "last_updated": datetime.now().isoformat(),
            "data_available": True,
            "aqi": station_data.get("aqi"),
            "dominentpol": station_data.get("dominentpol", ""),
            "time": station_data.get("time", {}).get("iso", "")
        }
    
    except requests.exceptions.Timeout:
        print(f"WAQI API timeout for ({lat}, {lon})")
        return get_aqi_fallback(lat, lon)
    except requests.exceptions.ConnectionError:
        print(f"WAQI API connection error for ({lat}, {lon})")
        return get_aqi_fallback(lat, lon)
    except Exception as e:
        print(f"Air quality data error for ({lat}, {lon}): {e}")
        return get_aqi_fallback(lat, lon)

def get_aqi_fallback(lat, lon):
    """
    Fallback graceful response when WAQI API is unavailable
    Allows system to continue working with weather-only scoring
    """
    return {
        "location_name": "Unknown Station",
        "lat": lat,
        "lon": lon,
        "measurements": [],
        "last_updated": datetime.now().isoformat(),
        "data_available": False,
        "message": "WAQI data unavailable"
    }

def extract_pollutant_value(measurements, pollutant_name):
    """
    Extract specific pollutant value from measurements.
    """
    try:
        for measurement in measurements:
            if measurement.get("parameter") == pollutant_name:
                return float(measurement.get("lastValue"))
        return None
    except Exception:
        return None

def calculate_aqi_from_pm25(pm25):
    """
    Calculate AQI from PM2.5 concentration (μg/m³) using US EPA method.
    """
    if pm25 is None:
        return None, "unknown"
    
    if pm25 <= 12.0:
        aqi = (pm25 / 12.0) * 50
        category = "good"
    elif pm25 <= 35.4:
        aqi = ((pm25 - 12.1) / (35.4 - 12.1)) * 50 + 50
        category = "moderate"
    elif pm25 <= 55.4:
        aqi = ((pm25 - 35.5) / (55.4 - 35.5)) * 50 + 100
        category = "unhealthy_sensitive"
    elif pm25 <= 150.4:
        aqi = ((pm25 - 55.5) / (150.4 - 55.5)) * 50 + 150
        category = "unhealthy"
    elif pm25 <= 250.4:
        aqi = ((pm25 - 150.5) / (250.4 - 150.5)) * 100 + 200
        category = "very_unhealthy"
    else:
        aqi = 500
        category = "hazardous"
    
    return min(500, aqi), category

def calculate_air_quality_safety_impact(pm25, pm10, no2=None, o3=None):
    """
    Calculate safety impact based on air quality pollutants.
    STRICTER: Higher penalties for pollution, lower cap.
    """
    try:
        safety_reduction = 0
        details = {}
        warnings = []
        
        # PM2.5 Impact (Primary pollutant) - STRICTER
        if pm25 is not None:
            aqi_pm25, category_pm25 = calculate_aqi_from_pm25(pm25)
            details["pm25"] = {"value": pm25, "aqi": aqi_pm25, "category": category_pm25}
            
            if pm25 > 250:  # Hazardous - INCREASED from 0.4 to 0.6
                safety_reduction += 0.6
                warnings.append(f"Hazardous PM2.5: {pm25:.1f} μg/m³ - DO NOT TRAVEL")
            elif pm25 > 150:  # Very Unhealthy - INCREASED from 0.3 to 0.45
                safety_reduction += 0.45
                warnings.append(f"Very high PM2.5: {pm25:.1f} μg/m³ - Avoid travel")
            elif pm25 > 55:  # Unhealthy - INCREASED from 0.2 to 0.35
                safety_reduction += 0.35
                warnings.append(f"Unhealthy PM2.5: {pm25:.1f} μg/m³ - Use caution")
            elif pm25 > 35:  # Moderate - INCREASED from 0.1 to 0.2
                safety_reduction += 0.2
                warnings.append(f"Moderate PM2.5: {pm25:.1f} μg/m³")
        
        # PM10 Impact (Secondary pollutant) - STRICTER
        if pm10 is not None:
            details["pm10"] = {"value": pm10}
            
            if pm10 > 500:  # INCREASED from 0.15 to 0.25
                safety_reduction += 0.25
                warnings.append(f"Hazardous PM10: {pm10:.1f} μg/m³ - DO NOT TRAVEL")
            elif pm10 > 200:  # INCREASED from 0.1 to 0.2
                safety_reduction += 0.2
                warnings.append(f"High PM10: {pm10:.1f} μg/m³ - Avoid travel")
            elif pm10 > 100:  # NEW: Added moderate threshold
                safety_reduction += 0.1
                warnings.append(f"Moderate PM10: {pm10:.1f} μg/m³")
        
        # NO2 Impact (Nitrogen Dioxide) - STRICTER
        if no2 is not None:
            details["no2"] = {"value": no2}
            
            if no2 > 200:  # INCREASED from 0.1 to 0.2
                safety_reduction += 0.2
                warnings.append(f"High NO2: {no2:.1f} ppb - Avoid travel")
            elif no2 > 100:  # INCREASED from 0.05 to 0.15
                safety_reduction += 0.15
                warnings.append(f"Moderate NO2: {no2:.1f} ppb")
        
        # O3 Impact (Ozone) - STRICTER
        if o3 is not None:
            details["o3"] = {"value": o3}
            
            if o3 > 150:  # INCREASED from 0.1 to 0.25
                safety_reduction += 0.25
                warnings.append(f"High O3: {o3:.1f} ppb - Avoid travel")
            elif o3 > 70:  # INCREASED from 0.05 to 0.15
                safety_reduction += 0.15
                warnings.append(f"Moderate O3: {o3:.1f} ppb")
        
        return {
            "safety_reduction": min(0.85, safety_reduction),  # STRICTER: Cap at 85% reduction (was 50%)
            "details": details,
            "warnings": warnings,
            "air_quality_impact": len(warnings) > 0
        }
    
    except Exception as e:
        print(f"Air quality safety impact error: {e}")
        return {
            "safety_reduction": 0,
            "details": {},
            "warnings": [],
            "error": str(e)
        }

def get_location_air_quality_score(lat, lon):
    """
    Get comprehensive air quality safety score for a location.
    Gracefully handles unavailable data.
    
    Returns:
        dict: Air quality data with safety impact
    """
    try:
        aq_data = get_air_quality_data(lat, lon)
        
        if "error" in aq_data or not aq_data.get("measurements"):
            # Return neutral impact if no data available
            return {
                "safety_score": 1.0,  # No impact if data unavailable
                "safety_reduction": 0,
                "warnings": [],
                "details": {},
                "data_available": False,
                "lat": lat,
                "lon": lon,
                "message": "Air quality data unavailable for this location"
            }
        
        measurements = aq_data.get("measurements", [])
        
        # Extract pollutant values
        pm25 = extract_pollutant_value(measurements, "pm25")
        pm10 = extract_pollutant_value(measurements, "pm10")
        no2 = extract_pollutant_value(measurements, "no2")
        o3 = extract_pollutant_value(measurements, "o3")
        
        # Calculate impact
        impact = calculate_air_quality_safety_impact(pm25, pm10, no2, o3)
        
        return {
            "location_name": aq_data.get("location_name", "Unknown"),
            "lat": aq_data.get("lat", lat),
            "lon": aq_data.get("lon", lon),
            "distance_km": aq_data.get("distance_km", 0),
            "last_updated": aq_data.get("last_updated", "Unknown"),
            "safety_reduction": impact["safety_reduction"],
            "warnings": impact["warnings"],
            "pollutants": impact["details"],
            "data_available": True
        }
    
    except Exception as e:
        print(f"Location air quality score error: {e}")
        return {
            "safety_reduction": 0,
            "warnings": [],
            "data_available": False,
            "error": str(e),
            "lat": lat,
            "lon": lon,
            "message": "Unable to retrieve air quality data"
        }
