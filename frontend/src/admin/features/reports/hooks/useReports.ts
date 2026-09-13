import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { reportsApi } from '../api/reports.api';

export function useReports() {
    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await reportsApi.getTopReported();
            setComments(data);
        } catch {
            toast.error('Помилка завантаження скарг');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, []);

    const dismiss = async (commentId: string) => {
        try {
            await reportsApi.dismissReports(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            toast.success('Скарги відхилено');
        } catch {
            toast.error('Помилка');
        }
    };

    const deleteComment = async (commentId: string) => {
        try {
            await reportsApi.deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            toast.success('Коментар видалено');
        } catch {
            toast.error('Помилка');
        }
    };

    return { comments, isLoading, dismiss, deleteComment };
}