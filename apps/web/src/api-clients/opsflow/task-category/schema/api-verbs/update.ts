import type { Tags } from '@/api-clients/_common/schema/model';
import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';
import type { TaskStatusOptions, TaskStatusOptionWithOptionalId, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';


export interface TaskCategoryUpdateParameters {
    category_id: string;
    name?: string;
    description?: string;
    status_options?: TaskStatusOptions|Record<TaskStatusType, TaskStatusOptionWithOptionalId[]>;
    fields?: TaskField[];
    force?: boolean;
    tags?: Tags;
    package_id?: string;
}
