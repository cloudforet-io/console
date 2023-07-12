<script lang="ts" setup>
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { CURRENCY } from '@/store/modules/settings/config';
import type { CurrencyRates } from '@/store/modules/settings/type';

import BudgetStat from '@/services/cost-explorer/budget/modules/budget-stat/BudgetStat.vue';
import type { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { getConvertedBudgetFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import {
    getWidgetOption,
} from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import CostDashboardCardWidgetLayout
    from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import type { WidgetProps } from '@/services/cost-explorer/widgets/type';

const props = withDefaults(defineProps<WidgetProps>(), {
    widgetId: '',
    options: () => ({}) as WidgetOptions,
    period: () => ({}),
    filters: () => ({}),
    currency: CURRENCY.USD,
    currencyRates: () => ({}) as CurrencyRates,
    printMode: false,
});
const emit = defineEmits<{(e: 'rendered'): void}>();
const { t } = useI18n();

const budgetQueryHelper = new QueryHelper();
const state = reactive({
    widgetOptions: getWidgetOption(props.options, props.widgetId),
    queryStoreFilters: computed<ConsoleFilter[]>(() => getConvertedBudgetFilter(props.filters)),
    widgetLink: computed(() => {
        if (props.printMode) return undefined;
        return {
            name: COST_EXPLORER_ROUTE.BUDGET._NAME,
            params: {},
            query: {
                filters: budgetQueryHelper.setFilters(state.queryStoreFilters).rawQueryStrings,
            },
        };
    }),
});

const handleRendered = () => {
    emit('rendered');
};

</script>

<template>
    <cost-dashboard-card-widget-layout :title="name ? name : t('BILLING.COST_MANAGEMENT.DASHBOARD.BUDGET_USAGE_SUMMARY')"
                                       :widget-link="state.widgetLink"
                                       :show-top-text="false"
                                       :print-mode="printMode"
    >
        <budget-stat :query-store-filters="state.queryStoreFilters"
                     :period="period"
                     :print-mode="printMode"
                     @rendered="handleRendered"
        />
    </cost-dashboard-card-widget-layout>
</template>
