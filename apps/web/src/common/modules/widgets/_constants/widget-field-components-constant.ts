// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Component } from 'vue';

import categoryBy from '@/common/modules/widgets/_widget-fields/category-by/WidgetFieldCategoryBy.vue';
import colorSchema from '@/common/modules/widgets/_widget-fields/color-schema/WidgetFieldColorSchema.vue';
import comparison from '@/common/modules/widgets/_widget-fields/comparison/WidgetFieldComparison.vue';
import customTableColumnWidth from '@/common/modules/widgets/_widget-fields/custom-table-column-width/WidgetFieldCustomTableColumnWidth.vue';
import dataFieldHeatmapColor from '@/common/modules/widgets/_widget-fields/data-field-heatmap-color/WidgetFieldDataFieldHeatmapColor.vue';
import dataField from '@/common/modules/widgets/_widget-fields/data-field/WidgetFieldDataField.vue';
import dateFormat from '@/common/modules/widgets/_widget-fields/date-format/WidgetFieldDateFormat.vue';
import dateRange from '@/common/modules/widgets/_widget-fields/date-range/WidgetFieldDateRange.vue';
import displayAnnotation from '@/common/modules/widgets/_widget-fields/display-annotation/WidgetFieldDisplayAnnotation.vue';
import displaySeriesLabel from '@/common/modules/widgets/_widget-fields/display-series-label/WidgetFieldDisplaySeriesLabel.vue';
import formatRules from '@/common/modules/widgets/_widget-fields/format-rules/WidgetFieldFormatRules.vue';
import granularity from '@/common/modules/widgets/_widget-fields/granularity/WidgetFieldGranularity.vue';
import groupBy from '@/common/modules/widgets/_widget-fields/group-by/WidgetFieldGroupBy.vue';
import icon from '@/common/modules/widgets/_widget-fields/icon/WidgetFieldIcon.vue';
import legend from '@/common/modules/widgets/_widget-fields/legend/WidgetFieldLegend.vue';
import max from '@/common/modules/widgets/_widget-fields/max/WidgetFieldMax.vue';
import min from '@/common/modules/widgets/_widget-fields/min/WidgetFieldMin.vue';
import missingValue from '@/common/modules/widgets/_widget-fields/missing-value/WidgetFieldMissingValue.vue';
import numberFormat from '@/common/modules/widgets/_widget-fields/number-format/WidgetFieldNumberFormat.vue';
import pieChartType from '@/common/modules/widgets/_widget-fields/pie-chart-type/WidgetFieldPieChartType.vue';
import sankeyDimensions from '@/common/modules/widgets/_widget-fields/sankey-dimensions/WidgetFieldSankeyDimensions.vue';
import stackBy from '@/common/modules/widgets/_widget-fields/stack-by/WidgetFieldStackBy.vue';
import subTotal from '@/common/modules/widgets/_widget-fields/sub-total/WidgetFieldSubTotal.vue';
import tableColumnComparison from '@/common/modules/widgets/_widget-fields/table-column-comparison/WidgetFieldTableColumnComparison.vue';
import tableColumnWidth from '@/common/modules/widgets/_widget-fields/table-column-width/WidgetFieldTableColumnWidth.vue';
import textWrap from '@/common/modules/widgets/_widget-fields/text-wrap/WidgetFieldTextWrap.vue';
import tooltipNumberFormat from '@/common/modules/widgets/_widget-fields/tooltip-number-format/WidgetFieldTooltipNumberFormat.vue';
import total from '@/common/modules/widgets/_widget-fields/total/WidgetFieldTotal.vue';
import widgetHeight from '@/common/modules/widgets/_widget-fields/widget-height/WidgetFieldWidgetHeight.vue';
import xAxis from '@/common/modules/widgets/_widget-fields/x-axis/WidgetFieldXAxis.vue';
import yAxis from '@/common/modules/widgets/_widget-fields/y-axis/WidgetFieldYAxis.vue';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';


export const WIDGET_FIELD_COMPONENTS: Record<Partial<WidgetFieldName>, Component> = {
    dateRange,
    dataField,
    xAxis,
    yAxis,
    stackBy,
    groupBy,
    categoryBy,
    min,
    max,
    formatRules,
    legend,
    icon,
    subTotal,
    total,
    comparison,
    tableColumnComparison,
    granularity,
    colorSchema,
    pieChartType,
    dateFormat,
    numberFormat,
    dataFieldHeatmapColor,
    displayAnnotation,
    displaySeriesLabel,
    textWrap,
    tableColumnWidth,
    customTableColumnWidth,
    missingValue,
    widgetHeight,
    tooltipNumberFormat,
    sankeyDimensions,
};
