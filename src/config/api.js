/**
 * API Configuration
 * 
 * Centralized configuration for API base URLs based on environment.
 * 
 * Important: The base URL should NOT include /api
 * All API calls should use: ${API_BASE_URL}/api/{endpoint}
 */

/**
 * Get the API base URL based on environment
 * @returns {string} Base API URL (without /api suffix)
 */
const getApiBaseUrl = () => {
  // If REACT_APP_BASE_URL is explicitly set in .env, use it
  if (process.env.REACT_APP_BASE_URL) {
    return process.env.REACT_APP_BASE_URL;
  }

  // Development - check if running on localhost
  if (
    process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return 'http://localhost:3001';
  }

  // Production - default to production domain
  return 'https://ddhealthcarevps.cloud';
};

/**
 * API Base URL
 * 
 * Usage:
 * import { API_BASE_URL } from '../config/api';
 * axios.get(`${API_BASE_URL}/api/employee/login`)
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * Get full API URL for an endpoint
 * @param {string} endpoint - API endpoint (e.g., 'employee/login' or '/api/employee/login')
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Add /api prefix if not already present
  const apiEndpoint = cleanEndpoint.startsWith('api/') 
    ? cleanEndpoint 
    : `api/${cleanEndpoint}`;
  
  return `${API_BASE_URL}/${apiEndpoint}`;
};

export default {
  API_BASE_URL,
  getApiUrl,
};

