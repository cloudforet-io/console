import type { Tags } from '@/schema/_common/model';
import type { TaskField } from '@/schema/opsflow/_types/task-field-type';
import type { TaskStatusOptions } from '@/schema/opsflow/task/type';

export interface TaskCategoryUpdateParameters {
    category_id: string;
    name?: string;
    description?: string;
    status_options: TaskStatusOptions;
    fields?: TaskField[];
    force?: boolean;
    tags?: Tags;
    package_id?: string;
}
