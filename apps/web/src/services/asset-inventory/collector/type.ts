/* eslint-disable camelcase */
import type { ListType, Tags, TimeStamp } from '@/models';

export enum COLLECT_MODE {
    all = 'ALL',
    create = 'CREATE',
    update = 'UPDATE'
}

export enum COLLECTOR_STATE {
    enabled = 'ENABLED',
    disabled = 'DISABLED'
}

export const UPGRADE_MODE = Object.freeze({
    AUTO: 'AUTO',
    MANUAL: 'MANUAL',
});

export const CollectorQueryHelperSet = {
    COLLECTOR_ID: 'collector_id',
    NAME: 'name',
    LAST_COLLECTED_AT: 'last_collected_at',
    PROVIDER: 'provider',
    TAGS: 'tags',
    PLUGIN_INFO: 'plugin_info',
    STATE: 'state',
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
    secret_id?: string;
    secret_group_id?: string;
    provider?: string;
}

export interface CollectorModel extends Tags {
    collector_id: string;
    name: string;
    state: COLLECTOR_STATE;
    provider: string;
    capability: any;
    plugin_info: CollectorPluginModel;
    priority: number;
    created_at: TimeStamp;
    last_collected_at: TimeStamp | null;
}

export interface CollectorUpdateParameter extends Tags {
    collector_id: string;
    name?: string;
    plugin_info?: CollectorPluginModel;
    priority?: number;
}

export interface CollectorCollectParameter {
    collector_id: string;
    collect_mode?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter?: any;
    secret_id?: string;
    secret_group_id?: string;
}

export interface CollectorCreateParameter extends Tags {
    name: string;
}

export interface Schedule {
    hours?: string[];
    interval?: number;
}

export interface ScheduleAddParameter {
    collector_id: string;
    name?: string;
    schedule: Schedule;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter?: any;
    collect_mode?: COLLECT_MODE;
}

export interface CollectorScheduleModel {
    schedule_id: string;
    name: string;
    collector_info: CollectorModel;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: any;
    collect_mode: COLLECT_MODE;
    schedule: Schedule;
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
