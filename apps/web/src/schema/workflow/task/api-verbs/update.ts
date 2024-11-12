import type { MentionTargets } from '@/schema/workflow/comment/type';

export interface TaskUpdateParameters {
    task_id: string;
    name?: string;
    description?: string;
    mention_targets?: MentionTargets;
    assignee?: string;
    data?: Record<string, any>;
    project_id?: string;
}
