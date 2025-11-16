# WAQI Integration - Quick Reference Card

## 🚀 3-Step Activation

```
STEP 1: Get Token (5 min)          STEP 2: Add to .env (1 min)      STEP 3: Restart & Test (3 min)
┌──────────────────────────┐       ┌──────────────────────────┐     ┌──────────────────────────┐
│ Visit:                   │       │ Edit: backend/.env       │     │ Stop Flask (Ctrl+C)      │
│ https://aqicn.org/       │       │                          │     │ Run: python server.py    │
│ data-platform/token/     │       │ Change:                  │     │ Then: python test_waqi.py
│                          │       │ WAQI_TOKEN=YOUR_WAQI...  │     │                          │
│ 1. Sign Up              │       │ To:                      │     │ If test shows real data: │
│ 2. Verify Email         │       │ WAQI_TOKEN=abc123def456  │     │ ✅ SUCCESS!              │
│ 3. Copy Token           │       │                          │     │                          │
│ 4. Done!                │       │ Then save (Ctrl+S)       │     │ If shows "unavailable":  │
└──────────────────────────┘       └──────────────────────────┘     │ 🔄 Retry restart        │
                                                                     └──────────────────────────┘
```

## 📊 Safety Score Calculation

```
WEATHER DATA                    AIR QUALITY DATA              COMBINED SCORE
(Open-Meteo API)               (WAQI API)
┌──────────────────┐           ┌──────────────────┐          ┌──────────────────┐
│ • Temperature    │           │ • PM2.5          │          │ Base: 1.0        │
│ • Wind           │           │ • PM10           │    →     │ - Weather Impact │
│ • Precipitation  │           │ • NO2            │          │ - AQI Impact     │
│ • Humidity       │           │ • O3             │   ═════> │ = Safety Score   │
└──────────────────┘           │ • SO2            │          │   (0.0 to 1.0)   │
                               │ • CO             │          │                  │
                               │ • Warnings       │          │ Status:          │
                               └──────────────────┘          │ 🟢 Safe: ≥0.7    │
                                                             │ 🟡 Moderate: 0.4 │
                                                             │ 🔴 Risky: <0.4   │
                                                             └──────────────────┘
```

## 📁 Key Files

| File | Purpose | Status |
|------|---------|--------|
| `backend/air_quality.py` | WAQI API calls | ✅ Ready |
| `backend/server.py` | Flask API service | ✅ Ready |
| `backend/.env` | Token storage | ⏳ Needs token |
| `test_waqi.py` | Automated testing | ✅ Ready |
| `WAQI_QUICKSTART.md` | 3-step guide | 📖 Read first |
| `WAQI_CHECKLIST.md` | Detailed steps | 📖 Follow this |

## 🎯 What Gets Displayed

### In SafetyChecker Component
```
Route Safety Analysis
━━━━━━━━━━━━━━━━━━━━
Waypoint 1: New Delhi
  Safety Score: 0.45 (45%)
  Status: 🟡 MODERATE
  
  Weather:
  • Type: Clear
  • Temp: 16.8°C
  • Wind: 4.1 km/h
  
  Air Quality: ⬆️ AVAILABLE
  • AQI: 287 (Hazardous)
  • PM2.5: 156 µg/m³ ⚠️
  • PM10: 285 µg/m³ ⚠️
  
  Warnings:
  ⚠️ Very high PM2.5: Avoid exposure
  ⚠️ High PM10: Air hazardous
```

### On TripMap Markers
```
Marker Color Legend:
🟢 Green = SAFE (score ≥ 0.7)
🟡 Yellow = MODERATE (0.4-0.7)
🔴 Red = RISKY (< 0.4)

Popup on Click:
┌─────────────────────────────┐
│ New Delhi                   │
│ Safety: 45%                 │
│ AQI: 287 (Hazardous)        │
│ PM2.5: 156 µg/m³ ⚠️         │
│ Warnings: Very high PM2.5   │
└─────────────────────────────┘
```

## 🔄 Data Flow

