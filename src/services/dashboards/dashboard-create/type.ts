import type { DASHBOARD_ENTIRE_SCOPE, DASHBOARD_SINGLE_SCOPE } from '@/services/dashboards/dashboard-create/config';

export type DashboardScope = typeof DASHBOARD_ENTIRE_SCOPE | typeof DASHBOARD_SINGLE_SCOPE;
