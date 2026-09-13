import React, { useState } from 'react';
import { Button } from '@shared/components/Button/Button';
import { reportsApi } from '../api/reports.api';
import { sanitizeForDisplay } from '@shared/utils/sanitize-html';
import { formatDate } from '@shared/utils/format-date';
import { formatScore } from '@shared/utils/format-score';
import { AlertTriangle, ChevronDown, CheckCircle, Trash2 } from 'lucide-react';
import { Spinner } from '@shared/components/Spinner/Spinner';
import toast from 'react-hot-toast';

interface ReportedCommentCardProps {
    comment: any;
    onDismiss: (id: string) => void;
    onDelete: (id: string) => void;
}

export const ReportedCommentCard: React.FC<ReportedCommentCardProps> = ({
    comment, onDismiss, onDelete,
}) => {
    const [reports, setReports] = useState<any[]>([]);
    //const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const [showReports, setShowReports] = useState(false);
    const [reportsLoading, setReportsLoading] = useState(false);

    const loadReports = async () => {
        setReportsLoading(true);
        try {
            const data = await reportsApi.getCommentReports(comment.id, 3, offset);
            setReports((prev) => [...prev, ...(Array.isArray(data) ? data : [])]);
            setOffset((prev) => prev + 3);
            //setTotal(data.total ?? data.length ?? 0);
            setShowReports(true);
        } catch {
            toast.error('Помилка завантаження скарг');
        } finally {
            setReportsLoading(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600
                            flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                            {comment.user?.username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-slate-800">
                                {comment.user?.username}
                            </span>
                            <p className="text-xs text-slate-400">{formatDate(comment.dateTime)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-slate-500">
                            Рейтинг: <span className="font-semibold">{formatScore(comment.score)}</span>
                        </span>
                        <div className="flex items-center gap-1.5 bg-red-50 border border-red-100
                            text-red-600 px-2.5 py-1 rounded-xl">
                            <AlertTriangle size={12} />
                            <span className="text-xs font-bold">{comment.reportCount} скарг</span>
                        </div>
                    </div>
                </div>

                <div
                    className="text-sm text-slate-700 comment-content leading-relaxed mb-4
                        bg-slate-50 rounded-xl p-3 border border-slate-100"
                    dangerouslySetInnerHTML={{ __html: sanitizeForDisplay(comment.text ?? '') }}
                />

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={loadReports}
                        disabled={reportsLoading}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl
                            bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        {reportsLoading ? (
                            <Spinner size={12} />
                        ) : (
                            <ChevronDown size={12} />
                        )}
                        {showReports ? 'Завантажити ще скарги' : 'Показати скарги'}
                    </button>
                    <button
                        onClick={() => onDismiss(comment.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl
                            bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                        <CheckCircle size={12} />
                        Відхилити скарги
                    </button>
                    <button
                        onClick={() => onDelete(comment.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl
                            bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={12} />
                        Видалити коментар
                    </button>
                </div>
            </div>

            {showReports && reports.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex flex-col gap-2.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Скарги</p>
                    {reports.map((r: any, i: number) => (
                        <div key={r.id ?? i} className="bg-white rounded-xl border border-slate-200 p-3">
                            <p className="text-sm text-slate-700">{r.text}</p>
                            <p className="text-xs text-slate-400 mt-1">{formatDate(r.createdAt)}</p>
                        </div>
                    ))}
                    {reportsLoading && (
                        <div className="flex justify-center py-2">
                            <Spinner size={16} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};