import type { Tags } from '@/schema/_common/model';

import type {
    DataTableAction, DataTableOperator, DataTableOptions, DataTableSourceType,
} from '@/common/modules/widgets/types/model';

export interface PublicDataTableCreateParameters {
    widget_id: string;
    name?: string;
    action: DataTableAction;
    source_type?: DataTableSourceType;
    operator?: DataTableOperator;
    options?: DataTableOptions;
    tags?: Tags;
}
