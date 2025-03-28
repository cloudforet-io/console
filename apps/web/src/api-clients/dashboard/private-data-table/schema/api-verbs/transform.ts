import type { Tags } from '@/api-clients/_common/schema/model';
import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

import type {
    DataTableOperator,
    DataTableOptions,
} from '@/common/modules/widgets/types/widget-model';



export interface DataTableTransformParameters {
    widget_id: string;
    name?: string;
    operator: DataTableOperator;
    options?: DataTableOptions;
    tags?: Tags;
    vars?: DashboardVars;
}
