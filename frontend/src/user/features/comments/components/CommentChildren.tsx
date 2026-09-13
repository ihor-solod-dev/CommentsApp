import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Comment } from '@shared/types/comment.types';
import { commentsApi } from '../api/comments.api';
import { Button } from '@shared/components/Button/Button';
import { Spinner } from '@shared/components/Spinner/Spinner';
import toast from 'react-hot-toast';

interface CommentChildrenProps {
    parentId: string;
    parentDepth: number;
    initialLimit: number;
    autoLoad: boolean;
    renderComment: (comment: Comment & { totalChildren: number }) => React.ReactNode;
}

export interface CommentChildrenHandle {
    prependItem: (item: Comment & { totalChildren: number }) => void;
}

export const CommentChildren = forwardRef<CommentChildrenHandle, CommentChildrenProps>(
    ({ parentId, initialLimit, autoLoad, renderComment }, ref) => {
        const [items, setItems] = useState<(Comment & { totalChildren: number })[]>([]);
        const [total, setTotal] = useState(0);
        const [isLoading, setIsLoading] = useState(false);
        const [isVisible, setIsVisible] = useState(autoLoad);
        const [hasLoaded, setHasLoaded] = useState(false);

        useImperativeHandle(ref, () => ({
            prependItem: (item) => {
                setItems((prev) => [item, ...prev]);
                setTotal((prev) => prev + 1);
                setHasLoaded(true);
                setIsVisible(true);
            },
        }));

        const fetchChildren = useCallback(
            async (limit: number, offset: number) => {
                setIsLoading(true);
                try {
                    return await commentsApi.getChildren(parentId, limit, offset);
                } catch {
                    toast.error('Помилка завантаження відповідей');
                    return null;
                } finally {
                    setIsLoading(false);
                }
            },
            [parentId],
        );

        useEffect(() => {
            if (!autoLoad) return;
            fetchChildren(initialLimit, 0).then((result) => {
                if (!result) return;
                setItems(result.items);
                setTotal(result.total);
                setHasLoaded(true);
            });
        }, []);

        const handleShowReplies = async () => {
            setIsVisible(true);
            if (hasLoaded) return;
            const result = await fetchChildren(initialLimit, 0);
            if (!result) return;
            setItems(result.items);
            setTotal(result.total);
            setHasLoaded(true);
        };

        const loadMore = async () => {
            const result = await fetchChildren(3, items.length);
            if (!result) return;
            setItems((prev) => [...prev, ...result.items]);
            setTotal(result.total);
        };

        if (!isVisible) {
            return (
                <Button variant="ghost" size="sm" onClick={handleShowReplies} isLoading={isLoading}>
                    Показати відповіді
                </Button>
            );
        }

        if (!hasLoaded) {
            return (
                <div className="py-2">
                    <Spinner size={16} />
                </div>
            );
        }

        if (items.length === 0 && total === 0) return null;

        return (
            <div className="flex flex-col gap-2.5">
                {items.map((comment) => (
                    <div key={comment.id}>{renderComment(comment)}</div>
                ))}

                {isLoading && (
                    <div className="flex justify-center py-1">
                        <Spinner size={14} />
                    </div>
                )}

                {!isLoading && items.length < total && (
                    <button
                        onClick={loadMore}
                        className="self-start text-xs text-blue-500 hover:text-blue-700 font-medium
                            py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        Показати ще {total - items.length} відповідей
                    </button>
                )}
            </div>
        );
    },
);

CommentChildren.displayName = 'CommentChildren';