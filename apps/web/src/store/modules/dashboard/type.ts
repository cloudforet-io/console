import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { DomainDashboardModel, ProjectDashboardModel } from '@/services/dashboards/types/dashboard-model-type';


export interface DashboardState {
    domainItems: DomainDashboardModel[];
    projectItems: ProjectDashboardModel[];
    searchFilters: ConsoleFilter[];
    viewers: string;
    scope: DashboardScopeType;
    domainItemCount: number;
    projectItemCount: number;
    loading: boolean;
}

export const DASHBOARD_SCOPE_TYPE = {
    ALL: 'ALL',
    DOMAIN: 'DOMAIN',
    PROJECT: 'PROJECT',
} as const;
export type DashboardScopeType = typeof DASHBOARD_SCOPE_TYPE[keyof typeof DASHBOARD_SCOPE_TYPE];
