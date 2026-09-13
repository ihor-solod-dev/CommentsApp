import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@shared/hooks/useAuth';
import { useWebSocket } from '@shared/hooks/useWebSocket';
import { useVotesStore, VoteType } from '@shared/stores/votesStore';
import { authApi } from './user/features/auth/api/auth.api';
import { votesApi } from './user/features/votes/api/votes.api';
import { HomePage } from './user/pages/HomePage/HomePage';
import { LoginPage } from './user/pages/LoginPage/LoginPage';
import { RegisterPage } from './user/pages/RegisterPage/RegisterPage';
import { ProfilePage } from './user/pages/ProfilePage/ProfilePage';
import { MyCommentsPage } from './user/pages/MyCommentsPage/MyCommentsPage';
import { ReportsPage } from './admin/pages/ReportsPage/ReportsPage';
import { Navbar } from './Navbar';

const AuthGuard: React.FC = () => {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminGuard: React.FC = () => {
    const { user, isAuthenticated } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role !== 'admin') return <Navigate to="/" replace />;
    return <Outlet />;
};

const GuestGuard: React.FC = () => {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export const App: React.FC = () => {
    const { isAuthenticated, setAuth, clearAuth } = useAuthStore();
    const { setVotes } = useVotesStore();
    useWebSocket(isAuthenticated);

    useEffect(() => {
        authApi
            .refresh()
            .then((result) => {
                setAuth(result.user, result.accessToken);
                return votesApi.getMyVotes();
            })
            .then((votes) => setVotes(votes as Record<string, 'like' | 'dislike'>))
            .catch(() => clearAuth());
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            const loadMyVotes = async () => {
                try {
                    const votes = await votesApi.getMyVotes();
                    useVotesStore.getState().setVotes(votes as Record<string, VoteType>);
                } catch { }
            };  

            loadMyVotes();
        }
    }, [isAuthenticated]);

    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        borderRadius: '12px',
                        background: '#1e293b',
                        color: '#f8fafc',
                        fontSize: '14px',
                    },
                }}
            />
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route element={<GuestGuard />}>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                        </Route>
                        <Route element={<AuthGuard />}>
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/my-comments" element={<MyCommentsPage />} />
                        </Route>
                        <Route path="/admin" element={<AdminGuard />}>
                            <Route path="reports" element={<ReportsPage />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};