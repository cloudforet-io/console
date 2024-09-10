import type {
    DATE_FORMAT, NUMBER_FORMAT, DATA_FIELD_HEATMAP_COLOR,
    PIE_CHART_SERIES_LABEL_POSITION,
    COLUMN_CHART_SERIES_LABEL_POSITION,
    LINE_CHART_SERIES_LABEL_POSITION,
    WIDGET_HEIGHT,
} from '@/common/modules/widgets/_constants/widget-field-constant';
import type { AdvancedFormatRulesValue } from '@/common/modules/widgets/_widget-fields/advanced-format-rules/type';
import type { CategoryByValue } from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { ColorSchemaValue } from '@/common/modules/widgets/_widget-fields/color-schema/type';
import type { FormatRulesValue } from '@/common/modules/widgets/_widget-fields/format-rules/type';
import type { TableDataFieldValueV1 } from '@/common/modules/widgets/_widget-fields/table-data-field/type';


export interface Icon {
    name: string;
    label: string;
}
// Field Value Options
export interface IconValue {
    icon: Icon;
    color: string;
}

export type ComparisonFormat = 'all'|'percent'|'fixed';
export interface ComparisonValue {
    decreaseColor?: string;
    increaseColor?: string;
    format?: ComparisonFormat;
}

export interface ProgressBarValue {
    fieldName: string;
    basisField?: string;
    totalField?: string;
    formatRules?: FormatRulesValue[];
    baseColor?: string;
}

export interface LineByValue {
    value: string;
    count: number;
}
export interface StackByValue {
    value: string;
    count: number;
}
export interface XAxisValue {
    value: string;
    count: number;
}
export interface YAxisValue {
    value: string;
    count: number;
}

export type TableDataFieldValue = TableDataFieldValueV1;

export interface GroupByValue {
    value?: string | string[];
    count?: number;
}

export interface TotalValue {
    toggleValue: boolean;
    freeze: boolean;
}

export interface WidgetHeaderValue {
    toggleValue: boolean;
    title?: string;
    description?: string;
}

export type DateFormat = keyof typeof DATE_FORMAT;
export interface DateFormatValue {
    value: DateFormat;
}

export type NumberFormat = typeof NUMBER_FORMAT[keyof typeof NUMBER_FORMAT];
export interface NumberFormatValue {
    [key: string]: {
        format: NumberFormat;
        customNumberFormat?: string;
    };
}

export type DataFieldHeatmapColor = keyof typeof DATA_FIELD_HEATMAP_COLOR;
export interface DataFieldHeatmapColorValue {
    [key: string]: {
        value: DataFieldHeatmapColor;
    };
}

export interface DisplayAnnotationValue {
    toggleValue: boolean;
    annotation?: string;
}

type ColumnChartSeriesLabelPosition = typeof COLUMN_CHART_SERIES_LABEL_POSITION[keyof typeof COLUMN_CHART_SERIES_LABEL_POSITION];
type PieChartSeriesLabelPosition = typeof PIE_CHART_SERIES_LABEL_POSITION[keyof typeof PIE_CHART_SERIES_LABEL_POSITION];
type LineChartSeriesLabelPosition = typeof LINE_CHART_SERIES_LABEL_POSITION[keyof typeof LINE_CHART_SERIES_LABEL_POSITION];
export interface DisplaySeriesLabelValue {
    toggleValue: boolean;
    position?: ColumnChartSeriesLabelPosition | PieChartSeriesLabelPosition | LineChartSeriesLabelPosition;
    rotate?: number;
}

export interface TextWrapValue {
    toggleValue: boolean;
}

export type CustomColumnWidthItem = {
    fieldKey: string;
    width: number;
};

export interface TableColumnWidthValue {
    minimumWidth: number;
    widthType: 'auto' | 'fixed';
    fixedWidth?: number;
}

export interface CustomTableColumnWidthValue {
    toggleValue: boolean;
    value?: CustomColumnWidthItem[];
}

export interface LegendValue {
    toggleValue: boolean;
    position?: 'right'|'bottom'|'top'|'left';
}

export type WidgetHeightType = keyof typeof WIDGET_HEIGHT; // for Number Card Widget
export interface WidgetHeightValue {
    value: WidgetHeightType;
}

export interface MissingValueValue {
    value: string;
}

export type WidgetFieldValues = string | string[] | number | boolean | ComparisonValue[] | ProgressBarValue | FormatRulesValue[]
    | LineByValue | StackByValue | CategoryByValue | GroupByValue
    | XAxisValue | YAxisValue | TableDataFieldValue | IconValue | TotalValue | ColorSchemaValue
    | WidgetHeaderValue | DateFormatValue | NumberFormatValue | DataFieldHeatmapColorValue
    | DisplayAnnotationValue | DisplaySeriesLabelValue | TextWrapValue | TableColumnWidthValue | CustomTableColumnWidthValue
    | LegendValue | WidgetHeightValue | MissingValueValue | AdvancedFormatRulesValue;
