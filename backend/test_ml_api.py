#!/usr/bin/env python3
"""
Test script for the ML API endpoints
Tests both /safety_score and /route_safety endpoints
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5001"

def test_safety_score():
    """Test single location safety score"""
    print("=" * 60)
    print("Testing /safety_score endpoint")
    print("=" * 60)
    
    payload = {
        "lat": 28.7041,  # Delhi
        "lon": 77.1025,
        "w_landslide": 0.5,
        "w_flood": 0.5
    }
    
    try:
        response = requests.post(f"{BASE_URL}/safety_score", json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print()
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_route_safety():
    """Test route safety with multiple waypoints"""
    print("=" * 60)
    print("Testing /route_safety endpoint")
    print("=" * 60)
    
    payload = {
        "waypoints": [
            {"lat": 28.7041, "lon": 77.1025},  # Delhi
            {"lat": 28.7500, "lon": 77.1200},  # Nearby location
            {"lat": 28.8000, "lon": 77.1500},  # Another location
            {"lat": 28.6500, "lon": 77.0800}   # Different area
        ]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/route_safety", json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print()
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_health():
    """Test health endpoint"""
    print("=" * 60)
    print("Testing /health endpoint")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print()
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("\nML API Testing Suite")
    print("Make sure the Flask server is running on port 5001\n")
    
    # Test health first
    health_ok = test_health()
    
    if not health_ok:
        print("Server is not responding. Make sure to start it with:")
        print("  python server.py")
        sys.exit(1)
    
    # Test endpoints
    test1_ok = test_safety_score()
    test2_ok = test_route_safety()
    
    # Summary
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"Health Check: {'✓ PASS' if health_ok else '✗ FAIL'}")
    print(f"Safety Score: {'✓ PASS' if test1_ok else '✗ FAIL'}")
    print(f"Route Safety: {'✓ PASS' if test2_ok else '✗ FAIL'}")
    print()
    
    if all([health_ok, test1_ok, test2_ok]):
        print("All tests passed! ✓")
        sys.exit(0)
    else:
        print("Some tests failed.")
        sys.exit(1)
