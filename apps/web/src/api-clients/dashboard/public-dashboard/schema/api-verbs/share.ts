import type { DashboardScope } from '@/api-clients/dashboard/_types/dashboard-type';

export interface PublicDashboardShareParameters {
    dashboard_id: string;
    scope: DashboardScope;
}
