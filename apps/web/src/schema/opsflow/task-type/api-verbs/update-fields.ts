import type { TaskField } from '@/schema/opsflow/_types/task-field-type';

export interface TaskTypeUpdateFieldsParameters {
    task_type_id: string;
    fields: TaskField[];
    category_id: string;
    force: boolean;
}
