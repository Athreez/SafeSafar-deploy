# SafeSafar Deployment Guide

This guide covers deploying SafeSafar using **Vercel** (Frontend), **Render** (Backend), and **MongoDB Atlas** (Database).

---

## 📋 Prerequisites

1. **GitHub Account** - Repo must be on GitHub
2. **Vercel Account** - Free at https://vercel.com
3. **Render Account** - Free at https://render.com
4. **MongoDB Atlas Account** - Free tier at https://www.mongodb.com/cloud/atlas
5. **WAQI API Token** - Get from https://waqi.info/api/

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create Free Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Click "Create Database"
4. Select **Free Tier**
5. Choose region closest to you
6. Click "Create"

### 1.2 Create Database User
1. In Atlas dashboard, go to **Database Access**
2. Click **Add New Database User**
3. Enter username: `safesafar_user`
4. Set strong password (save it!)
5. Click **Add User**

### 1.3 Whitelist IP Address
1. Go to **Network Access**
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (or add specific IPs)
4. Click **Confirm**

### 1.4 Get Connection String
1. Go back to **Databases**
2. Click **Connect** on your cluster
3. Select **Drivers**
4. Copy the connection string
5. Replace `<password>` with your user password
6. Replace `myFirstDatabase` with `safesafar`

**Example:**
```
mongodb+srv://safesafar_user:YOUR_PASSWORD@cluster.mongodb.net/safesafar?retryWrites=true&w=majority
```

---

## 🚀 Step 2: Deploy Backend on Render

### 2.1 Deploy Node.js Backend (Port 5000)

1. Go to https://render.com
2. Sign up with GitHub
3. Click **New** → **Web Service**
4. Connect your GitHub repo
5. Fill in:
   - **Name:** `safesafar-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run dev` (or `node server.js`)
   - **Plan:** Free

6. Click **Advanced**
7. Add **Environment Variables:**
   ```
   MONGO_URI=mongodb+srv://safesafar_user:PASSWORD@cluster.mongodb.net/safesafar
   JWT_SECRET=your_secure_random_secret_here
   WAQI_TOKEN=your_waqi_token
   NODE_ENV=production
   ```

8. Click **Create Web Service**
9. Wait for deployment (3-5 minutes)
10. Copy the service URL (e.g., `https://safesafar-backend.onrender.com`)

### 2.2 Deploy Python Backend (Port 5002)

1. In Render, click **New** → **Web Service**
2. Connect your repo again
3. Fill in:
   - **Name:** `safesafar-python`
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python server.py`
   - **Plan:** Free

4. Click **Advanced**
5. Add **Environment Variables:**
   ```
   WAQI_TOKEN=your_waqi_token
   MONGO_URI=mongodb+srv://safesafar_user:PASSWORD@cluster.mongodb.net/safesafar
   ```

6. Click **Create Web Service**
7. Wait for deployment
8. Copy the service URL (e.g., `https://safesafar-python.onrender.com`)

---

## 🎨 Step 3: Deploy Frontend on Vercel

### 3.1 Connect Repository

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **New Project**
4. Select your SafeSafar repo
5. Click **Import**

### 3.2 Configure Project

1. **Framework:** Vite
2. **Root Directory:** `.`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`

### 3.3 Set Environment Variables

Click **Environment Variables** and add:

```
VITE_API_URL=https://safesafar-backend.onrender.com
VITE_SAFETY_API_URL=https://safesafar-python.onrender.com
```

(Use the actual URLs from your Render services)

### 3.4 Deploy

Click **Deploy** and wait for completion (2-3 minutes)

Your app will be available at: `https://yourproject.vercel.app`

---

## ✅ Testing Deployment

### Test Backend APIs:
```bash
# Test Node.js backend
curl https://safesafar-backend.onrender.com/api/auth/me

# Test Python backend
curl https://safesafar-python.onrender.com/safety_score -X POST -H "Content-Type: application/json" -d '{"lat": 28.7, "lon": 77.1}'
```

### Test Frontend:
1. Open `https://yourproject.vercel.app`
2. Try to sign up / log in
3. Create a trip and test the tracking

---

## 🔄 Updating Deployed Code

After making changes:

```bash
# Commit and push to GitHub
git add .
git commit -m "Your changes"
git push

# Vercel deploys automatically
# Render needs to be manually triggered OR setup auto-deploy from GitHub
```

### Enable Auto-Deploy on Render:
1. Go to your Render service
2. Settings → **Git Auto-Deploy**
3. Select **main** branch
4. Enable auto-deploy

---

## 🐛 Troubleshooting

### Frontend can't connect to backend:
- Check environment variables on Vercel
- Verify Render service URLs are correct
- Check CORS settings in `backend/server.js`

### MongoDB connection fails:
- Verify IP whitelist in MongoDB Atlas
- Check username and password
- Ensure database name is correct

### Render app keeps restarting:
- Check logs: Click service → **Logs**
- Check environment variables are set
- Verify build and start commands

---

## 📚 Documentation Links

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [WAQI API Docs](https://waqi.info/api)

---

## 🎉 You're Live!

Your SafeSafar app is now running on:
- **Frontend:** https://yourproject.vercel.app
- **Node Backend:** https://safesafar-backend.onrender.com
- **Python Backend:** https://safesafar-python.onrender.com
- **Database:** MongoDB Atlas Cloud
