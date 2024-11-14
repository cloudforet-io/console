import type { MentionTargets } from '@/schema/workflow/comment/type';

export interface CommentUpdateParameters {
    comment_id: string;
    comment: string;
    mention_targets?: MentionTargets;
}
