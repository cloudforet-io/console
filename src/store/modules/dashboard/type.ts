import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

export const VIEWERS_TYPE = {
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
} as const;

export type ViewersType = typeof VIEWERS_TYPE[keyof typeof VIEWERS_TYPE];

export const SCOPE_TYPE = {
    DOMAIN: 'DOMAIN',
    PROJECT: 'PROJECT',
} as const;

export type ScopeType = typeof SCOPE_TYPE[keyof typeof SCOPE_TYPE];

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
    viewers: ViewersType;
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

