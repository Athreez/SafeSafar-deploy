# SafeSafar 🚗🛡️

**A Real-Time Trip Safety Monitoring System**

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Safety Analysis](#safety-analysis)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## ⚡ Quick Start

If you've already set up the project before, here's the fast version:

```bash
# Install dependencies (first time only)
npm install
cd backend && npm install && pip install -r requirements.txt && cd ..

# Start all services in separate terminals:
# Terminal 1:
npm run dev

# Terminal 2:
cd backend && npm run dev

# Terminal 3:
cd backend && python server.py

# Open http://localhost:5173 in your browser
```

**Prerequisites:** Node.js, Python 3.10+, MongoDB running on localhost:27017, and `.env` configured in `backend/`

---

## 🎯 Overview

**SafeSafar** is a comprehensive travel safety platform that provides real-time monitoring of trips with integrated safety scoring and location tracking. Users can plan trips, track their journey in real-time, receive safety alerts, and access detailed post-trip safety analysis reports.

The system combines geolocation services, air quality monitoring, and machine learning to provide comprehensive safety insights during travel.

---

## ✨ Features

### Core Features
- **Real-Time Trip Tracking** 📍
  - Live geolocation tracking with automatic fallback
  - Location history recording
  - Interactive map with actual route display using OSRM

- **Safety Monitoring** 🛡️
  - Automatic safety checks every 10 minutes during trip
  - Real-time safety score calculation (0-100%)
  - Color-coded alerts (Green: Safe, Yellow: Moderate, Red: Unsafe)
  - Air quality index (AQI) integration

- **Trip Management** 📝
  - Create trips with multiple stops
  - Start, pause, and end trips
  - Full trip history with status tracking
  - Trip details with maps and route visualization

- **Safety Analysis Reports** 📊
  - Comprehensive post-trip safety analysis
  - Safety history timeline with timestamps
  - Average safety score calculation
  - Location-specific safety data
  - Statistics (total checks, safe/unsafe percentages)

- **Emergency Features** 🚨
  - SOS button during active trips
  - Manual safety check trigger
  - Emergency contact integration

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI library
- **Vite 5.4.21** - Build tool
- **Tailwind CSS** - Styling
- **Leaflet + react-leaflet** - Interactive maps
- **React Router** - Navigation

### Backend
- **Node.js + Express** - REST API server
- **Python 3.13** - Safety analysis and ML models
- **Flask** - Python API server
- **MongoDB** - Database

### Third-Party Services
- **OpenStreetMap** - Map tiles
- **OSRM** - Route calculation
- **Geolocation API** - Location tracking
- **WAQI API** - Air quality data
- **Google Earth Engine** - Environmental analysis

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                      │
│        Dashboard | Trip Creation | Tracking | Reports   │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼─────────┐  ┌──▼──────────────┐
│ Node.js Server  │  │ Flask Server    │
│ (Port 5000)     │  │ (Port 5002)     │
├─────────────────┤  ├─────────────────┤
│ Trip CRUD       │  │ Safety Scoring  │
│ Auth/Users      │  │ AQI Analysis    │
│ Location Mgmt   │  │ ML Models       │
│                 │  │ Environmental   │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └────────┬───────────┘
                  │
         ┌────────▼──────────┐
         │ MongoDB Database  │
         │ (Trip Data, Users)│
         └───────────────────┘
```

### Data Flow
1. User creates/starts a trip → Node.js API → MongoDB
2. During tracking: Location updates → Safety checks (Flask) → Real-time alerts
3. Trip completion: Data aggregation → Safety report generation
4. Dashboard: Retrieves trip data → Displays analytics → Shows safety history

---

## 🚀 Getting Started

### Prerequisites

Before starting, ensure you have installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org)
- **Python** (v3.10 or higher, recommended v3.13) - [Download](https://www.python.org/downloads)
- **MongoDB** (local or cloud instance) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/download/win)
- Modern web browser with Geolocation support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Athreez/SafeSafar.git
   cd SafeSafar
   ```

2. **Setup Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Setup Backend (Node.js)**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Setup Python Environment & Dependencies**
   ```bash
   # Navigate to backend folder
   cd backend
   
   # Install Python dependencies
   # The requirements.txt is compatible with Python 3.10+
   pip install -r requirements.txt
   
   cd ..
   ```

5. **Environment Configuration**
   
   Create `.env` file in the `backend/` folder:
   ```env
   # MongoDB Connection String
   MONGO_URI=mongodb://127.0.0.1:27017/safesafar
   
   # JWT Secret for authentication (use a strong random string)
   JWT_SECRET=myverysecretkey123
   
   # Optional: Web3 Configuration (for blockchain integration)
   RPC_URL=http://127.0.0.1:8545
   PRIV_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   CONTRACT_ADDR=0x5FbDB2315678afecb367f032d93F642f64180aa3
   
   # WAQI Token for Air Quality Data
   WAQI_TOKEN=your_waqi_api_token_here
   ```

   **Important:** 
   - Ensure MongoDB is running on `localhost:27017` or update `MONGO_URI` accordingly
   - Get WAQI token from [WAQI.info](https://waqi.info/api/)

### Running the Application

You need **3 separate terminal windows** to run all services:

**Terminal 1 - Frontend (Vite Dev Server)**
```bash
npm run dev
```
Access at: `http://localhost:5173`

**Terminal 2 - Node.js Backend (Express API)**
```bash
cd backend
npm run dev
```
Runs on: `http://localhost:5000`

**Terminal 3 - Python Backend (Flask API)**
```bash
cd backend
python server.py
```
Runs on: `http://localhost:5002`

> **Note:** Make sure MongoDB is running before starting the Node.js backend. If using local MongoDB, it typically runs on port 27017.

---

## 📁 Project Structure

```
safesafar/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CreateTrip.jsx
│   │   ├── TripTracking.jsx
│   │   └── TripMap.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── SafetyChecker.jsx
│   │   ├── SafetyAnalysisReport.jsx
│   │   ├── Toast.jsx
│   │   └── ProtectedRoute.jsx
│   ├── api/
│   │   └── trips.js
│   ├── App.jsx
│   └── main.jsx
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── trip.js
│   │   └── itinerary.js
│   ├── models/
│   │   ├── User.js
│   │   └── Trip.js
│   ├── services/
│   │   └── safety.py
│   ├── server.js
│   ├── server.py
│   └── requirements.txt
├── public/
├── package.json
├── vite.config.mjs
├── tailwind.config.cjs
└── README.md
```

---

## 🔌 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Trips
- `GET /api/trips/my` - Get user's trips
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips` - Create new trip
- `PATCH /api/trips/:id/activate` - Start trip tracking
- `PATCH /api/trips/:id/complete` - End trip and save data
- `DELETE /api/trips/:id` - Delete trip

### Safety
- `POST /safety_score` - Calculate safety score for location
  - Input: `{lat: number, lon: number}`
  - Output: `{safety_score: 0-1, aqi: number, details: object}`

---

## 📊 Safety Analysis

### Safety Score Calculation

The safety score is determined by:
1. **Air Quality Index (AQI)** - 40% weight
   - Excellent: 100%
   - Good: 90%
   - Moderate: 70%
   - Unhealthy: 40%
   - Hazardous: 20%

2. **Crime Data** - 30% weight
   - Historical crime rates by location
   - Recent incidents in area

3. **Environmental Factors** - 20% weight
   - Weather conditions
   - Road safety ratings

4. **Time of Day** - 10% weight
   - Night travel risk adjustment
   - Peak hours analysis

### Alerts
- **🟢 Green (75-100%)** - Safe, continue journey
- **🟡 Yellow (50-74%)** - Moderate risk, be cautious
- **🔴 Red (<50%)** - High risk, consider alternate route

---

## ⚙️ Configuration

### Safety Check Interval
- Default: 10 minutes during active trip
- Located in: `src/pages/TripTracking.jsx` (line ~227)
- Adjustable via state management

### Map Settings
- Default zoom: 13
- Tile provider: OpenStreetMap
- Route calculation: OSRM (open-source)
- Fallback: Straight-line route if service unavailable

### Geolocation
- Timeout: 3 seconds
- Accuracy: Standard (no high accuracy for battery saving)
- Fallback: Trip start location with random offset

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow ESLint configuration
- Use meaningful commit messages
- Test features before submitting PR
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- **GitHub Issues**: [SafeSafar Issues](https://github.com/Athreez/SafeSafar/issues)
- **Email**: safesafar@example.com

---

## 🙏 Acknowledgments

- OpenStreetMap for map data
- OSRM for routing services
- WAQI for air quality data
- Leaflet.js for mapping library
- React community for excellent tools and libraries

---

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced ML models for predictive safety
- [ ] Integration with emergency services
- [ ] Multi-language support
- [ ] Dark mode support
- [ ] Offline trip recording
- [ ] Group trip features

---

**SafeSafar** - Making Travel Safer, One Trip at a Time 🚗✨
