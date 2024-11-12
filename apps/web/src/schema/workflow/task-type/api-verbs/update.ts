import type { Tags } from '@/schema/_common/model';
import type { TaskField } from '@/schema/workflow/_types/task-field-type';

export interface TaskTypeUpdateParameters {
    task_type_id: string;
    name?: string;
    description?: string;
    fields?: TaskField[];
    tags?: Tags;
    category_id?: string;
}
