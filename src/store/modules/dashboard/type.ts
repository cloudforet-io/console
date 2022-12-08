import type { QueryStoreFilter } from '@cloudforet/core-lib/query/type';

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
    domainItems?: DomainDashboardItem[];
    projectItems?: ProjectDashboardItem[];
    searchFilters: QueryStoreFilter[];
    viewers: string;
    scope: string;
}

export interface DashboardItem {
    name: string;
    viewers: ViewersType;
    version: number;
    layouts: any[];
    dashboard_options: any;
    settings: any;
    dashboard_options_schema: any;
    labels: string[];
    tags: any;
    user_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

export interface DomainDashboardItem extends DashboardItem {
    domain_dashboard_id: string;
}
export interface ProjectDashboardItem extends DashboardItem {
    project_dashboard_id: string;
}

