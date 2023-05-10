import type { AsyncComponent } from 'vue';

import type { DynamicField } from '@spaceone/design-system/types/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicWidgetType } from '@spaceone/design-system/types/data-display/dynamic/dynamic-widget/type';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { ConsoleFilterOperator } from '@cloudforet/core-lib/query/type';

import type { Tags } from '@/models';


import type { CurrencyRates } from '@/store/modules/display/type';
import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

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
    // resource reference type
    PROVIDER: REFERENCE_TYPE_INFO.provider.key,
    PROJECT: REFERENCE_TYPE_INFO.project.key,
    SERVICE_ACCOUNT: REFERENCE_TYPE_INFO.service_account.key,
    PROJECT_GROUP: REFERENCE_TYPE_INFO.project_group.key,
    REGION: REFERENCE_TYPE_INFO.region.key,
    // cost reference
    CATEGORY: 'category',
    RESOURCE_GROUP: 'resource_group',
    PRODUCT: 'product',
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
    GROUP_BY.CATEGORY,
    GROUP_BY.RESOURCE_GROUP,
    GROUP_BY.PRODUCT,
    GROUP_BY.TYPE,
    GROUP_BY.ACCOUNT,
] as const;
export type WidgetFilterKey = typeof WIDGET_FILTER_KEYS[number];
export type WidgetFiltersMap = Partial<Record<WidgetFilterKey, WidgetFilter[]>>;


/* widget schema */
export type WidgetFiltersSchema = {
    [K in WidgetFilterKey as `filters.${K}`]: JsonSchema['properties']
};
export type WidgetFiltersSchemaProperty = keyof WidgetFiltersSchema;
export type WidgetOptionsSchemaProperty = 'group_by'|WidgetFiltersSchemaProperty|string;
export type WidgetOptionsSchemaProperties = Partial<Record<WidgetOptionsSchemaProperty, JsonSchema['properties']>>;
export interface WidgetOptionsSchema {
    default_properties?: WidgetOptionsSchemaProperty[];
    fixed_properties?: WidgetOptionsSchemaProperty[];
    schema: {
        type: 'object',
        properties: WidgetOptionsSchemaProperties;
        required?: WidgetOptionsSchemaProperty[];
        order?: WidgetOptionsSchemaProperty[];
    };
}


/* widget options */
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
    widget_key: string; // widget unique key. used for layout key binding.
    title: string; // widget title
    widget_options: WidgetOptions;
    size: WidgetSize;
    version: string; // widget config version
    inherit_options: InheritOptions; // inherit information for the widget option
    schema_properties: string[]; // schema properties that are shown on widget form. updated when use add more options.
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
    size?: WidgetSize;
    width?: number;
    theme?: WidgetTheme; // e.g. 'violet', 'coral', 'peacock', ... default: violet
    widgetKey: string; // unique widget key to identify widgets in layout
    currencyRates?: CurrencyRates;
    editMode?: boolean;
    errorMode?: boolean;
    allReferenceTypeInfo: AllReferenceTypeInfo;
    initiated?: boolean;
    disableViewMode?: boolean;
}

export interface WidgetExpose<Data = any> {
    initWidget: (data?: Data) => Promise<Data>;
    refreshWidget: () => Promise<Data>;
}

export type SelectorType = 'cost' | 'usage' | 'day' | 'month';
export type UsageType = 'data-transfer.out' | 'data-transfer.in' | 'data-transfer.etc' | 'requests.http' | 'requests.https';
