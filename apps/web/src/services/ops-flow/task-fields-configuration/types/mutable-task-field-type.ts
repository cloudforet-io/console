import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';

export type MutableTaskField = TaskField & {
    _field_id: string; // original field_id. immutable. it must be removed when saving
};

export type OptionalMutableTaskField = TaskField & {
    _field_id?: string; // original field_id. immutable. it must be removed when saving
};
