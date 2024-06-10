import type { Tags } from '@/schema/_common/model';

import type { DATA_TABLE_TYPE, DATA_SOURCE_DOMAIN } from '@/common/modules/widgets/_constants/data-table-constant';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';

export interface WidgetModel {
    widget_id: string;
    name: string;
    description: string;
    widget_type: WidgetType;
    options: Record<WidgetFieldName, WidgetFieldValues>;
    tags: Tags;
    workspace_id?: string;
    domain_id?: string;
    created_at: string;
    updated_at: string;
}

export type WidgetType = string; // TODO: make this widget type enum

export interface DataTableModel {
    data_table_id: string;
    name: string;
    data_type: DataTableDataType;
    source_type?: DataTableSourceType;
    operator?: DataTableOperator;
    options: DataTableOptions;
    tags?: Tags;
    labels_info: LabelsInfo;
    data_info: DataInfo;
    widget_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

export type DataTableSourceType = typeof DATA_SOURCE_DOMAIN[keyof typeof DATA_SOURCE_DOMAIN];
export type DataTableOperator = 'CONCAT' | 'JOIN' | 'WHERE' | 'AGGREGATE' | 'EVAL';
export type DataTableDataType = typeof DATA_TABLE_TYPE[keyof typeof DATA_TABLE_TYPE];
export type AdditionalLabels = Record<string, number>; // year|month|day
export type TimeDiff = Record<string, any>;
export type TimeSeriesAnalyzeQuery = Record<string, any>;
export type LabelsInfo = DataTableLabelKey[];
export type DataInfo = DataTableDataKey[];
export type DataTableOptions = DataTableAddOptions | DataTableTransformOptions;
export interface DataTableLabelKey {
    key: string;
    name: string;
    search_key?: string;
    default?: boolean;
    reference?: {
        resource_type: string;
        reference_key: string;
    }
}
export interface DataTableDataKey {
    key: string;
    name: string;
    unit: string;
}
/* ADD Data Type Options */
export interface DataTableAddOptions {
    'ASSET'?: AssetOptions;
    'COST'?: CostOptions;
    group_by?: string[];
    data_name: string;
    date_format?: 'SINGLE'|'SEPARATE';
    additional_labels?: AdditionalLabels;
    time_diff?: TimeDiff;
}
export interface AssetOptions {
    metric_id: string;
}

export interface CostOptions {
    data_source_id: string;
    data_key: string;
}

/* TRANSFORM Data Type Options */
export interface DataTableTransformOptions {
    'CONCAT'?: ConcatOptions;
    'JOIN'?: JoinOptions;
    'AGGREGATE'?: AggregateOptions;
    'WHERE'?: WhereOptions;
    'EVALUATE'?: EvalOptions;
}
export interface ConcatOptions {
    data_tables: string[];
    // data_table_indexes: number[];
}

export interface JoinOptions {
    data_tables: string[];
    on: 'LEFT' | 'RIGHT' | 'INNER' | 'OUTER';
}

export interface WhereOptions {
    data_table_id: string;
    conditions: string[];
}

export interface AggregateOptions {
    data_table_id: string;
    group_by: string[];
}

export interface EvalOptions {
    data_table_id: string;
    formulas: any[]; // TODO: define formula type
}
