import type { CommentGetParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/get';
import type { CommentListParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/list';

export const commentKeys = {
    list: (params: CommentListParameters) => ['comment', 'list', params] as const,
    get: (idParam: CommentGetParameters['comment_id']) => ['comment', 'get', idParam] as const,
};