```
React Frontend (SafetyChecker.jsx)
         │
         │ Click "Check Safety"
         ↓
Node.js Backend (port 5000)
/api/trips/:id/check-safety
         │
         │ POST waypoints
         ↓
Flask Service (port 5002)
/route_safety endpoint
         │
         ├─ Calls weather_safety.py
         │  ├─ Calls Open-Meteo API (weather)
         │  └─ Calls air_quality.py
         │     └─ Calls WAQI API (AQI)
         │
         ↓
Returns safety data with AQI
         │
         ↓
SafetyChecker displays data
TripMap colors markers
```

## 💾 Environment Variable

```env
# In: backend/.env

Before:
WAQI_TOKEN=YOUR_WAQI_API_TOKEN_HERE

After (with real token):
WAQI_TOKEN=abcd1234efgh5678ijkl90mnopqrst
```

## ✅ Verification Commands

```powershell
# 1. Check token is set
Get-Content backend\.env | Select-String "WAQI_TOKEN"

# 2. Test air_quality module
cd backend
python -c "from air_quality import get_air_quality_data; print(get_air_quality_data(28.7041, 77.1025))"

# 3. Run full test suite
cd ..
python test_waqi.py

# 4. Test Flask endpoint (Flask must be running)
curl -X POST http://localhost:5002/route_safety `
  -H "Content-Type: application/json" `
  -d '{"waypoints": [{"lat": 28.7041, "lon": 77.1025, "name": "Delhi"}]}'
```

## ⚡ Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| Still shows "N/A" | ❶ Restart Flask ❷ Check token correct ❸ No quotes in .env |
| "Invalid key" error | ❶ Copy token again ❷ No typos ❸ Visit WAQI to get new token |
| No AQI data | ❶ Token in .env? ❷ Not placeholder? ❸ Flask restarted? |
| API timeout | Normal - graceful fallback works, try again |
| Still broken? | Run: python test_waqi.py to get diagnostics |

## 📈 Free Tier Details

```
Monthly Quota: 3,000 requests
Per Location: 1 request
Per Route: ~3 requests (3 waypoints)
Max Routes/Month: ~1,000

Safe Usage Pattern:
• 10 routes/day = 30 calls/day
• Safe for 100 routes/month
• Plenty headroom in free tier ✅
```

## 🎓 Learning Path

```
New to WAQI?
    ↓
1. Read: WAQI_QUICKSTART.md (2 min)
    ↓
2. Follow: WAQI_CHECKLIST.md (10 min)
    ↓
3. Run: python test_waqi.py (2 min)
    ↓
4. Test in app: Create trip, "Check Safety" (1 min)
    ↓
✅ DONE! Using real AQI data

Want deep dive?
    ↓
5. Read: WAQI_SETUP.md (detailed)
6. Study: WAQI_TECHNICAL_REFERENCE.md (code)
7. Reference: WAQI_RESPONSE_EXAMPLES.md (API format)
```

## 🔐 Security Checklist

- [ ] WAQI token is NOT in public GitHub
- [ ] Token is only in .env (git-ignored)
- [ ] Token not shared in messages
- [ ] Token treated like password
- [ ] Use git to verify .env in .gitignore

## 🎯 Success Criteria

You know it's working when:

✅ Token added to `.env` (real token, not placeholder)
✅ Flask running without errors
✅ `python test_waqi.py` shows location names and AQI values
✅ Creating trip shows AQI data in SafetyChecker
✅ Map markers are color-coded by air quality
✅ Warnings appear for poor air quality
✅ No errors in browser console

## 📞 Need Help?

| Question | Answer |
|----------|--------|
| How to get token? | https://aqicn.org/data-platform/token/ |
| Token format? | `WAQI_TOKEN=abc123def456` (no quotes) |
| Still not working? | Run `python test_waqi.py` for diagnostics |
| API documentation? | https://aqicn.org/json-api/ |
| Wrong token format? | See `WAQI_TOKEN_GUIDE.md` |

## ⏱️ Timeline

```
Right now:      Code ready ✅
Action needed:  Get WAQI token (5 min)
Action needed:  Add to .env (1 min)
Action needed:  Restart Flask (1 min)
After test:     Live in app! ✅

Total time: ~10 minutes
```

---

**Ready? Start with WAQI_QUICKSTART.md or WAQI_CHECKLIST.md!** 🚀
