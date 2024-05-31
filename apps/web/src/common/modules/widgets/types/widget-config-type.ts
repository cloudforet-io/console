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

interface DropdownOptions {
    dataTarget?: string; // e.g. label_field, data_field
    multiSelectable?: boolean;
}
interface DropdownWithCountOptions {
    dataTarget?: string;
    multiSelectable?: boolean;
}
interface FormatRulesOptions {
    fields: string[];
}
// interface ProgressBarOptions { // TODO: set after the schema is defined
//     dataTargetList: string[];
// }
type WidgetFieldOptions = DropdownOptions | DropdownWithCountOptions | FormatRulesOptions;
type WidgetFieldComponent = 'dropdown' | 'dropdownWithCount' | 'number' | 'formatRules' | 'comparison' | 'icon' | 'toggle';
interface WidgetFieldSchema {
    componentType: WidgetFieldComponent;
    label: string;
    required?: boolean;
    options?: Partial<WidgetFieldOptions>;
}

type WidgetFieldName = 'dataField' | 'xAxisField' | 'stackBy' | 'lineBy' | 'groupBy' | 'categoryBy'
    | 'totalField' | 'basisField' | 'min' | 'max'
    | 'icon' | 'comparison' | 'legend' | 'subTotal' | 'total' | 'progressBar' | 'formatRules';

export interface WidgetConfig {
    widgetName: string;
    meta: {
        title?: string;
        sizes: WidgetSize[];
    };
    dataMappingSchema: Partial<Record<WidgetFieldName, WidgetFieldSchema>>;
    advancedOptionsSchema: Partial<Record<WidgetFieldName, WidgetFieldSchema>>;
}
