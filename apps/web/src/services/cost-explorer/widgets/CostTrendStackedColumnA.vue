<script lang="ts" setup>
import dayjs from 'dayjs';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { CURRENCY } from '@/store/modules/settings/config';
import type { CurrencyRates } from '@/store/modules/settings/type';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import type { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import CostDashboardCardWidgetLayout
    from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardStackedColumnWidget
    from '@/services/cost-explorer/widgets/modules/CostDashboardStackedColumnWidget.vue';
import type { WidgetProps } from '@/services/cost-explorer/widgets/type';

const props = withDefaults(defineProps<WidgetProps<WidgetOptions>>(), {
    name: undefined,
    options: () => ({}) as WidgetOptions,
    period: () => ({}),
    filters: () => ({}),
    currency: CURRENCY.USD,
    currencyRates: () => ({}) as CurrencyRates,
    printMode: false,
});
const emit = defineEmits<{(e: 'rendered'): void}>();
const { t } = useI18n();

const state = reactive({
    groupBy: computed(() => props.options?.group_by),
    widgetLink: computed(() => {
        const _period = {
            start: dayjs.utc(props.period.end).subtract(3, 'month').format('YYYY-MM-01'),
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

const handleRendered = () => {
    emit('rendered');
};

</script>

<template>
    <cost-dashboard-card-widget-layout :title="name ? name : t('BILLING.COST_MANAGEMENT.DASHBOARD.COST_TREND_BY_PRODUCT')"
                                       :widget-link="state.widgetLink"
                                       :print-mode="printMode"
    >
        <cost-dashboard-stacked-column-widget
            :group-by="state.groupBy"
            :currency="currency"
            :currency-rates="currencyRates"
            :period="period"
            :filters="filters"
            :print-mode="printMode"
            @rendered="handleRendered"
        />
    </cost-dashboard-card-widget-layout>
</template>
