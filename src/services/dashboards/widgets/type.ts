import type { DynamicField } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicWidgetType } from '@spaceone/design-system/src/data-display/dynamic/dynamic-widget/type';

import type { QueryStoreFilter } from '@cloudforet/core-lib/query/type';

import type { Currency } from '@/store/modules/display/config';

import type { WidgetSize } from '@/common/components/widgets/type';

import type { GRANULARITY } from '@/services/cost-explorer/lib/config';

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
