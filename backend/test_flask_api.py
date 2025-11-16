#!/usr/bin/env python3
"""Test Flask API endpoints with WAQI integration"""

import requests
import json

BASE_URL = "http://localhost:5002"

print('='*70)
print('Testing Flask API with Real WAQI AQI Data')
print('='*70)

# Test 1: Single location safety score
print('\n1. Testing /safety_score endpoint...')
try:
    response = requests.post(
        f"{BASE_URL}/safety_score",
        json={"lat": 28.7041, "lon": 77.1025}
    )
    data = response.json()
    print('Status Code:', response.status_code)
    print('Response:')
    print(json.dumps(data, indent=2))
except Exception as e:
    print('Error:', str(e))

# Test 2: Route safety (multiple waypoints)
print('\n' + '='*70)
print('2. Testing /route_safety endpoint...')
try:
    waypoints = [
        {"lat": 28.7041, "lon": 77.1025, "name": "New Delhi"},
        {"lat": 28.4595, "lon": 77.0266, "name": "Gurgaon"},
        {"lat": 28.5921, "lon": 77.0489, "name": "Noida"}
    ]
    
    response = requests.post(
        f"{BASE_URL}/route_safety",
        json={"waypoints": waypoints}
    )
    data = response.json()
    print('Status Code:', response.status_code)
    print('Average Safety:', data.get('average_safety'))
    print('Route Status:', data.get('route_status'))
    
    print('\nWaypoint Details:')
    for i, wp in enumerate(data.get('waypoints', []), 1):
        print(f'\n  {i}. {wp.get("name")}')
        print(f'     Safety Score: {wp.get("safety_score")}')
        print(f'     Status: {wp.get("status")}')
        
        aq = wp.get('air_quality', {})
        if aq.get('available'):
            print(f'     AQI: {aq.get("aqi")}')
            if aq.get('warnings'):
                print(f'     Warnings: {len(aq.get("warnings"))} warning(s)')
                for warn in aq.get('warnings', []):
                    print(f'       - {warn}')
        
except Exception as e:
    print('Error:', str(e))

# Test 3: Health check
print('\n' + '='*70)
print('3. Testing /health endpoint...')
try:
    response = requests.get(f"{BASE_URL}/health")
    data = response.json()
    print('Status Code:', response.status_code)
    print('Response:')
    print(json.dumps(data, indent=2))
except Exception as e:
    print('Error:', str(e))

print('\n' + '='*70)
print('✅ API Testing Complete!')
print('='*70)
