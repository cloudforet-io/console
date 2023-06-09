import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { ListType, Tags, TimeStamp } from '@/models';

import type { MonitoringType } from '@/common/modules/monitoring/config';

export enum COLLECT_MODE {
    all = 'ALL',
    create = 'CREATE',
    update = 'UPDATE'
}

export const COLLECTOR_STATE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;
export type CollectorState = typeof COLLECTOR_STATE[keyof typeof COLLECTOR_STATE];

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
    secret_filter: object;
}

export interface RepositoryPluginModel {
    plugin_id: string;
    name: string;
    state: CollectorState;
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

export interface CollectorModel {
    collector_id: string;
    name: string;
    state: CollectorState;
    provider: string;
    capability: Capability;
    schedule?: Schedule;
    plugin_info: CollectorPluginModel;
    created_at: string;
    last_collected_at: string;
    tags: Tags;
}

export interface CollectorUpdateParameter {
    collector_id: string;
    name?: string;
    plugin_info?: CollectorPluginModel;
    priority?: number;
    tags: Tags;
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

export interface Schedule {
    cron?: string;
    interval?: number;
    minutes?: number[];
    hours?: number[];
}

export interface ScheduleAddParameter {
    collector_id: string;
    name?: string;
    schedule: Schedule;
    filter?: any;
    collect_mode?: COLLECT_MODE;
}

export interface CollectorScheduleModel {
    schedule_id: string;
    name: string;
    collector_id: string;
    schedule: Schedule;
    filters: object;
    collect_mode: COLLECT_MODE;
    created_at: TimeStamp;
    last_schedule_at: TimeStamp;
}

export interface ScheduleUpdateParameter {
    schedule_id: string;
    collector_id: string;
    name?: string;
    schedule?: Schedule;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter?: any;
    collect_mode?: COLLECT_MODE;
}

export interface ScheduleDeleteParameter {
    schedule_id: string;
    collector_id: string;
}

export interface ScheduleListParameter {
    collector_id: string;
    schedule_id?: string;
}

export interface ScheduleGetParameter {
    collector_id: string;
    schedule_id: string;
}

export type CollectorListResp = ListType<CollectorModel>;
export type CollectorScheduleListResp = ListType<CollectorScheduleModel>;

interface CollectorPlugin {
    name?: string;
    icon?: string;
    info: CollectorPluginModel;
}
interface CollectorLink {
    name: string;
    param: CollectorDetailLinkParameter;
    query: CollectorDetailLinkQuery;
}
interface CollectorDetailLinkParameter {
    id: string;
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
