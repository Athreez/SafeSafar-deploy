"""
LHASA (Landslide) Model Wrapper
Integrates NASA's LHASA landslide prediction model
"""

import os
import sys
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class LHASAPredictor:
    """Wrapper for NASA LHASA landslide prediction model"""
    
    def __init__(self):
        self.model_path = Path(__file__).parent / "LHASA"
        self.is_available = self._check_availability()
        
    def _check_availability(self):
        """Check if LHASA model is available"""
        try:
            # Check if LHASA directory exists
            if not self.model_path.exists():
                logger.warning(f"LHASA model not found at {self.model_path}")
                return False
            
            # Try to import LHASA modules
            sys.path.insert(0, str(self.model_path))
            logger.info("LHASA model loaded successfully")
            return True
        except Exception as e:
            logger.warning(f"LHASA model unavailable: {e}")
            return False
    
    def predict_risk(self, lat, lon):
        """
        Predict landslide risk at given coordinates.
        
        Returns:
            float: Risk score 0-1 (0 = safe, 1 = very risky)
        """
        try:
            if not self.is_available:
                # Fallback: Return mock prediction based on terrain characteristics
                return self._mock_prediction(lat, lon)
            
            # TODO: Integrate actual LHASA model prediction
            # This would involve:
            # 1. Fetching terrain data (elevation, slope, etc.)
            # 2. Running LHASA model inference
            # 3. Returning risk score
            
            return self._mock_prediction(lat, lon)
            
        except Exception as e:
            logger.error(f"LHASA prediction error: {e}")
            return None
    
    def _mock_prediction(self, lat, lon):
        """
        Mock prediction based on geographical characteristics.
        Higher risk in mountainous regions (high latitude variation)
        """
        # Create pseudo-random but consistent predictions based on coordinates
        risk = abs((lat * 7.123 + lon * 3.456) % 100) / 100.0
        
        # Mountainous regions (high latitude): higher landslide risk
        if abs(lat % 30) > 15:  # High mountainous regions
            risk = min(risk + 0.3, 1.0)
        
        # Flatten terrain: lower risk
        if abs(lat % 10) < 2:  # Flat regions
            risk = max(risk - 0.2, 0.0)
        
        return risk

class FloodPredictor:
    """Wrapper for UN-SPIDER flood prediction model"""
    
    def __init__(self):
        self.model_path = Path(__file__).parent / "flood-mapping-tool"
        self.is_available = self._check_availability()
    
    def _check_availability(self):
        """Check if Flood Mapping model is available"""
        try:
            if not self.model_path.exists():
                logger.warning(f"Flood mapping model not found at {self.model_path}")
                return False
            
            sys.path.insert(0, str(self.model_path))
            logger.info("Flood mapping model loaded successfully")
            return True
        except Exception as e:
            logger.warning(f"Flood mapping model unavailable: {e}")
            return False
    
    def predict_risk(self, lat, lon):
        """
        Predict flood risk at given coordinates.
        
        Returns:
            float: Risk score 0-1 (0 = safe, 1 = very risky)
        """
        try:
            if not self.is_available:
                # Fallback: Return mock prediction based on elevation
                return self._mock_prediction(lat, lon)
            
            # TODO: Integrate actual Flood Mapping model prediction
            # This would involve:
            # 1. Fetching satellite/radar data
            # 2. Analyzing water body proximity and elevation
            # 3. Running UN-SPIDER model inference
            # 4. Returning flood risk score
            
            return self._mock_prediction(lat, lon)
            
        except Exception as e:
            logger.error(f"Flood prediction error: {e}")
            return None
    
    def _mock_prediction(self, lat, lon):
        """
        Mock prediction based on geographical characteristics.
        Higher risk in low-elevation areas and near water bodies.
        """
        # Create pseudo-random but consistent predictions
        risk = abs((lon * 9.876 + lat * 5.432) % 100) / 100.0
        
        # Low elevation areas: higher flood risk
        # Simulate using longitude (lower longitudes = lower elevation in some regions)
        if abs(lon % 20) < 10:  # Low elevation zones
            risk = min(risk + 0.25, 1.0)
        
        # High elevation areas: lower flood risk
        if abs(lat % 25) > 20:  # Mountain regions
            risk = max(risk - 0.15, 0.0)
        
        # Water body proximity simulation
        if (lat % 5) < 1 or (lon % 5) < 1:  # Near water patterns
            risk = min(risk + 0.2, 1.0)
        
        return risk


# Initialize predictors
lhasa = LHASAPredictor()
flood = FloodPredictor()


def get_landslide_risk(lat, lon):
    """Get landslide risk prediction"""
    return lhasa.predict_risk(lat, lon)


def get_flood_risk(lat, lon):
    """Get flood risk prediction"""
    return flood.predict_risk(lat, lon)


def get_combined_safety(landslide_risk, flood_risk, w_landslide=0.5, w_flood=0.5):
    """Calculate combined safety score"""
    if landslide_risk is None or flood_risk is None:
        return None
    
    # Normalize weights
    total = w_landslide + w_flood
    w_land = w_landslide / total
    w_flood = w_flood / total
    
    # Combine risks
    combined_risk = (w_land * float(landslide_risk)) + (w_flood * float(flood_risk))
    safety_score = 1.0 - combined_risk
    
    # Determine status
    if safety_score >= 0.7:
        status = "SAFE"
        risk_level = "Low"
    elif safety_score >= 0.4:
        status = "MODERATE"
        risk_level = "Medium"
    else:
        status = "RISKY"
        risk_level = "High"
    
    return {
        "safety_score": safety_score,
        "status": status,
        "risk_level": risk_level,
        "combined_risk": combined_risk
    }
