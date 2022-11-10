import type {
    DASHBOARD_SCOPE_ENTIRE, DASHBOARD_SCOPE_SINGLE, DASHBOARD_VIEWER_PRIVATE, DASHBOARD_VIEWER_PUBLIC,
} from '@/services/dashboards/dashboard-create/config';

// SCOPE
export type DashboardScope = typeof DASHBOARD_SCOPE_ENTIRE | typeof DASHBOARD_SCOPE_SINGLE;

// VIEWER
export type DashboardViewerType = typeof DASHBOARD_VIEWER_PUBLIC | typeof DASHBOARD_VIEWER_PRIVATE;
