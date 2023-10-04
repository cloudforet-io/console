import type { AsyncComponent } from 'vue';

import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { ConsoleFilterOperator } from '@cloudforet/core-lib/query/type';

import type { Tags } from '@/models';

import type { AllReferenceTypeInfo } from '@/store/reference/all-reference-store';

import { ASSET_VARIABLE_TYPE_INFO } from '@/lib/reference/asset-reference-config';
import { COST_VARIABLE_TYPE_INFO } from '@/lib/reference/cost-reference-config';
import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import type { DashboardSettings, DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/_configs/view-config';


export const WIDGET_SIZE = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    full: 'full',
} as const;

export const GRANULARITY = {
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
} as const;

export const COST_GROUP_BY = {
    // resource reference type
    PROVIDER: REFERENCE_TYPE_INFO.provider.key,
    PROJECT: REFERENCE_TYPE_INFO.project.key,
    SERVICE_ACCOUNT: REFERENCE_TYPE_INFO.service_account.key,
    PROJECT_GROUP: REFERENCE_TYPE_INFO.project_group.key,
    REGION: REFERENCE_TYPE_INFO.region.key,
    // cost reference
    USAGE_TYPE: COST_VARIABLE_TYPE_INFO.cost_usage_type.key,
    PRODUCT: COST_VARIABLE_TYPE_INFO.cost_product.key,
} as const;

export const ASSET_GROUP_BY = {
    // resource reference type
    PROJECT: REFERENCE_TYPE_INFO.project.key,
    PROVIDER: REFERENCE_TYPE_INFO.provider.key,
    REGION: REFERENCE_TYPE_INFO.region.key,
    // asset reference
    // REQUIREMENT_ID: ASSET_REFERENCE_TYPE_INFO.asset_requirement_id.key,
    SERVICE: ASSET_VARIABLE_TYPE_INFO.asset_service.key,
    COMPLIANCE_FRAMEWORK: 'cloud_service_type',
    ACCOUNT: ASSET_VARIABLE_TYPE_INFO.asset_account.key,
};

export const CHART_TYPE = {
    TREEMAP: 'TREEMAP',
    MAP: 'MAP',
    LINE: 'LINE',
    STACKED_COLUMN: 'STACKED_COLUMN',
    DONUT: 'DONUT',
    PIE: 'PIE',
    WAFFLE: 'WAFFLE',
} as const;

export type WidgetSize = typeof WIDGET_SIZE[keyof typeof WIDGET_SIZE];
export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];
export type CostGroupBy = typeof COST_GROUP_BY[keyof typeof COST_GROUP_BY];
export type AssetGroupBy = typeof ASSET_GROUP_BY[keyof typeof ASSET_GROUP_BY];
export type GroupBy = CostGroupBy|AssetGroupBy;
type WidgetScope = 'DOMAIN'|'WORKSPACE'|'PROJECT';

export interface BaseConfigInfo {
    config_id: string;
    version?: string;
}
export interface BaseWidgetConfig {
    widget_config_id: string;
    widget_component?: AsyncComponent;
    base_configs?: BaseConfigInfo[];
    title?: string;

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
    inherit_options?: InheritOptions;
    options_schema?: WidgetOptionsSchema;
}

export interface CostWidgetConfig extends BaseWidgetConfig {
    labels?: Array<'Cost'|string>;
    options?: CostWidgetOptions;
}
export interface AssetWidgetConfig extends BaseWidgetConfig {
    labels?: Array<'Asset'|string>;
    options?: AssetWidgetOptions;
}
export type WidgetConfig = CostWidgetConfig|AssetWidgetConfig;

type ChartType = typeof CHART_TYPE[keyof typeof CHART_TYPE];
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
export const WIDGET_FILTER_KEYS = [
    // resource reference type
    REFERENCE_TYPE_INFO.provider.type,
    REFERENCE_TYPE_INFO.project.type,
    REFERENCE_TYPE_INFO.service_account.type,
    REFERENCE_TYPE_INFO.project_group.type,
    REFERENCE_TYPE_INFO.user.type,
    REFERENCE_TYPE_INFO.cloud_service_type.type,
    REFERENCE_TYPE_INFO.region.type,
    // cost reference
    COST_VARIABLE_TYPE_INFO.cost_product.type,
    COST_VARIABLE_TYPE_INFO.cost_usage_type.type,
    // asset reference
    ASSET_VARIABLE_TYPE_INFO.asset_compliance_framework.type,
    ASSET_VARIABLE_TYPE_INFO.asset_account.type,
] as const;
export type WidgetFilterKey = typeof WIDGET_FILTER_KEYS[number];
export type WidgetFiltersMap = Partial<Record<WidgetFilterKey, WidgetFilter[]>>;


