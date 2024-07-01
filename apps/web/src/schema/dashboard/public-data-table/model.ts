import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';

import type {
    DataInfo,
    DataTableDataType,
    DataTableOperator,
    DataTableOptions,
    DataTableSourceType, LabelsInfo,
} from '@/common/modules/widgets/types/widget-model';


export interface PublicDataTableModel {
    dashboard_id: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id: string;
    data_table_id: string;
    name?: string;
    data_type: DataTableDataType;
    source_type?: DataTableSourceType;
    operator?: DataTableOperator;
    options: DataTableOptions;
    tags?: Tags;
    labels_info?: LabelsInfo;
    data_info?: DataInfo;
    widget_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
