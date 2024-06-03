import type { WIDGET_SIZE } from '@/common/modules/widgets/_constants/widget-display-constant';


export type WidgetSize = typeof WIDGET_SIZE[keyof typeof WIDGET_SIZE];

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
type WidgetFieldComponent = 'dropdown' | 'dropdownWithCount'
    | 'number'
    | 'formatRules' | 'formatRulesWithLegend'
    | 'comparison'
    | 'icon'
    | 'legend'
    | 'total'
    | 'progressBar';

interface WidgetFieldSchema {
    componentType: WidgetFieldComponent;
    label: string;
    required?: boolean;
    options?: Partial<WidgetFieldOptions>;
}

type WidgetFieldName = 'dataField' | 'xAxisField' | 'yAxisField'
    | 'stackBy' | 'lineBy' | 'groupBy' | 'categoryBy'
    | 'totalField' | 'basisField'
    | 'min' | 'max'
    | 'icon' | 'comparison' | 'legend'
    | 'subTotal' | 'total'
    | 'progressBar'
    | 'formatRules';

export interface WidgetConfig {
    widgetName: string;
    meta: {
        title?: string;
        sizes: WidgetSize[];
    };
    dataMappingSchema: Partial<Record<WidgetFieldName, WidgetFieldSchema>>;
    advancedOptionsSchema: Partial<Record<WidgetFieldName, WidgetFieldSchema>>;
}
