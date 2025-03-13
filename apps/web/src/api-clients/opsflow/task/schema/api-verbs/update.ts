import type { TaskPriority } from '@/api-clients/opsflow/task/schema/type';

export interface TaskUpdateParameters {
    task_id: string;
    name?: string;
    priority?: TaskPriority;
    data?: Record<string, any>;
    project_id?: string;
}
