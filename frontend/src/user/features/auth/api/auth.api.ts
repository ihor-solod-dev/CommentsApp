import { apiClient } from '@shared/api/axios.instance';
import { User } from '@shared/types/user.types';

interface AuthResponse {
    accessToken: string;
    user: User;
}

export const authApi = {
    register: (data: { username: string; email: string; password: string }) =>
        apiClient.post<{ data: AuthResponse }>('/auth/register', data).then((r) => r.data.data),

    login: (data: { email: string; password: string }) =>
        apiClient.post<{ data: AuthResponse }>('/auth/login', data).then((r) => r.data.data),

    logout: () => apiClient.post('/auth/logout'),

    refresh: () =>
        apiClient.post<{ data: AuthResponse }>('/auth/refresh').then((r) => r.data.data),
};