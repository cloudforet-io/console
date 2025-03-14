import type { MentionTargets } from '@/api-clients/opsflow/comment/schema/type';

export interface CommentCreateParameters {
    task_id: string;
    comment: string;
    mentions?: MentionTargets;
}
