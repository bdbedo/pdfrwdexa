const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}
