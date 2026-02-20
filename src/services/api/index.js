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

import { useToast } from '@/composables/useToast';

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

// Set flag to prevent multiple "Session Expired" toasts
let isLoggingOut = false;

export const setupInterceptors = (router) => {
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
                const toast = useToast();
                const message = data?.message || 'Berhasil menyimpan data';
                toast.success(message);
            }

            return response;
        },
        async (error) => {
            const { config, response } = error;

            // Handle 401 Unauthorized
            if (response && response.status === 401) {
                if (!isLoggingOut) {
                    isLoggingOut = true;

                    // Clear authentication data through the store to ensure state is flushed
                    const { useAuthStore } = await import('../../stores/auth');
                    const authStore = useAuthStore();
                    authStore.logout();

                    const toast = useToast();
                    toast.error('Sesi login telah berakhir, silakan login kembali.');

                    if (router) {
                        router.push('/login');
                    } else {
                        window.location.href = '/login';
                    }

                    // Reset flag after small delay to allow redirects
                    setTimeout(() => {
                        isLoggingOut = false;
                    }, 2000);
                }

                return Promise.reject(error);
            }

            // Check for custom overrides
            // If 'silent' or 'skipErrorToast' is true, do not show global toast
            if (config?.silent || config?.skipErrorToast) {
                return Promise.reject(error);
            }

            const toast = useToast();
            let message = 'Terjadi kesalahan pada server';

            if (response?.data?.message) {
                message = response.data.message;
            } else if (response?.status === 422 && response?.data?.errors) {
                // Fallback for Laravel-style validation errors if message is missing (rare)
                const firstError = Object.values(response.data.errors)[0];
                message = Array.isArray(firstError) ? firstError[0] : firstError;
            } else {
                message = error.message || message;
            }

            toast.error(message);

            return Promise.reject(error);
        }
    );
};

export default api;
