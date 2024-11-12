import type { Tags } from '@/schema/_common/model';
import type { TaskStatusOption, TaskField } from '@/schema/workflow/_types/task-field-type';

export interface TaskCategoryModel {
    category_id: string;
    name: string;
    description: string;
    status_options: TaskStatusOption[];
    fields:TaskField[];
    tags: Tags;
    package_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
