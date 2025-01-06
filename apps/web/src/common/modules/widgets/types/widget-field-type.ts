import type WidgetFieldValueManager from '@/common/modules/widgets/_widget-field-value-manager';
import type { CategoryByOptions } from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { _ColorSchemaOptions as ColorSchemaOptions } from '@/common/modules/widgets/_widget-fields/color-schema/type';
import type { ComparisonOptions } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { DataFieldHeatmapColorOptions } from '@/common/modules/widgets/_widget-fields/data-field-heatmap-color/type';
import type { DataFieldOptions } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateFormatOptions } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeOptions } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { DisplaySeriesLabelOptions } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { FormatRulesOptions } from '@/common/modules/widgets/_widget-fields/format-rules/type';
import type { GroupByOptions } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { IconOptions } from '@/common/modules/widgets/_widget-fields/icon/type';
import type { LegendOptions } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { MaxOptions } from '@/common/modules/widgets/_widget-fields/max/type';
import type { MinOptions } from '@/common/modules/widgets/_widget-fields/min/type';
import type { MissingValueOptions } from '@/common/modules/widgets/_widget-fields/missing-value/type';
import type { NumberFormatOptions } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { PieChartTypeOptions } from '@/common/modules/widgets/_widget-fields/pie-chart-type/type';
import type { SankeyDimensionsOptions } from '@/common/modules/widgets/_widget-fields/sankey-dimensions/type';
import type { StackByOptions } from '@/common/modules/widgets/_widget-fields/stack-by/type';
import type { SubTotalOptions } from '@/common/modules/widgets/_widget-fields/sub-total/type';
import type { TableColumnComparisonOptions } from '@/common/modules/widgets/_widget-fields/table-column-comparison/type';
import type { TableColumnWidthOptions } from '@/common/modules/widgets/_widget-fields/table-column-width/type';
import type { TextWrapOptions } from '@/common/modules/widgets/_widget-fields/text-wrap/type';
import type { TooltipNumberFormatOptions } from '@/common/modules/widgets/_widget-fields/tooltip-number-format/type';
import type { TotalOptions } from '@/common/modules/widgets/_widget-fields/total/type';
import type { WidgetHeightOptions } from '@/common/modules/widgets/_widget-fields/widget-height/type';
import type { XAxisOptions } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { YAxisOptions } from '@/common/modules/widgets/_widget-fields/y-axis/type';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


export type WidgetFieldOptions = DataFieldOptions | XAxisOptions | YAxisOptions
    | StackByOptions | GroupByOptions | CategoryByOptions
    | FormatRulesOptions | MinOptions | MaxOptions | LegendOptions | IconOptions | SubTotalOptions | TotalOptions
    | ComparisonOptions | ColorSchemaOptions | PieChartTypeOptions | DateFormatOptions | TableColumnComparisonOptions
    | NumberFormatOptions | DataFieldHeatmapColorOptions | TextWrapOptions | TableColumnWidthOptions
    | MissingValueOptions | WidgetHeightOptions | DisplaySeriesLabelOptions | DateRangeOptions
    | TooltipNumberFormatOptions | SankeyDimensionsOptions;

export interface WidgetFieldSchema<FieldOption=WidgetFieldOptions> {
    options?: Partial<FieldOption>;
}

export type FieldDataTargetType = 'data_info' | 'labels_info';

export type WidgetFieldName = 'dataField' | 'tableDataField' | 'xAxis' | 'yAxis'
    | 'stackBy' | 'groupBy' | 'categoryBy'
    | 'min' | 'max'
    | 'icon' | 'comparison' | 'legend'
    | 'subTotal' | 'total'
    | 'progressBar' | 'tableColumnComparison'
    | 'formatRules' | 'advancedFormatRules'
    | 'granularity' | 'dateRange' | 'colorSchema' | 'pieChartType'
    | 'dateFormat' | 'numberFormat' | 'tooltipNumberFormat' | 'dataFieldHeatmapColor'
    | 'displayAnnotation' | 'displaySeriesLabel' | 'textWrap' | 'tableColumnWidth' | 'customTableColumnWidth'
    | 'missingValue' | 'widgetHeight'
    | 'widgetHeader' | 'sankeyDimensions';


export interface WidgetFieldComponentProps<FieldOptions> {
    widgetFieldSchema?: WidgetFieldSchema<FieldOptions>;
    fieldManager: WidgetFieldValueManager;
    widgetConfig: WidgetConfig;
    widgetId: string;
}

export interface WidgetFieldComponentEmit<ValueType> {
    (e: 'update:value', value: ValueType): void;
    (e: 'update:is-valid', value: boolean): void;
    (e: 'show-error-modal', value?: number): void;
}
