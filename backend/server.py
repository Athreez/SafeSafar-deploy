"""
SafeSafar Weather-based Safety Service
Uses Open-Meteo API for real weather data to calculate route safety scores
Runs on port 5002
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from weather_safety import get_route_weather_safety, calculate_weather_safety_score

app = Flask(__name__)

# Enable CORS for frontend
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/safety_score", methods=["POST"])
def safety_score():
    """
    Calculate safety score for a single location based on weather.
    
    Request JSON:
    {
      "lat": 28.7,
      "lon": 77.1
    }
    
    Response JSON:
    {
      "lat": 28.7,
      "lon": 77.1,
      "safety_score": 0.75,
      "status": "SAFE",
      "weather_type": "clear",
      "temperature": 25,
      "wind_speed": 10,
      "precipitation": 0,
      "humidity": 60
    }
    """
    try:
        data = request.get_json(force=True)
        lat = data.get("lat")
        lon = data.get("lon")
        
        if lat is None or lon is None:
            return jsonify({"error": "lat and lon are required"}), 400
        
        try:
            lat = float(lat)
            lon = float(lon)
        except ValueError:
            return jsonify({"error": "lat and lon must be numeric"}), 400
        
        # Get weather-based safety score
        safety_info = calculate_weather_safety_score(lat, lon)
        
        # Determine status
        safety_score = safety_info["safety_score"]
        if safety_score >= 0.7:
            status = "SAFE"
        elif safety_score >= 0.4:
            status = "MODERATE"
        else:
            status = "RISKY"
        
        return jsonify({
            "lat": lat,
            "lon": lon,
            "safety_score": safety_score,
            "status": status,
            "weather_type": safety_info.get("weather_type", "unknown"),
            "temperature": safety_info.get("temperature", 0),
            "wind_speed": safety_info.get("wind_speed", 0),
            "precipitation": safety_info.get("precipitation", 0),
            "humidity": safety_info.get("humidity", 0)
        })
    
    except Exception as e:
        logger.exception("Safety score calculation error")
        return jsonify({"error": str(e)}), 500

@app.route("/route_safety", methods=["POST"])
def route_safety():
    """
    Check safety of multiple points along a route using weather data.
    
    Request JSON:
    {
      "waypoints": [
        {"lat": 28.7, "lon": 77.1, "name": "Delhi"},
        {"lat": 28.8, "lon": 77.2, "name": "Noida"}
      ]
    }
    
    Response JSON:
    {
      "waypoints": [...],
      "average_safety": 0.75,
      "unsafe_areas": [...],
      "route_status": "SAFE",
      "unsafe_count": 0
    }
    """
    try:
        data = request.get_json(force=True)
        waypoints = data.get("waypoints", [])
        
        if not waypoints:
            return jsonify({"error": "waypoints array is required"}), 400
        
        # Get route safety from weather analysis
        safety_result = get_route_weather_safety(waypoints)
        
        return jsonify(safety_result)
    
    except Exception as e:
        logger.exception("Route safety check error")
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "SafeSafar Weather-based Safety Service",
        "data_source": "Open-Meteo API"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
