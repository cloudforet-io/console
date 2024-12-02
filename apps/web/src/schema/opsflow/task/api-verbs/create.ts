import type { FileModel } from '@/schema/file-manager/model';
import type { MentionTargets } from '@/schema/opsflow/comment/type';
import type { TaskPriority } from '@/schema/opsflow/task/type';

export interface TaskCreateParameters {
    task_type_id: string;
    name: string;
    status_id: string;
    priority?: TaskPriority;
    description?: string;
    files?: FileModel[];
    mentions?: MentionTargets;
    assignee?: string;
    data?: Record<string, any>;
    project_id: string;
}
