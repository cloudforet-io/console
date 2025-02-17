import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

export interface PrivateWidgetLoadSumParameters {
    widget_id: string;
    granularity: string;
    start: string;
    end: string;
    vars?:DashboardVars;
}
