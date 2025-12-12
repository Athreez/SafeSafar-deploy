/**
 * API Configuration
 * Uses environment variables for different environments (dev/prod)
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SAFETY_API_URL = import.meta.env.VITE_SAFETY_API_URL || "http://localhost:5002";

export const API_CONFIG = {
  API_URL,
  SAFETY_API_URL,
  
  // Auth endpoints
  AUTH: {
    SIGNUP: `${API_URL}/api/auth/signup`,
    LOGIN: `${API_URL}/api/auth/login`,
    ME: `${API_URL}/api/auth/me`,
  },
  
  // Trip endpoints
  TRIPS: {
    CREATE: `${API_URL}/api/trips/create`,
    GET_ALL: `${API_URL}/api/trips/my`,
    GET_ONE: (id) => `${API_URL}/api/trips/${id}`,
    ACTIVATE: (id) => `${API_URL}/api/trips/${id}/activate`,
    COMPLETE: (id) => `${API_URL}/api/trips/${id}/complete`,
  },
  
  // Safety endpoints
  SAFETY: {
    SCORE: `${SAFETY_API_URL}/safety_score`,
  },
  
  // Itinerary endpoints
  ITINERARY: {
    GENERATE: `${API_URL}/api/itinerary/generate`,
  },
};

export default API_CONFIG;
