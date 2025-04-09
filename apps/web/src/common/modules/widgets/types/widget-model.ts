import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';

import type {
    DATA_TABLE_TYPE, DATA_SOURCE_DOMAIN, DATA_TABLE_OPERATOR, JOIN_TYPE, DATA_TABLE_FIELD_TYPE,
} from '@/common/modules/widgets/_constants/data-table-constant';

export type WidgetType = string; // HACK: make this widget type enum

export type DataTableState = 'AVAILABLE' | 'UNAVAILABLE';

export type DataTableSourceType = typeof DATA_SOURCE_DOMAIN[keyof typeof DATA_SOURCE_DOMAIN];
export type DataTableOperator = typeof DATA_TABLE_OPERATOR[keyof typeof DATA_TABLE_OPERATOR];
export type DataTableDataType = typeof DATA_TABLE_TYPE[keyof typeof DATA_TABLE_TYPE];
export type AdditionalLabels = Record<string, string>;
export interface DataTableGroupByInfo {
    key:string;
    name: string;
    reference?: object;
    search_key?: string;
    tags?: string[]; // [tag_key_1, tag_key_2, ...]
}
export interface TimeDiff {
    years?: number;
    months?: number;
    data_name: string;
}
export type LabelsInfo = Record<string, object>;
export type DataInfo = Record<string, { unit?: string, timediff?: TimeDiff }>;
export type DataTableOptions = DataTableAddOptions & DataTableTransformOptions;
export type JoinType = typeof JOIN_TYPE[keyof typeof JOIN_TYPE];
export type WidgetState = 'CREATING' | 'INACTIVE' | 'ACTIVE';
/* ADD Data Type Options */
export interface DataTableAddOptions {
    'ASSET'?: AssetOptions;
    'COST'?: CostOptions;
    'UNIFIED_COST'?: UnifiedCostOptions;
    group_by?: DataTableGroupByInfo[];
    data_name: string;
    data_unit?: string;
    timediff?: TimeDiff;
    filter?: DataTableQueryFilter[];
    filter_or?: DataTableQueryFilter[];
}
export type DataTableQueryFilter = ApiFilter;

export interface AssetOptions {
    metric_id: string;
}

export interface CostOptions {
    data_source_id: string;
    plugin_id?: string;
    data_key: string;
}

export interface UnifiedCostOptions {
    data_key: string;
}

/* TRANSFORM Data Type Options */
export interface DataTableTransformOptions {
    CONCAT?: ConcatOptions;
    JOIN?: JoinOptions;
    AGGREGATE?: AggregateOptions;
    QUERY?: QueryOptions;
    EVAL?: EvalOptions;
    PIVOT?: PivotOptions;
    ADD_LABELS?: AddLabelsOptions;
    VALUE_MAPPING?: ValueMappingOptions;
}
export interface ConcatOptions {
    data_tables: string[];
    // data_table_indexes: number[];
}

export interface JoinOptions {
    data_tables: string[];
    how?: JoinType;
    left_keys: string[];
    right_keys: string[];
}

export interface QueryOptions {
    data_table_id?: string;
    conditions: string[];
    // operator: 'AND'|'OR';
}

export interface AggregateOptions {
    data_table_id?: string;
    group_by: string[];
    function: AggregateFunction;
}
export interface AggregateFunction {
    [key: string]: 'sum'|'max'|'min'|'mean';
}

export interface EvalOptions {
    data_table_id?: string;
    expressions: EvaluateExpression[];
}

export interface EvaluateExpression {
    name: string;
    field_type: DataTableFieldType;
    expression: string;
    condition?: string;
}

export interface PivotOptions {
    data_table_id?: string; // required in params
    fields?: PivotFieldOptions; // required in params
    select?: string[];
    limit?: number;
    function?: 'sum' | 'min' | 'max' | 'mean'; // default -> "sum"
    order_by?: {
        type: 'key' | 'value'; // default -> "key"
        desc: boolean; // default false
    }
}

export interface PivotFieldOptions {
    labels: string[];
    data?: string;
    column?: string;
}

export interface AddLabelsOptions {
    data_table_id?: string;
    labels: AdditionalLabels;
}

export interface ValueMappingOptions {
    data_table_id?: string;
    name: string;
    field_type?: DataTableFieldType; // default LABEL
    key?: string;
    cases: ValueMappingCase[];
    else?: string;
    condition?: string;
}

export interface ValueMappingCase {
    value: string;
    operator: 'eq' | 'regex';
    match: string;
}

export type DataTableFieldType = keyof typeof DATA_TABLE_FIELD_TYPE;
