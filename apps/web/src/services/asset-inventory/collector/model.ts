import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { Tags } from '@/models';

import type { MonitoringType } from '@/common/modules/monitoring/config';


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

// RepositoryPluginModel
interface Capability {
    supported_schemas: string[];
    use_resource_secret: boolean;
    monitoring_type: MonitoringType;
    supported_providers?: string[];
    [key: string]: any;
}

export interface RepositoryInfo {
    created_at: string;
    endpoint: string;
    name: string;
    repository_id: string;
    repository_type: string;
}

export interface RepositoryPluginModel {
    plugin_id: string;
    name: string;
    image: string;
    registry_type: 'DOCKER_HUB'|'AWS_PUBLIC_ECR'|'HARBOR';
    registry_url: string;
    registry_config: object;
    service_type: string;
    provider?: string;
    capability: Capability;
    template: {
        options: {
            schema: JsonSchema;
        }
    };
    repository_info: RepositoryInfo;
    project_id: string;
    labels: string[];
    version: string;
    tags: {
        icon?: string;
        description?: string;
        link?: string;
        beta?: string;
    } & Tags;
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
    created_at: string;
    last_collected_at: string;
    tags: Tags;
}

// SecretModel
export interface SecretModel {
    secret_id: string;
    provider: string;
    service_account_id: string;
    project_id: string;
    created_at: string;
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
export interface CollectorDeleteParameter {
    collectors: [string, ...string[]];
}

type JobStatus = |
    'IN_PROGRESS'| // One or more JobTasks are running
    'FAILURE'| // When one or more JobTasks are FAILURE or TIMEOUT
    'CANCELED'| // When a Job is Canceled
    'SUCCESS'; // When all JobTasks succeed

export interface JobModel {
    job_id: string;
    status: JobStatus;
    remained_tasks: number;
    total_tasks: number;
    failure_tasks: number;
    success_tasks: number;
    collector_id: string;
    plugin_id: string;
    created_at: string;
    finished_at: string;
    updated_at: string;
}
