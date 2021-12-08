<template>
    <cost-dashboard-card-widget-layout title="Cost Trend by Product">
        <cost-dashboard-stacked-column-widget
            :group-by="GROUP_BY.PRODUCT"
            :currency="currency"
            :currency-rates="currencyRates"
            :period="period"
            :filters="filters"
        />
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import {
    defineComponent,
} from '@vue/composition-api';

import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardStackedColumnWidget
    from '@/services/billing/cost-management/widgets/modules/CostDashboardStackedColumnWidget.vue';

import { GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { CURRENCY } from '@/store/modules/display/config';
import { WidgetProps } from '@/services/billing/cost-management/widgets/type';


export default defineComponent<WidgetProps>({
    name: 'CostTrendByProduct',
    components: {
        CostDashboardStackedColumnWidget,
        CostDashboardCardWidgetLayout,
    },
    props: {
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
    },
    setup() {
        return {
            GROUP_BY,
        };
    },
});
</script>
