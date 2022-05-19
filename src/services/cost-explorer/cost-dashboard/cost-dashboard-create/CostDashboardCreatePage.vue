<template>
    <div class="cost-dashboard-create-page">
        <nav>
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
import { computed, reactive, toRefs } from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { PButton, PPageTitle } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CostDashboardCreateForm
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateForm.vue';
import { fetchDefaultLayoutData } from '@/services/cost-explorer/cost-dashboard/lib/helper';
import {
    CustomLayout,
    DASHBOARD_PRIVACY_TYPE,
    DashboardCreateParam,
    DashboardPrivacyType,
    PERIOD_TYPE, PeriodType,
} from '@/services/cost-explorer/cost-dashboard/type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { costExplorerStore } from '@/services/cost-explorer/store';
import { Period } from '@/services/cost-explorer/type';

export default {
    name: 'CostDashboardCreatePage',
    components: {
        CostDashboardCreateForm,
        PPageTitle,
        PButton,
    },

    setup() {
        const state = reactive({
            selectedTemplate: computed(() => costExplorerStore.state.dashboard.selectedTemplate),
            defaultFilter: computed<Record<string, string[]>>(() => costExplorerStore.state.dashboard.defaultFilter),
            includesFilter: computed<boolean>(() => costExplorerStore.state.dashboard.includesFilter),
            selectedPrivacy: computed<DashboardPrivacyType>(() => costExplorerStore.state.dashboard.selectedDashboardPrivacy),
        });

        const getCustomLayouts = async () => {
            const hasDefaultId = Object.prototype.hasOwnProperty.call(state.selectedTemplate, 'default_layout_id');
            if (hasDefaultId && (!Array.isArray(state.selectedTemplate.custom_layouts) || state.selectedTemplate.custom_layouts.length === 0)) {
                return await fetchDefaultLayoutData(state.selectedTemplate.default_layout_id as string) as CustomLayout[];
            }
            return state.selectedTemplate?.custom_layouts as CustomLayout[];
        };

        const makeDashboardCreateParam = async (): Promise<DashboardCreateParam> => ({
            name: 'Untitled Dashboard',
            custom_layouts: await getCustomLayouts(),
            period_type: state.selectedTemplate.period_type as PeriodType ?? PERIOD_TYPE.AUTO,
            period: state.selectedTemplate.period as Period,
            default_filter: state.includesFilter ? state.defaultFilter : {},
        });

        const createPublicDashboard = async (): Promise<string|undefined> => {
            try {
                const res = await SpaceConnector.client.costAnalysis.publicDashboard.create(await makeDashboardCreateParam() as DashboardCreateParam);
                return res.public_dashboard_id;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.ALT_E_CREATE_ALERT'));
            }
            return undefined;
        };

        const createUserDashboard = async (): Promise<string|undefined> => {
            try {
                const res = await SpaceConnector.client.costAnalysis.userDashboard.create(await makeDashboardCreateParam() as DashboardCreateParam);
                return res.user_dashboard_id;
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
            costExplorerStore.commit('dashboard/setDashboardPrivacy', DASHBOARD_PRIVACY_TYPE.USER);
        };

        return {
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
