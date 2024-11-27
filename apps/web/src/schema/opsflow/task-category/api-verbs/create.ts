import type { Tags } from '@/schema/_common/model';
import type { TaskField } from '@/schema/opsflow/_types/task-field-type';
import type { TaskStatusOption, TaskStatusType } from '@/schema/opsflow/task/type';

interface TaskStatusOptionWithOptionalId extends Omit<TaskStatusOption, 'status_id'> {
    status_id?: string;
}

export interface TaskCategoryCreateParameters {
    name: string;
    description?: string;
    status_options: Record<TaskStatusType, TaskStatusOptionWithOptionalId[]>;
    fields?: TaskField[];
    tags?: Tags;
    package_id: string;
}
