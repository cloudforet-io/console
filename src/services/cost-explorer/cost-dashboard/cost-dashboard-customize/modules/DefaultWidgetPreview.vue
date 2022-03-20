<template>
    <cost-dashboard-customize-widget-preview :layout="layout">
        <template #chart>
            <div class="info-item">
                <p-label>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.TYPE') }}</p-label>
                <div class="image-wrapper">
                    <img :src="require(`@/assets/images/${chartTypeImageFileName}.svg`)">
                </div>
                <span>{{ chartTypeName }}</span>
            </div>
        </template>
    </cost-dashboard-customize-widget-preview>
</template>

<script lang="ts">
import CostDashboardCustomizeWidgetPreview
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetPreview.vue';
import { WidgetInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { PLabel } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { chartTypeItemMap } from '@/services/cost-explorer/cost-dashboard/lib/config';

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
            chartTypeName: computed(() => chartTypeItemMap[state.chartType]?.label),
            chartTypeImageFileName: computed(() => chartTypeItemMap[state.chartType]?.imageFileName),
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
.image-wrapper {
    width: 6.25rem;
    height: 6.25rem;
    img {
        margin: 0 auto;
    }
}
</style>
