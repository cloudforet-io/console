import type { ComponentPublicInstance } from 'vue';

import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';

import type { DataTableQueryFilter } from '@/common/modules/widgets/types/widget-model';

export type DataTableModel = PublicDataTableModel | PrivateDataTableModel;

type Handler = (item:any) => string;

export interface TableWidgetField {
    name: string;
    label: string;
    width?: string;
    fieldInfo?: TableFieldInfo;
    tooltipText?: string;
    link?: string | Handler;
}

interface TableFieldInfo {
    type: 'labelField' | 'dataField';
    additionalType?: 'comparison' | 'subTotal' | 'total' | 'progressBar' | 'dateFormat';
    reference?: string;
    unit?: string;
}

export interface TransformDataTableInfo {
    dataTables?: string[];
    dataTableId?: string;
}

export type DataTableAlertModalMode = 'DELETE'|'DELETE_UNABLED'|'RESET';

export type JoinRestrictedMap = Record<string, boolean>; // { {id}: true }

export type DataTableQueryFilterForDropdown = Omit<DataTableQueryFilter, 'v'> & { v: MenuItem[]|string };

export interface TransformDataTableProps<OperatorOptions> {
    baseDataTableId: string;
    operatorOptions: OperatorOptions;
    originData: OperatorOptions;
    invalid?: boolean;
}

export interface DataTableReference {
    data_table_id: string;
    parents: string[];
    children: string[];
}

export interface WidgetFormDataTableCardContents extends ComponentPublicInstance, DataTableFormContentsExpose {}

export interface DataTableFormContentsExpose {
    updateDataTable: () => Promise<DataTableModel|undefined>;
}
