import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
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
