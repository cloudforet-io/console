import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { Tags } from '@/models';

import type { MonitoringType } from '@/common/modules/monitoring/config';

export enum COLLECT_MODE {
    all = 'ALL',
    create = 'CREATE',
    update = 'UPDATE'
}

export const UPGRADE_MODE = {
    AUTO: 'AUTO',
    MANUAL: 'MANUAL',
} as const;
export type UpgradeMode = typeof UPGRADE_MODE[keyof typeof UPGRADE_MODE];

export const COLLECTOR_QUERY_HELPER_SET = {
    COLLECTOR_ID: 'collector_id',
    NAME: 'name',
    LAST_COLLECTED_AT: 'last_collected_at',
    PROVIDER: 'provider',
    TAGS: 'tags',
    PLUGIN_INFO: 'plugin_info',
    STATE: 'state',
} as const;

export const COLLECTOR_ITEM_INFO_TYPE = {
    PLUGIN: 'PLUGIN',
    STATUS: 'STATUS',
    JOBS: 'JOBS',
    SCHEDULE: 'SCHEDULE',
} as const;
export interface FilterFormat {
    name: string;
    type: string;
    change_key: string[];
    resource_type: string;
    object_key?: string;
}

export interface PluginOptions {
    supported_resource_type: string[];
    filter_format: FilterFormat[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface CollectorPluginModel {
    plugin_id: string;
    version: string;
    options: PluginOptions;
    metadata: object;
    upgrade_mode: UpgradeMode;
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
    repository_info: object;
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

interface Capability {
    supported_schemas: string[];
    use_resource_secret: boolean;
    monitoring_type: MonitoringType;
    supported_providers?: string[];
    [key: string]: any;
}

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

export interface SecretModel {
    secret_id: string;
    provider: string;
    service_account_id: string;
    project_id: string;
    created_at: string;
}

export interface CollectorUpdateParameter {
    collector_id: string;
    name?: string;
    plugin_info?: Partial<CollectorPluginModel>;
    schedule?: Partial<Schedule>;
    tags?: Tags;
}

export interface CollectorCollectParameter {
    collector_id: string;
    collect_mode?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter?: any;
    secret_id?: string;
    secret_group_id?: string;
}

export interface CollectorCreateParameter {
    name: string;
    tags: Tags;
}



// TODO: Interfaces below must be moved to other directory that uses. (these are not global type for collector service)
interface CollectorPlugin {
    name?: string;
    icon?: string;
    info: CollectorPluginModel;
}
interface CollectorLink {
    name: string;
    params: CollectorDetailLinkParameter;
    query: CollectorDetailLinkQuery;
}
interface CollectorDetailLinkParameter {
    id?: string;
    collectorId?: string;
}
interface CollectorDetailLinkQuery {
    filters: string[];
    collectorId?: string;
}
export interface CollectorItemInfo {
    collectorId: string;
    name: string;
    plugin: CollectorPlugin;
    historyLink: CollectorLink,
    detailLink: CollectorLink;
}
