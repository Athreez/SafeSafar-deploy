/**
 * Keep-alive script to prevent Render free tier from sleeping
 * Run this every 10 minutes to keep server awake
 */

const https = require('https');

const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || 'https://safesafar-backend.onrender.com';
const PYTHON_URL = 'https://safesafar-python.onrender.com';

function pingServer(url, name) {
  https.get(`${url}/health`, (res) => {
    console.log(`[${new Date().toISOString()}] ✓ ${name} pinged: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] ✗ ${name} ping failed:`, err.message);
  });
}

// Ping every 10 minutes to keep server awake
setInterval(() => {
  pingServer(BACKEND_URL, 'Node.js Backend');
  pingServer(PYTHON_URL, 'Python Backend');
}, 10 * 60 * 1000);

// Initial ping
pingServer(BACKEND_URL, 'Node.js Backend');
pingServer(PYTHON_URL, 'Python Backend');

console.log('Keep-alive service started - pinging every 10 minutes');
