import { useEffect, useState, useCallback } from 'react';
import { useComments } from '../../features/comments/hooks/useComments';
import { Comment, SortField, SortDirection } from '@shared/types/comment.types';

export function useHomePageViewModel() {
    const {
        items,
        total,
        page,
        totalPages,
        isLoading,
        sortField,
        sortDirection,
        fetchComments,
        changePage,
        changeSort,
    } = useComments();

    const [localComments, setLocalComments] = useState<Comment[]>([]);

    useEffect(() => {
        fetchComments();
    }, []);

    useEffect(() => {
        setLocalComments(items);
    }, [items]);

    const handleCommentCreated = useCallback((comment: Comment) => {
        setLocalComments((prev) => [comment, ...prev]);
    }, []);

    const handleCommentDeleted = useCallback((id: string) => {
        setLocalComments((prev) =>
            prev.map((c) => (c.id === id ? { ...c, isDeleted: true, text: null, user: null } : c)),
        );
    }, []);

    const handleCommentUpdated = useCallback((updated: Comment) => {
        setLocalComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }, []);

    return {
        comments: localComments,
        total,
        page,
        totalPages,
        isLoading,
        sortField,
        sortDirection,
        changePage,
        changeSort,
        handleCommentCreated,
        handleCommentDeleted,
        handleCommentUpdated,
    };
}