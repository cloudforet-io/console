import type { DataTableSourceType, DataTableOperator, DataTableDataType } from '@/common/modules/widgets/types/widget-model';

export interface DataTableListParameters {
    widget_id: string;
    query?: Record<string, any>;
    data_table_id?: string;
    name?: string;
    data_type?: DataTableDataType
    source_type?: DataTableSourceType;
    operator?: DataTableOperator;
}
