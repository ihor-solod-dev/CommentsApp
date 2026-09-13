import React from 'react';

interface CommentToolbarProps {
    onInsertTag: (tag: string) => void;
}

const TAGS = [
    { tag: 'i', label: 'I', title: 'Курсив' },
    { tag: 'strong', label: 'B', title: 'Жирний' },
    { tag: 'code', label: '</>', title: 'Код' },
    { tag: 'a', label: '🔗', title: 'Посилання' },
] as const;

export const CommentToolbar: React.FC<CommentToolbarProps> = ({ onInsertTag }) => (
    <div className="flex gap-1.5">
        {TAGS.map(({ tag, label, title }) => (
            <button
                key={tag}
                type="button"
                title={title}
                onClick={() => onInsertTag(tag)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-600
                    hover:bg-slate-200 hover:text-slate-900 transition-colors border border-slate-200"
            >
                {label}
            </button>
        ))}
    </div>
);