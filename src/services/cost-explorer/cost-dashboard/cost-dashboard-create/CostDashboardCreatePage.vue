<template>
    <div class="cost-dashboard-create-page">
        <nav>
            <p-heading :title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.CREATE_DASHBOARD')"
                       show-back-button
                       @click-back-button="$router.go(-1)"
            />
        </nav>
        <cost-dashboard-create-form :manage-disabled="!hasManagePermission" />
        <div class="button-group">
            <p-button style-type="tertiary"
                      @click="$router.go(-1)"
            >
                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      :disabled="!Object.keys(selectedTemplate).length"
                      @click="handleClickCreate"
            >
                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.CREATE') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import { PButton, PHeading } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import CostDashboardCreateForm
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateForm.vue';
import { fetchDefaultLayoutData } from '@/services/cost-explorer/cost-dashboard/lib/helper';
import type {
    CustomLayout,
    DashboardCreateParam,
    DashboardPrivacyType, PeriodType,
} from '@/services/cost-explorer/cost-dashboard/type';
import {
    DASHBOARD_PRIVACY_TYPE,
    PERIOD_TYPE,
} from '@/services/cost-explorer/cost-dashboard/type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';
import type { CostFiltersMap, Period } from '@/services/cost-explorer/type';


export default {
    name: 'CostDashboardCreatePage',
    components: {
        CostDashboardCreateForm,
        PHeading,
        PButton,
    },

    setup() {
        const costDashboardPageStore = useCostDashboardPageStore();
        const costDashboardPageState = costDashboardPageStore.state;

        const state = reactive({
            selectedTemplate: computed(() => costDashboardPageState.selectedTemplate),
            defaultFilter: computed<CostFiltersMap>(() => costDashboardPageState.defaultFilter),
            includesFilter: computed<boolean>(() => costDashboardPageState.includesFilter),
            selectedPrivacy: computed<DashboardPrivacyType>(() => costDashboardPageState.selectedDashboardPrivacy),
            hasManagePermission: useManagePermissionState(),
        });

        const getCustomLayouts = async () => {
            const hasDefaultId = Object.prototype.hasOwnProperty.call(state.selectedTemplate, 'default_layout_id');
            if (hasDefaultId && (!Array.isArray(state.selectedTemplate.custom_layouts) || state.selectedTemplate.custom_layouts.length === 0)) {
                return await fetchDefaultLayoutData(state.selectedTemplate.default_layout_id as string) as CustomLayout[];
            }
            return state.selectedTemplate?.custom_layouts as CustomLayout[];
        };

        const makeDashboardCreateParam = async (): Promise<DashboardCreateParam> => ({
            name: state.selectedTemplate?.name?.toString() ?? 'Untitled Dashboard',
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
            costDashboardPageState.selectedDashboardPrivacy = DASHBOARD_PRIVACY_TYPE.USER;
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
