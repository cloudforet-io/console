import type { DashboardScope } from '@/schema/dashboard/_types/dashboard-type';

export interface PublicDashboardShareParameters {
    dashboard_id: string;
    scope: DashboardScope;
}
