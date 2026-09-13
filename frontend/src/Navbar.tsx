import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Menu, X, LogOut, User, FileText, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@shared/hooks/useAuth';
import { authApi } from './user/features/auth/api/auth.api';
import { Button } from '@shared/components/Button/Button';
import toast from 'react-hot-toast';

const FILES_URL = import.meta.env.VITE_FILES_URL;

export const Navbar: React.FC = () => {
    const { isAuthenticated, user, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try { await authApi.logout(); } catch { }
        clearAuth();
        navigate('/login');
        toast.success('Вийшли з системи');
        setMenuOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;

    const navLinkClass = (path: string) =>
        `text-sm font-medium transition-colors ${isActive(path) ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
        }`;

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                            <MessageSquare size={14} className="text-white" />
                        </div>
                        <span>Коментарі</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        {isAuthenticated ? (
                            <>
                                {user?.role === 'admin' && (
                                    <Link to="/admin/reports" className={navLinkClass('/admin/reports')}>
                                        <span className="flex items-center gap-1.5">
                                            <ShieldAlert size={14} />
                                            Скарги
                                        </span>
                                    </Link>
                                )}
                                <Link to="/my-comments" className={navLinkClass('/my-comments')}>
                                    <span className="flex items-center gap-1.5">
                                        <FileText size={14} />
                                        Мої коментарі
                                    </span>
                                </Link>
                                <Link to="/profile" className="flex items-center gap-2 group">
                                    {user?.avatar ? (
                                        <img
                                            src={`${FILES_URL}${user.avatar}`}
                                            alt={user.username}
                                            className="w-7 h-7 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-300 transition-all"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold text-xs">
                                                {user?.username?.[0]?.toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <span className={`text-sm font-medium ${isActive('/profile') ? 'text-blue-600' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                        {user?.username}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    <LogOut size={14} />
                                    Вийти
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Увійти</Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">Реєстрація</Button>
                                </Link>
                            </div>
                        )}
                    </nav>

                    <button
                        className="md:hidden p-2 text-slate-500 hover:text-slate-900"
                        onClick={() => setMenuOpen((v) => !v)}
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {menuOpen && (
                    <div className="md:hidden border-t border-slate-100 py-3 flex flex-col gap-3">
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" className="flex items-center gap-2 px-1" onClick={() => setMenuOpen(false)}>
                                    <User size={14} className="text-slate-500" />
                                    <span className="text-sm text-slate-700">{user?.username}</span>
                                </Link>
                                <Link to="/my-comments" className="flex items-center gap-2 px-1 text-sm text-slate-600" onClick={() => setMenuOpen(false)}>
                                    <FileText size={14} />
                                    Мої коментарі
                                </Link>
                                {user?.role === 'admin' && (
                                    <Link to="/admin/reports" className="flex items-center gap-2 px-1 text-sm text-slate-600" onClick={() => setMenuOpen(false)}>
                                        <ShieldAlert size={14} />
                                        Скарги
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="flex items-center gap-2 px-1 text-sm text-red-500">
                                    <LogOut size={14} />
                                    Вийти
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link to="/login" onClick={() => setMenuOpen(false)}>
                                    <Button variant="secondary" size="sm" className="w-full">Увійти</Button>
                                </Link>
                                <Link to="/register" onClick={() => setMenuOpen(false)}>
                                    <Button size="sm" className="w-full">Реєстрація</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};