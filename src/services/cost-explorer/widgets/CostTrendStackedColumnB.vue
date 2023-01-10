<template>
    <cost-dashboard-card-widget-layout :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.COST_TREND_BY_PROVIDER')"
                                       :widget-link="widgetLink"
                                       :print-mode="printMode"
    >
        <cost-dashboard-stacked-column-widget
            :group-by="groupBy"
            :currency="currency"
            :currency-rates="currencyRates"
            :period="period"
            :filters="filters"
            widget-type="LONG"
            :print-mode="printMode"
            @rendered="handleRendered"
        />
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import dayjs from 'dayjs';

import { CURRENCY } from '@/store/modules/display/config';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import type { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import CostDashboardCardWidgetLayout
    from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardStackedColumnWidget
    from '@/services/cost-explorer/widgets/modules/CostDashboardStackedColumnWidget.vue';
import type { WidgetProps } from '@/services/cost-explorer/widgets/type';

export default defineComponent<WidgetProps>({
    name: 'CostTrendStackedColumnB',
    components: {
        CostDashboardStackedColumnWidget,
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
    setup(props: WidgetProps, { emit }) {
        const state = reactive({
            groupBy: computed(() => props.options?.group_by),
            widgetLink: computed(() => {
                const _period = {
                    start: dayjs.utc(props.period.start).format('YYYY-MM-01'),
                    end: dayjs.utc(props.period.end).endOf('month').format('YYYY-MM-DD'),
                };
                return {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    params: {},
                    query: {
                        granularity: primitiveToQueryString(GRANULARITY.MONTHLY),
                        group_by: arrayToQueryString([state.groupBy]),
                        period: objectToQueryString(_period),
                        filters: objectToQueryString(props.filters),
                    },
                };
            }),
        });

        const handleRendered = (...args) => {
            emit('rendered', ...args);
        };

        return {
            ...toRefs(state),
            handleRendered,
        };
    },
});
</script>
