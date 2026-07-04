import axios from 'axios';

// Default to the configured VITE_API_BASE_URL, or when running in
// development on localhost, point to the backend at port 3000 so
// calls like `API.get('/orders/revenue-by-status')` reach the
// Express server without requiring a Vite proxy.
const envBase = import.meta.env.VITE_API_BASE_URL;
const defaultDevBase = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:3000/api'
    : '/api';
export const API_BASE_URL = (envBase || defaultDevBase).replace(/\/+$/, '');
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const apiUrl = (path = '') => {
    if (/^https?:\/\//i.test(path)) return path;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (normalizedPath === '/api' || normalizedPath.startsWith('/api/')) {
        return `${API_ORIGIN}${normalizedPath}`;
    }

    return `${API_BASE_URL}${normalizedPath}`;
};

export const assetUrl = (path = '') => {
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`;
};

export const getAuthToken = () =>
    sessionStorage.getItem('token') || localStorage.getItem('token');

export const authHeaders = (headers = {}) => {
    const token = getAuthToken();
    return token
        ? { ...headers, Authorization: `Bearer ${token}` }
        : headers;
};

const API = axios.create({
    baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
