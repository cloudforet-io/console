<template>
    <general-page-layout>
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title child :title="'Budget Name'"
                      @goBack="$router.go(-1)"
        />
        <div class="content">
            <budget-detail-summary />
            <budget-detail-summary-chart />
            <div>budget-alert</div>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import { PBreadcrumbs, PPageTitle } from '@spaceone/design-system';
import { computed, reactive } from '@vue/composition-api';
import BudgetDetailSummary
    from '@/services/billing/cost-management/budget/budget-detail/modules/BudgetDetailSummary.vue';
import BudgetDetailSummaryChart
    from '@/services/billing/cost-management/budget/budget-detail/modules/BudgetDetailSummaryChart.vue';


export default {
    name: 'BudgetDetailPage',
    components: {
        GeneralPageLayout,
        PBreadcrumbs,
        PPageTitle,
        BudgetDetailSummary,
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

}
</style>
