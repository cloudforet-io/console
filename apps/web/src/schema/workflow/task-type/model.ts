import type { Tags } from '@/schema/_common/model';
import type { TaskField } from '@/schema/workflow/_types/task-field-type';

export interface TaskTypeModel {
    task_type_id: string;
    name: string;
    description: string;
    assignee?: string;
    fields: TaskField[];
    tags: Tags;
    category_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
