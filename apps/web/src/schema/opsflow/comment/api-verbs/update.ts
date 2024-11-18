import type { MentionTargets } from '@/schema/opsflow/comment/type';

export interface CommentUpdateParameters {
    comment_id: string;
    comment: string;
    mentions?: MentionTargets;
}
