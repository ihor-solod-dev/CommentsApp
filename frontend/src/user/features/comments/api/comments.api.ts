import { apiClient } from '@shared/api/axios.instance';
import { getGraphQLClient } from '@shared/api/graphql.client';
import { gql } from 'graphql-request';
import { Comment, CommentFile, CommentsQuery } from '@shared/types/comment.types';
import { PaginatedResponse } from '@shared/types/api.types';
import { filesClient } from '@shared/api/files.client';

const GET_CHILDREN = gql`
  query GetCommentChildren($parentId: ID!, $limit: Int!, $offset: Int!) {
    commentChildren(parentId: $parentId, limit: $limit, offset: $offset) {
      total
      items {
        id
        text
        isDeleted
        score
        depth
        parentId
        dateTime
        totalChildren
        user {
          id
          username
          avatar
        }
        files {
          id
          filePath
        }
      }
    }
  }
`;

export const commentsApi = {
    getRootComments: (query: CommentsQuery) =>
        apiClient
            .get<{ data: PaginatedResponse<Comment> }>('/comments', { params: query })
            .then((r) => r.data.data),

    getMyComments: (query: CommentsQuery) =>
        apiClient
            .get<{ data: PaginatedResponse<Comment> }>('/comments/my', { params: query })
            .then((r) => r.data.data),

    getCommentById: (id: string) =>
        apiClient.get<{ data: Comment }>(`/comments/${id}`).then((r) => r.data.data),

    createComment: (data: {
        text: string;
        parentId?: string;
        captchaId: string;
        captchaAnswer: string;
        files?: CommentFile[];
    }) =>
        apiClient.post<{ data: Comment }>('/comments', data).then((r) => r.data.data),

    updateComment: (id: string, data: { text: string; captchaId: string; captchaAnswer: string }) =>
        apiClient.patch<{ data: Comment }>(`/comments/${id}`, data).then((r) => r.data.data),

    deleteComment: (id: string) => apiClient.delete(`/comments/${id}`),

    getChildren: async (
        parentId: string,
        limit: number,
        offset: number,
    ): Promise<{ items: (Comment & { totalChildren: number })[]; total: number }> => {
        const client = getGraphQLClient();
        const data = await client.request<{
            commentChildren: { items: (Comment & { totalChildren: number })[]; total: number };
        }>(GET_CHILDREN, { parentId, limit, offset });
        return data.commentChildren;
    },

    translate: (commentId: string, targetLang: string) =>
        apiClient
            .post<{ data: string }>(`/translate/${commentId}`, { targetLang })
            .then((r) => r.data.data),

    generateCaptcha: () =>
        apiClient.post<{ data: { id: string; svg: string } }>('/captcha/generate').then((r) => r.data.data),

    presignUpload: (mimeType: string) =>
        apiClient
            .post<{ data: { fileId: string; uploadUrl: string; token: string } }>('/files/presign', { mimeType })
            .then((r) => r.data.data),

    uploadFile: async (file: File): Promise<{ fileId: string; filePath: string }> => {
        const presign = await commentsApi.presignUpload(file.type);

        const formData = new FormData();
        formData.append('file', file);

        const uploadPath = new URL(presign.uploadUrl).pathname;

        const response = await filesClient.post(uploadPath, formData, {
            headers: {
                'x-upload-token': presign.token,
                'Content-Type': 'multipart/form-data',
            },
        });

        const filePath = response.data?.data?.filePath;

        if (!filePath) {
            throw new Error('No filePath returned from files service');
        }

        return {
            fileId: presign.fileId,
            filePath,
        };
    },
};