import type { Tags } from '@/schema/_common/model';

import type {
    DataTableSourceType, DataTableOptions,
} from '@/common/modules/widgets/types/model';

export interface PublicDataTableAddParameters {
    widget_id: string;
    name?: string;
    source_type: DataTableSourceType;
    options?: DataTableOptions;
    tags?: Tags;
}
