import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMyCommentsViewModel } from './useMyCommentsViewModel';
import { CommentTree } from '../../features/comments/components/CommentTree';
import { SortField, SortDirection } from '@shared/types/comment.types';

const SORT_OPTIONS: Array<{ label: string; field: SortField; direction: SortDirection }> = [
    { label: 'Рейтинг ↓', field: 'score', direction: 'DESC' },
    { label: 'Рейтинг ↑', field: 'score', direction: 'ASC' },
    { label: 'Нові', field: 'date_time', direction: 'DESC' },
    { label: 'Старі', field: 'date_time', direction: 'ASC' },
];

export const MyCommentsPage: React.FC = () => {
    const vm = useMyCommentsViewModel();

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Мої коментарі</h1>
                </div>
                <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
                    {SORT_OPTIONS.map((opt) => {
                        const isActive = vm.sortField === opt.field && vm.sortDirection === opt.direction;
                        return (
                            <button
                                key={`${opt.field}-${opt.direction}`}
                                onClick={() => vm.handleSort(opt.field, opt.direction)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${isActive
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <CommentTree
                comments={vm.items as any}
                isLoading={vm.isLoading}
                onDeleted={vm.handleDeleted}
                onUpdated={vm.handleUpdated}
            />

            {vm.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => vm.handlePage(vm.page - 1)}
                        disabled={vm.page === 1}
                        className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200
                            bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-slate-600 font-medium">
                        {vm.page} / {vm.totalPages}
                    </span>
                    <button
                        onClick={() => vm.handlePage(vm.page + 1)}
                        disabled={vm.page === vm.totalPages}
                        className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200
                            bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};