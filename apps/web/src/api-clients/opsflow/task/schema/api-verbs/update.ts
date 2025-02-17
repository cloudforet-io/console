import type { TaskPriority } from '../type';

export interface TaskUpdateParameters {
    task_id: string;
    name?: string;
    priority?: TaskPriority;
    data?: Record<string, any>;
    project_id?: string;
}
