import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';

import type { CategoryByValue } from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { ColorSchemaValue } from '@/common/modules/widgets/_widget-fields/color-schema/type';
import type { ComparisonValue } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { CustomTableColumnWidthValue } from '@/common/modules/widgets/_widget-fields/custom-table-column-width/type';
import type { DataFieldHeatmapColorValue } from '@/common/modules/widgets/_widget-fields/data-field-heatmap-color/type';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { DisplayAnnotationValue } from '@/common/modules/widgets/_widget-fields/display-annotation/type';
import type { DisplaySeriesLabelValue } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { FormatRulesValue } from '@/common/modules/widgets/_widget-fields/format-rules/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { WidgetHeaderValue } from '@/common/modules/widgets/_widget-fields/header/type';
import type { IconValue } from '@/common/modules/widgets/_widget-fields/icon/type';
import type { LegendValue } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { MaxValue } from '@/common/modules/widgets/_widget-fields/max/type';
import type { MinValue } from '@/common/modules/widgets/_widget-fields/min/type';
import type { MissingValueValue } from '@/common/modules/widgets/_widget-fields/missing-value/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { PieChartTypeValue } from '@/common/modules/widgets/_widget-fields/pie-chart-type/type';
import type { SankeyDimensionsValue } from '@/common/modules/widgets/_widget-fields/sankey-dimensions/type';
import type { StackByValue } from '@/common/modules/widgets/_widget-fields/stack-by/type';
import type { SubTotalValue } from '@/common/modules/widgets/_widget-fields/sub-total/type';
import type { TableColumnComparisonValue } from '@/common/modules/widgets/_widget-fields/table-column-comparison/type';
import type { TableColumnWidthValue } from '@/common/modules/widgets/_widget-fields/table-column-width/type';
import type { TextWrapValue } from '@/common/modules/widgets/_widget-fields/text-wrap/type';
import type { TooltipNumberFormatValue } from '@/common/modules/widgets/_widget-fields/tooltip-number-format/type';
import type { TotalValue } from '@/common/modules/widgets/_widget-fields/total/type';
import type { WidgetHeightValue } from '@/common/modules/widgets/_widget-fields/widget-height/type';
import type { XAxisValue } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { YAxisValue } from '@/common/modules/widgets/_widget-fields/y-axis/type';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';

export type FieldValueValidator<T extends WidgetFieldValue> = (fieldValue: T, widgetConfig: WidgetConfig, dataTable?: DataTableModel, allValueMap?: WidgetFieldValueMap) => boolean;
export type FieldDefaultValueConvertor<T extends keyof WidgetFieldTypeMap> = (widgetConfig: WidgetConfig, dataTable: PublicDataTableModel|PrivateDataTableModel) => WidgetFieldTypeMap[T]['value'];

export interface WidgetFieldValueMap {
    [fieldKey: string]: WidgetFieldValue;
}

export interface WidgetFieldValue<T = any> {
    value?: T;
    meta?: Record<string, any>;
}

export interface WidgetFieldTypeMap {
    xAxis: WidgetFieldValue<XAxisValue>;
    yAxis: WidgetFieldValue<YAxisValue>;
    widgetHeight: WidgetFieldValue<WidgetHeightValue>;
    total: WidgetFieldValue<TotalValue>;
    tooltipNumberFormat: WidgetFieldValue<TooltipNumberFormatValue>;
    textWrap: WidgetFieldValue<TextWrapValue>;
    tableColumnWidth: WidgetFieldValue<TableColumnWidthValue>;
    subTotal: WidgetFieldValue<SubTotalValue>;
    stackBy: WidgetFieldValue<StackByValue>;
    pieChartType: WidgetFieldValue<PieChartTypeValue>;
    numberFormat: WidgetFieldValue<NumberFormatValue>;
    missingValue: WidgetFieldValue<MissingValueValue>;
    min: WidgetFieldValue<MinValue>;
    max: WidgetFieldValue<MaxValue>;
    legend: WidgetFieldValue<LegendValue>;
    icon: WidgetFieldValue<IconValue>;
    widgetHeader: WidgetFieldValue<WidgetHeaderValue>;
    groupBy: WidgetFieldValue<GroupByValue>;
    granularity: WidgetFieldValue<GranularityValue>;
    formatRules: WidgetFieldValue<FormatRulesValue>;
    displaySeriesLabel: WidgetFieldValue<DisplaySeriesLabelValue>;
    displayAnnotation: WidgetFieldValue<DisplayAnnotationValue>;
    dateRange: WidgetFieldValue<DateRangeValue>;
    dateFormat: WidgetFieldValue<DateFormatValue>;
    dataFieldHeatmapColor: WidgetFieldValue<DataFieldHeatmapColorValue>;
    dataField: WidgetFieldValue<DataFieldValue>;
    customTableColumnWidth: WidgetFieldValue<CustomTableColumnWidthValue>;
    comparison: WidgetFieldValue<ComparisonValue>;
    tableColumnComparison: WidgetFieldValue<TableColumnComparisonValue>;
    colorSchema: WidgetFieldValue<ColorSchemaValue>;
    categoryBy: WidgetFieldValue<CategoryByValue>;
    sankeyDimensions: WidgetFieldValue<SankeyDimensionsValue>;
}
