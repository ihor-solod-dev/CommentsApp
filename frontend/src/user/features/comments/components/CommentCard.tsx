import React, { useState, useRef } from 'react';
import {
    ThumbsUp, ThumbsDown, Flag, Reply, Languages,
    Pencil, Trash2, ChevronDown,
} from 'lucide-react';
import { Comment } from '@shared/types/comment.types';
import { Modal } from '@shared/components/Modal/Modal';
import { Lightbox } from '@shared/components/Lightbox/Lightbox';
import { useVote } from '../../votes/hooks/useVote';
import { useAuthStore } from '@shared/hooks/useAuth';
import { formatScore } from '@shared/utils/format-score';
import { formatDate } from '@shared/utils/format-date';
import { sanitizeForDisplay } from '@shared/utils/sanitize-html';
import { commentsApi } from '../api/comments.api';
import { CommentForm } from './CommentForm';
import { CommentChildren, CommentChildrenHandle } from './CommentChildren';
import { Button } from '@shared/components/Button/Button';
import { FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@shared/api/axios.instance';

const FILES_URL = import.meta.env.VITE_FILES_URL;

const DEPTH_COLORS = [
    'border-blue-100',
    'border-indigo-100',
    'border-violet-100',
    'border-purple-100',
    'border-pink-100',
];

interface CommentCardProps {
    comment: Comment & { totalChildren?: number };
    onDeleted?: (id: string) => void;
    onUpdated?: (comment: Comment) => void;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment, onDeleted, onUpdated }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportText, setReportText] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [hasLocalReplies, setHasLocalReplies] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const childrenRef = useRef<CommentChildrenHandle>(null);

    const { score, currentVote, handleVote, isLoading: voteLoading } = useVote(comment.id, comment.score);
    const { isAuthenticated, user } = useAuthStore();
    const isOwner = isAuthenticated && user?.id === comment.user?.id;

    const getChildConfig = (depth: number) => {
        if (depth === 0) return { initialLimit: 3, autoLoad: true };
        if (depth === 1) return { initialLimit: 1, autoLoad: true };
        return { initialLimit: 3, autoLoad: false };
    };

    const shouldShowChildren =
        comment.depth < 5 &&
        (hasLocalReplies ||
            comment.totalChildren === undefined ||
            (comment.totalChildren ?? 0) > 0);

    const childBorderColor = DEPTH_COLORS[comment.depth % DEPTH_COLORS.length];

    const requireAuth = (action: () => void) => {
        if (!isAuthenticated) {
            toast.error('Увійдіть, щоб продовжити');
            return;
        }
        action();
    };

    const handleReport = async () => {
        if (!reportText.trim()) return;
        setReportLoading(true);
        try {
            await apiClient.post(`/reports/${comment.id}`, { text: reportText });
            toast.success('Скаргу успішно подано');
            setShowReportModal(false);
            setReportText('');
        } catch (err: any) {
            toast.error(err?.response?.data?.error?.message ?? 'Помилка при поданні скарги');
        } finally {
            setReportLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await commentsApi.deleteComment(comment.id);
            onDeleted?.(comment.id);
            toast.success('Коментар видалено');
            setShowDeleteModal(false);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ??
                err?.response?.data?.error?.message ??
                'Помилка видалення'
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleTranslate = async () => {
        if (translatedText) { setTranslatedText(null); return; }
        setIsTranslating(true);
        try {
            const result = await commentsApi.translate(comment.id, 'uk');
            setTranslatedText(result);
        } catch {
            toast.error('Помилка перекладу');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleReplySuccess = (reply: Comment) => {
        setShowReplyForm(false);
        setHasLocalReplies(true);
        childrenRef.current?.prependItem({ ...reply, totalChildren: 0 });
    };

    if (comment.isDeleted) {
        return (
            <div>
                <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <Trash2 size={12} className="text-slate-300" />
                    <span className="text-xs text-slate-400 italic">Коментар видалено</span>
                </div>
                {shouldShowChildren && (
                    <div className={`mt-2 ml-4 pl-3 border-l-2 ${childBorderColor}`}>
                        <CommentChildren
                            ref={childrenRef}
                            parentId={comment.id}
                            parentDepth={comment.depth}
                            {...getChildConfig(comment.depth)}
                            renderComment={(c) => (
                                <CommentCard comment={c} onDeleted={onDeleted} onUpdated={onUpdated} />
                            )}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                            {comment.user?.avatar ? (
                                <img
                                    src={`${FILES_URL}${comment.user.avatar}`}
                                    alt={comment.user.username}
                                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                                    flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                    {comment.user?.username?.[0]?.toUpperCase() ?? '?'}
                                </div>
                            )}
                            <div>
                                <span className="text-sm font-semibold text-slate-800">
                                    {comment.user?.username ?? 'Анонім'}
                                </span>
                                <p className="text-xs text-slate-400">{formatDate(comment.dateTime)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                                onClick={() => handleVote('like')}
                                disabled={voteLoading}
                                className={`p-1.5 rounded-lg transition-colors ${currentVote === 'like'
                                    ? 'text-emerald-500 bg-emerald-50'
                                    : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
                                    }`}
                            >
                                <ThumbsUp
                                    size={15}
                                    fill={currentVote === 'like' ? 'currentColor' : 'none'}
                                />
                            </button>
                            <span
                                className={`text-sm font-bold min-w-[2rem] text-center tabular-nums ${score > 0 ? 'text-emerald-600' : score < 0 ? 'text-red-500' : 'text-slate-500'
                                    }`}
                            >
                                {formatScore(score)}
                            </span>
                            <button
                                onClick={() => handleVote('dislike')}
                                disabled={voteLoading}
                                className={`p-1.5 rounded-lg transition-colors ${currentVote === 'dislike'
                                    ? 'text-red-500 bg-red-50'
                                    : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                    }`}
                            >
                                <ThumbsDown
                                    size={15}
                                    fill={currentVote === 'dislike' ? 'currentColor' : 'none'}
                                />
                            </button>
                            <button
                                onClick={() => requireAuth(() => setShowReportModal(true))}
                                className="p-1.5 rounded-lg text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition-colors ml-1"
                                title="Поскаржитись"
                            >
                                <Flag size={14} />
                            </button>
                        </div>
                    </div>

                    <div
                        className="text-sm text-slate-700 leading-relaxed comment-content mb-3"
                        dangerouslySetInnerHTML={{
                            __html: sanitizeForDisplay(translatedText ?? comment.text ?? ''),
                        }}
                    />

                    {comment.files?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {comment.files.map((file) => {
                                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file.filePath);
                                const fullUrl = `${FILES_URL}${file.filePath}`;
                                const fileName = file.filePath.split('/').pop() ?? 'file';

                                return isImage ? (
                                    <div key={file.id} className="relative group">
                                        <img
                                            src={fullUrl}
                                            alt="вкладення"
                                            onClick={() => setLightboxSrc(fullUrl)}
                                            className="w-20 h-20 object-cover rounded-xl border border-slate-200
                       cursor-pointer hover:opacity-90 transition-opacity"
                                        />
                                        <div
                                            className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10
                       transition-colors flex items-center justify-center cursor-pointer"
                                            onClick={() => setLightboxSrc(fullUrl)}
                                        />
                                    </div>
                                ) : (
                                    <a
                                        key={file.id}
                                        href={fullUrl}
                                        download
                                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200
                     rounded-xl text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        <FileText size={14} className="text-slate-400" />
                                        <span className="max-w-[120px] truncate">{fileName}</span>
                                        <Download size={12} className="text-slate-400" />
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex items-center gap-1 flex-wrap">
                        <ActionButton
                            icon={<Languages size={13} />}
                            label={translatedText ? 'Оригінал' : 'Перекласти'}
                            onClick={handleTranslate}
                            disabled={isTranslating}
                        />
                        <ActionButton
                            icon={<Reply size={13} />}
                            label="Відповісти"
                            onClick={() => requireAuth(() => setShowReplyForm((v) => !v))}
                            active={showReplyForm}
                        />
                        {isOwner && (
                            <>
                                <ActionButton
                                    icon={<Pencil size={13} />}
                                    label="Редагувати"
                                    onClick={() => setShowEditForm((v) => !v)}
                                    active={showEditForm}
                                />
                                <ActionButton
                                    icon={<Trash2 size={13} />}
                                    label="Видалити"
                                    onClick={() => setShowDeleteModal(true)}
                                    danger
                                />
                            </>
                        )}
                    </div>
                </div>

                {showEditForm && (
                    <div className="px-4 pb-4">
                        <CommentForm
                            existingComment={comment}
                            onSuccess={(updated) => { onUpdated?.(updated); setShowEditForm(false); }}
                            onCancel={() => setShowEditForm(false)}
                        />
                    </div>
                )}

                {showReplyForm && comment.depth < 5 && (
                    <div className="px-4 pb-4">
                        <CommentForm
                            parentId={comment.id}
                            onSuccess={handleReplySuccess}
                            onCancel={() => setShowReplyForm(false)}
                        />
                    </div>
                )}
            </div>

            {
                shouldShowChildren && (
                    <div className={`mt-2 ml-4 pl-3 border-l-2 ${childBorderColor}`}>
                        <CommentChildren
                            ref={childrenRef}
                            parentId={comment.id}
                            parentDepth={comment.depth}
                            {...getChildConfig(comment.depth)}
                            renderComment={(c) => (
                                <CommentCard comment={c} onDeleted={onDeleted} onUpdated={onUpdated} />
                            )}
                        />
                    </div>
                )
            }

            <Modal
                isOpen={showDeleteModal}
                onClose={() => !deleteLoading && setShowDeleteModal(false)}
                title="Видалити коментар?"
            >
                <div className="flex flex-col gap-5">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Ця дія необернена. Коментар буде позначено як видалений,
                        але відповіді під ним залишаться видимими.
                    </p>
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deleteLoading}
                        >
                            Скасувати
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleDelete}
                            isLoading={deleteLoading}
                            className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                        >
                            Видалити
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Подати скаргу">
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-slate-500">
                        Опишіть, чому цей коментар порушує правила спільноти.
                    </p>
                    <textarea
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        placeholder="Причина скарги..."
                        rows={4}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm
                            resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    />
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setShowReportModal(false)}>
                            Скасувати
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleReport}
                            isLoading={reportLoading}
                            disabled={!reportText.trim()}
                        >
                            Надіслати
                        </Button>
                    </div>
                </div>
            </Modal>

            {
                lightboxSrc && (
                    <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
                )
            }
        </div >
    );
};

const ActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    danger?: boolean;
}> = ({ icon, label, onClick, disabled, active, danger }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors
            ${danger ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' :
                active ? 'text-blue-600 bg-blue-50' :
                    'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {icon}
        {label}
    </button>
);