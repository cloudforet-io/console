import type { Tags } from '@/schema/_common/model';
import type { TaskField, TaskStatusOption } from '@/schema/workflow/_types/task-field-type';

export interface TaskCategoryCreateParameters {
    name: string;
    description?: string;
    status_options: TaskStatusOption[];
    fields?: TaskField[];
    tags?: Tags;
    package_id: string;
}
