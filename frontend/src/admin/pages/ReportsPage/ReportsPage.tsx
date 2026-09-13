import React from 'react';
import { useReportsViewModel } from './useReportsViewModel';
import { ReportedCommentCard } from '../../features/reports/components/ReportedCommentCard';
import { Spinner } from '@shared/components/Spinner/Spinner';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
    const { comments, isLoading, dismiss, deleteComment } = useReportsViewModel();

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                    <ShieldAlert size={20} className="text-red-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Скарги</h1>
                    <p className="text-sm text-slate-500">Топ-25 коментарів з найбільшою кількістю скарг</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Spinner size={32} />
                </div>
            ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <CheckCircle2 size={40} className="mb-3 text-emerald-400" />
                    <p className="text-sm font-medium text-slate-600">Скарг немає</p>
                    <p className="text-xs text-slate-400 mt-1">Спільнота дотримується правил</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {comments.map((comment) => (
                        <ReportedCommentCard
                            key={comment.id}
                            comment={comment}
                            onDismiss={dismiss}
                            onDelete={deleteComment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};