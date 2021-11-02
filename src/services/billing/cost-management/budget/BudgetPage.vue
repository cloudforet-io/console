<template>
    <div class="budget-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')" />
    </div>
</template>

<script lang="ts">
import { computed, reactive } from '@vue/composition-api';
import { i18n } from '@/translations';

import {
    PBreadcrumbs, PPageTitle,
} from '@spaceone/design-system';

export default {
    name: 'BudgetPage',
    components: {
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

        return {
            routeState,
        };
    },
};
</script>
