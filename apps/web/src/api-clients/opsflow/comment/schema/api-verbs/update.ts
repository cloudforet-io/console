import type { MentionTargets } from '../type';

export interface CommentUpdateParameters {
    comment_id: string;
    comment: string;
    mentions?: MentionTargets;
}
