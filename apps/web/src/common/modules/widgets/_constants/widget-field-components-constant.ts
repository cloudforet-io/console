import type { AsyncComponent } from 'vue';

import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-config-type';


export const WIDGET_FIELD_COMPONENTS: Record<Partial<WidgetFieldName>, AsyncComponent> = {
    dataField: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldDataField.vue'),
    }),
    xAxisField: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldXAxis.vue'),
    }),
    yAxisField: () => ({
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
};
