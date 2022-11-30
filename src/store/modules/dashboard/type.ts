
export const VIEWERS_TYPE = Object.freeze({
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
} as const);

export type ViewersType = typeof VIEWERS_TYPE[keyof typeof VIEWERS_TYPE];

export interface DashboardState {
    domainItems: DashboardItem[];
    projectItems: DashboardItem[];
}

export interface DashboardItem {
    domain_dashboard_id: string;
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
