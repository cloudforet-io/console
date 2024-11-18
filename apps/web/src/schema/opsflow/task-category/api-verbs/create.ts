import type { Tags } from '@/schema/_common/model';
import type { TaskField } from '@/schema/opsflow/_types/task-field-type';
import type { TaskStatusOptions } from '@/schema/opsflow/task/type';

export interface TaskCategoryCreateParameters {
    name: string;
    description?: string;
    status_options: TaskStatusOptions;
    fields?: TaskField[];
    tags?: Tags;
    package_id: string;
}
