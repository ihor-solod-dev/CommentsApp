import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { commentsApi } from '../api/comments.api';
import { Comment, CommentsQuery, SortField, SortDirection } from '@shared/types/comment.types';

interface CommentsState {
    items: Comment[];
    total: number;
    page: number;
    totalPages: number;
    isLoading: boolean;
    sortField: SortField;
    sortDirection: SortDirection;
}

export function useComments() {
    const [state, setState] = useState<CommentsState>({
        items: [],
        total: 0,
        page: 1,
        totalPages: 1,
        isLoading: false,
        sortField: 'score',
        sortDirection: 'DESC',
    });

    const fetchComments = useCallback(async (query: Partial<CommentsQuery> = {}) => {
        setState((prev) => ({ ...prev, isLoading: true }));
        try {
            const params: CommentsQuery = {
                page: query.page ?? state.page,
                sortField: query.sortField ?? state.sortField,
                sortDirection: query.sortDirection ?? state.sortDirection,
            };
            const result = await commentsApi.getRootComments(params);
            setState((prev) => ({
                ...prev,
                ...result,
                sortField: params.sortField,
                sortDirection: params.sortDirection,
                isLoading: false,
            }));
        } catch (err: any) {
            toast.error(err?.response?.data?.error?.message ?? 'Помилка завантаження коментарів');
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, [state.page, state.sortField, state.sortDirection]);

    const changePage = (page: number) => fetchComments({ page });

    const changeSort = (sortField: SortField, sortDirection: SortDirection) =>
        fetchComments({ sortField, sortDirection, page: 1 });

    return { ...state, fetchComments, changePage, changeSort };
}