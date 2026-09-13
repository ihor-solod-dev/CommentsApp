import { create } from 'zustand';

export type VoteType = 'like' | 'dislike';

interface VotesState {
    votes: Record<string, VoteType>;
    setVotes: (votes: Record<string, VoteType>) => void;
    setVote: (commentId: string, voteType: VoteType | null) => void;
    getVote: (commentId: string) => VoteType | null;
}

export const useVotesStore = create<VotesState>((set, get) => ({
    votes: {},
    setVotes: (votes) => set({ votes }),
    setVote: (commentId, voteType) =>
        set((state) => {
            const next = { ...state.votes };
            if (voteType === null) {
                delete next[commentId];
            } else {
                next[commentId] = voteType;
            }
            return { votes: next };
        }),
    getVote: (commentId) => get().votes[commentId] ?? null,
}));