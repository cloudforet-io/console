import type { ResourceGroupType } from '@/schema/_common/type';
import type { WorkflowEventType } from '@/schema/workflow/event/type';

export interface WorkflowEventModel {
    event_id: string;
    event_type: WorkflowEventType;
    name: string;
    description: string;
    actor: string;
    task_id: string;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE' | 'PROJECT'>;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
