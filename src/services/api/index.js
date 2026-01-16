import axios from 'axios';
import { mockAdapter } from './mock';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    adapter: useMock ? mockAdapter : undefined
});

import { useToastStore } from '@/stores/toast';

api.interceptors.request.use(
    (config) => {
        // Get token key from env, default to 'token'
        const tokenKey = import.meta.env.VITE_AUTH_TOKEN_KEY || 'token';
        const token = localStorage.getItem(tokenKey);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        const { config, data } = response;
        const method = config.method.toLowerCase();

        // Check for custom overrides
        // If 'silent' or 'skipSuccessToast' is true, do not show global toast
        if (config.silent || config.skipSuccessToast) {
            return response;
        }

        // Show toast for mutations (POST, PUT, DELETE)
        if (['post', 'put', 'delete', 'patch'].includes(method)) {
            const toast = useToastStore();
            const message = data?.message || 'Berhasil menyimpan data';
            toast.add(message, 'success');
        }

        return response;
    },
    (error) => {
        const { config, response } = error;

        // Check for custom overrides
        // If 'silent' or 'skipErrorToast' is true, do not show global toast
        if (config?.silent || config?.skipErrorToast) {
            return Promise.reject(error);
        }

        const toast = useToastStore();
        const message = response?.data?.message || error.message || 'Terjadi kesalahan pada server';
        toast.add(message, 'error');

        return Promise.reject(error);
    }
);

export default api;
