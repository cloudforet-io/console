import type { ResourceGroupType } from '@/schema/_common/type';
import type { TaskStatusType } from '@/schema/workflow/task/type';

export interface TaskModel {
    task_id: string;
    name: string;
    status: string;
    status_type: TaskStatusType;
    description: string;
    data: Record<string, any>;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'PROJECT'>;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    started_at: string;
    updated_at: string;
    completed_at: string;
}
