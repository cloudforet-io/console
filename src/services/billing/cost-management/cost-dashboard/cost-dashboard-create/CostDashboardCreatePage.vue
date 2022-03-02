<template>
    <div class="cost-dashboard-create-page">
        <nav>
            <p-breadcrumbs :routes="routeState.route" />
            <p-page-title :title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.CREATE_DASHBOARD')" child @goBack="$router.go(-1)" />
        </nav>
        <cost-dashboard-create-form />
        <div class="button-group">
            <p-button style-type="gray900" :outline="true" @click="$router.go(-1)">
                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary-dark" :disabled="!Object.keys(selectedTemplate).length" @click="handleClickCreate">
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
import CostDashboardStoreModule from '@/services/billing/cost-management/cost-dashboard/store';
import { CostDashboardState } from '@/services/billing/cost-management/cost-dashboard/store/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    CustomLayout,
    DASHBOARD_PRIVACY_TYPE,
    DashboardCreateParam,
    DashboardPrivacyType,
} from '@/services/billing/cost-management/cost-dashboard/type';
import { store } from '@/store';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceRouter } from '@/router';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { fetchDefaultLayoutData } from '@/services/billing/cost-management/cost-dashboard/lib/helper';

export default {
    name: 'CostDashboardCreatePage',
    components: {
        CostDashboardCreateForm,
        PBreadcrumbs,
        PPageTitle,
        PButton,
    },

    setup() {
        registerServiceStore<CostDashboardState>('costDashboard', CostDashboardStoreModule);
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), path: '/billing' },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), path: '/billing/cost-management' },
                { name: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.CREATE_DASHBOARD') },
            ]),
        });

        const state = reactive({
            selectedTemplate: computed(() => store.state.service?.costDashboard?.selectedTemplate),
            defaultFilter: computed<Record<string, string[]>>(() => store.state.service?.costDashboard?.defaultFilter),
            includesFilter: computed<boolean>(() => store.state.service?.costDashboard?.includesFilter),
            selectedPrivacy: computed<DashboardPrivacyType>(() => store.state.service?.costDashboard?.selectedDashboardPrivacy),
        });

        const getCustomLayouts = async () => {
            const hasDefaultId = Object.prototype.hasOwnProperty.call(state.selectedTemplate, 'default_layout_id');
            if (hasDefaultId && (!state.selectedTemplate.custom_layouts || state.selectedTemplate.custom_layouts?.length === 0)) {
                return await fetchDefaultLayoutData(state.selectedTemplate.default_layout_id as string) as CustomLayout[];
            }
            return state.selectedTemplate?.custom_layouts as CustomLayout[];
        };

        const makeDashboardCreateParam = async (): Promise<DashboardCreateParam> => ({
            name: 'Untitled Dashboard',
            custom_layouts: await getCustomLayouts(),
            period_type: 'AUTO',
            default_filter: state.includesFilter ? state.defaultFilter : {},
        });

        const createPublicDashboard = async (): Promise<string|undefined> => {
            try {
                const { public_dashboard_id } = await SpaceConnector.client.costAnalysis.publicDashboard.create(await makeDashboardCreateParam() as DashboardCreateParam);
                return public_dashboard_id;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.ALT_E_CREATE_ALERT'));
            }
            return undefined;
        };

        const createUserDashboard = async (): Promise<string|undefined> => {
            try {
                const { user_dashboard_id } = await SpaceConnector.client.costAnalysis.userDashboard.create(await makeDashboardCreateParam() as DashboardCreateParam);
                return user_dashboard_id;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.ALT_E_CREATE_ALERT'));
            }
            return undefined;
        };

        const goToCustomizePage = (dashboardId: string) => {
            SpaceRouter.router.push({
                name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE._NAME,
                params: { dashboardId },
                query: {
                    from: 'create',
                },
            });
        };
        const handleClickCreate = async () => {
            const createdDashboardId = state.selectedPrivacy === DASHBOARD_PRIVACY_TYPE.PUBLIC ? await createPublicDashboard() : await createUserDashboard();
            if (createdDashboardId) goToCustomizePage(createdDashboardId);
            store.commit('service/costDashboard/setDashboardPrivacy', DASHBOARD_PRIVACY_TYPE.USER);
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
