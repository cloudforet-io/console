import type { WIDGET_SIZE } from '@/common/modules/widgets/_constants/widget-display-constant';

export type WidgetSize = typeof WIDGET_SIZE[keyof typeof WIDGET_SIZE];


export interface DataFieldOptions {
    dataTarget?: string;
    multiSelectable?: boolean;
}
export interface XAxisFieldOptions {
    dataTarget?: string;
}
export interface YAxisFieldOptions {
    dataTarget?: string;
}
export interface LineByFieldOptions {
    dataTarget?: string;
}
export interface StackByFieldOptions {
    dataTarget?: string;
}
export interface GroupByFieldOptions {
    dataTarget?: string;
    multiSelectable?: boolean;
}
export interface CategoryByFieldOptions {
    dataTarget?: string;
}
interface FormatRulesOptions {
    fields: string[];
}
type WidgetFieldOptions = DataFieldOptions | XAxisFieldOptions | YAxisFieldOptions
    | LineByFieldOptions | StackByFieldOptions | GroupByFieldOptions | CategoryByFieldOptions
    | FormatRulesOptions;

export interface WidgetFieldSchema {
    label: string;
    options?: Partial<WidgetFieldOptions>;
}

export type WidgetFieldName = 'dataField' | 'xAxisField' | 'yAxisField'
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
    requiredFieldsSchema: Partial<Record<WidgetFieldName, WidgetFieldSchema>>;
    optionalFieldsSchema: Partial<Record<WidgetFieldName, WidgetFieldSchema>>;
}
