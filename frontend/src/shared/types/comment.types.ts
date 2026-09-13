export interface CommentUser {
    id: number;
    username: string;
    avatar: string | null;
}

export interface CommentFile {
    id: string;
    filePath: string;
}

export interface Comment {
    id: string;
    text: string | null;
    isDeleted: boolean;
    score: number;
    depth: number;
    parentId: string | null;
    dateTime: string;
    user: CommentUser | null;
    files: CommentFile[];
}

export type SortField = 'score' | 'date_time';
export type SortDirection = 'ASC' | 'DESC';

export interface CommentsQuery {
    page: number;
    sortField: SortField;
    sortDirection: SortDirection;
}