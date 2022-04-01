<template>
    <cost-dashboard-card-widget-layout :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.COST_BY_PROVIDER')"
                                       class="cost-donut"
                                       :print-mode="printMode"
    >
        Traffic Cost Trend
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import CostDashboardCardWidgetLayout from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { CURRENCY } from '@/store/modules/display/config';

export default {
    name: 'TrafficCostTrend',
    components: {
        CostDashboardCardWidgetLayout,
    },
    props: {
        name: {
            type: String,
            default: undefined,
        },
        options: {
            type: Object as () => WidgetOptions,
            default: () => ({}),
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
        period: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
        printMode: {
            type: Boolean,
            default: false,
        },
    },

    setup() {
        return {};
    },
};
</script>
