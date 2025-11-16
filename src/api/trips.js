export async function createTripAPI(token, tripData) {
  try {
    const res = await fetch("http://localhost:5000/api/trips/create", {
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
