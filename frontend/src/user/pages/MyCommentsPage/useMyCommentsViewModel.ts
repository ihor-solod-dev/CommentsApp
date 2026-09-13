import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { commentsApi } from '../../features/comments/api/comments.api';
import { Comment, SortField, SortDirection } from '@shared/types/comment.types';

export function useMyCommentsViewModel() {
    const [items, setItems] = useState<Comment[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [sortField, setSortField] = useState<SortField>('score');
    const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');

    const fetch = useCallback(async (p = page, sf = sortField, sd = sortDirection) => {
        setIsLoading(true);
        try {
            const result = await commentsApi.getMyComments({ page: p, sortField: sf, sortDirection: sd });
            setItems(result.items);
            setTotalPages(result.totalPages);
        } catch {
            toast.error('Помилка завантаження коментарів');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, []);

    const handleSort = (sf: SortField, sd: SortDirection) => {
        setSortField(sf);
        setSortDirection(sd);
        fetch(1, sf, sd);
    };

    const handlePage = (p: number) => { setPage(p); fetch(p); };

    const handleDeleted = (id: string) =>
        setItems((prev) => prev.map((c) => c.id === id ? { ...c, isDeleted: true, text: null, user: null } : c));

    const handleUpdated = (updated: Comment) =>
        setItems((prev) => prev.map((c) => c.id === updated.id ? updated : c));

    return { items, page, totalPages, isLoading, sortField, sortDirection, handleSort, handlePage, handleDeleted, handleUpdated };
}