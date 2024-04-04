import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { STATE } from '@/schema/inventory/collector/constant';

export interface CollectorOptions {
    [key: string]: any;
}
export type ScheduleState = typeof STATE[keyof typeof STATE];

export interface CollectorMetadata {
    options_schema: JsonSchema;

    [key: string]: any;
}

export interface SecretFilter {
    state: ScheduleState;
    secrets: string[];
    service_accounts: string[];
    schemas: string[];
    exclude_secrets: string[];
    exclude_service_accounts: string[];
    exclude_schemas: string[];
}

export interface Schedule {
    state: ScheduleState;
    hours: number[];
}

