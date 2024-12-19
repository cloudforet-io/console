import type { MentionTargets } from '@/schema/opsflow/comment/type';

export interface CommentCreateParameters {
    task_id: string;
    comment: string;
    mentions?: MentionTargets;
}
