import type { AdvancedFormatRulesValue } from '@/common/modules/widgets/_widget-fields/advanced-format-rules/type';
import type { CategoryByValue } from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { ColorSchemaValue } from '@/common/modules/widgets/_widget-fields/color-schema/type';
import type { ComparisonValue } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { CustomTableColumnWidthValue } from '@/common/modules/widgets/_widget-fields/custom-table-column-width/type';
import type { DataFieldHeatmapColorValue } from '@/common/modules/widgets/_widget-fields/data-field-heatmap-color/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { DisplayAnnotationValue } from '@/common/modules/widgets/_widget-fields/display-annotation/type';
import type { DisplaySeriesLabelValue } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { FormatRulesValue } from '@/common/modules/widgets/_widget-fields/format-rules/type';
import type { GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { WidgetHeaderValue } from '@/common/modules/widgets/_widget-fields/header/type';
import type { IconValue } from '@/common/modules/widgets/_widget-fields/icon/type';
import type { LegendValue } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { LineByValue } from '@/common/modules/widgets/_widget-fields/line-by/type';
import type { MissingValueValue } from '@/common/modules/widgets/_widget-fields/missing-value/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { ProgressBarValue } from '@/common/modules/widgets/_widget-fields/progress-bar/type';
import type { StackByValue } from '@/common/modules/widgets/_widget-fields/stack-by/type';
import type { TableColumnWidthValue } from '@/common/modules/widgets/_widget-fields/table-column-width/type';
import type { TableDataFieldValue } from '@/common/modules/widgets/_widget-fields/table-data-field/type';
import type { TextWrapValue } from '@/common/modules/widgets/_widget-fields/text-wrap/type';
import type { TooltipNumberFormatValue } from '@/common/modules/widgets/_widget-fields/tooltip-number-format/type';
import type { TotalValue } from '@/common/modules/widgets/_widget-fields/total/type';
import type { WidgetHeightValue } from '@/common/modules/widgets/_widget-fields/widget-height/type';
import type { XAxisValue } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { YAxisValue } from '@/common/modules/widgets/_widget-fields/y-axis/type';



export type WidgetFieldValues = string | string[] | number | boolean | ComparisonValue | ProgressBarValue | FormatRulesValue[]
    | LineByValue | StackByValue | CategoryByValue | GroupByValue
    | XAxisValue | YAxisValue | TableDataFieldValue | IconValue | TotalValue | ColorSchemaValue
    | WidgetHeaderValue | DateFormatValue | NumberFormatValue | DataFieldHeatmapColorValue
    | DisplayAnnotationValue | DisplaySeriesLabelValue | TextWrapValue | TableColumnWidthValue | CustomTableColumnWidthValue
    | LegendValue | WidgetHeightValue | MissingValueValue | AdvancedFormatRulesValue | DateRangeValue
    | TooltipNumberFormatValue;
