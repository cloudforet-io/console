import type { Tags } from '@/schema/_common/model';

import type {
    DataTableOperator, DataTableOptions,
} from '@/common/modules/widgets/types/model';

export interface PublicDataTableTransformParameters {
    widget_id: string;
    name?: string;
    operator: DataTableOperator;
    options?: DataTableOptions;
    tags?: Tags;
}
