import type {
    DATA_TABLE_TYPE, DATA_SOURCE_DOMAIN, DATA_TABLE_OPERATOR, JOIN_TYPE,
} from '@/common/modules/widgets/_constants/data-table-constant';

export type WidgetType = string; // TODO: make this widget type enum

export type DataTableSourceType = typeof DATA_SOURCE_DOMAIN[keyof typeof DATA_SOURCE_DOMAIN];
export type DataTableOperator = typeof DATA_TABLE_OPERATOR[keyof typeof DATA_TABLE_OPERATOR];
export type DataTableDataType = typeof DATA_TABLE_TYPE[keyof typeof DATA_TABLE_TYPE];
export type AdditionalLabels = Record<string, string>;
export type DateFormat = 'SINGLE' | 'SEPARATE';
export type TimeDiff = Record<string, any>; // years|months|days
export type TimeSeriesAnalyzeQuery = Record<string, any>;
export type LabelsInfo = Record<string, object>;
export type DataInfo = Record<string, { unit: string }>;
export type DataTableOptions = DataTableAddOptions | DataTableTransformOptions;
export type JoinType = typeof JOIN_TYPE[keyof typeof JOIN_TYPE];

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
    CONCAT?: ConcatOptions;
    JOIN?: JoinOptions;
    AGGREGATE?: AggregateOptions;
    QUERY?: QueryOptions;
    EVAL?: EvalOptions;
}
export interface ConcatOptions {
    data_tables: string[];
    // data_table_indexes: number[];
}

export interface JoinOptions {
    data_tables: string[];
    how: JoinType;
}

export interface QueryOptions {
    data_table_id: string;
    conditions: string[];
}

export interface AggregateOptions {
    data_table_id: string;
    group_by: string[];
}

export interface EvalOptions {
    data_table_id: string;
    expressions: string[];
}
