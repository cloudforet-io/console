import type { Page } from '@/api-clients/_common/schema/type';
import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';
import type { Granularity } from '@/api-clients/dashboard/_types/widget-type';



export interface DataTableLoadParameters {
    data_table_id: string;
    granularity: Granularity;
    start?: string;
    end?: string;
    sort?: any[];
    page?: Page;
    vars?: DashboardVars;
}
