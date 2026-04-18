const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const apiServerClient = {
  fetch: (path, options = {}) => fetch(`${API_BASE_URL}${path}`, options),
};

export default apiServerClient;
