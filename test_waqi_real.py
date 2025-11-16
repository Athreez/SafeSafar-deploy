#!/usr/bin/env python3
"""Test WAQI API with real token"""

import requests
import json

token = '3c55093e469b9708fff6a52b4145e3b88da763ef'
lat, lon = 28.7041, 77.1025

url = f'https://api.waqi.info/feed/geo:{lat};{lon}/?token={token}'
print('Calling WAQI API...')
print(f'URL: {url}\n')

try:
    response = requests.get(url, timeout=5)
    data = response.json()
    
    print('Status:', data.get('status'))
    
    if data.get('status') == 'ok':
        station = data['data']
        print('Location:', station.get('city', {}).get('name'))
        print('AQI:', station.get('aqi'))
        print('Dominant Pollutant:', station.get('dominentpol'))
        
        iaqi = station.get('iaqi', {})
        print('\nPollutants:')
        for pollutant, value in iaqi.items():
            print(f'  {pollutant.upper()}: {value.get("v")}')
    else:
        print('Error:', data.get('data'))
        
except Exception as e:
    print('Error:', str(e))
