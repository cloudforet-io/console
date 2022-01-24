<template>
    <div class="cost-dashboard-create-page">
        <nav>
            <p-breadcrumbs :routes="routeState.route" />
            <p-page-title title="Create New Dashboard" child @goBack="$router.go(-1)" />
        </nav>
        <cost-dashboard-create-form />
        <div class="button-group">
            <p-button style-type="gray900" :outline="true" @click="$router.go(-1)">
                Cancel
            </p-button>
            <p-button style-type="primary-dark" @click="handleClickCreate">
                Create
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import { PBreadcrumbs, PButton, PPageTitle } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { i18n } from '@/translations';
import CostDashboardCreateForm
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateForm.vue';
import { registerServiceStore } from '@/common/composables/register-service-store';
import CostDashboardCreateStoreModule
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/store';
import { CostDashboardCreateState } from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/store/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    DashboardCreateParam,
    DashboardInfo,
    DefaultLayout,
} from '@/services/billing/cost-management/cost-dashboard/type';
import { store } from '@/store';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceRouter } from '@/router';
import { BILLING_ROUTE } from '@/services/billing/routes';

export default {
    name: 'CostDashboardCreatePage',
    components: {
        CostDashboardCreateForm,
        PBreadcrumbs,
        PPageTitle,
        PButton,
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

        const state = reactive({
            selectedTemplate: computed<Record<string, DefaultLayout> | DashboardInfo>(() => store.state.service?.costDashboardCreate?.selectedTemplate),
            defaultFilter: computed<Record<string, string[]>>(() => store.state.service?.costDashboardCreate?.defaultFilter),
        });

        const getDefaultLayoutId = () => {
            if (Object.prototype.hasOwnProperty.call(state.selectedTemplate, 'default_layout_id')) {
                return state.selectedTemplate.default_layout_id;
            } return '';
        };

        const createDashboard = async (): Promise<DashboardInfo|undefined> => {
            try {
                return await SpaceConnector.client.costAnalysis.dashboard.create({
                    name: 'Untitled Dashboard',
                    default_layout_id: getDefaultLayoutId(),
                    custom_layouts: [],
                    period_type: 'AUTO',
                    default_filter: state.defaultFilter,
                } as DashboardCreateParam);
            } catch (e) {
                ErrorHandler.handleRequestError(e, 'Failed to create dashboard');
            }
            return undefined;
        };

        const goToCustomizePage = (dashboardId: string) => {
            SpaceRouter.router.push({
                name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE._NAME,
                params: { dashboardId },
            });
        };
        const handleClickCreate = async () => {
            const createdDashboard = await createDashboard();
            if (createdDashboard?.dashboard_id) goToCustomizePage(createdDashboard.dashboard_id);
        };

        return {
            routeState,
            ...toRefs(state),
            handleClickCreate,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-create-page {
    .button-group {
        @apply flex justify-end;
        margin-top: 1.5rem;
        gap: 1rem;
    }
}
</style>
