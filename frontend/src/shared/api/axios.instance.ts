import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
    failedQueue = [];
}

apiClient.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Не пытаемся делать refresh на login / register / refresh
        const url = original.url ?? '';
        const isAuthEndpoint =
            url.includes('/auth/login') ||
            url.includes('/auth/register') ||
            url.includes('/auth/refresh');

        if (error.response?.status !== 401 || original._retry || isAuthEndpoint) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                original.headers.Authorization = `Bearer ${token}`;
                return apiClient(original);
            });
        }

        original._retry = true;
        isRefreshing = true;

        try {
            const { data } = await apiClient.post('/auth/refresh');
            const authData = (data as any)?.data ?? data;
            const newToken = authData.accessToken;

            if (!newToken) {
                throw new Error('No access token in refresh response');
            }

            setAccessToken(newToken);

            if (authData.user) {
                useAuthStore.getState().setAuth(authData.user, newToken);
            } else {
                useAuthStore.setState({ accessToken: newToken });
            }

            processQueue(null, newToken);
            original.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(original);
        } catch (refreshError) {
            processQueue(refreshError);
            setAccessToken(null);
            useAuthStore.getState().clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);