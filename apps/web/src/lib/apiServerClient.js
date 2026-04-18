const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '/api',
);

const apiServerClient = {
  fetch: (path, options = {}) => fetch(`${API_BASE_URL}${path}`, options),
};

export default apiServerClient;
