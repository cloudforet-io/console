import type { Tags } from '@/schema/_common/model';

import type { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import type {
    DataInfo, DataTableAddOptions,
    DataTableDataType,
    DataTableOperator,
    DataTableSourceType, DataTableTransformOptions, LabelsInfo,
} from '@/common/modules/widgets/types/widget-model';


export type PrivateDataTableModel = DataTableAddModel | DataTableTransformModel;

/* Add */
interface DataTableAddModel extends BaseDataTableModel {
    data_type: typeof DATA_TABLE_TYPE.ADDED;
    source_type: DataTableSourceType;
    options: DataTableAddOptions;
}

/* Transform */
interface DataTableTransformModel extends BaseDataTableModel {
    data_type: typeof DATA_TABLE_TYPE.TRANSFORMED;
    operator: DataTableOperator;
    options: DataTableTransformOptions;
}

/* Base */
interface BaseDataTableModel {
    dashboard_id: string;
    user_id: string;
    data_table_id: string;
    name?: string;
    data_type: DataTableDataType;
    tags?: Tags;
    labels_info?: LabelsInfo;
    data_info?: DataInfo;
    widget_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
