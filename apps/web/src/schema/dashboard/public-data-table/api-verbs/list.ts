import type { DataTableSourceType, DataTableDataType, DataTableOperator } from '@/common/modules/widgets/types/model';

export interface PublicDataTableListParameters {
    widget_id: string;
    query?: Record<string, any>;
    data_table_id?: string;
    name?: string;
    data_type?: DataTableDataType
    source_type?: DataTableSourceType;
    operator?: DataTableOperator;
}
