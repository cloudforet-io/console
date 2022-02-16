<template>
    <cost-dashboard-customize-widget-preview>
        <template #description>
            description
        </template>
        <template #extra>
            button
        </template>
    </cost-dashboard-customize-widget-preview>
</template>

<script lang="ts">
import CostDashboardCustomizeWidgetPreview
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetPreview.vue';
import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';

export default {
    name: 'CustomWidgetPreview',
    components: { CostDashboardCustomizeWidgetPreview },
    props: {
        selectedWidget: {
            type: Object as () => WidgetInfo,
            default: () => ({}),
        },
    },

    setup() {
        return {};
    },
};
</script>
