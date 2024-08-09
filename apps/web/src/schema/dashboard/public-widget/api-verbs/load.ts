import type { DashboardVars } from '@/schema/dashboard/_types/dashboard-type';

export interface PublicWidgetLoadParameters {
    widget_id: string;
    query: Record<string, any>;
    vars?: DashboardVars;
}
