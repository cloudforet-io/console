import type { Granularity } from '@/schema/dashboard/_types/widget-type';

import type { WIDGET_SIZE } from '@/common/modules/widgets/_constants/widget-display-constant';


export type WidgetSize = typeof WIDGET_SIZE[keyof typeof WIDGET_SIZE];

interface DataField {
    label?: string;
    enable_granularity?: boolean;
}
export interface NewWidgetConfig {
    widget_name: string;
    meta: {
        title?: string;
        sizes: WidgetSize[];
        granularity?: Granularity;
    };
    data_mapping_schema: {
        data_field_x?: DataField;
        data_field_y?: DataField;
        data_field?: DataField;
        granularity_field?: {
            label: string;
        };
    };
    chart_options_schema: {
        [key: string]: {
            type: string;
            label?: string;
            fields?: string[]; // only for format_rules
        }
    }
}

interface FormatRules {
    fields: string[];
}
interface Comparison {
    fields: string[]; // TODO: have to fix
}
type WidgetFieldOptions = FormatRules | Comparison;
interface WidgetFieldType {
    type: string;
    label: string;
    multiSelectable?: boolean;
    enableMaxCount?: boolean;
    required?: boolean;
    options?: Partial<WidgetFieldOptions>;
}

type WidgetFieldName = 'dataField' | 'xAxisField' | 'stackBy' | 'lineBy' | 'groupBy' | 'categoryBy' | 'totalField' | 'basisField' | 'min' | 'max'
    | 'icon' | 'comparison' | 'legend' | 'subTotal' | 'total' | 'progressBar' | 'formatRules';

type WidgetFieldSchema = Partial<Record<WidgetFieldName, WidgetFieldType>>;

export interface WidgetConfig {
    widgetName: string;
    meta: {
        title?: string;
        sizes: WidgetSize[];
    };
    dataMappingSchema: WidgetFieldSchema;
    advancedOptionsSchema: WidgetFieldSchema;
}
