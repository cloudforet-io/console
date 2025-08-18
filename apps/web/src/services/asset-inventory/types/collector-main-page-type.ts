import type { Dictionary, Location } from 'vue-router/types/router';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type {
    CollectorPluginInfo,

} from '@/api-clients/inventory/collector/schema/model';
import type { Schedule } from '@/api-clients/inventory/collector/schema/type';
import type { JobStatus } from '@/api-clients/inventory/job/schema/type';

import type { RouteQueryString } from '@/lib/router-query-string';

interface CollectorPlugin {
    name?: string;
    icon?: string;
    info: CollectorPluginInfo;
}

export interface CollectorLink extends Location {
    name: string;
    params: CollectorDetailLinkParameter;
    query?: CollectorDetailLinkQuery;
}

interface CollectorDetailLinkParameter extends Dictionary<any> {
    id?: string;
    collectorId?: string;
}
interface CollectorDetailLinkQuery extends Dictionary<any> {
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
    resourceGroup: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'>;
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
