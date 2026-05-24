// Centralized API configuration for deployment
// In development (web): uses localhost:8000
// In production (web): uses VITE_API_URL environment variable
// On native (Capacitor): always uses the deployed backend

import { isNative } from './platform';

// On native platforms or in production builds (Vercel), point to the deployed backend.
// In local development, use localhost fallback.
// We are hardcoding this to bypass any cached Vercel Dashboard environment variables.
const API_BASE = (import.meta.env.PROD || isNative) 
  ? 'https://mayank11207-scamdetect-backend.hf.space' 
  : 'http://localhost:8000';

// Derive WebSocket URL from the HTTP URL
const WS_BASE = API_BASE.replace('https://', 'wss://').replace('http://', 'ws://');

export { API_BASE, WS_BASE };

