import type { Tags } from '@/api-clients/_common/schema/model';
import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

import type { DataTableOptions } from '@/common/modules/widgets/types/widget-model';



export interface DataTableUpdateParameters {
    data_table_id: string;
    name?: string;
    options?: DataTableOptions;
    tags?: Tags;
    vars?: DashboardVars;
}
