import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { DashboardViewer } from '@/services/dashboards/type';

export interface DashboardState {
    domainItems: DomainDashboardModel[];
    projectItems: ProjectDashboardModel[];
    searchFilters: ConsoleFilter[];
    viewers: string;
    scope: string;
    domainItemCount: number;
    projectItemCount: number;
}

export interface DashboardModel {
    name: string;
    viewers: DashboardViewer;
    version: number;
    layouts: any[];
    dashboard_options: any;
    settings: any;
    dashboard_options_schema: any;
    labels: any[];
    tags: any;
    user_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

export interface DomainDashboardModel extends DashboardModel {
    domain_dashboard_id: string;
}
export interface ProjectDashboardModel extends DashboardModel {
    project_dashboard_id: string;
    project_id: string;
}

