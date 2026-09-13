import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@shared/hooks/useAuth';

export function useAuthForm() {
    const [isLoading, setIsLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const login = async (data: { email: string; password: string }) => {
        setIsLoading(true);
        try {
            const result = await authApi.login(data);
            setAuth(result.user, result.accessToken);
            toast.success('Успішний вхід!');
            navigate(result.user.role === 'admin' ? '/admin/reports' : '/');
        } catch (err: any) {
            const msg =
                'Помилка авторизації. Неправильний email або пароль';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: { username: string; email: string; password: string }) => {
        setIsLoading(true);
        try {
            const result = await authApi.register(data);
            setAuth(result.user, result.accessToken);
            toast.success('Реєстрація успішна!');
            navigate('/');
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.response?.data?.error?.message ??
                (typeof err?.response?.data?.error === 'string' ? err.response.data.error : null) ??
                'Помилка реєстрації';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return { login, register, isLoading };
}