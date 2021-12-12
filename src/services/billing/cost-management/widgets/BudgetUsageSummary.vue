<template>
    <cost-dashboard-card-widget-layout title="Budget Usage Summary"
                                       :widget-link="widgetLink"
                                       :show-top-text="false"
    >
        <budget-stat :filters="queryStoreFilters" :period="period" />
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import BudgetStat from '@/services/billing/cost-management/budget/modules/budget-stat/BudgetStat.vue';

import { QueryHelper } from '@spaceone/console-core-lib/query';
import { getConvertedBudgetFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { WidgetProps } from '@/services/billing/cost-management/widgets/type';
import { CURRENCY } from '@/store/modules/display/config';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';


export default {
    name: 'BudgetUsageSummary',
    components: {
        CostDashboardCardWidgetLayout,
        BudgetStat,
    },
    props: {
        period: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
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
    },
    setup(props: WidgetProps) {
        const budgetQueryHelper = new QueryHelper();
        const state = reactive({
            queryStoreFilters: computed<QueryStoreFilter[]>(() => getConvertedBudgetFilter(props.filters)),
            widgetLink: computed(() => ({
                name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET._NAME,
                params: {},
                query: {
                    filters: budgetQueryHelper.setFilters(state.queryStoreFilters).rawQueryStrings,
                },
            })),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
