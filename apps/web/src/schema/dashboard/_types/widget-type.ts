import type { ConsoleFilterOperator } from '@cloudforet/core-lib/query/type';

import type {
    WIDGET_OPTION_FILTER_KEY_MAP, WIDGET_OPTION_KEYS,
    ASSET_DATA_FIELD_MAP, CHART_TYPE,
    COST_DATA_FIELD_MAP,
    GRANULARITY,
    WIDGET_SIZE,
} from '@/schema/dashboard/_constants/widget-constant';

import type { VariableModelConfig } from '@/lib/variable-models';

/*
 * inheritance_mode: how to inherit widget options from dashboard variables.
 *      NONE: no inheritance
 *      KEY_MATCHING: inherit by key matching
 *      SELECTION_TYPE_MATCHING: inherit by selection type matching
 */
export type InheritanceMode = 'NONE'|'KEY_MATCHING'|'SELECTION_TYPE_MATCHING';
export interface WidgetOptionsSchemaProperty {
    key: string; // e.g. cost_data_source
    name?: string; // e.g. Data Source
    selection_type?: 'SINGLE'|'MULTI';
    readonly?: boolean;
    fixed?: boolean;
    inheritance_mode?: InheritanceMode; // default: 'KEY_MATCHING'
    item_options?: Array<VariableModelConfig>;
    scope?: 'GLOBAL'|'LOCAL'; // default: 'LOCAL'
}

export type WidgetFilterKey = keyof typeof WIDGET_OPTION_FILTER_KEY_MAP;
export type WidgetFilterOptionKey = typeof WIDGET_OPTION_FILTER_KEY_MAP[keyof typeof WIDGET_OPTION_FILTER_KEY_MAP];

export type WidgetOptionKey = typeof WIDGET_OPTION_KEYS[number];
export type WidgetOptionsSchema = {
    properties: Record<string, WidgetOptionsSchemaProperty>;
    order: string[];
};

export type WidgetSize = typeof WIDGET_SIZE[keyof typeof WIDGET_SIZE];
export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];
export type CostDataField = typeof COST_DATA_FIELD_MAP[keyof typeof COST_DATA_FIELD_MAP]['name'];
export type AssetDataField = typeof ASSET_DATA_FIELD_MAP[keyof typeof ASSET_DATA_FIELD_MAP]['name'];
export type DataField = CostDataField|AssetDataField|string;
type WidgetScope = 'DOMAIN'|'WORKSPACE'|'PROJECT';

export interface BaseConfigInfo {
    config_id: string;
    version?: string;
}
export interface WidgetConfig {
    widget_config_id: string;
    base_configs?: BaseConfigInfo[];
    title?: string;
    labels?: Array<'Cost'|'Asset'|'Budget'|string>;
    description?: {
        translation_id?: string;
        preview_image?: string;
    };
    scopes: WidgetScope[];
    theme?: {
        inherit?: boolean;
        inherit_count?: number;
    };
    sizes: WidgetSize[];
    options: WidgetOptions;
    options_schema?: WidgetOptionsSchema;
}

export type ChartType = typeof CHART_TYPE[keyof typeof CHART_TYPE];
interface LegendOptions {
    enabled?: boolean;
    show_at?: 'table'|'chart';
}

/* widget filters */
export interface WidgetFilter {
    k?: string;
    v: null|string|boolean|number|Array<null|string|boolean|number>;
    o?: ConsoleFilterOperator;
}

export type WidgetFiltersMap = Partial<Record<WidgetFilterKey, WidgetFilter[]>>;

/* widget options */
export interface WidgetOptions {
    // cost
    cost_data_source?: string;
    cost_data_type?: string;
    cost_data_field?: string;
    cost_secondary_data_field?: string;
    // asset
    cloud_service_query_set?: string;
    asset_data_field?: string;
    asset_secondary_data_field?: string;
    // common
    granularity?: Granularity;
    chart_type?: ChartType;
    legend_options?: LegendOptions;
    pagination_options?: {
        enabled?: boolean;
        page_size?: number;
    };
    data_criteria?: 'history'|'realtime';
    filters?: WidgetFiltersMap;
}


export interface InheritOption {
    enabled?: boolean;
    variable_key?: string;
}
export type InheritOptions = Partial<Record<WidgetOptionKey, {
    enabled?: boolean;
    variable_key?: string;
}>>;

