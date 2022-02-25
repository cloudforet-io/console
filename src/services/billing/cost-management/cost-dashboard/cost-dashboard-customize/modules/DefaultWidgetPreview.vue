<template>
    <cost-dashboard-customize-widget-preview :layout="layout">
        <template #chart>
            <div class="info-item">
                <p-label>Type</p-label>
                <div style="width: 100px; height: 100px; background-color: lightgreen;" />
                <span>{{ chartType }}</span>
            </div>
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
<style lang="postcss" scoped>
.info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 0.5rem;
    .p-label {
        @apply mr-auto;
    }
}
</style>
