<template>
    <cost-dashboard-card-widget-layout title="Cost Trend by Product" :widget-link="widgetLink">
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
import dayjs from 'dayjs';

import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardStackedColumnWidget
    from '@/services/billing/cost-management/widgets/modules/CostDashboardStackedColumnWidget.vue';

import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { CURRENCY } from '@/store/modules/display/config';
import { WidgetProps } from '@/services/billing/cost-management/widgets/type';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';


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
    setup(props: WidgetProps) {
        const state = reactive({
            widgetLink: computed(() => {
                const _period = {
                    start: dayjs(props.period.end).subtract(5, 'month').format('YYYY-MM'),
                    end: dayjs.utc(props.period.end).endOf('month').format('YYYY-MM-DD'),
                };
                return {
                    name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                    params: {},
                    query: {
                        granularity: primitiveToQueryString(GRANULARITY.MONTHLY),
                        groupBy: arrayToQueryString([GROUP_BY.PRODUCT]),
                        period: objectToQueryString(_period),
                        filters: objectToQueryString(props.filters),
                    },
                };
            }),
        });

        return {
            ...toRefs(state),
            GROUP_BY,
        };
    },
});
</script>
