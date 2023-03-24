import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { DomainDashboardModel, ProjectDashboardModel } from '@/services/dashboards/model';

export interface DashboardState {
    domainItems: DomainDashboardModel[];
    projectItems: ProjectDashboardModel[];
    searchFilters: ConsoleFilter[];
    viewers: string;
    scope: string;
    domainItemCount: number;
    projectItemCount: number;
    loading: boolean;
}

