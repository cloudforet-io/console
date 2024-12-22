import type { DashboardVars } from '@/schema/dashboard/_types/dashboard-type';

export interface PublicWidgetLoadSumParameters {
    widget_id: string;
    data_table_id: string;
    granularity: string;
    start: string;
    end: string;
    vars?:DashboardVars;
}
