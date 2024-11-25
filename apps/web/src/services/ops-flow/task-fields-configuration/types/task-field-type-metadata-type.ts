import type { TaskFieldType } from '@/schema/opsflow/_types/task-field-type';

export interface TaskFieldTypeMetadata {
    type: TaskFieldType;
    name: string;
    icon: string;
}
