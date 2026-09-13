import React from 'react';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { useHomePageViewModel } from './useHomePageViewModel';
import { CommentTree } from '../../features/comments/components/CommentTree';
import { CommentForm } from '../../features/comments/components/CommentForm';
import { Button } from '@shared/components/Button/Button';
import { useAuthStore } from '@shared/hooks/useAuth';
import { SortField, SortDirection } from '@shared/types/comment.types';
import { useState } from 'react';

const SORT_OPTIONS: Array<{ label: string; field: SortField; direction: SortDirection }> = [
    { label: 'Рейтинг ↓', field: 'score', direction: 'DESC' },
    { label: 'Рейтинг ↑', field: 'score', direction: 'ASC' },
    { label: 'Нові', field: 'date_time', direction: 'DESC' },
    { label: 'Старі', field: 'date_time', direction: 'ASC' },
];

export const HomePage: React.FC = () => {
    const vm = useHomePageViewModel();
    const { isAuthenticated } = useAuthStore();
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Коментарі</h1>
                    {vm.total > 0 && (
                        <p className="text-sm text-slate-400 mt-0.5">{vm.total} коментарів</p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
                        {SORT_OPTIONS.map((opt) => {
                            const isActive = vm.sortField === opt.field && vm.sortDirection === opt.direction;
                            return (
                                <button
                                    key={`${opt.field}-${opt.direction}`}
                                    onClick={() => vm.changeSort(opt.field, opt.direction)}
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
            </div>

            {isAuthenticated ? (
                showForm ? (
                    <CommentForm
                        onSuccess={(c) => { vm.handleCommentCreated(c); setShowForm(false); }}
                        onCancel={() => setShowForm(false)}
                    />
                ) : (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 w-full px-4 py-3 bg-white border border-slate-200
                            rounded-2xl text-sm text-slate-400 hover:text-slate-600 hover:border-slate-300
                            hover:shadow-sm transition-all text-left"
                    >
                        <PlusCircle size={16} />
                        Написати коментар...
                    </button>
                )
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                    <p className="text-sm text-slate-500 mb-3">Увійдіть, щоб залишити коментар</p>
                    <div className="flex justify-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => window.location.href = '/login'}>
                            Увійти
                        </Button>
                        <Button size="sm" onClick={() => window.location.href = '/register'}>
                            Реєстрація
                        </Button>
                    </div>
                </div>
            )}

            <CommentTree
                comments={vm.comments as any}
                isLoading={vm.isLoading}
                onDeleted={vm.handleCommentDeleted}
                onUpdated={vm.handleCommentUpdated}
            />

            {vm.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => vm.changePage(vm.page - 1)}
                        disabled={vm.page === 1}
                        className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200
                            bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed
                            transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(vm.totalPages, 7) }, (_, i) => {
                            const page = i + 1;
                            const isActive = page === vm.page;
                            return (
                                <button
                                    key={page}
                                    onClick={() => vm.changePage(page)}
                                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${isActive
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        {vm.totalPages > 7 && (
                            <span className="text-slate-400 px-2">…{vm.totalPages}</span>
                        )}
                    </div>

                    <button
                        onClick={() => vm.changePage(vm.page + 1)}
                        disabled={vm.page === vm.totalPages}
                        className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200
                            bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed
                            transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};