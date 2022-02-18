<template>
    <cost-dashboard-customize-widget-preview :layout="layout">
        <template #chart>
            <p-label>Type</p-label>
            {{ chartType }}
        </template>
    </cost-dashboard-customize-widget-preview>
</template>

<script lang="ts">
import CostDashboardCustomizeWidgetPreview
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetPreview.vue';
import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { PLabel } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'DefaultWidgetPreview',
    components: {
        CostDashboardCustomizeWidgetPreview,
        PLabel,
    },
    props: {
        selectedWidget: {
            type: Object as () => WidgetInfo,
            default: () => ({}),
        },
    },

    setup(props) {
        const state = reactive({
            chartType: computed(() => props.selectedWidget?.options?.chart_type ?? ''),
            layout: computed(() => props.selectedWidget?.options?.layout),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>
