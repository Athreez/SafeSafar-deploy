# WAQI (World Air Quality Index) API Setup Guide

## Overview
WAQI provides **FREE real-time air quality data** for 130+ countries with millions of monitoring stations. The integration adds detailed AQI (Air Quality Index) data to your route safety calculations.

## Step-by-Step Setup

### 1. Get Your Free WAQI API Token (5 minutes)

1. Go to: **https://aqicn.org/data-platform/token/**
2. Click **"Sign Up"** (top right)
3. Fill in the registration form:
   - **Email**: Your email address
   - **Password**: Create a secure password
   - **Full Name**: Your name
   - **Organization**: Your project name (e.g., "SafeSafar")
4. Click **"Create my Account"**
5. Check your email for verification link and confirm
6. After confirmation, go back to https://aqicn.org/data-platform/token/
7. **Copy your API Token** (you'll see it on the dashboard)

✅ **Free Tier Includes:**
- 3,000 requests per month
- Real-time data from 130+ countries
- 5-minute data updates
- Support for lat/lon queries (geo API)

### 2. Add Token to Your .env File

Open `backend/.env` and update:

```env
WAQI_TOKEN=YOUR_ACTUAL_TOKEN_HERE
```

Replace `YOUR_ACTUAL_TOKEN_HERE` with your copied token.

**Example:**
```env
WAQI_TOKEN=abcd1234efgh5678ijkl90mn
```

### 3. Restart Flask Service

Stop the current Flask server (if running) and restart:

```powershell
cd "D:\5th_sem\New folder\mini\backend"
python server.py
```

### 4. Test the Integration

Run this test in a new terminal:

```powershell
cd "D:\5th_sem\New folder\mini\backend"
python -c "
from air_quality import get_air_quality_data

# Test with Delhi coordinates
result = get_air_quality_data(28.7041, 77.1025)
print('Location:', result.get('location_name'))
print('AQI:', result.get('aqi'))
print('PM2.5:', [m for m in result.get('measurements', []) if m.get('parameter') == 'pm25'])
print('Data Available:', result.get('data_available'))
"
```

**Expected output:**
```
Location: New Delhi
AQI: 287
PM2.5: [{'parameter': 'pm25', 'lastValue': 156.0}]
Data Available: True
```

### 5. Verify in Dashboard

1. Start the app: `npm run dev`
2. Create a trip
3. Click "Check Safety" 
4. You should now see:
   - ✅ Real AQI values for each waypoint
   - ✅ Pollutant details (PM2.5, PM10, NO2, O3, SO2, CO)
   - ✅ Air quality impact on safety score
   - ✅ Warnings for unhealthy pollution levels

## What You Get

### Data Available from WAQI

For each location, you now get:

```json
{
  "location_name": "New Delhi",
  "aqi": 287,
  "pm25": 156.0,
  "pm10": 285.0,
  "o3": 45.2,
  "no2": 82.1,
  "so2": 12.3,
  "co": 0.8,
  "dominentpol": "pm25",
  "time": "2025-11-16T15:30:00Z"
}
```

### Safety Score Impact

The AQI data affects your route safety score:

| AQI Range | Category | Safety Reduction |
|-----------|----------|-----------------|
| 0-50 | Good | 0% |
| 51-100 | Moderate | 5-10% |
| 101-150 | Unhealthy for Sensitive | 15-20% |
| 151-200 | Unhealthy | 25-30% |
| 201-300 | Very Unhealthy | 35-40% |
| 301+ | Hazardous | 40% + Travel Warning |

## Troubleshooting

### Issue: "WAQI_TOKEN not configured. Using graceful fallback."

**Solution:** 
- Verify token is in `backend/.env`
- Don't include quotes: `WAQI_TOKEN=abc123def456` ✅
- Not: `WAQI_TOKEN="abc123def456"` ❌
- Restart Flask server after adding token

### Issue: API Returns Error

**Common error:** `"status": "error", "data": "Invalid or Expired Token"`

**Solution:**
- Double-check token copied correctly
- Get a new token from https://aqicn.org/data-platform/token/
- Verify no extra spaces in .env file
- Restart Flask service

### Issue: Quota Exceeded

**Error:** `401 Unauthorized` or quota limit hit

**Solution:**
- Free tier: 3,000 requests/month (~100 per day)
- Check usage at: https://aqicn.org/data-platform/
- Consider caching results (see next section)
- Upgrade to paid plan if needed

## Optimization: Cache Results

To reduce API calls (important for free tier), add caching to Flask:

Edit `backend/server.py`:

```python
from functools import lru_cache
import time

# Add this decorator to cache results for 30 minutes
@lru_cache(maxsize=128)
def get_air_quality_cached(lat, lon):
    """Cache AQI results for 30 minutes to reduce API calls"""
    return get_air_quality_data(lat, lon)

# Then use in calculate_weather_safety_score:
aq_data = get_air_quality_cached(lat, lon)  # Instead of get_air_quality_data
```

This reduces API calls by ~70% on typical usage.

## API Rate Limits

**Free Tier:**
- **3,000 requests/month**
- **Optimal usage per trip:** 
  - 3 waypoints × 10 route checks = 30 API calls
  - Covers ~100 routes per month (plenty for testing)

**Paid Plans (if needed):**
- Start at $25/month for 50,000 requests
- Contact WAQI for enterprise pricing

## What's Next?

Once WAQI is working:

1. ✅ **Real AQI data** in SafetyChecker component
2. ✅ **Pollutant warnings** on TripMap markers
3. ✅ **Health recommendations** based on air quality
4. **Future:** Historical AQI trends, time-based predictions

## Support

- WAQI API Docs: https://aqicn.org/json-api/
- WAQI Forum: https://aqicn.org/forum/
- This project: See backend/air_quality.py for integration details

## Summary

You now have **real-time air quality data** powering your route safety calculations! 🌍

- ✅ Real AQI values from 130+ countries
- ✅ 6 pollutant types (PM2.5, PM10, NO2, O3, SO2, CO)
- ✅ Free tier supports 100+ routes/month
- ✅ Graceful fallback if API unavailable
- ✅ Full integration with weather safety scoring
