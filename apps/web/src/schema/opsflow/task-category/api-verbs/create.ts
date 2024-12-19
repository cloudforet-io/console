import type { Tags } from '@/schema/_common/model';
import type { TaskField } from '@/schema/opsflow/_types/task-field-type';
import type { TaskStatusType, TaskStatusOptionWithOptionalId } from '@/schema/opsflow/task/type';


export interface TaskCategoryCreateParameters {
    name: string;
    description?: string;
    status_options: Record<TaskStatusType, TaskStatusOptionWithOptionalId[]>;
    fields?: TaskField[];
    tags?: Tags;
    package_id: string;
}
