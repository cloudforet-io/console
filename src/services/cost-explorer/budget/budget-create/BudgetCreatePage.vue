<template>
    <div>
        <p-breadcrumbs :routes="routeState.routes" />
        <p-page-title :title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE_BUDGET')" child @goBack="$router.go(-1)" />
        <budget-form @confirm="handleFormConfirm" />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { PBreadcrumbs, PPageTitle } from '@spaceone/design-system';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import BudgetForm from '@/services/cost-explorer/budget/modules/budget-form/BudgetForm.vue';

export default {
    name: 'BudgetCreatePage',
    components: {
        BudgetForm,
        PBreadcrumbs,
        PPageTitle,
    },
    setup() {
        const state = reactive({
        });

        const routeState = reactive({
            routes: computed(() => [
                { name: 'Cost Explorer', to: { name: COST_EXPLORER_ROUTE._NAME } },
                { name: 'Budget', to: { name: COST_EXPLORER_ROUTE.BUDGET._NAME } },
                { name: 'Create Budget' },
            ]),
        });

        const handleFormConfirm = () => {

        };

        return {
            ...toRefs(state),
            routeState,
            handleFormConfirm,
        };
    },
};
</script>
