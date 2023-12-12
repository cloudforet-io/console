import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { Tags } from '@/schema/_common/model';
import type { PermissionGroup } from '@/schema/identity/role-binding/type';
import type { Capability } from '@/schema/repository/plugin/model';


// CollectorPluginModel
export const UPGRADE_MODE = {
    AUTO: 'AUTO',
    MANUAL: 'MANUAL',
} as const;
export type UpgradeMode = typeof UPGRADE_MODE[keyof typeof UPGRADE_MODE];

export interface CollectorOptions {
    [key: string]: any;
}
export interface CollectorMetadata {
    options_schema: JsonSchema;
    [key: string]: any;
}
export interface CollectorPluginModel {
    plugin_id: string;
    version: string;
    options: CollectorOptions;
    metadata: CollectorMetadata;
    upgrade_mode: UpgradeMode;
    secret_filter?: {
        state: 'ENABLED'|'DISABLED';
        service_accounts?: string[];
        schemas?: string[];
        secrets?: string[];
    }
}


// CollectorModel
export const COLLECTOR_SECRET_STATE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;
export type CollectorSecretState = typeof COLLECTOR_SECRET_STATE[keyof typeof COLLECTOR_SECRET_STATE];
interface SecretFilter {
    state: CollectorSecretState;
    secrets?: string[];
    service_accounts?: string[];
    schemas?: string[];
    exclude_secrets?: string[];
    exclude_service_accounts?: string[];
    exclude_schemas?: string[];
}
export const COLLECTOR_SCHEDULE_STATE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;
export type CollectorScheduleState = typeof COLLECTOR_SCHEDULE_STATE[keyof typeof COLLECTOR_SCHEDULE_STATE];
export interface Schedule {
    state: CollectorScheduleState;
    hours?: number[];
}
export interface CollectorModel {
    collector_id: string;
    name: string;
    provider: string;
    capability: Capability;
    schedule?: Schedule;
    secret_filter: SecretFilter;
    plugin_info: CollectorPluginModel;
    workspace_id: string;
    permission_group: PermissionGroup;
    created_at: string;
    last_collected_at: string;
    tags: Tags;
}

// collector api parameters
export interface CollectorUpdateParameter {
    collector_id: string;
    name?: string;
    schedule?: Schedule; // backend api will replace whole schedule object
    secret_filter?: SecretFilter; // backend api will replace whole schedule object
    tags?: Tags;
}
export interface CollectorCreateParameter {
    plugin_info?: Partial<CollectorPluginModel>;
    provider?: string;
    name?: string;
    schedule?: Schedule; // backend api will replace whole schedule object
    secret_filter?: SecretFilter; // backend api will replace whole schedule object
    tags?: Tags;
}
export interface CollectorUpdatePluginParameter {
    collector_id: string;
    version?: string;
    options?: CollectorOptions; // backend api will replace whole schedule object
    upgrade_mode?: UpgradeMode;
}

