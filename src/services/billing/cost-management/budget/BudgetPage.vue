<template>
    <div class="budget-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')">
            <template #extra />
        </p-page-title>
        <budget-toolbox />
        <budget-stat />
        <budget-list />
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PBreadcrumbs, PPageTitle,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import BudgetToolbox from '@/services/billing/cost-management/budget/modules/budget-toolbox/BudgetToolbox.vue';
import BudgetStat from '@/services/billing/cost-management/budget/modules/budget-stat/BudgetStat.vue';
import BudgetList from '@/services/billing/cost-management/budget/modules/budget-list/BudgetList.vue';

export default {
    name: 'BudgetPage',
    components: {
        BudgetList,
        BudgetStat,
        BudgetToolbox,
        PBreadcrumbs,
        PPageTitle,
    },
    setup() {
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), path: '/billing' },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), path: '/billing/cost-management' },
                { name: i18n.t('MENU.BILLING.BUDGET') },
            ]),
        });

        const state = reactive({
        });

        return {
            ...toRefs(state),
            routeState,
        };
    },
};
</script>
