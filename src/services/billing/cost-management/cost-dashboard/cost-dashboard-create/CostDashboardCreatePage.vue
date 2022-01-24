<template>
    <div class="cost-dashboard-create-page">
        <nav>
            <p-breadcrumbs :routes="routeState.route" />
            <p-page-title title="Create New Dashboard" child @goBack="$router.go(-1)" />
        </nav>
        <cost-dashboard-create-form />
    </div>
</template>

<script lang="ts">
import {
    PBreadcrumbs, PPageTitle,
} from '@spaceone/design-system';
import { computed, reactive } from '@vue/composition-api';
import { i18n } from '@/translations';
import CostDashboardCreateForm
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateForm.vue';
import { registerServiceStore } from '@/common/composables/register-service-store';
import CostDashboardCreateStoreModule from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/store';
import { CostDashboardCreateState } from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/store/type';

export default {
    name: 'CostDashboardCreatePage',
    components: {
        CostDashboardCreateForm,
        PBreadcrumbs,
        PPageTitle,
    },

    setup() {
        registerServiceStore<CostDashboardCreateState>('costDashboardCreate', CostDashboardCreateStoreModule);
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), path: '/billing' },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), path: '/billing/cost-management' },
                { name: 'Create New Dashboard' },
            ]),
        });

        return {
            routeState,
        };
    },
};
</script>
