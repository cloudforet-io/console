import type { Component } from 'vue';

import basisField from '@/common/modules/widgets/_widget-fields/WidgetFieldBasisField.vue';
import categoryBy from '@/common/modules/widgets/_widget-fields/WidgetFieldCategoryBy.vue';
import colorSchema from '@/common/modules/widgets/_widget-fields/WidgetFieldColorSchema.vue';
import comparison from '@/common/modules/widgets/_widget-fields/WidgetFieldComparison.vue';
import dataField from '@/common/modules/widgets/_widget-fields/WidgetFieldDataField.vue';
import dateFormat from '@/common/modules/widgets/_widget-fields/WidgetFieldDateFormat.vue';
import formatRules from '@/common/modules/widgets/_widget-fields/WidgetFieldFormatRules.vue';
import granularity from '@/common/modules/widgets/_widget-fields/WidgetFieldGranularity.vue';
import groupBy from '@/common/modules/widgets/_widget-fields/WidgetFieldGroupBy.vue';
import icon from '@/common/modules/widgets/_widget-fields/WidgetFieldIcon.vue';
import legend from '@/common/modules/widgets/_widget-fields/WidgetFieldLegend.vue';
import lineBy from '@/common/modules/widgets/_widget-fields/WidgetFieldLineBy.vue';
import max from '@/common/modules/widgets/_widget-fields/WidgetFieldMax.vue';
import min from '@/common/modules/widgets/_widget-fields/WidgetFieldMin.vue';
import pieChartType from '@/common/modules/widgets/_widget-fields/WidgetFieldPieChartType.vue';
import progressBar from '@/common/modules/widgets/_widget-fields/WidgetFieldProgressBar.vue';
import stackBy from '@/common/modules/widgets/_widget-fields/WidgetFieldStackBy.vue';
import subTotal from '@/common/modules/widgets/_widget-fields/WidgetFieldSubTotal.vue';
import tableDataField from '@/common/modules/widgets/_widget-fields/WidgetFieldTableDataField.vue';
import total from '@/common/modules/widgets/_widget-fields/WidgetFieldTotal.vue';
import totalField from '@/common/modules/widgets/_widget-fields/WidgetFieldTotalField.vue';
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
    totalField,
    basisField,
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
};
