import type { Tags } from '@/schema/_common/model';

import type {
    DataTableOptions, DataTableSourceType,
} from '@/common/modules/widgets/types/model';

export interface PublicDataTableAddParameters {
    widget_id: string;
    name?: string;
    source_type: DataTableSourceType;
    options?: DataTableOptions;
    tags?: Tags;
}
