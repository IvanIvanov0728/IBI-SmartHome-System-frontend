/**
 * Centralized API configuration for IBI Smart Home System.
 * Uses Vite environment variables with a fallback to the production URL.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";
