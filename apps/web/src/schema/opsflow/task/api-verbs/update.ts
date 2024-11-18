import type { FileModel } from '@/schema/file-manager/model';
import type { MentionTargets } from '@/schema/opsflow/comment/type';
import type { TaskPriority } from '@/schema/opsflow/task/type';

export interface TaskUpdateParameters {
    task_id: string;
    name?: string;
    priority?: TaskPriority;
    description?: string;
    files?: FileModel[];
    mentions?: MentionTargets;
    assignee?: string;
    data?: Record<string, any>;
    project_id?: string;
}
