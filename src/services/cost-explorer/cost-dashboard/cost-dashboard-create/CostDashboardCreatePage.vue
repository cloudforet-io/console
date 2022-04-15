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
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateForm.vue';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    CustomLayout,
    DASHBOARD_PRIVACY_TYPE,
    DashboardCreateParam,
    DashboardPrivacyType,
    PERIOD_TYPE, PeriodType,
} from '@/services/cost-explorer/cost-dashboard/type';
import { store } from '@/store';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceRouter } from '@/router';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { fetchDefaultLayoutData } from '@/services/cost-explorer/cost-dashboard/lib/helper';

export default {
    name: 'CostDashboardCreatePage',
    components: {
        CostDashboardCreateForm,
        PBreadcrumbs,
        PPageTitle,
        PButton,
    },

    setup() {
        const routeState = reactive({
            route: computed(() => [
                { name: 'Cost Explorer', to: { name: COST_EXPLORER_ROUTE._NAME } },
                { name: 'Dashboard', to: { name: COST_EXPLORER_ROUTE.DASHBOARD._NAME } },
                { name: 'Create Dashboard' },
            ]),
        });

        const state = reactive({
            selectedTemplate: computed(() => store.state.service.costExplorer.dashboard.selectedTemplate),
            defaultFilter: computed<Record<string, string[]>>(() => store.state.service.costExplorer.dashboard.defaultFilter),
            includesFilter: computed<boolean>(() => store.state.service.costExplorer.dashboard.includesFilter),
            selectedPrivacy: computed<DashboardPrivacyType>(() => store.state.service.costExplorer.dashboard.selectedDashboardPrivacy),
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
            period_type: state.selectedTemplate.period_type as PeriodType ?? PERIOD_TYPE.AUTO,
            period: state.selectedTemplate.period ?? null,
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
                name: COST_EXPLORER_ROUTE.DASHBOARD.CUSTOMIZE._NAME,
                params: { dashboardId },
                query: {
                    from: 'create',
                },
            });
        };
        const handleClickCreate = async () => {
            const createdDashboardId = state.selectedPrivacy === DASHBOARD_PRIVACY_TYPE.PUBLIC ? await createPublicDashboard() : await createUserDashboard();
            if (createdDashboardId) goToCustomizePage(createdDashboardId);
            store.commit('service/costExplorer/dashboard/setDashboardPrivacy', DASHBOARD_PRIVACY_TYPE.USER);
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
