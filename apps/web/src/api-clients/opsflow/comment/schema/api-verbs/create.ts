import type { MentionTargets } from '../type';

export interface CommentCreateParameters {
    task_id: string;
    comment: string;
    mentions?: MentionTargets;
}
