// Centralized API configuration for deployment
// In development (web): uses localhost:8000
// In production (web): uses VITE_API_URL environment variable
// On native (Capacitor): always uses the deployed backend

import { isNative } from './platform';

// On native platforms, always point to the deployed backend
// On web, use the environment variable or localhost fallback
const API_BASE = isNative
  ? (import.meta.env.VITE_API_URL || 'https://scamdetect-ai.onrender.com')
  : (import.meta.env.VITE_API_URL || 'http://localhost:8000');

// Derive WebSocket URL from the HTTP URL
const WS_BASE = import.meta.env.VITE_WS_URL || 
  API_BASE.replace('https://', 'wss://').replace('http://', 'ws://');

export { API_BASE, WS_BASE };

