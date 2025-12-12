import { API_CONFIG } from "../config/apiConfig";

export async function createTripAPI(token, tripData) {
  try {
    const res = await fetch(API_CONFIG.TRIPS.CREATE, {
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
    return { error: "Network error" };
  }
}
