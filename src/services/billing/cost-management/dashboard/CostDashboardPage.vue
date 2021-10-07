<template>
    <div class="cost-dashboard-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD')" />
        {{ id }}
    </div>
</template>

<script lang="ts">
import { computed, reactive } from '@vue/composition-api';
import { i18n } from '@/translations';

import {
    PBreadcrumbs, PPageTitle,
} from '@spaceone/design-system';
import { BILLING_ROUTE } from '@/services/billing/routes';

export default {
    name: 'CostDashboardPage',
    components: {
        PBreadcrumbs,
        PPageTitle,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    setup() {
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), to: { name: BILLING_ROUTE._NAME } },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), to: { name: BILLING_ROUTE.COST_MANAGEMENT._NAME } },
                { name: i18n.t('MENU.BILLING.DASHBOARD') },
            ]),
        });

        return {
            routeState,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
