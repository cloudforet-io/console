import type { DataTableSourceType } from '@/common/modules/widgets/types/model';

export interface PublicDataTableListParameters {
    widget_id: string;
    query?: Record<string, any>;
    data_table_id?: string;
    name?: string;
    source_type?: DataTableSourceType;
}
