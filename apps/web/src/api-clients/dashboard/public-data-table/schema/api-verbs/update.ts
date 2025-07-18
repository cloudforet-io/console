import type { Tags } from '@/api-clients/_common/schema/model';
import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

import type { DataTableAddOptions, DataTableOptions, DataTableTransformOptions } from '@/common/modules/widgets/types/widget-model';



export interface DataTableUpdateParameters {
    data_table_id: string;
    name?: string;
    options?: DataTableOptions;
    tags?: Tags;
    vars?: DashboardVars;
}

// derive from DataTableAddParameters
export interface DataTableAddUpdateParameters {
    data_table_id: string;
    name?: string;
    options?: DataTableAddOptions;
    tags?: Tags;
    vars?: DashboardVars;
}
export interface DataTableTransformUpdateParameters {
    data_table_id: string;
    name?: string;
    options?: DataTableTransformOptions;
    tags?: Tags;
    vars?: DashboardVars;
}
