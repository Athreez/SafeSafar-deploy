// API URL - production backend
const API_URL = "https://safesafar-backend.onrender.com";

// Retry logic for failed requests (handles cold starts)
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 sec timeout

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export async function createTripAPI(token, tripData) {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/trips/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(tripData),
    });

    return await res.json();
  } catch (err) {
    console.error("Create trip error:", err);
    return { error: "Network error - please try again" };
  }
}

export async function getTripAPI(token, tripId) {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/trips/${tripId}`, {
      headers: {
        Authorization: token,
      },
    });

    return await res.json();
  } catch (err) {
    console.error("Get trip error:", err);
    return { error: "Network error - please try again" };
  }
}

export async function updateTripAPI(token, tripId, tripData) {
  try {
    const res = await fetchWithRetry(`${API_URL}/api/trips/${tripId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(tripData),
    });

    return await res.json();
  } catch (err) {
    console.error("Update trip error:", err);
    return { error: "Network error - please try again" };
  }
}
