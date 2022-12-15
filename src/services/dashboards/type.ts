import type { Tags } from '@/models';

import type { DASHBOARD_SCOPE, DASHBOARD_VIEWER } from '@/services/dashboards/config';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/config';

export type DashboardScope = keyof typeof DASHBOARD_SCOPE;
export type DashboardViewer = keyof typeof DASHBOARD_VIEWER;

type DomainDashboardScope = 'DOMAIN'|'USER'; // DOMAIN: Viewer is Public, USER: Viewer is Private
type ProjectDashboardScope = 'PROJECT'|'USER';

interface DashboardConfig {
    name: string;
    layouts: DashboardLayoutWidgetInfo[][];
    dashboard_options: object,
    settings: {
        date_range: {
            enabled: boolean;
        },
        currency: {
            enabled: boolean;
        },
    },
    dashboard_options_schema: object;
    labels: string[];
}

// backend data
export interface DomainDashboardInfo extends DashboardConfig {
    domain_dashboard_id: string;
    scope: DomainDashboardScope;
    tags: Tags;
    user_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectDashboardInfo extends DashboardConfig {
    project_dashboard_id: string;
    scope: ProjectDashboardScope;
    project_id: string;
    tags: Tags;
    user_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

export type DashboardInfo = DomainDashboardInfo | ProjectDashboardInfo;


export interface Period {
    start?: string;
    end?: string;
}
