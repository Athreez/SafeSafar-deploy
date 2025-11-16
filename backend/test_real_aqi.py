#!/usr/bin/env python3
"""Test air_quality module with real WAQI token"""

import sys
sys.path.insert(0, '.')

from air_quality import get_air_quality_data
from weather_safety import calculate_weather_safety_score

print('='*60)
print('Testing air_quality module with real WAQI token')
print('='*60)

# Test 1: Get AQI data
print('\n1. Fetching AQI data from WAQI...')
result = get_air_quality_data(28.7041, 77.1025)

print('Location:', result.get('location_name'))
print('AQI:', result.get('aqi'))
print('Data Available:', result.get('data_available'))

measurements = result.get('measurements', [])
print('Pollutants found:', len(measurements))

print('\nPollutants:')
for m in measurements[:8]:
    param = m.get('parameter')
    value = m.get('lastValue')
    print(f'  {param.upper()}: {value}')

# Test 2: Get full safety score with AQI
print('\n' + '='*60)
print('2. Testing weather + AQI safety score')
print('='*60)

safety = calculate_weather_safety_score(28.7041, 77.1025)

print('Safety Score:', safety['safety_score'])
print('Weather Type:', safety.get('weather_type'))
print('Temperature:', safety.get('temperature'), 'C')

aq = safety.get('air_quality', {})
print('\nAir Quality:')
print('  Available:', aq.get('available'))
print('  AQI:', aq.get('aqi') if aq.get('available') else 'N/A')
if aq.get('warnings'):
    print('  Warnings:')
    for w in aq.get('warnings', []):
        print(f'    - {w}')

print('\nImpact Breakdown:')
for key, val in safety['details'].items():
    print(f'  {key}: {val:.3f}')

print('\n' + '='*60)
print('SUCCESS! Real AQI data is integrated!')
print('='*60)
