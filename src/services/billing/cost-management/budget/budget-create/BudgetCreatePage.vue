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

import { i18n } from '@/translations';

import { BILLING_ROUTE } from '@/services/billing/routes';
import BudgetForm from '@/services/billing/cost-management/budget/modules/budget-form/BudgetForm.vue';
import { store } from '@/store';

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
                { name: i18n.t('MENU.BILLING.BILLING'), to: { name: BILLING_ROUTE._NAME } },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), to: { name: BILLING_ROUTE.COST_MANAGEMENT._NAME } },
                { name: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE_BUDGET') },
            ]),
        });

        const handleFormConfirm = () => {

        };

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('resource/serviceAccount/load'),
                store.dispatch('resource/project/load'),
                store.dispatch('resource/projectGroup/load'),
                store.dispatch('resource/region/load'),
                store.dispatch('resource/provider/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            routeState,
            handleFormConfirm,
        };
    },
};
</script>
