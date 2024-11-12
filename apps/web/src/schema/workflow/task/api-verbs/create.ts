import type { ResourceGroupType } from '@/schema/_common/type';
import type { MentionTargets } from '@/schema/workflow/comment/type';

export interface TaskCreateParameters {
    task_type_id: string;
    name: string;
    status: string;
    description?: string;
    mention_targets?: MentionTargets;
    assignee?: string;
    data?: Record<string, any>;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'PROJECT'>;
    project_id?: string;
    workspace_id?: string;
}
