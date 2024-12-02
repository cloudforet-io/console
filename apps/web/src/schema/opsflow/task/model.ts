import type { FileModel } from '@/schema/file-manager/model';
import type { TaskPriority, TaskStatusType } from '@/schema/opsflow/task/type';

export interface TaskModel {
    task_id: string;
    name: string;
    status_id: string;
    status_type: TaskStatusType;
    priority: TaskPriority;
    description: string;
    data: Record<string, any>;
    files: FileModel[];
    assignee: string;
    task_type_id: string;
    category_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    started_at: string;
    updated_at: string;
    completed_at: string;
}
