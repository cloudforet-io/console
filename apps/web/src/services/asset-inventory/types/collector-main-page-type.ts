import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type {
    CollectorPluginModel,

} from '@/schema/inventory/collector/model';
import type { Schedule } from '@/schema/inventory/collector/type';
import type { JobStatus } from '@/schema/inventory/job/type';

import type { RouteQueryString } from '@/lib/router-query-string';





export const COLLECTOR_QUERY_HELPER_SET = {
    COLLECTOR_ID: 'collector_id',
    NAME: 'name',
    LAST_COLLECTED_AT: 'last_collected_at',
    PROVIDER: 'provider',
    TAGS: 'tags',
    PLUGIN_INFO: 'plugin_info',
    SCHEDULE: 'schedule',
    SECRET_FILTER: 'secret_filter',
} as const;

interface CollectorPlugin {
    name?: string;
    icon?: string;
    info: CollectorPluginModel;
}

export interface CollectorLink {
    name: string;
    params: CollectorDetailLinkParameter;
    query?: CollectorDetailLinkQuery;
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
    workspaceId: string;
    name: string;
    plugin: CollectorPlugin;
    historyLink: CollectorLink,
    detailLink: CollectorLink;
    schedule?: Schedule;
    recentJobAnalyze?: JobAnalyzeStatus[];
    hasJobList?: boolean
}

export type CollectorMainPageQuery = Partial<Record<'filters'|'provider', RouteQueryString>>;

export interface CollectorMainPageQueryValue {
    provider?: string;
    filters?: ConsoleFilter[];
}

export interface JobAnalyzeStatus {
    job_id: string;
    status: JobStatus;
    finished_at: string;
    remained_tasks: number;
    total_tasks: number;
    secret_id?: string;
}
export interface JobAnalyzeInfo {
    collector_id: string;
    job_status: JobAnalyzeStatus[]
}
