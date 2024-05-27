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
    source_type: DataTableSourceType;
    options: Record<string, any>;
    tags: Tags;
    labels_info: Record<string, any>;
    widget_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

/* Data Table Options Example
*
*  - Cost
*  {
*      resource_type: "cost_analysis.Cost",
*      data_source_id: "ds-xxxx",
*      data_field: "cost",
*      query: <TimeSeriesAnalyzeQuery>,
*      inherits: [<var_keys>, <var_keys>]
*  }
*
*  - Budget
*  {
*      resource_type: "cost_analysis.BudgetUsage",
*      data_source_id: "ds-xxxx",
*      query: <TimeSeriesAnalyzeQuery>,
*      inherits: [<var_keys>, <var_keys>]
*  }
*
*  - Asset
*  {
*      resource_type: "inventory.Metric",
*      metric_id: "metric-xxxx",
*      query: <TimeSeriesAnalyzeQuery>,
*      inherits: [<var_keys>, <var_keys>]
*  }
*
*  - Concat
*  {
*      operator: "concat",
*      data_tables: [<data_table_id>, <data_table_id>],
*  }
*
*  - Join
*  {
*      operator: "join",
*      data_tables: [<data_table_id>, <data_table_id>],
*      data_table_indexes: [1, 0],
*      join_type: "LEFT" | "RIGHT" | "INNER" | "OUTER",
*  }
*
*  - Where
*  {
*      operator: "where",
*      data_table_id: <data_table_id>,
*      formula: <formula>, // "a>0" - pandas spec
*  }
* */

export type DataTableSourceType = 'DATA_SOURCE' | 'DATA_TABLE';
