import type { Tags } from '@/schema/_common/model';

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
}
