<template>
    <general-page-layout>
        <p-breadcrumbs :routes="routeState.routes" />
        <p-page-title :title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.UPDATE_BUDGET')" child @goBack="$router.go(-1)" />
        <budget-form :budget-id="budgetId" @confirm="handleFormConfirm" />
    </general-page-layout>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { PBreadcrumbs } from '@spaceone/design-system';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import BudgetForm from '@/services/cost-explorer/budget/modules/budget-form/BudgetForm.vue';

export default {
    name: 'BudgetUpdatePage',
    components: {
        BudgetForm,
        GeneralPageLayout,
        PBreadcrumbs,
    },
    props: {
        budgetId: {
            type: String,
            default: '',
        },
    },
    setup() {
        const state = reactive({
        });

        const routeState = reactive({
            routes: computed(() => [
                { name: 'Cost Explorer', to: { name: COST_EXPLORER_ROUTE._NAME } },
                { name: 'Budget', to: { name: COST_EXPLORER_ROUTE.BUDGET._NAME } },
                { name: 'Update Budget' },
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
