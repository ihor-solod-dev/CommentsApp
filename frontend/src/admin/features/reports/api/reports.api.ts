import { apiClient } from '@shared/api/axios.instance';

export const reportsApi = {
    getTopReported: () =>
        apiClient.get<{ data: any[] }>('/reports/top').then((r) => r.data.data),

    getCommentReports: (commentId: string, limit: number, offset: number) =>
        apiClient
            .get<{ data: any[] }>(`/reports/${commentId}/list`, { params: { limit, offset } })
            .then((r) => r.data.data),

    dismissReports: (commentId: string) =>
        apiClient.delete(`/reports/${commentId}/dismiss`),

    deleteComment: (commentId: string) =>
        apiClient.delete(`/comments/${commentId}`),
};