import type { Tags } from '../../../../_common/schema/model';
import type { TaskField } from '../../../_types/task-field-type';
import type { TaskStatusType, TaskStatusOptionWithOptionalId } from '../../../task/schema/type';


export interface TaskCategoryCreateParameters {
    name: string;
    description?: string;
    status_options: Record<TaskStatusType, TaskStatusOptionWithOptionalId[]>;
    fields?: TaskField[];
    tags?: Tags;
    package_id: string;
}
