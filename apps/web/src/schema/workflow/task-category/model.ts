import type { Tags } from '@/schema/_common/model';
import type { TaskField } from '@/schema/workflow/_types/task-field-type';
import type { TaskStatusOption } from '@/schema/workflow/task/type';

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
