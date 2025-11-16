# Weather-Based Safety API Implementation

## Overview
The SafeSafar safety service now uses real weather data from the **Open-Meteo API** to calculate route safety scores.

## How It Works

### Data Source
- **Open-Meteo API** - Free, no authentication required
- Provides real-time weather data including:
  - Temperature
  - Wind speed
  - Precipitation
  - Humidity
  - Weather conditions (clear, rain, snow, thunderstorm, etc.)

### Safety Score Calculation
The safety score is calculated as a value from 0.1 to 1.0 based on:

1. **Weather Conditions (40% weight)**
   - Clear: Safe (0% reduction)
   - Cloudy: +5% reduction
   - Foggy: +15% reduction
   - Rain: +25% reduction
   - Heavy rain/snow showers: +50% reduction
   - Thunderstorm: +70% reduction

2. **Wind Speed (30% weight)**
   - Safe: 0-20 km/h (0% reduction)
   - Moderate: 20-40 km/h (15% reduction)
   - Risky: 40+ km/h (30% reduction)

3. **Precipitation (20% weight)**
   - Safe: 0-2mm (0% reduction)
   - Moderate: 2-5mm (15% reduction)
   - Risky: 5mm+ (30% reduction)

4. **Humidity (5% weight)**
   - Very high (>95%): -10% (poor visibility/fog)

5. **Temperature Extremes (5% weight)**
   - Extreme cold (<-10°C) or heat (>45°C): -10%
   - Moderate extremes: -5%

### Status Classification
- **SAFE**: Safety score ≥ 0.7 (✅)
- **MODERATE**: Safety score 0.4-0.7 (⚠️)
- **RISKY**: Safety score < 0.4 (🚨)

## API Endpoints

### 1. `/safety_score` (POST)
Get safety score for a single location.

**Request:**
```json
{
  "lat": 28.7041,
  "lon": 77.1025
}
```

**Response:**
```json
{
  "lat": 28.7041,
  "lon": 77.1025,
  "safety_score": 1.0,
  "status": "SAFE",
  "weather_type": "clear",
  "temperature": 17.3,
  "wind_speed": 4.1,
  "precipitation": 0,
  "humidity": 77
}
```

### 2. `/route_safety` (POST)
Get safety analysis for entire route.

**Request:**
```json
{
  "waypoints": [
    {"lat": 28.7041, "lon": 77.1025, "name": "Delhi"},
    {"lat": 19.0760, "lon": 72.8777, "name": "Mumbai"}
  ]
}
```

**Response:**
```json
{
  "waypoints": [
    {
      "lat": 28.7041,
      "lon": 77.1025,
      "safety_score": 1.0,
      "status": "SAFE",
      "weather_type": "clear",
      "temperature": 17.3,
      "wind_speed": 4.1,
      "precipitation": 0.0,
      "humidity": 77
    },
    {
      "lat": 19.0760,
      "lon": 72.8777,
      "safety_score": 1.0,
      "status": "SAFE",
      "weather_type": "clear",
      "temperature": 27.3,
      "wind_speed": 15.8,
      "precipitation": 0.0,
      "humidity": 69
    }
  ],
  "average_safety": 1.0,
  "unsafe_areas": [],
  "route_status": "SAFE",
  "unsafe_count": 0
}
```

### 3. `/health` (GET)
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "SafeSafar Weather-based Safety Service",
  "data_source": "Open-Meteo API"
}
```

## Files Created

1. **`backend/weather_safety.py`**
   - Main module for weather data fetching and safety calculations
   - Functions:
     - `get_weather_data(lat, lon)` - Fetch current weather
     - `calculate_weather_safety_score(lat, lon)` - Calculate single location score
     - `get_route_weather_safety(waypoints)` - Analyze entire route
     - `interpret_weather_code(code)` - Convert WMO codes to weather types

2. **`backend/server.py`** (Updated)
   - Flask API server on port 5002
   - Uses weather_safety module instead of ML models

## Running the Service

```powershell
cd "D:\5th_sem\New folder\mini\backend"
python server.py
```

The service will start on `http://localhost:5002`

## Integration with Frontend

The SafetyChecker component already calls `/api/trips/:id/check-safety` which:
1. Collects trip waypoints
2. Sends to Node backend
3. Node backend calls Flask service on port 5002
4. Returns safety data with location names merged in
5. Frontend displays with color-coded markers on map

## Real-World Example

**Test Query:**
```
Delhi → Mumbai route
```

**Result:**
- Delhi: Clear weather, 17.3°C, 4.1 km/h wind → **SAFE** (1.0)
- Mumbai: Clear weather, 27.3°C, 15.8 km/h wind → **SAFE** (1.0)
- Route Status: **SAFE** ✅

## Advantages

✅ **Real Weather Data** - Uses current/forecast weather from Open-Meteo
✅ **No Authentication** - Free API, no keys needed
✅ **Global Coverage** - Works worldwide
✅ **Fast** - API response time ~500ms per location
✅ **Simple** - No complex model setup required
✅ **Maintainable** - Easy to adjust safety thresholds
✅ **Transparent** - Users can see exact weather conditions affecting safety

## Future Enhancements

- Add historical weather patterns for specific routes
- Integrate traffic data for congestion safety scores
- Add road conditions (wet, icy, etc.)
- Include time-of-day visibility factors
- Add emergency service proximity data
