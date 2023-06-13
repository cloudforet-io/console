import type {
    CollectorPluginModel, Schedule, JobStatus,
} from '@/services/asset-inventory/collector/model';

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

export const JOB_STATE = {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    CREATED: 'CREATED',
    IN_PROGRESS: 'IN_PROGRESS',
    TIMEOUT: 'TIMEOUT',
    CANCELED: 'CANCELED',
    NONE: 'NONE',
} as const;

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
    schedule: Schedule;
    recentJobAnalyze: JobStatus[];
}
