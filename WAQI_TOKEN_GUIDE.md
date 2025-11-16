# WAQI Token Setup - Common Mistakes & Solutions

## ✅ Correct Format

### In .env File
```env
WAQI_TOKEN=abcd1234efgh5678ijkl90mn
```

**Key Points:**
- ✅ No quotes
- ✅ No extra spaces
- ✅ Token directly after equals sign
- ✅ One token per line
- ✅ No semicolons or colons

---

## ❌ COMMON MISTAKES

### Mistake 1: Quotes Around Token
```env
WAQI_TOKEN="abcd1234efgh5678ijkl90mn"  ❌ WRONG
WAQI_TOKEN='abcd1234efgh5678ijkl90mn'  ❌ WRONG
WAQI_TOKEN=abcd1234efgh5678ijkl90mn    ✅ CORRECT
```

**What Happens:**
- Python reads the token AS: `"abcd1234efgh5678ijkl90mn"`
- WAQI API sees: `"abcd1234efgh5678ijkl90mn"` with quotes
- API returns: `401 Invalid key`

**Fix:** Remove quotes

### Mistake 2: Extra Spaces
```env
WAQI_TOKEN= abcd1234efgh5678ijkl90mn  ❌ WRONG (space after =)
WAQI_TOKEN=abcd1234efgh5678ijkl90mn   ✅ CORRECT
WAQI_TOKEN=abcd1234efgh5678ijkl90mn  ❌ WRONG (trailing space)
```

**What Happens:**
- Python reads: ` abcd1234efgh5678ijkl90mn` with leading space
- API sees invalid token with extra characters

**Fix:** Remove all extra spaces

### Mistake 3: Case Sensitivity
```env
WAQI_token=abc123  ❌ WRONG (lowercase 'token')
waqi_token=abc123  ❌ WRONG (all lowercase)
WAQI_TOKEN=abc123  ✅ CORRECT (exactly as shown)
```

**What Happens:**
- Python looks for `WAQI_TOKEN` (uppercase)
- Can't find `waqi_token` or `WAQI_token`
- Returns empty string

**Fix:** Use exact case `WAQI_TOKEN`

### Mistake 4: Using Placeholder Token
```env
WAQI_TOKEN=YOUR_WAQI_API_TOKEN_HERE  ❌ This is still placeholder!
WAQI_TOKEN=your_actual_token_abc123  ✅ Use real token
```

**What Happens:**
- System checks if token == "YOUR_WAQI_API_TOKEN_HERE"
- If yes, uses graceful fallback (no AQI data)

**Fix:** Replace entire placeholder with real token

### Mistake 5: Forgetting to Restart Flask
```
1. You add token to .env
2. Flask is already running
3. Flask doesn't reload .env
4. Still no AQI data
```

**Fix:** Stop Flask (Ctrl+C) and run `python server.py` again

### Mistake 6: Copying Wrong Characters
```env
WAQI_TOKEN=abcd1234efgh567B ijkl90mn  ❌ Capital 'B' instead of '8'
WAQI_TOKEN=abcd1234efgh5678ijkl90mn   ✅ All correct characters
```

**What Happens:**
- Single wrong character invalidates entire token
- API returns: `401 Invalid key`

**Fix:** 
- Copy slowly and carefully
- Or copy-paste from WAQI website directly
- Verify in browser before pasting

---

## 🔍 How to Find Your Real Token

### Step 1: Go to WAQI Platform
Visit: https://aqicn.org/data-platform/token/

### Step 2: Log In
- Email: Your email
- Password: Your password

### Step 3: Find Your Token
Look for section that says:
```
Your API token:
abcd1234efgh5678ijkl90mn
```

### Step 4: Copy It
- Click copy button, or
- Triple-click to select all
- Ctrl+C to copy

### Step 5: Paste in .env
```env
WAQI_TOKEN=abcd1234efgh5678ijkl90mn
```

---

## ✅ Verification Steps

### Step 1: Check .env Content
```powershell
Get-Content backend\.env | Select-String "WAQI_TOKEN"
```

**Expected Output:**
```
WAQI_TOKEN=abcd1234efgh5678ijkl90mn
```

**NOT Expected:**
```
WAQI_TOKEN=YOUR_WAQI_API_TOKEN_HERE
WAQI_TOKEN="abcd1234efgh5678ijkl90mn"
WAQI_TOKEN= abcd1234efgh5678ijkl90mn
waqi_token=abcd1234efgh5678ijkl90mn
```

### Step 2: Test Python Can Load It
```powershell
cd backend
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('Token:', os.getenv('WAQI_TOKEN'))"
```

**Expected Output:**
```
Token: abcd1234efgh5678ijkl90mn
```

