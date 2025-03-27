import type { Tags } from '@/api-clients/_common/schema/model';
import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';
import type { TaskStatusOptionWithOptionalId, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';


export interface TaskCategoryCreateParameters {
    name: string;
    description?: string;
    status_options: Record<TaskStatusType, TaskStatusOptionWithOptionalId[]>;
    fields?: TaskField[];
    tags?: Tags;
    package_id: string;
}
