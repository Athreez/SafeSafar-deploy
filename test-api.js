// Simple API test script
const testSignup = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        phone: "1234567890",
        emergency: "9876543210",
        password: "password123",
      }),
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response:", data);

    if (response.ok) {
      console.log("✅ Signup successful!");
    } else {
      console.log("❌ Signup failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

const testLogin = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response:", data);

    if (response.ok) {
      console.log("✅ Login successful!");
    } else {
      console.log("❌ Login failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

console.log("Testing Signup...");
testSignup().then(() => {
  console.log("\nTesting Login...");
  setTimeout(testLogin, 1000);
});