**NOT Expected:**
```
Token: YOUR_WAQI_API_TOKEN_HERE  (means you didn't replace placeholder)
Token: None  (means variable name wrong)
Token: "abcd1234efgh5678ijkl90mn"  (means quotes are in the string)
```

### Step 3: Test WAQI API Directly
```powershell
curl "https://api.waqi.info/feed/geo:28.7041;77.1025/?token=abcd1234efgh5678ijkl90mn"
```

**Expected Response:**
```json
{
  "status": "ok",
  "data": {
    "aqi": 287,
    "city": {"name": "New Delhi", ...},
    ...
  }
}
```

**NOT Expected:**
```json
{
  "status": "error",
  "data": "Invalid key"
}
```

### Step 4: Restart Flask
```powershell
# Stop old Flask (if running)
# Ctrl+C in Flask terminal

# Restart
cd backend
python server.py
```

**Expected Log Output:**
```
 * Running on http://0.0.0.0:5002
```

### Step 5: Test Flask
```bash
python test_waqi.py
```

**Expected Output:** Real location names and AQI values

---

## 🛠️ Troubleshooting Decision Tree

```
Does test_waqi.py show real AQI data?
│
├─ YES → ✅ GOOD! Skip to testing in app
│
└─ NO → Continue below...

Is WAQI_TOKEN in .env?
│
├─ NO → Add it: WAQI_TOKEN=your_token
├─ YES but is placeholder → Replace with real token
└─ YES, looks correct → Continue below...

Did you restart Flask after adding token?
│
├─ NO → Restart: Stop (Ctrl+C), run python server.py
│
└─ YES → Continue below...

Check token for these mistakes:
├─ Has quotes? ❌ Remove: "abc123" → abc123
├─ Has spaces? ❌ Remove: " abc123 " → abc123
├─ Wrong case? ❌ Fix: waqi_TOKEN → WAQI_TOKEN
├─ Typos? ❌ Copy again from WAQI website
└─ Expired? → Get new token from WAQI

Still not working?
│
├─ Check Flask error logs
├─ Verify internet connection
├─ Test WAQI API with curl
└─ Post question with your error message
```

---

## 🚨 ERROR MESSAGES & FIXES

### Error: `WAQI_TOKEN not configured`
```
Means: Token is placeholder or missing
Fix:   Replace WAQI_TOKEN value in .env with real token
```

### Error: `Invalid or Expired Token`
```
Means: Token exists but is wrong/expired
Fix:   Get new token from https://aqicn.org/data-platform/token/
```

### Error: `Connection timeout`
```
Means: WAQI servers slow or offline
Fix:   Wait a moment and retry (graceful fallback works)
```

### Error: `401 Unauthorized`
```
Means: Token format invalid
Fix:   Check for: quotes, spaces, typos, wrong case
```

### Error: `Air quality data unavailable`
```
Means: Graceful fallback active (no real token)
Fix:   Add real WAQI token to .env and restart Flask
```

---

## 💡 Pro Tips

### Tip 1: Keep Token Secret
```
DON'T share in:
- GitHub/public repos
- Chat/Slack messages
- Email
- Code comments

DO keep in:
- .env file only
- .gitignore (usually default)
```

### Tip 2: Multiple Tokens
If you have multiple WAQI accounts:
```env
WAQI_TOKEN=token_for_main_account
# WAQI_TOKEN_BACKUP=token_for_secondary
```

### Tip 3: Test Before Deploy
Always test locally:
```bash
python test_waqi.py  # Should show real data
```

### Tip 4: Check Quota
Monitor your API usage:
Visit: https://aqicn.org/data-platform/
Look for: "API calls this month"

### Tip 5: Graceful Fallback Works
Even if token fails, app continues to work:
- Weather data still loads
- Safety score still calculates
- Just without AQI impact (graceful)

---

## 📋 Final Checklist Before Using

- [ ] WAQI account created
- [ ] Token copied correctly
- [ ] Pasted in backend/.env
- [ ] No quotes around token
- [ ] No extra spaces
- [ ] Exactly: `WAQI_TOKEN=abc123...`
- [ ] Flask restarted after adding token
- [ ] test_waqi.py shows real data
- [ ] App creates trips successfully
- [ ] "Check Safety" shows AQI data

---

## 🎯 Quick Copy-Paste Template

Just replace `YOUR_TOKEN_HERE` with your actual token:

```env
# Get your token from: https://aqicn.org/data-platform/token/
WAQI_TOKEN=YOUR_TOKEN_HERE
```

After copying your token, it should look like:
```env
WAQI_TOKEN=abcd1234efgh5678ijkl90mnopqrst
```

---

**Once you get this right, everything works automatically!** ✅
