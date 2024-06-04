import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';


export interface DataFieldOptions {
    multiSelectable?: boolean;
}
export interface XAxisFieldOptions {
    dataTarget?: string;
    multiSelectable?: boolean;
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
export interface TotalFieldOptions {
    dataTarget?: string;
}
export interface BasisFieldOptions {
    dataTarget?: string;
}
export interface MinOptions {
    dataTarget?: string;
    min: number;
    max: number;
    default?: number;
}
export interface MaxOptions {
    dataTarget?: string;
    min: number;
    max: number;
    default?: number;
}

type FormatRulesField = 'name' | 'threshold' | 'color'| 'legend';
export interface FormatRulesOptions {
    fields: FormatRulesField[];
    legendOptions?: {
        dataTarget?: string;
    }
}
type WidgetFieldOptions = DataFieldOptions | XAxisFieldOptions | YAxisFieldOptions
    | LineByFieldOptions | StackByFieldOptions | GroupByFieldOptions | CategoryByFieldOptions
    | TotalFieldOptions | BasisFieldOptions
    | FormatRulesOptions | MinOptions | MaxOptions;

export interface WidgetFieldSchema<FieldOption=WidgetFieldOptions> {
    label: string;
    options?: Partial<FieldOption>;
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
