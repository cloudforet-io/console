<template>
    <general-page-layout>
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title child :title="'Budget Name'"
                      @goBack="$router.go(-1)"
        />
        <div class="content">
            <budget-detail-info class="summary" />
            <budget-detail-summary-chart class="summary-chart" />
            <budget-detail-alert class="alert" />
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import { PBreadcrumbs, PPageTitle } from '@spaceone/design-system';
import { computed, reactive } from '@vue/composition-api';
import BudgetDetailInfo
    from '@/services/billing/cost-management/budget/budget-detail/modules/BudgetDetailInfo.vue';
import BudgetDetailSummaryChart
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-summary/BudgetSummaryChart.vue';
import BudgetDetailAlert
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-alert/BudgetAlert.vue';


export default {
    name: 'BudgetDetailPage',
    components: {
        BudgetDetailAlert,
        GeneralPageLayout,
        PBreadcrumbs,
        PPageTitle,
        BudgetDetailInfo,
        BudgetDetailSummaryChart,
    },
    setup() {
        const routeState = reactive({
            route: computed(() => ([
                { name: 'Billing', to: { name: '' } },
                { name: 'Cost Management', to: { name: '' } },
                { name: 'Budget', to: { name: '' } },
                { name: 'Budget Name', to: { name: '' } },
            ])),
        });

        return {
            routeState,
        };
    },
};
</script>

<style lang="postcss" scoped>
.content {
    @apply flex flex-col;
    gap: 1rem;
    .summary {
        flex-grow: 1;
    }
    .summary-chart {
        flex-grow: 2;
    }
    .alert {
        flex-grow: 1;
    }
}
</style>
