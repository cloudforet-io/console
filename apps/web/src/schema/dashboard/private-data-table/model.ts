import type { Tags } from '@/schema/_common/model';

import type {
    DataInfo,
    DataTableDataType,
    DataTableOperator,
    DataTableOptions,
    DataTableSourceType, DataTableState, LabelsInfo,
} from '@/common/modules/widgets/types/widget-model';


export interface PrivateDataTableModel {
    dashboard_id: string;
    user_id: string;
    data_table_id: string;
    name?: string;
    data_type: DataTableDataType;
    source_type?: DataTableSourceType;
    operator?: DataTableOperator;
    options: DataTableOptions;
    sort_keys?: string[]; // Pivot only
    tags?: Tags;
    labels_info?: LabelsInfo;
    data_info?: DataInfo;
    widget_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
    state: DataTableState;
    error_message?: string;
}
