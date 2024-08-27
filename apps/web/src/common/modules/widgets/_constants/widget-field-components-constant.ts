import type { Component } from 'vue';

import categoryBy from '@/common/modules/widgets/_widget-fields/WidgetFieldCategoryBy.vue';
import colorSchema from '@/common/modules/widgets/_widget-fields/WidgetFieldColorSchema.vue';
import comparison from '@/common/modules/widgets/_widget-fields/WidgetFieldComparison.vue';
import customTableColumnWidth from '@/common/modules/widgets/_widget-fields/WidgetFieldCustomTableColumnWidth.vue';
import dataField from '@/common/modules/widgets/_widget-fields/WidgetFieldDataField.vue';
import dataFieldHeatmapColor from '@/common/modules/widgets/_widget-fields/WidgetFieldDataFieldHeatmapColor.vue';
import dateFormat from '@/common/modules/widgets/_widget-fields/WidgetFieldDateFormat.vue';
import displayAnnotation from '@/common/modules/widgets/_widget-fields/WidgetFieldDisplayAnnotation.vue';
import displaySeriesLabel from '@/common/modules/widgets/_widget-fields/WidgetFieldDisplaySeriesLabel.vue';
import formatRules from '@/common/modules/widgets/_widget-fields/WidgetFieldFormatRules.vue';
import granularity from '@/common/modules/widgets/_widget-fields/WidgetFieldGranularity.vue';
import groupBy from '@/common/modules/widgets/_widget-fields/WidgetFieldGroupBy.vue';
import icon from '@/common/modules/widgets/_widget-fields/WidgetFieldIcon.vue';
import legend from '@/common/modules/widgets/_widget-fields/WidgetFieldLegend.vue';
import lineBy from '@/common/modules/widgets/_widget-fields/WidgetFieldLineBy.vue';
import max from '@/common/modules/widgets/_widget-fields/WidgetFieldMax.vue';
import min from '@/common/modules/widgets/_widget-fields/WidgetFieldMin.vue';
import missingValue from '@/common/modules/widgets/_widget-fields/WidgetFieldMissingValue.vue';
import numberFormat from '@/common/modules/widgets/_widget-fields/WidgetFieldNumberFormat.vue';
import pieChartType from '@/common/modules/widgets/_widget-fields/WidgetFieldPieChartType.vue';
import progressBar from '@/common/modules/widgets/_widget-fields/WidgetFieldProgressBar.vue';
import stackBy from '@/common/modules/widgets/_widget-fields/WidgetFieldStackBy.vue';
import subTotal from '@/common/modules/widgets/_widget-fields/WidgetFieldSubTotal.vue';
import tableColumnWidth from '@/common/modules/widgets/_widget-fields/WidgetFieldTableColumnWidth.vue';
import tableDataField from '@/common/modules/widgets/_widget-fields/WidgetFieldTableDataField.vue';
import textWrap from '@/common/modules/widgets/_widget-fields/WidgetFieldTextWrap.vue';
import total from '@/common/modules/widgets/_widget-fields/WidgetFieldTotal.vue';
import widgetHeight from '@/common/modules/widgets/_widget-fields/WidgetFieldWidgetHeight.vue';
import xAxis from '@/common/modules/widgets/_widget-fields/WidgetFieldXAxis.vue';
import yAxis from '@/common/modules/widgets/_widget-fields/WidgetFieldYAxis.vue';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';


export const WIDGET_FIELD_COMPONENTS: Record<Partial<WidgetFieldName>, Component> = {
    dataField,
    tableDataField,
    xAxis,
    yAxis,
    stackBy,
    lineBy,
    groupBy,
    categoryBy,
    min,
    max,
    formatRules,
    legend,
    progressBar,
    icon,
    subTotal,
    total,
    comparison,
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
};
