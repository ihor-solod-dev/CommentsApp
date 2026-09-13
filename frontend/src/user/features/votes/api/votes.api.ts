import { apiClient } from '@shared/api/axios.instance';

export type VoteType = 'like' | 'dislike';

export const votesApi = {
    vote: (commentId: string, voteType: VoteType) =>
        apiClient
            .post<{ data: { action: string; voteType: string; score: number } }>(
                `/votes/${commentId}`,
                { voteType },
            )
            .then((r) => r.data.data),

    getMyVotes: () =>
        apiClient
            .get<{ data: Record<string, string> }>('/votes/my')
            .then((r) => r.data.data),
};