import type { MentionTargets } from '@/api-clients/opsflow/comment/schema/type';
import type { TaskPriority } from '@/api-clients/opsflow/task/schema/type';

export interface TaskCreateParameters {
    task_type_id: string;
    name: string;
    status_id: string;
    priority?: TaskPriority;
    description?: string;
    files?: string[];
    mentions?: MentionTargets;
    assignee?: string;
    data?: Record<string, any>;
    project_id: string;
}
