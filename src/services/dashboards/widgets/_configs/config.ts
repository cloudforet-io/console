import type { AsyncComponent } from 'vue';

import type { DynamicField } from '@spaceone/design-system/types/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicWidgetType } from '@spaceone/design-system/types/data-display/dynamic/dynamic-widget/type';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { Tags } from '@/models';
import type { ConsoleFilterOperator } from '@/query/type';


import type { CurrencyRates } from '@/store/modules/display/type';
import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

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
    ACCUMULATED: 'ACCUMULATED',
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
} as const;

export const GROUP_BY = {
    PROJECT_GROUP: 'project_group_id',
    PROJECT: 'project_id',
    PROVIDER: 'provider',
    SERVICE_ACCOUNT: 'service_account_id',
    CATEGORY: 'category',
    RESOURCE_GROUP: 'resource_group',
    PRODUCT: 'product',
    REGION: 'region_code',
    TYPE: 'usage_type',
    ACCOUNT: 'account',
} as const;

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
export type GroupBy = typeof GROUP_BY[keyof typeof GROUP_BY];
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
    labels?: string[];

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
    options?: WidgetOptions;
    options_schema?: WidgetOptionsSchema;
}

export interface WidgetOptionsSchema {
    default_properties?: string[];
    inheritable_properties?: string[];
    schema: JsonSchema | any;
}

type ChartType = typeof CHART_TYPE[keyof typeof CHART_TYPE];


interface LegendOptions {
    enabled?: boolean;
    show_at?: 'table'|'chart';
}

export interface WidgetFilter {
    k?: string;
    v: null|string|boolean|number;
    o?: ConsoleFilterOperator;
}
export interface WidgetFiltersMap {
    provider?: WidgetFilter[];
    project_id?: WidgetFilter[];
    service_account_id?: WidgetFilter[];
    user_id?: WidgetFilter[];
    cloud_service_type_id?: WidgetFilter[];
    region_code?: WidgetFilter[];
}
export interface WidgetOptions {
    group_by?: GroupBy | string;
    granularity?: Granularity;
    stacked?: boolean;
    legend_options?: LegendOptions;
    chart_type?: ChartType;
    dynamic_widget_type?: DynamicWidgetType;
    name_options?: DynamicField;
    value_options?: DynamicField;
    selector_options?: {
        enabled?: boolean;
        type: 'cost-usage'|'days';
    };
    pagination_options?: {
        enabled?: boolean;
        page_size?: number;
    };
    filters?: WidgetFiltersMap;
}

export interface DashboardLayoutWidgetInfo {
    widget_name: string; // widget config name
    widget_key: string; // widget unique key
    title: string; // widget title
    widget_options: WidgetOptions;
    size: WidgetSize;
    version: string; // widget config version
    inherit_options: InheritOptions; // inherit information for the widget option
}
export type InheritOptions = Record<string, {
    enabled?: boolean;
    variable_info?: {
        key: string;
    }
}>;

export interface CustomWidgetInfo extends DashboardLayoutWidgetInfo {
    custom_widget_id: string;
    user_id: string;
    tags: Tags;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

export interface WidgetProps {
    widgetConfigId: string;
    title?: string;
    options?: WidgetOptions;
    inheritOptions?: InheritOptions;
    dashboardVariables?: DashboardVariables;
    dashboardVariablesSchema?: DashboardVariablesSchema;
    dashboardSettings: DashboardSettings;
    size?: WidgetSize;
    width?: number;
    theme?: WidgetTheme; // e.g. 'violet', 'coral', 'peacock', ... default: violet
    widgetKey: string; // unique widget key to identify widgets in layout
    currencyRates?: CurrencyRates;
    editMode?: boolean;
    allReferenceTypeInfo: AllReferenceTypeInfo;
}

export interface WidgetExpose<Data = any> {
    initWidget: (data?: Data) => Promise<Data>;
    refreshWidget: () => Promise<Data>;
}

export type SelectorType = 'cost' | 'usage' | 'day' | 'month';
export type UsageType = 'data-transfer.out' | 'data-transfer.in' | 'data-transfer.etc' | 'requests.http' | 'requests.https';
