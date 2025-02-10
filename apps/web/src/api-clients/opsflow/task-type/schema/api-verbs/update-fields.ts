import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';

export interface TaskTypeUpdateFieldsParameters {
    task_type_id: string;
    fields: TaskField[];
    force: boolean;
}
