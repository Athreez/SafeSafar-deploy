# How to Enable Real Air Quality Data

## Current Status
✅ Weather data: LIVE & WORKING
⏳ Air quality data: Framework ready, graceful fallback active

## Three Ways to Add AQI Data

---

## Option 1: WAQI (World Air Quality Index) - FREE & RECOMMENDED

### Step 1: Get Free API Key
1. Visit: https://aqicn.org/data-platform/free/
2. Click "Sign up for free account"
3. Confirm email
4. Get your API key (looks like: `1234567890abcdef`)

### Step 2: Update air_quality.py

Replace the `get_aqi_estimate()` function with:

```python
def get_aqi_estimate(lat, lon):
    """
    Get AQI data from WAQI (World Air Quality Index)
    """
    try:
        # Add your API key here
        waqi_api_key = "YOUR_API_KEY_HERE"
        
        url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={waqi_api_key}"
        
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        if data.get("status") == "ok":
            result = data.get("data", {})
            
            # Parse measurements
            measurements = []
            iaqi = result.get("iaqi", {})
            
            if "pm25" in iaqi:
                measurements.append({
                    "parameter": "pm25",
                    "lastValue": iaqi["pm25"]["v"]
                })
            
            if "pm10" in iaqi:
                measurements.append({
                    "parameter": "pm10",
                    "lastValue": iaqi["pm10"]["v"]
                })
            
            if "no2" in iaqi:
                measurements.append({
                    "parameter": "no2",
                    "lastValue": iaqi["no2"]["v"]
                })
            
            return {
                "location_name": result.get("city", {}).get("name", "Unknown"),
                "lat": lat,
                "lon": lon,
                "measurements": measurements,
                "last_updated": result.get("time", {}).get("iso", "Unknown"),
                "data_available": True,
                "aqi": result.get("aqi", 0)
            }
        else:
            return {
                "error": "WAQI API error",
                "data_available": False
            }
    
    except Exception as e:
        print(f"WAQI API error: {e}")
        return {
            "error": str(e),
            "data_available": False
        }
```

### Step 3: Update get_air_quality_data()

```python
def get_air_quality_data(lat, lon):
    """Get air quality data - now with WAQI support"""
    return get_aqi_estimate(lat, lon)
```

### Step 4: Restart Flask
```powershell
# Kill existing server (Ctrl+C)
# Then restart:
cd "D:\5th_sem\New folder\mini\backend"
python server.py
```

---

## Option 2: OpenWeatherMap Pollution API

### Pros:
- Integrated with weather (single API call)
- Satellite imagery for PM2.5

### Cons:
- Requires paid account (~$25/month)

### Setup:
1. Register: https://openweathermap.org/api/air-pollution
2. Get API key
3. Call endpoint: `http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={key}`

---

## Option 3: NASA SEDAC Air Quality Data

### Pros:
- Free, from NASA
- Historical data available

### Cons:
- Lower resolution
- Slower updates

### Setup:
1. Register: https://sedac.ciesin.columbia.edu/
2. Download regional AQI grids
3. Load into Python at startup
4. Query via spatial indexing

---

## Testing Your Integration

### Test Script
```python
from air_quality import get_location_air_quality_score

result = get_location_air_quality_score(28.7041, 77.1025)

print("Data Available:", result['data_available'])
print("Warnings:", result['warnings'])
print("Pollutants:", result['pollutants'])
print("Safety Reduction:", result['safety_reduction'])
```

### Expected Output (with real data)
```
Data Available: True
Warnings: ['Moderate PM2.5: 85.3 μg/m³']
Pollutants: {'pm25': {'value': 85.3, 'aqi': 82, 'category': 'moderate'}}
Safety Reduction: 0.1
```

---

## Monitoring

Add this to your Flask logs to track AQI queries:

```python
# In server.py
@app.route("/route_safety", methods=["POST"])
def route_safety():
    try:
        data = request.get_json(force=True)
        waypoints = data.get("waypoints", [])
        
        logger.info(f"Processing {len(waypoints)} waypoints")
        
        for wp in waypoints:
            logger.debug(f"  - {wp.get('name', 'Unknown')}: ({wp['lat']}, {wp['lon']})")
        
        # ... rest of function
```

---

## Environment Variables (Optional)

Create `.env` in backend directory:

```
WAQI_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
AQI_UPDATE_INTERVAL=1800  # 30 minutes
```

Then load in Python:

```python
import os
from dotenv import load_dotenv

load_dotenv()
WAQI_API_KEY = os.getenv("WAQI_API_KEY")
```

---

## Troubleshooting

### AQI shows "data_available: false"

**Cause**: API endpoint failing
**Solution**: 
1. Check internet connection
2. Verify API key is correct
3. Check if location has nearby station
4. Review API rate limits

### Safety score always 1.0

**Cause**: Air quality returns 0 reduction
**Solution**:
1. Check if `data_available` is True
2. Verify measurements array is populated
3. Check pollutant values are being extracted

### API Rate Limiting

**Limit**: Most free APIs allow 50-1000 requests/day
**Solution**: Implement caching

```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_aq_score(lat_round, lon_round):
    lat = lat_round / 100
    lon = lon_round / 100
    return get_location_air_quality_score(lat, lon)
```

---

## Recommended: WAQI Integration

**Why WAQI?**
- ✅ Free tier available
- ✅ Global coverage (>15,000 stations)
- ✅ Real-time data
- ✅ Detailed pollutants (PM2.5, PM10, NO2, O3, etc.)
- ✅ Easy API

**Implementation Time**: ~30 minutes
**API Key Setup**: ~5 minutes
**Cost**: FREE for first 3000 requests/month

---

## Quick Start (Copy-Paste Ready)

1. Get key from: https://aqicn.org/data-platform/free/

2. Replace in `air_quality.py`:
```python
WAQI_API_KEY = "YOUR_KEY_HERE"  # Add this at top

def get_aqi_estimate(lat, lon):
    try:
        url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={WAQI_API_KEY}"
        response = requests.get(url, timeout=5)
        data = response.json()
        
        if data.get("status") == "ok":
            iaqi = data["data"].get("iaqi", {})
            measurements = []
            
            for param in ["pm25", "pm10", "no2", "o3"]:
                if param in iaqi:
                    measurements.append({
                        "parameter": param,
                        "lastValue": iaqi[param]["v"]
                    })
            
            return {
                "location_name": data["data"].get("city", {}).get("name", "Unknown"),
                "lat": lat,
                "lon": lon,
                "measurements": measurements,
                "last_updated": data["data"].get("time", {}).get("iso", ""),
                "data_available": True
            }
        
        return {"error": "No data", "data_available": False}
    
    except Exception as e:
        return {"error": str(e), "data_available": False}
```

3. Restart Flask - Done! ✅

---

For detailed WAQI docs: https://aqicn.org/json-api/
