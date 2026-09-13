import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, FileText, ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@shared/components/Button/Button';
import { CommentToolbar } from './CommentToolbar';
import { useCommentForm } from '../hooks/useCommentForm';
import { Comment } from '@shared/types/comment.types';

interface CommentFormProps {
    parentId?: string;
    existingComment?: Comment;
    onSuccess: (comment: Comment) => void;
    onCancel?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
    parentId,
    existingComment,
    onSuccess,
    onCancel,
}) => {
    const {
        text, setText,
        captchaSvg, captchaAnswer, setCaptchaAnswer,
        isLoading, pendingFiles, textareaRef,
        loadCaptcha, insertTag, uploadFile, removeFile, submit,
    } = useCommentForm({ parentId, existingComment, onSuccess });

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEditing = !!existingComment;

    useEffect(() => { loadCaptcha(); }, []);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) await uploadFile(file);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await uploadFile(file);
        e.target.value = '';
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 pt-3 pb-2 border-b border-slate-100">
                <CommentToolbar onInsertTag={insertTag} />
            </div>

            <div className="p-4 flex flex-col gap-3">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={isEditing ? 'Редагуйте коментар...' : 'Напишіть коментар...'}
                    rows={4}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm
                        resize-y focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
                        placeholder:text-slate-400 transition-all"
                />

                {!isEditing && (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => pendingFiles.length < 3 && fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all
                            ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                            ${pendingFiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Upload size={16} className="mx-auto mb-1 text-slate-400" />
                        <p className="text-xs text-slate-500">
                            {pendingFiles.length >= 3
                                ? 'Максимум 3 файли'
                                : 'Перетягніть або натисніть для вибору файлу'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">JPEG, PNG, GIF до 3 МБ · TXT до 100 КБ</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/gif,image/png,text/plain"
                            onChange={handleFileChange}
                            disabled={pendingFiles.length >= 3}
                        />
                    </div>
                )}

                {pendingFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {pendingFiles.map((file) => (
                            <div key={file.fileId} className="relative group">
                                {file.previewUrl ? (
                                    <img
                                        src={file.previewUrl}
                                        alt={file.name}
                                        className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50
                                        flex flex-col items-center justify-center gap-1 px-1">
                                        <FileText size={18} className="text-slate-400" />
                                        <span className="text-xs text-slate-500 text-center leading-tight truncate w-full text-center">
                                            {file.name}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => removeFile(file.fileId)}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full
                                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {captchaSvg && (
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-slate-600">Підтвердження</label>
                        <div className="flex items-center gap-3">
                            <div
                                className="border border-slate-200 rounded-xl p-2 bg-slate-50 select-none"
                                dangerouslySetInnerHTML={{ __html: captchaSvg }}
                            />
                            <button
                                type="button"
                                onClick={loadCaptcha}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                title="Оновити CAPTCHA"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={captchaAnswer}
                            onChange={(e) => setCaptchaAnswer(e.target.value)}
                            placeholder="Введіть символи з картинки"
                            className="w-48 px-3 py-2 border border-slate-200 rounded-xl text-sm
                                focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                        />
                    </div>
                )}

                <div className="flex gap-2 justify-end pt-1">
                    {onCancel && (
                        <Button variant="ghost" size="sm" onClick={onCancel}>
                            Скасувати
                        </Button>
                    )}
                    <Button size="sm" isLoading={isLoading} onClick={submit}>
                        {isEditing ? 'Зберегти' : 'Опублікувати'}
                    </Button>
                </div>
            </div>
        </div>
    );
};