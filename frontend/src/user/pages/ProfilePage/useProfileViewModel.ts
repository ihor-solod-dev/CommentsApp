import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@shared/api/axios.instance';
import { useAuthStore } from '@shared/hooks/useAuth';
import { User } from '@shared/types/user.types';
import { commentsApi } from '../../features/comments/api/comments.api';
import axios from 'axios';

const FILES_URL = import.meta.env.VITE_FILES_URL;

export function useProfileViewModel() {
    const { user, setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const updateProfile = async (data: Partial<User & { password: string }>) => {
        setIsLoading(true);
        try {
            const result = await apiClient.patch<{ data: User }>('/users/me', data);
            setAuth(result.data.data, useAuthStore.getState().accessToken!);
            toast.success('Профіль оновлено');
        } catch (err: any) {
            toast.error(err?.response?.data?.error?.message ?? 'Помилка оновлення профілю');
        } finally {
            setIsLoading(false);
        }
    };

    const uploadAvatar = async (file: File) => {
        setIsUploading(true);
        try {
            const result = await commentsApi.uploadFile(file);
            
            await updateProfile({ avatar: result.filePath });

            toast.success('Аватар оновлено');
        } catch (err: any) {
            toast.error(err?.response?.data?.error?.message ?? 'Помилка завантаження аватара');
        } finally {
            setIsUploading(false);
        }
    };

    return { user, isLoading, isUploading, updateProfile, uploadAvatar };
}