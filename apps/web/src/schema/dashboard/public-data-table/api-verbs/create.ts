import type { Tags } from '@/schema/_common/model';

import type { DataTableSourceType } from '@/common/modules/widgets/types/model';

export interface PublicDataTableCreateParameters {
    widget_id: string;
    name?: string;
    source_type: DataTableSourceType;
    options?: Record<string, any>;
    tags?: Tags;
}
