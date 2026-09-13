import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { votesApi, VoteType } from '../api/votes.api';
import { useAuthStore } from '@shared/hooks/useAuth';
import { useVotesStore } from '@shared/stores/votesStore';

export function useVote(commentId: string, initialScore: number) {
    const [score, setScore] = useState(initialScore);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const { getVote, setVote } = useVotesStore();
    const navigate = useNavigate();

    const currentVote = getVote(commentId);

    const handleVote = async (voteType: VoteType) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setIsLoading(true);
        try {
            const result = await votesApi.vote(commentId, voteType);
            setScore(result.score);
            
            if (result.action === 'removed') {
                setVote(commentId, null);
            } else {
                setVote(commentId, voteType as VoteType);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error?.message ?? 'Помилка голосування');
        } finally {
            setIsLoading(false);
        }
    };

    return { score, currentVote, isLoading, handleVote };
}