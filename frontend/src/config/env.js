// Central place for environment-driven configuration.

const PROD_API_BASE_URL = 'https://attendease-api-kohh.onrender.com/api';
const DEV_API_BASE_URL = 'http://localhost:8080/api';

/**
 * Resolves the API base URL safely across environments:
 * - In production (import.meta.env.PROD): guarantees the build NEVER selects localhost
 *   even if a local .env file contains localhost. Defaults to the Render production API.
 * - In development (import.meta.env.DEV): defaults to local Spring Boot (http://localhost:8080/api).
 * - Custom production URLs (e.g. custom domain) can be passed via VITE_API_BASE_URL.
 */
function resolveApiBaseUrl() {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

  if (import.meta.env.PROD) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return PROD_API_BASE_URL;
    }
    return envUrl;
  }

  return envUrl || DEV_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl().replace(/\/+$/, '');

/**
 * Sample mode configuration:
 * - If VITE_USE_SAMPLE_DATA is set to 'true', enable in-memory sample mode.
 * - Defaults to false (connecting to the live REST API and MySQL database).
 */
const rawSampleSetting = import.meta.env.VITE_USE_SAMPLE_DATA;
export const USE_SAMPLE_DATA = rawSampleSetting !== undefined
  ? String(rawSampleSetting).toLowerCase() === 'true'
  : false;
