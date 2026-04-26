// Centralized API configuration for deployment
// In development: uses localhost:8000
// In production: uses VITE_API_URL environment variable

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Derive WebSocket URL from the HTTP URL
const WS_BASE = import.meta.env.VITE_WS_URL || 
  API_BASE.replace('https://', 'wss://').replace('http://', 'ws://');

export { API_BASE, WS_BASE };
