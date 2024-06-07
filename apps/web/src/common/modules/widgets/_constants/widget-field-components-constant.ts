import type { AsyncComponent } from 'vue';

import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-config-type';


export const WIDGET_FIELD_COMPONENTS: Record<Partial<WidgetFieldName>, AsyncComponent> = {
    dataField: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldDataField.vue'),
    }),
    tableDataField: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldTableDataField.vue'),
    }),
    xAxis: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldXAxis.vue'),
    }),
    yAxis: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldYAxis.vue'),
    }),
    stackBy: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldStackBy.vue'),
    }),
    lineBy: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldLineBy.vue'),
    }),
    groupBy: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldGroupBy.vue'),
    }),
    categoryBy: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldCategoryBy.vue'),
    }),
    totalField: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldTotalField.vue'),
    }),
    basisField: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldBasisField.vue'),
    }),
    min: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldMin.vue'),
    }),
    max: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldMax.vue'),
    }),
    formatRules: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldFormatRules.vue'),
    }),
    legend: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldLegend.vue'),
    }),
    progressBar: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldProgressBar.vue'),
    }),
    icon: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldIcon.vue'),
    }),
    subTotal: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldSubTotal.vue'),
    }),
    total: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldTotal.vue'),
    }),
    comparison: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldComparison.vue'),
    }),
};
