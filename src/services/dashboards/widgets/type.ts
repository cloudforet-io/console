import type { DynamicField } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicWidgetType } from '@spaceone/design-system/src/data-display/dynamic/dynamic-widget/type';

import type { QueryStoreFilter } from '@cloudforet/core-lib/query/type';

import type { Tags } from '@/models';

import type { Currency } from '@/store/modules/display/config';

import type { CHART_TYPE } from '@/services/cost-explorer/cost-analysis/type';

import type {
    GRANULARITY, WIDGET_SIZE, GROUP_BY,
} from './config';

export type WidgetSize = typeof WIDGET_SIZE[keyof typeof WIDGET_SIZE];
export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];
export type GroupBy = typeof GROUP_BY[keyof typeof GROUP_BY];
type WidgetScope = 'DOMAIN'|'WORKSPACE'|'PROJECT';

export interface WidgetConfig {
    widget_config_id: string;
    widget_component: string;
    base_configs?: string[];
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
interface WidgetOptions {
    date_range?: { start?: string; end?: string; };
    currency?: Currency;
    group_by?: string[];
    granularity?: Granularity;
    stacked?: boolean;
    enable_legend?: boolean;
    chart_type?: ChartType;
    filter?: QueryStoreFilter[];
    dynamic_widget_type?: DynamicWidgetType;
    name_options?: DynamicField;
    value_options?: DynamicField;
}

export interface DashboardLayoutWidgetInfo {
    widget_name: string; // widget config name
    title: string; // widget title
    widget_options: WidgetOptions;
    size: WidgetSize;
    version: string; // widget config version
    inherit_options: Record<string, InheritOptions>; // inherit information for the widget option
}
interface InheritOptions {
    enabled?: boolean;
}

export interface CustomWidgetInfo extends DashboardLayoutWidgetInfo {
    custom_widget_id: string;
    user_id: string;
    tags: Tags;
    domain_id: string;
    created_at: string;
    updated_at: string;
}

// component spec
export interface WidgetProps {
    widgetName: string;
    title?: string;
    options?: WidgetOptions;
    inheritOptions?: InheritOptions;
    dashboardOptions?: object;
    size?: WidgetSize;
    theme?: string; // e.g. 'violet', 'coral', 'peacock', ... default: violet
    widgetKey?: string; // unique widget key to identify widgets in layout
}
