import type { Tags } from '@/schema/_common/model';

export interface WidgetModel {
    widget_id: string;
    name: string;
    description: string;
    widget_type: WidgetType;
    options: Record<string, any>;
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
    action: DataTableAction;
    source_type: DataTableSourceType;
    operator: DataTableOperator;
    options: DataTableOptions;
    tags: Tags;
    data_info: DataInfo;
    widget_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

export type DataTableSourceType = 'ASSET' | 'COST';
export type DataTableAction = 'ADD' | 'TRANSFORM';
export type DataTableOperator = 'CONCAT' | 'JOIN' | 'WHERE' | 'AGGREGATE' | 'EVAL';
export type AdditionalLabels = Record<string, string>;
export type TimeDiff = Record<string, any>;
export type TimeSeriesAnalyzeQuery = Record<string, any>;
export type DataInfo = Record<string, { unit: string }>;
export type DataTableAddOptions = MetricOptions | CostOptions;
export type DataTableTransformOptions = ConcatOptions | JoinOptions | WhereOptions | AggregateOptions | EvalOptions;
export type DataTableOptions = DataTableAddOptions | DataTableTransformOptions;

/* ADD Action Options */
export interface MetricOptions {
    metric_id: string;
    data_name: string;
    additional_labels: AdditionalLabels;
    time_diff: TimeDiff;
    query: TimeSeriesAnalyzeQuery;
}

export interface CostOptions {
    data_source_id: string;
    data_key: string;
    data_name: string;
    additional_labels: AdditionalLabels;
    time_diff: TimeDiff;
    query: TimeSeriesAnalyzeQuery;
}

/* TRANSFORM Action Options */
export interface ConcatOptions {
    data_tables: string[];
    data_table_indexes: number[];
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
