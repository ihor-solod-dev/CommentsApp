import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { commentsApi } from '../api/comments.api';
import { Comment } from '@shared/types/comment.types';
import { validateCommentText } from '@shared/utils/sanitize-html';

export interface PendingFile {
    fileId: string;
    name: string;
    mimeType: string;
    previewUrl: string | null;
    size: number;
    filePath: string;
}

interface UseCommentFormOptions {
    parentId?: string;
    existingComment?: Comment;
    onSuccess: (comment: Comment) => void;
}

export function useCommentForm({ parentId, existingComment, onSuccess }: UseCommentFormOptions) {
    const [text, setText] = useState(existingComment?.text ?? '');
    const [captchaId, setCaptchaId] = useState('');
    const [captchaSvg, setCaptchaSvg] = useState('');
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        return () => {
            pendingFiles.forEach((f) => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
        };
    }, []);

    const loadCaptcha = async () => {
        try {
            const captcha = await commentsApi.generateCaptcha();
            setCaptchaId(captcha.id);
            setCaptchaSvg(captcha.svg);
            setCaptchaAnswer('');
        } catch {
            toast.error('Не вдалось завантажити CAPTCHA');
        }
    };

    const insertTag = (tag: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = text.slice(start, end);

        const templates: Record<string, string> = {
            i: `<i>${selected}</i>`,
            strong: `<strong>${selected}</strong>`,
            code: `<code>${selected}</code>`,
            a: `<a href="https://" title="">${selected || 'link text'}</a>`,
        };

        const insertion = templates[tag] ?? '';
        const newText = text.slice(0, start) + insertion + text.slice(end);
        setText(newText);

        requestAnimationFrame(() => {
            textarea.focus();
            const cursorPos = tag === 'a' ? start + 9 : start + tag.length + 2;
            textarea.setSelectionRange(cursorPos, cursorPos + (selected ? selected.length : (tag === 'a' ? 9 : 0)));
        });
    };

    const uploadFile = async (file: File) => {
        if (pendingFiles.length >= 3) {
            toast.error('Максимум 3 файли');
            return;
        }

        const isImage = file.type.startsWith('image/');
        const isTxt = file.type === 'text/plain';

        if (!isImage && !isTxt) {
            toast.error('Дозволені формати: JPEG, PNG, GIF, TXT');
            return;
        }

        const maxSize = isTxt ? 100 * 1024 : 3 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(isTxt ? 'TXT файл занадто великий (макс. 100 КБ)' : 'Зображення занадто велике (макс. 3 МБ)');
            return;
        }

        const previewUrl = isImage ? URL.createObjectURL(file) : null;

        try {
            const presign = await commentsApi.presignUpload(file.type);
            const formData = new FormData();
            formData.append('file', file);

            const filesUrl = import.meta.env.VITE_FILES_URL;
            const uploadResponse = await axios.post(
                presign.uploadUrl.replace('http://files-service:3001', filesUrl),
                formData,
                {
                    headers: {
                        'x-upload-token': presign.token,
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );

            const filePath = uploadResponse.data?.data?.filePath;

            if (!filePath) {
                throw new Error('No filePath returned from files service');
            }

            setPendingFiles((prev) => [
                ...prev,
                {
                    fileId: presign.fileId,
                    name: file.name,
                    mimeType: file.type,
                    previewUrl,
                    size: file.size,
                    filePath,
                },
            ]);
            toast.success('Файл завантажено');
        } catch {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            toast.error('Помилка завантаження файлу');
        }
    };

    const removeFile = (fileId: string) => {
        setPendingFiles((prev) => {
            const file = prev.find((f) => f.fileId === fileId);
            if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
            return prev.filter((f) => f.fileId !== fileId);
        });
    };

    const submit = async () => {
        const validationError = validateCommentText(text);
        if (validationError) {
            toast.error(validationError);
            return;
        }
        if (!captchaId || !captchaAnswer.trim()) {
            toast.error('Пройдіть CAPTCHA');
            return;
        }

        setIsLoading(true);
        try {
            let result: Comment;
            if (existingComment) {
                result = await commentsApi.updateComment(existingComment.id, {
                    text,
                    captchaId,
                    captchaAnswer,
                });
            } else {
                result = await commentsApi.createComment({
                    text,
                    parentId,
                    captchaId,
                    captchaAnswer,
                    files: pendingFiles.map((f) => {
                        return { id: f.fileId, filePath: f.filePath }
                    }),
                });
            }
            onSuccess(result);
            setText('');
            pendingFiles.forEach((f) => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
            setPendingFiles([]);
        } catch (err: any) {
            toast.error(err?.response?.data?.error?.message ?? 'Помилка збереження коментаря');
            await loadCaptcha();
        } finally {
            setIsLoading(false);
        }
    };

    return {
        text,
        setText,
        captchaId,
        captchaSvg,
        captchaAnswer,
        setCaptchaAnswer,
        isLoading,
        pendingFiles,
        textareaRef,
        loadCaptcha,
        insertTag,
        uploadFile,
        removeFile,
        submit
    };
}