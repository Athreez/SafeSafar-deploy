# WAQI API Response Examples

## Example 1: Real WAQI Response (with token)

When you add your WAQI token and call `get_air_quality_data(28.7041, 77.1025)` for Delhi:

```json
{
  "location_name": "New Delhi",
  "lat": 28.7041,
  "lon": 77.1025,
  "measurements": [
    {
      "parameter": "aqi",
      "lastValue": 287
    },
    {
      "parameter": "pm25",
      "lastValue": 156.0
    },
    {
      "parameter": "pm10",
      "lastValue": 285.0
    },
    {
      "parameter": "o3",
      "lastValue": 45.2
    },
    {
      "parameter": "no2",
      "lastValue": 82.1
    },
    {
      "parameter": "so2",
      "lastValue": 12.3
    },
    {
      "parameter": "co",
      "lastValue": 0.8
    }
  ],
  "last_updated": "2025-11-16T15:30:00Z",
  "data_available": true,
  "aqi": 287,
  "dominentpol": "pm25",
  "time": "2025-11-16T15:30:00Z"
}
```

## Example 2: Safety Score with AQI Data

When integrated into `calculate_weather_safety_score()`:

```json
{
  "safety_score": 0.45,
  "weather_type": "clear",
  "temperature": 17.1,
  "wind_speed": 4.1,
  "precipitation": 0.0,
  "humidity": 77,
  "air_quality": {
    "available": true,
    "warnings": [
      "Very high PM2.5: 156.0 μg/m³",
      "High PM10: 285.0 μg/m³"
    ],
    "pollutants": {
      "pm25": {
        "value": 156.0,
        "aqi": 196,
        "category": "unhealthy"
      },
      "pm10": {
        "value": 285.0
      },
      "no2": {
        "value": 82.1
      },
      "o3": {
        "value": 45.2
      },
      "so2": {
        "value": 12.3
      },
      "co": {
        "value": 0.8
      }
    },
    "location": "New Delhi"
  },
  "details": {
    "weather_impact": 0.0,
    "wind_impact": 0.0,
    "precipitation_impact": 0.0,
    "humidity_impact": 0.0,
    "temperature_impact": 0.0,
    "air_quality_impact": 0.3
  }
}
```

### Interpretation:
- **Safety Score: 0.45** → 🟡 MODERATE (decreased from 1.0 due to AQI)
- **Weather Impact: 0%** → Clear, calm conditions
- **Air Quality Impact: 30%** → Very unhealthy PM2.5/PM10 reduces safety by 30%
- **Status: MODERATE** → Can travel but health impact likely

---

## Example 3: Fallback Response (No Token)

When `WAQI_TOKEN` is not configured or unavailable:

```json
{
  "location_name": "Unknown Station",
  "lat": 28.7041,
  "lon": 77.1025,
  "measurements": [],
  "last_updated": "2025-11-16T15:30:00Z",
  "data_available": false,
  "message": "WAQI data unavailable"
}
```

The system **gracefully continues** with weather-only scoring:
- Safety Score based on weather only (temperature, wind, rain, humidity)
- No air quality impact
- System remains fully functional

---

## Example 4: Route Safety Response (with AQI)

API endpoint: `POST /route_safety`

**Request:**
```json
{
  "waypoints": [
    {"lat": 28.7041, "lon": 77.1025, "name": "New Delhi"},
    {"lat": 28.4595, "lon": 77.0266, "name": "Gurgaon"},
    {"lat": 28.5921, "lon": 77.0489, "name": "Noida"}
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
      "name": "New Delhi",
      "safety_score": 0.45,
      "status": "MODERATE",
      "weather_type": "clear",
      "temperature": 17.1,
      "air_quality": {
        "available": true,
        "warnings": [
          "Very high PM2.5: 156.0 μg/m³"
        ],
        "aqi": 287
      }
    },
    {
      "lat": 28.4595,
      "lon": 77.0266,
      "name": "Gurgaon",
      "safety_score": 0.52,
      "status": "MODERATE",
      "weather_type": "clear",
      "temperature": 18.5,
      "air_quality": {
        "available": true,
        "warnings": [
          "High PM2.5: 128.0 μg/m³"
        ],
        "aqi": 243
      }
    },
    {
      "lat": 28.5921,
      "lon": 77.0489,
      "name": "Noida",
      "safety_score": 0.48,
      "status": "MODERATE",
      "weather_type": "clear",
      "temperature": 17.8,
      "air_quality": {
        "available": true,
        "warnings": [
          "Very high PM2.5: 142.0 μg/m³"
        ],
        "aqi": 267
      }
    }
  ],
  "average_safety": 0.48,
  "route_status": "MODERATE",
  "unsafe_count": 0,
  "unsafe_areas": []
}
```

