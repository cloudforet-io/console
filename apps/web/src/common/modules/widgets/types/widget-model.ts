import type {
    DATA_TABLE_TYPE, DATA_SOURCE_DOMAIN, DATA_TABLE_OPERATOR, JOIN_TYPE,
} from '@/common/modules/widgets/_constants/data-table-constant';

export type WidgetType = string; // TODO: make this widget type enum

export type DataTableSourceType = typeof DATA_SOURCE_DOMAIN[keyof typeof DATA_SOURCE_DOMAIN];
export type DataTableOperator = typeof DATA_TABLE_OPERATOR[keyof typeof DATA_TABLE_OPERATOR];
export type DataTableDataType = typeof DATA_TABLE_TYPE[keyof typeof DATA_TABLE_TYPE];
export type AdditionalLabels = Record<string, string>;
export type DateFormat = 'SINGLE' | 'SEPARATE';
export type TimeDiff = Record<string, any>; // year|month|day
export type TimeSeriesAnalyzeQuery = Record<string, any>;
export type LabelsInfo = DataTableLabelKey[];
export type DataInfo = DataTableDataKey[];
export type DataTableOptions = DataTableAddOptions | DataTableTransformOptions;
export type JoinType = typeof JOIN_TYPE[keyof typeof JOIN_TYPE];

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
    data_unit?: string;
    date_format?: DateFormat;
    additional_labels?: AdditionalLabels;
    timediff?: TimeDiff;
    filter?: any[];
    filter_or?: any[];
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
    how: JoinType;
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

export interface WhereCondition {
    key: string;
    value: string;
}

export interface EvalFormula {
    key: string;
    name: string;
    value: string;
}
