import type { Tags } from '@/schema/_common/model';
import type { DashboardVars } from '@/schema/dashboard/_types/dashboard-type';

import type { DataTableOptions } from '@/common/modules/widgets/types/widget-model';



export interface DataTableUpdateParameters {
    data_table_id: string;
    name?: string;
    options?: DataTableOptions;
    tags?: Tags;
    vars?: DashboardVars;
}
