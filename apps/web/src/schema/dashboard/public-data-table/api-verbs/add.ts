import type { Tags } from '@/schema/_common/model';
import type { DashboardVars } from '@/schema/dashboard/_types/dashboard-type';

import type {
    DataTableOptions, DataTableSourceType,
} from '@/common/modules/widgets/types/widget-model';



export interface DataTableAddParameters {
    widget_id: string;
    name?: string;
    source_type: DataTableSourceType;
    options?: DataTableOptions;
    tags?: Tags;
    vars?: DashboardVars;
}
