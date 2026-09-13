import React from 'react';
import { Comment } from '@shared/types/comment.types';
import { CommentCard } from './CommentCard';
import { Spinner } from '@shared/components/Spinner/Spinner';
import { MessageSquareDashed } from 'lucide-react';

interface CommentTreeProps {
    comments: (Comment & { totalChildren?: number })[];
    isLoading: boolean;
    onDeleted: (id: string) => void;
    onUpdated: (comment: Comment) => void;
}

export const CommentTree: React.FC<CommentTreeProps> = ({
    comments, isLoading, onDeleted, onUpdated,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner size={32} />
            </div>
        );
    }

    if (!comments.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <MessageSquareDashed size={40} className="mb-3 opacity-50" />
                <p className="text-sm">Коментарів поки немає. Будьте першим!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {comments.map((comment) => (
                <CommentCard
                    key={comment.id}
                    comment={comment}
                    onDeleted={onDeleted}
                    onUpdated={onUpdated}
                />
            ))}
        </div>
    );
};