import type { DynamicField } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicWidgetType } from '@spaceone/design-system/src/data-display/dynamic/dynamic-widget/type';

import type { QueryStoreFilter } from '@cloudforet/core-lib/query/type';

import type { Tags } from '@/models';

import type { Currency } from '@/store/modules/display/config';

import type { GRANULARITY } from '@/services/cost-explorer/lib/config';
import type { WidgetSize } from '@/services/dashboards/widgets/_components/type';

export interface WidgetConfig {
    widget_name: string; // unique name
    title: string;
    labels: string[];

    description?: {
        translation_id?: string;
        preview_image?: string;
        chart_type?: string;
    };
    scopes: Array<'DOMAIN'|'WORKSPACE'|'PROJECT'>;

    theme: {
        inherit?: boolean;
        inherit_count?: number;
    };
    link?: WidgetLink;

    sizes: WidgetSize[];
    widget_options_schema: object;

    base_widget_name?: string;
    widget_options: WidgetOptions;
}

interface WidgetLink {
    enabled?: boolean;
    external?: boolean;
    location: Location; // Vue Router spec
}
type Dictionary<T> = { [key: string]: T };
interface Location {
    name?: string;
    path?: string;
    hash?: string;
    query?: Dictionary<string | (string | null)[] | null | undefined>;
    params?: Dictionary<string>;
    version: string;
}

type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];
interface WidgetOptions {
    currency?: Currency;
    date_range?: { start: string; end?: string; };
    stack?: boolean;
    granularity?: Granularity;
    enable_legends: boolean;
    dynamic_widget_type?: DynamicWidgetType;
    group_by?: string[];
    datetime_range?: { start: string; end?: string; };
    page?: { start?: number; limit: number; };
    sort?: Array<{ key: string; desc: boolean; }>;
    field?: { string: { key?: string; operator: string; } };
    field_options?: Record<string, DynamicField>;
    // value_options?: DynamicField;
    // name_options?: DynamicField;
    filter?: QueryStoreFilter[];
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
