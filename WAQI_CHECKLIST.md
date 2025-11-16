# WAQI Integration - Quick Checklist ✅

## Pre-Activation (Right Now)

- [x] Code updated with WAQI API integration
- [x] Graceful fallback implemented
- [x] Error handling complete
- [x] All files tested and validated
- [x] No syntax errors
- [x] Documentation complete
- [x] Test script provided
- [x] Examples provided

**Status:** Ready for token activation ✅

---

## Activation (10 Minutes)

### 1. Get WAQI Token (5 min)
- [ ] Go to https://aqicn.org/data-platform/token/
- [ ] Click "Sign Up"
- [ ] Enter email, password, name
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] Log in to dashboard
- [ ] Copy your API token
- [ ] Keep it safe (it's like a password)

### 2. Add Token to .env (1 min)
- [ ] Open `backend/.env` in editor
- [ ] Find: `WAQI_TOKEN=YOUR_WAQI_API_TOKEN_HERE`
- [ ] Replace with: `WAQI_TOKEN=your_actual_token_here`
- [ ] Save file (Ctrl+S)
- [ ] Do NOT add quotes around token

### 3. Restart Flask (1 min)
- [ ] Open terminal in `backend/` folder
- [ ] Stop Flask if running (Ctrl+C)
- [ ] Run: `python server.py`
- [ ] Wait for: "Running on http://0.0.0.0:5002"

### 4. Test Integration (2 min)
- [ ] Open new terminal in project root
- [ ] Run: `python test_waqi.py`
- [ ] See test output (should show locations and AQI values)

### 5. Test in App (1 min)
- [ ] Open browser to http://localhost:5173
- [ ] Create new trip or open existing
- [ ] Click "Check Safety"
- [ ] Should see AQI data instead of "N/A"

---

## Post-Activation Verification

### In SafetyChecker Component
- [ ] Location names show (e.g., "New Delhi")
- [ ] AQI value displays (e.g., "287")
- [ ] Pollutant values shown (PM2.5, PM10, NO2, O3, SO2, CO)
- [ ] Air quality warnings appear if pollution high
- [ ] Safety score affected by air quality

### In TripMap Component
- [ ] Markers color-coded by safety (Green/Yellow/Red)
- [ ] Marker popups show location name
- [ ] Marker popups show AQI value
- [ ] Marker popups show air quality warnings

### In API Response
- [ ] `/api/trips/:id/check-safety` returns AQI data
- [ ] Each waypoint has `air_quality` object
- [ ] `data_available: true` (was false before)
- [ ] `measurements` array has pollutant data
- [ ] `warnings` array shows health warnings

---

## Troubleshooting

### Problem: Still seeing "N/A" for AQI

**Check List:**
- [ ] WAQI token copied correctly?
- [ ] No quotes in `.env`? (WAQI_TOKEN=abc ✅, not WAQI_TOKEN="abc" ❌)
- [ ] Flask server restarted after adding token?
- [ ] Check Flask logs for error messages
- [ ] Test token manually: `curl https://api.waqi.info/feed/geo:28.7041;77.1025/?token=YOUR_TOKEN`

### Problem: "Invalid key" error

**Solution:**
- [ ] Go back to https://aqicn.org/data-platform/token/
- [ ] Double-check the token you copied
- [ ] Try copying again and updating .env
- [ ] Restart Flask

### Problem: API timeout errors

**Reason:** WAQI server might be slow or API limit hit
**Solution:**
- [ ] System will use graceful fallback (works fine)
- [ ] Wait a minute and try again
- [ ] Check internet connection
- [ ] Check WAQI status: https://aqicn.org/

### Problem: Quota exceeded (401 error)

**Reason:** Used more than 3,000 requests/month
**Solution:**
- [ ] Check usage: https://aqicn.org/data-platform/
- [ ] Wait until next month, or
- [ ] Upgrade to paid plan, or
- [ ] Implement caching to reduce API calls

---

## Files to Review

1. **For Setup:** `WAQI_SETUP.md`
2. **For Quick Start:** `WAQI_QUICKSTART.md`
3. **For API Details:** `WAQI_RESPONSE_EXAMPLES.md`
4. **For Code Details:** `WAQI_TECHNICAL_REFERENCE.md`
5. **For Testing:** `test_waqi.py`

---

## Support

| Issue | Where to Get Help |
|-------|-------------------|
| WAQI token setup | https://aqicn.org/data-platform/ |
| API documentation | https://aqicn.org/json-api/ |
| Troubleshooting | See `WAQI_SETUP.md` troubleshooting section |
| Code issues | Check `WAQI_TECHNICAL_REFERENCE.md` |
| Test failures | Run `python test_waqi.py` and check output |

---

## Free Tier Limits

- **Monthly Requests:** 3,000
- **Daily Usage:** ~100 requests/day (stays under limit)
- **Per Trip:** 3 API calls (3 waypoints)
- **Estimated Routes:** 1,000 routes/month safely

**You won't hit the limit unless you:**
- Create 100+ routes per day, or
- Test API 50+ times in one sitting

---

## Important Notes

⚠️ **DO NOT:**
- Share your WAQI token publicly
- Commit token to GitHub
- Send token in messages/emails

✅ **DO:**
- Keep token in `.env` (git-ignored)
- Treat it like a password
- Regenerate if accidentally exposed

---

## Success Indicators

You know it's working when:

✅ `WAQI_TOKEN` in `.env` (without "YOUR_WAQI...")
✅ Flask server logs show successful API calls
✅ `test_waqi.py` shows real AQI values
✅ SafetyChecker displays AQI data
✅ TripMap shows colored markers based on air quality
✅ API response includes `air_quality` object with `data_available: true`

---

## Timeline

- **Now:** Code ready ✅
- **5 min:** Get token
- **1 min:** Add to .env
- **1 min:** Restart Flask
- **2 min:** Test
- **Total:** ~10 minutes to full activation

---

## What's Next After Activation?

Once WAQI is working:

1. **Create Test Trip** (30 seconds)
   - Add 2-3 waypoints in polluted area
   - Click "Check Safety"
   - Should see real AQI data

2. **Create Normal Trip** (1 minute)
   - Add waypoints
   - See safety scores with AQI impact
   - Share with others

3. **Optional Enhancements** (future)
   - Add caching for better performance
   - Add historical AQI trends
   - Add health recommendations
   - Add alternative route suggestions

---

## Verification Script

Run this to verify everything is working:

```powershell
# 1. Check .env has token
Get-Content "backend\.env" | Select-String "WAQI_TOKEN"

# 2. Test air_quality module
cd backend
python -c "from air_quality import get_air_quality_data; result = get_air_quality_data(28.7041, 77.1025); print('Data Available:', result.get('data_available'))"

# 3. Run full test suite
cd ..
python test_waqi.py

# 4. Test API endpoint (Flask must be running)
curl -X POST http://localhost:5002/safety_score -H "Content-Type: application/json" -d "{\"lat\": 28.7041, \"lon\": 77.1025}"
```

---

**Ready to get real air quality data? Start with step 1 above!** 🚀
