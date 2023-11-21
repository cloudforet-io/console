import type { Tags } from '@/models';

import type { DashboardTemplate, DashboardViewer } from '@/services/dashboards/config';

export interface DomainDashboardModel extends DashboardTemplate {
    domain_dashboard_id: string;
    viewers: DashboardViewer;
    tags: Tags;
    user_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectDashboardModel extends DashboardTemplate {
    project_dashboard_id: string;
    project_id: string;
    viewers: DashboardViewer;
    tags: Tags;
    user_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

export type DashboardModel = DomainDashboardModel | ProjectDashboardModel;
