<template>
    <general-page-layout>
        <p-breadcrumbs :routes="routeState.routes" />
        <budget-form :budget-id="budgetId" @confirm="handleFormConfirm" />
    </general-page-layout>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { PBreadcrumbs } from '@spaceone/design-system';

import { i18n } from '@/translations';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import { BILLING_ROUTE } from '@/services/billing/routes';
import BudgetForm from '@/services/billing/cost-management/budget/modules/budget-form/BudgetForm.vue';

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
                { name: i18n.t('MENU.BILLING.BILLING'), to: { name: BILLING_ROUTE._NAME } },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), to: { name: BILLING_ROUTE.COST_MANAGEMENT._NAME } },
                { name: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.UPDATE_BUDGET') },
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

<style lang="postcss" scoped>

</style>
