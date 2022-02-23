<template>
    <cost-dashboard-card-widget-layout :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.BUDGET_USAGE_SUMMARY')"
                                       :widget-link="widgetLink"
                                       :show-top-text="false"
                                       :print-mode="printMode"
    >
        <budget-stat :filters="queryStoreFilters" :period="period" :print-mode="printMode"
                     @rendered="handleRendered"
        />
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
import {
    getWidgetOption,
} from '@/services/billing/cost-management/widgets/lib/widget-data-helper';


export default {
    name: 'BudgetUsageSummary',
    components: {
        CostDashboardCardWidgetLayout,
        BudgetStat,
    },
    props: {
        name: {
            type: String,
            default: undefined,
        },
        widgetId: {
            type: String,
            default: '',
        },
        options: {
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
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: WidgetProps, { emit }) {
        const budgetQueryHelper = new QueryHelper();
        const state = reactive({
            widgetOptions: getWidgetOption(props.options, props.widgetId),
            queryStoreFilters: computed<QueryStoreFilter[]>(() => getConvertedBudgetFilter(props.filters)),
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                return {
                    name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET._NAME,
                    params: {},
                    query: {
                        filters: budgetQueryHelper.setFilters(state.queryStoreFilters).rawQueryStrings,
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
};
</script>
