import type { MentionTargets } from '@/api-clients/opsflow/comment/schema/type';

export interface CommentUpdateParameters {
    comment_id: string;
    comment: string;
    mentions?: MentionTargets;
}
