import { Tags, TimeStamp } from '@/models';

const DASHBOARD_SCOPE = {
    PRIVATE: 'PRIVATE',
    PUBLIC: 'PUBLIC',
} as const;

export type DASHBOARD_SCOPE = typeof DASHBOARD_SCOPE[keyof typeof DASHBOARD_SCOPE];

interface DefaultFilter {
    projects: string[];
    project_groups: string[];
    service_accounts: string[];
    provider: string[];
}
interface DashboardListResponse {
    created_at: TimeStamp;
    updated_at: TimeStamp;
    custom_layouts: string[];
    dashboard_id: string;
    default_filter?: DefaultFilter;
    default_layout_id: string;
    domain_id?: string;
    name: string;
    scope: 'PRIVATE';
    tags: Tags;
    user_id: string;
}

export interface DashboardItem extends DashboardListResponse {
    label: string;
    routeName: string;
}
