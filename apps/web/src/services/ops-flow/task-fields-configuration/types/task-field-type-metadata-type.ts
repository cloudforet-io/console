import type { TaskFieldType } from '@/api-clients/opsflow/_types/task-field-type';

import type { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';

export interface TaskFieldTypeMetadata {
    type: TaskFieldType;
    name: string;
    icon: string;
}

export type DefaultTaskFieldId = typeof DEFAULT_FIELD_ID_MAP[keyof typeof DEFAULT_FIELD_ID_MAP];