---

## Example 5: Good Air Quality Response

When air quality is good (e.g., London):

```json
{
  "location_name": "London",
  "lat": 51.5074,
  "lon": -0.1278,
  "measurements": [
    {"parameter": "aqi", "lastValue": 42},
    {"parameter": "pm25", "lastValue": 8.0},
    {"parameter": "pm10", "lastValue": 12.0},
    {"parameter": "o3", "lastValue": 35.0},
    {"parameter": "no2", "lastValue": 15.3}
  ],
  "data_available": true,
  "aqi": 42,
  "dominentpol": "pm10"
}
```

**Safety Score Impact:**
- PM2.5 (8.0 μg/m³) → Good → No reduction
- No warnings
- Full safety score maintained
- Status: 🟢 SAFE

---

## Example 6: Error Responses

### Invalid Token:
```json
{
  "location_name": "Unknown Station",
  "lat": 28.7041,
  "lon": 77.1025,
  "measurements": [],
  "data_available": false,
  "message": "WAQI data unavailable"
}
```

### Network Timeout:
```json
{
  "location_name": "Unknown Station",
  "lat": 28.7041,
  "lon": 77.1025,
  "measurements": [],
  "data_available": false,
  "message": "WAQI data unavailable"
}
```

**In both cases:** System falls back gracefully, continues with weather-only scoring ✅

---

## AQI Categories and Impact

| AQI Score | Category | PM2.5 Range | Health Impact | Safety Reduction |
|-----------|----------|-------------|---------------|-----------------|
| 0-50 | Good | 0-12 | No health effects | 0% |
| 51-100 | Moderate | 12.1-35.4 | Slight effects on sensitive | 5-10% |
| 101-150 | Unhealthy for Sensitive | 35.5-55.4 | Health effects on sensitive groups | 15-20% |
| 151-200 | Unhealthy | 55.5-150.4 | Health effects on general population | 25-30% |
| 201-300 | Very Unhealthy | 150.5-250.4 | Major health effects | 35-40% |
| 301+ | Hazardous | 250.5+ | Serious health effects | 40%+ ⚠️ |

---

## API Rate Limits

**Free Tier:**
- 3,000 requests/month
- 100 requests/day recommended for stable usage
- 5-minute data cache on WAQI servers

**Calculation:**
- 3 waypoints per trip = 3 API calls
- 10 routes/day = 30 API calls/day
- Fits comfortably in free tier ✅

---

## Testing Endpoints

Once deployed, test these endpoints:

### Test Single Location Safety:
```bash
curl -X POST http://localhost:5002/safety_score \
  -H "Content-Type: application/json" \
  -d '{"lat": 28.7041, "lon": 77.1025}'
```

### Test Route Safety:
```bash
curl -X POST http://localhost:5002/route_safety \
  -H "Content-Type: application/json" \
  -d '{
    "waypoints": [
      {"lat": 28.7041, "lon": 77.1025, "name": "Delhi"},
      {"lat": 28.5921, "lon": 77.0489, "name": "Noida"}
    ]
  }'
```

### Test Health:
```bash
curl http://localhost:5002/health
```

---

## Notes

- All timestamps are ISO 8601 format
- Coordinates are in decimal degrees (WGS84)
- Pollutant values are typically in μg/m³ or ppb depending on pollutant
- WAQI updates data every 5 minutes from monitoring stations
- Results cached locally in Flask to reduce API calls
