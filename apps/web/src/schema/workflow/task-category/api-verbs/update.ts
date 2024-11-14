import type { Tags } from '@/schema/_common/model';
import type { TaskField, TaskStatusOption } from '@/schema/workflow/_types/task-field-type';

export interface TaskCategoryUpdateParameters {
    category_id: string;
    name?: string;
    description?: string;
    status_options: TaskStatusOption[];
    fields?: TaskField[];
    force?: boolean;
    tags?: Tags;
    package_id?: string;
}
