import type { AsyncComponent } from 'vue';

import type { ConsoleFilterOperator } from '@cloudforet/core-lib/query/type';

import type { Tags } from '@/models';

import type { AllReferenceTypeInfo } from '@/store/reference/all-reference-store';

import type { DashboardSettings, DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/_configs/view-config';
import type {
    WidgetFilterKey,
    WidgetOptionKey,
    WidgetOptionsSchema,
} from '@/services/dashboards/widgets/_configs/widget-options-schema';


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

export const COST_DATA_FIELD_MAP = {
    // resource reference type
    PROJECT_GROUP: { name: 'project_group_id', label: 'Project Group' },
    PROJECT: { name: 'project_id', label: 'Project' },
    PROVIDER: { name: 'provider', label: 'Provider' },
    SERVICE_ACCOUNT: { name: 'service_account_id', label: 'Service Account' },
    REGION: { name: 'region_code', label: 'Region' },
    // cost reference
    USAGE_TYPE: { name: 'usage_type', label: 'Type' },
    PRODUCT: { name: 'product', label: 'Product' },
} as const;
export const ASSET_DATA_FIELD_MAP = {
    // resource reference type
    PROJECT: { name: 'project_id', label: 'Project' },
    PROVIDER: { name: 'provider', label: 'Provider' },
    REGION: { name: 'region_code', label: 'Region' },
    // asset reference
    SERVICE: { name: 'additional_info.service', label: 'Service' },
    COMPLIANCE_FRAMEWORK: { name: 'cloud_service_type', label: 'Compliance Framework' },
    ACCOUNT: { name: 'account', label: 'Account' },
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
export type CostDataField = typeof COST_DATA_FIELD_MAP[keyof typeof COST_DATA_FIELD_MAP]['name'];
export type AssetDataField = typeof ASSET_DATA_FIELD_MAP[keyof typeof ASSET_DATA_FIELD_MAP]['name'];
export type DataField = CostDataField|AssetDataField;
type WidgetScope = 'DOMAIN'|'WORKSPACE'|'PROJECT';

export interface BaseConfigInfo {
    config_id: string;
    version?: string;
}
export interface WidgetConfig {
    widget_config_id: string;
    widget_component?: AsyncComponent;
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

export type WidgetFiltersMap = Partial<Record<WidgetFilterKey, WidgetFilter[]>>;

/* widget options */
export interface WidgetOptions {
    // cost
    cost_data_source?: string;
    cost_data_type?: string;
    cost_data_field?: string[];
    cost_secondary_data_field?: string[];
    // asset
    cloud_service_query_set?: string;
    asset_data_field?: string[];
    asset_secondary_data_field?: string[];
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
export interface SelectorOptions {
    enabled?: boolean;
    type: 'cost-usage'|'days';
}

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
export type UpdatableWidgetInfo = Pick<DashboardLayoutWidgetInfo, 'title'|'inherit_options'|'widget_options'|'schema_properties'>;

export type InheritOptions = Partial<Record<WidgetOptionKey, {
    enabled?: boolean;
    variable_key?: string;
}>>;

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
    (e: 'update-widget-info', widgetInfo: UpdatableWidgetInfo): void;
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
