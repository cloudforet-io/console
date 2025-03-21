import type { CommentGetParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/get';
import type { CommentListParameters } from '@/api-clients/opsflow/comment/schema/api-verbs/list';

export const commentKeys = {
    all: ['comment'] as const,
    list: (params: CommentListParameters) => [...commentKeys.all, 'list', params] as const,
    get: (idParam: CommentGetParameters['comment_id']) => [...commentKeys.all, 'get', idParam] as const,
};

