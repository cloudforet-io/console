import type { Tags } from '@/schema/_common/model';

import type { DataTableOptions } from '@/common/modules/widgets/types/model';

export interface PublicDataTableCreateParameters {
    data_table_id: string;
    name?: string;
    options?: DataTableOptions;
    tags?: Tags;
}
