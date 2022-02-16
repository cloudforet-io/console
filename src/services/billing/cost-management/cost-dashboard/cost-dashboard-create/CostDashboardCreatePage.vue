<template>
    <div class="cost-dashboard-create-page">
        <nav>
            <p-breadcrumbs :routes="routeState.route" />
            <p-page-title :title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.CREATE_DASHBOARD')" child @goBack="$router.go(-1)" />
        </nav>
        <cost-dashboard-create-form />
        <div class="button-group">
            <p-button style-type="gray900" :outline="true" @click="$router.go(-1)">
                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary-dark" @click="handleClickCreate">
                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.CREATE') }}
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
    DASHBOARD_PRIVACY_TYPE,
    DashboardCreateParam,
    DashboardPrivacyType,
    DefaultLayout, PublicDashboardInfo,
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
            selectedTemplate: computed<Record<string, DefaultLayout> | PublicDashboardInfo>(() => store.state.service?.costDashboardCreate?.selectedTemplate),
            defaultFilter: computed<Record<string, string[]>>(() => store.state.service?.costDashboardCreate?.defaultFilter),
            selectedPrivacy: computed<DashboardPrivacyType>(() => store.state.service?.costDashboardCreate?.selectedPrivacy),
        });

        const getDefaultLayoutId = () => {
            if (Object.prototype.hasOwnProperty.call(state.selectedTemplate, 'default_layout_id')) {
                return state.selectedTemplate.default_layout_id;
            } return undefined;
        };

        const dashboardCreateParam: DashboardCreateParam = {
            name: 'Untitled Dashboard',
            default_layout_id: getDefaultLayoutId() as string,
            custom_layouts: [],
            period_type: 'AUTO',
            default_filter: state.defaultFilter,
        };

        const createPublicDashboard = async (): Promise<string|undefined> => {
            try {
                const { public_dashboard_id } = await SpaceConnector.client.costAnalysis.publicDashboard.create(dashboardCreateParam as DashboardCreateParam);
                return public_dashboard_id;
            } catch (e) {
                ErrorHandler.handleRequestError(e, 'Failed to create dashboard');
            }
            return undefined;
        };

        const createUserDashboard = async (): Promise<string|undefined> => {
            try {
                const { user_dashboard_id } = await SpaceConnector.client.costAnalysis.userDashboard.create(dashboardCreateParam as DashboardCreateParam);
                return user_dashboard_id;
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
            const createdDashboardId = state.selectedPrivacy === DASHBOARD_PRIVACY_TYPE.PUBLIC ? await createPublicDashboard() : await createUserDashboard();
            if (createdDashboardId) goToCustomizePage(createdDashboardId);
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
        margin-top: 1rem;
        gap: 1rem;
    }
}
</style>
