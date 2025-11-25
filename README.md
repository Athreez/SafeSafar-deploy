# SafeSafar 🚗🛡️

**A Real-Time Trip Safety Monitoring System with Blockchain Integration**

---

## 📋 Table of Contents

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
- [Blockchain Integration](#blockchain-integration)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**SafeSafar** is a comprehensive travel safety platform that provides real-time monitoring of trips with integrated safety scoring, location tracking, and blockchain-based trip verification. Users can plan trips, track their journey in real-time, receive safety alerts, and access detailed post-trip safety analysis reports.

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

- **Blockchain Integration** ⛓️
  - Trip activation recorded on blockchain
  - Trip completion with safety data stored on-chain
  - Transaction hashes for audit trails
  - Smart contract-based trip registry

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
- **Hardhat** - Blockchain development

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
│ Blockchain API  │  │ ML Models       │
│ Location Mgmt   │  │ Environmental   │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └────────┬───────────┘
                  │
         ┌────────▼──────────┐
         │ MongoDB Database  │
         │ (Trip Data, Users)│
         └───────────────────┘
         
         ┌─────────────────────┐
         │ Blockchain (Hardhat)│
         │ Smart Contracts     │
         └─────────────────────┘
```

### Data Flow
1. User creates/starts a trip → Node.js API → MongoDB
2. During tracking: Location updates → Safety checks (Flask) → Real-time alerts
3. Trip completion: Data aggregation → Safety report generation → Blockchain recording
4. Dashboard: Retrieves trip data → Displays analytics → Shows safety history

---

## 🚀 Getting Started

### Prerequisites

Before starting, ensure you have:
- **Node.js** (v16 or higher)
- **Python** (v3.10 or higher)
- **MongoDB** (local or cloud instance)
- **Git**
- Modern web browser with Geolocation support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Athreez/SafeSafar.git
   cd SafeSafar
   ```

2. **Setup Frontend**
   ```bash
   npm install
   ```

3. **Setup Backend (Node.js)**
   ```bash
   cd backend
   npm install
   ```

4. **Setup Python Environment**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # Linux/macOS
   pip install -r backend/requirements.txt
   ```

5. **Environment Configuration**
   
   Create `.env` file in root directory:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SAFETY_API_URL=http://localhost:5002
   MONGODB_URI=mongodb://localhost:27017/safesafar
   JWT_SECRET=your_jwt_secret_key
   WAQI_API_KEY=your_waqi_api_key
   ```

### Running the Application

**Terminal 1 - Frontend (Vite Dev Server)**
```bash
npm run dev
```
Runs on: `http://localhost:5173`

**Terminal 2 - Node.js Backend**
```bash
cd backend
npm start
```
Runs on: `http://localhost:5000`

**Terminal 3 - Python Flask Server**
```bash
cd backend
python server.py
```
Runs on: `http://localhost:5002`

**Terminal 4 - Blockchain (Hardhat)**
```bash
cd backend
npx hardhat node
```
Runs on: `http://localhost:8545`

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
│   │   ├── blockchain.js
│   │   └── safety.py
│   ├── contracts/
│   │   └── TripRegistry.sol
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

### Blockchain
- Trip activation recorded automatically on contract
- Trip completion stored with safety metrics
- Transaction hashes tracked in trip document

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

## ⛓️ Blockchain Integration

### Smart Contracts
- **TripRegistry.sol** - Main contract managing trip lifecycle

### Trip Lifecycle on Blockchain
1. **Trip Activation**
   - Trip status changed to ACTIVE
   - Transaction recorded on blockchain
   - Hash stored in database

2. **Trip Completion**
   - Final safety score recorded
   - Location history snapshot stored
   - Trip marked COMPLETED on-chain
   - Transaction hash serves as immutable proof

### Benefits
- Audit trail for safety claims
- Immutable trip records
- Verification of data integrity
- Regulatory compliance support

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
