import type { AsyncComponent } from 'vue';

import type { DynamicField } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicWidgetType } from '@spaceone/design-system/src/data-display/dynamic/dynamic-widget/type';

import type { RawQueryOperator } from '@cloudforet/core-lib/query/type';

import type { Tags } from '@/models';

import type { Currency } from '@/store/modules/display/config';
import type { CurrencyRates } from '@/store/modules/display/type';

import type { WidgetTheme } from '@/services/dashboards/widgets/view-config';

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

interface BaseConfigInfo {
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
    widget_options?: WidgetOptions;
    widget_options_schema?: object;
}

type ChartType = typeof CHART_TYPE[keyof typeof CHART_TYPE];
export interface DateRange {
    start?: string;
    end?: string;
}

interface LegendOptions {
    enabled?: boolean;
    show_at?: 'table'|'chart';
}

interface WidgetFilter {
    k?: string;
    v: null|string|boolean|number;
    o?: RawQueryOperator;
}
interface WidgetFiltersMap {
    [key: string]: WidgetFilter[]
}
export interface WidgetOptions {
    date_range?: DateRange;
    currency?: Currency;
    group_by?: GroupBy;
    granularity?: Granularity;
    stacked?: boolean;
    legend_options?: LegendOptions;
    chart_type?: ChartType;
    filter?: WidgetFiltersMap[];
    dynamic_widget_type?: DynamicWidgetType;
    name_options?: DynamicField;
    value_options?: DynamicField;
    selector_options?: {
        enabled?: boolean;
        type: 'cost-usage'|'days';
    };
}

export interface DashboardLayoutWidgetInfo {
    widget_name: string; // widget config name
    title: string; // widget title
    widget_options: WidgetOptions;
    size: WidgetSize;
    version: string; // widget config version
    inherit_options: InheritOptions; // inherit information for the widget option
}
export type InheritOptions = Record<string, {
    enabled?: boolean;
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
    dashboardOptions?: object;
    size?: WidgetSize;
    width?: number;
    theme?: WidgetTheme; // e.g. 'violet', 'coral', 'peacock', ... default: violet
    widgetKey: string; // unique widget key to identify widgets in layout
    currencyRates?: CurrencyRates;
}
