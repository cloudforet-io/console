import type { DashboardVars } from '@/schema/dashboard/_types/dashboard-type';

export interface PrivateWidgetLoadParameters {
    widget_id: string;
    query?: Record<string, any>;
    vars?: DashboardVars;
}