/* widget schema */
export type WidgetFiltersSchema = {
    [K in WidgetFilterKey as `filters.${K}`]: JsonSchema['properties']
};
export type WidgetFiltersSchemaProperty = keyof WidgetFiltersSchema;
export type WidgetOptionsSchemaProperty = 'cost_group_by'|'asset_group_by'|WidgetFiltersSchemaProperty|string;
export type CostWidgetOptionsSchemaProperty = 'cost_group_by'|WidgetFiltersSchemaProperty|string;
export type AssetWidgetOptionsSchemaProperty = 'asset_group_by'|WidgetFiltersSchemaProperty|string;
export interface BaseWidgetOptionsSchema<T extends string> {
    default_properties?: T[];
    fixed_properties?: T[];
    non_inheritable_properties?: T[];
    schema: JsonSchema;
}
export type WidgetOptionsSchema =
     | BaseWidgetOptionsSchema<CostWidgetOptionsSchemaProperty>
     | BaseWidgetOptionsSchema<AssetWidgetOptionsSchemaProperty>;

/* widget options */
export interface BaseWidgetOptions {
    // group_by?: GroupBy | string;
    granularity?: Granularity;
    stacked?: boolean;
    legend_options?: LegendOptions;
    chart_type?: ChartType;
    // selector_options?: {
    //     enabled?: boolean;
    //     type: 'cost-usage'|'days';
    // };
    pagination_options?: {
        enabled?: boolean;
        page_size?: number;
    };
    filters?: WidgetFiltersMap;
}
export interface SelectorOptions {
    enabled?: boolean;
    type: 'cost-usage'|'days';
}
export interface CostWidgetOptions extends BaseWidgetOptions {
    cost_data_source?: string;
    cost_group_by?: CostGroupBy | string;
    selector_options?: SelectorOptions;
}
export interface AssetWidgetOptions extends BaseWidgetOptions {
    asset_query_set?: string;
    asset_group_by?: AssetGroupBy | string;
}
export type WidgetOptions = CostWidgetOptions&AssetWidgetOptions;

export interface DashboardLayoutWidgetInfo {
    widget_name: string; // widget config name
    widget_key: string; // widget unique key. used for layout key binding.
    title?: string; // widget title
    widget_options?: WidgetOptions;
    size?: WidgetSize;
    version: string; // widget config version
    inherit_options?: InheritOptions; // inherit information for the widget option
    schema_properties?: string[]; // schema properties that are shown on widget form. updated when use add more options.
}
export type InheritOptions = Record<string, {
    enabled?: boolean;
    variable_info?: {
        key: string;
    },
}>;

export interface CustomWidgetInfo extends DashboardLayoutWidgetInfo {
    custom_widget_id: string;
    user_id: string;
    tags: Tags;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

// TODO: replace with NewWidgetProps
export interface WidgetProps<T = any> {
    widgetConfigId: string;
    title?: string;
    options?: WidgetOptions;
    inheritOptions?: InheritOptions;
    schemaProperties?: string[];
    size?: WidgetSize;
    width?: number;
    theme?: WidgetTheme; // e.g. 'violet', 'coral', 'peacock', ... default: violet
    widgetKey: string; // unique widget key to identify widgets in layout
    editMode?: boolean;
    errorMode?: boolean;
    allReferenceTypeInfo: AllReferenceTypeInfo;
    disableViewMode?: boolean;
    disableRefreshOnVariableChange?: boolean;
    dashboardSettings?: DashboardSettings;
    dashboardVariablesSchema?: DashboardVariablesSchema;
    dashboardVariables?: DashboardVariables;
    loading?: boolean;
    data?: T;
}

// TODO: remove this after replacing WidgetProps with NewWidgetProps
export interface NewWidgetProps {
    widgetConfigId: string;
    widgetInfo: DashboardLayoutWidgetInfo;
    editMode?: boolean;
    errorMode?: boolean;
    disableViewMode?: boolean;
    disableRefreshOnVariableChange?: boolean;
    allReferenceTypeInfo: AllReferenceTypeInfo;
    settings?: DashboardSettings;
    variablesSchema?: DashboardVariablesSchema;
    variables?: DashboardVariables;
}

export interface WidgetEmit {
    (e: 'mounted'): void;
    (e: 'initiated', data: any): void;
    (e: 'refreshed', data: any): void;
    (e: 'update-widget-info', widgetInfo: Partial<DashboardLayoutWidgetInfo>): void;
    (e: 'update-widget-validation', validation: boolean): void;
    (event: 'click-delete'): void;
    (event: 'click-expand'): void;
    (event: 'click-edit'): void;
}

export interface WidgetExpose<Data = any> {
    initWidget: (data?: Data) => Promise<Data>;
    refreshWidget: () => Promise<Data>;
}

export type SelectorType = 'cost' | 'usage' | 'day' | 'month';
export type UsageType = 'data-transfer.out' | 'data-transfer.in' | 'data-transfer.etc' | 'requests.http' | 'requests.https';
