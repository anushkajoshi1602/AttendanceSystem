// Central place for environment-driven configuration.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/+$/, '');

// Sample mode is ON unless explicitly set to "false".
export const USE_SAMPLE_DATA = String(import.meta.env.VITE_USE_SAMPLE_DATA ?? 'true').toLowerCase() !== 'false';
