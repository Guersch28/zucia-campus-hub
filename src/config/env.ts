/**
 * Centralised runtime configuration.
 * All values come from Vite env vars (prefixed with VITE_).
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8000";
