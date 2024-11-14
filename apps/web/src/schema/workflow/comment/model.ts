import type { ResourceGroupType } from '@/schema/_common/type';
import type { CommentType, MentionTargets } from '@/schema/workflow/comment/type';

export interface WorkflowCommentModel {
    comment_id: string;
    comment: string;
    comment_type: CommentType;
    is_edited: boolean;
    mention_targets: MentionTargets;
    task_id: string;
    user_id: string;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'PROJECT'>;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
