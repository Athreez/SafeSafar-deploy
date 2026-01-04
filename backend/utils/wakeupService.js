/**
 * Wake-up Service
 * Pings the Python backend to prevent it from sleeping (Render free tier issue)
 */

const PYTHON_BACKEND_URL = "https://safesafar-python.onrender.com";

export async function wakeupPythonBackend() {
  try {
    // Use a simple GET request to health endpoint (non-blocking)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(`${PYTHON_BACKEND_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log(`✅ Python backend wake-up successful (${new Date().toISOString()})`);
      return true;
    } else {
      console.warn(`⚠️ Python backend returned status ${response.status}`);
      return false;
    }
  } catch (err) {
    // Don't fail login if wake-up fails - run in background
    console.warn(`⚠️ Python backend wake-up failed: ${err.message}`);
    return false;
  }
}

export async function wakeupPythonBackendAsync() {
  // Run in background without blocking the response
  setImmediate(() => {
    wakeupPythonBackend().catch(err => 
      console.error("Background wake-up error:", err)
    );
  });
}
