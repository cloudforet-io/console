<template>
    <div class="cost-dashboard-customize-page">
        <nav>
            <p-breadcrumbs :routes="routeState.route" />
        </nav>
        <h2 class="header">
            <p-icon-button
                name="ic_back"
                @click="$router.go(-1)"
            />
            <p-text-input v-model="dashboardTitle" block class="dashboard-title" />
            <div class="button-group">
                <p-button style-type="transparent" :outline="true" @click="handleClickCancel">
                    Cancel
                </p-button>
                <p-button style-type="secondary" @click="handleClickSave">
                    Save
                </p-button>
            </div>
        </h2>
        <cost-dashboard-customize-sidebar />
    </div>
</template>

<script lang="ts">
import {
    PBreadcrumbs, PButton, PTextInput, PIconButton,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { i18n } from '@/translations';
import { registerServiceStore } from '@/common/composables/register-service-store';
import CostDashboardCreateStoreModule
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/store';
import CostDashboardCustomizeStoreModule
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/store';
import { CostDashboardCreateState } from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/store/type';
import { CostDashboardCustomizeState } from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/store/type';
import {
    DashboardInfo,
    DefaultLayout, PublicDashboardInfo,
} from '@/services/billing/cost-management/cost-dashboard/type';
import { store } from '@/store';
import CostDashboardCustomizeSidebar
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeSidebar.vue';
import { SpaceRouter } from '@/router';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { BILLING_ROUTE } from '@/services/billing/routes';


export default {
    name: 'CostDashboardCustomizePage',
    components: {
        CostDashboardCustomizeSidebar,
        PBreadcrumbs,
        PButton,
        PIconButton,
        PTextInput,
    },
    props: {
        dashboardId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        registerServiceStore<CostDashboardCreateState>('costDashboardCreate', CostDashboardCreateStoreModule);
        registerServiceStore<CostDashboardCustomizeState>('costDashboardCustomize', CostDashboardCustomizeStoreModule);
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), path: '/billing' },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), path: '/billing/cost-management' },
                { name: 'Create New Dashboard' },
            ]),
        });

        const state = reactive({
            dashboardIdFromRoute: computed(() => props.dashboardId || SpaceRouter.router.currentRoute.params.dashboardId),
            dashboardData: {} as DashboardInfo,
            dashboardTitle: '',
            selectedTemplate: computed<Record<string, DefaultLayout> | PublicDashboardInfo>(() => store.state.service?.costDashboardCreate?.selectedTemplate),
            defaultFilter: computed<Record<string, string[]>>(() => store.state.service?.costDashboardCreate?.defaultFilter),
        });

        const goToMainDashboardPage = () => {
            SpaceRouter.router.replace({ name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME, params: { dashboardId: state.dashboardIdFromRoute } });
        };

        const handleClickCancel = () => {
            goToMainDashboardPage();
        };

        const saveDashboardWithUpdatedData = async () => {
            try {
                if (state.dashboardIdFromRoute.startsWith('user')) {
                    await SpaceConnector.client.costAnalysis.userDashboard.update({
                        user_dashboard_id: state.dashboardIdFromRoute,
                        name: state.dashboardTitle,
                    });
                } else {
                    await SpaceConnector.client.costAnalysis.publicDashboard.update({
                        public_dashboard_id: state.dashboardIdFromRoute,
                        name: state.dashboardTitle,
                    });
                }
                goToMainDashboardPage();
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        const handleClickSave = () => {
            saveDashboardWithUpdatedData();
        };

        const getDashboardData = async () => {
            try {
                if (state.dashboardIdFromRoute.startsWith('user')) {
                    state.dashboardData = await SpaceConnector.client.costAnalysis.userDashboard.get({
                        user_dashboard_id: state.dashboardIdFromRoute,
                    });
                } else {
                    state.dashboardData = await SpaceConnector.client.costAnalysis.publicDashboard.get({
                        public_dashboard_id: state.dashboardIdFromRoute,
                    });
                }
                state.dashboardTitle = state.dashboardData?.name || '';
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dashboardData = {} as DashboardInfo;
            }
        };

        (() => {
            getDashboardData();
            store.dispatch('display/showInfo');
        })();

        return {
            routeState,
            ...toRefs(state),
            handleClickCancel,
            handleClickSave,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-customize-page {
    .header {
        @apply flex items-center;
    }
    .dashboard-title {
        margin-left: 1rem;
        &.p-text-input::v-deep {
            .input-container {
                @apply font-bold;
                height: 3.125rem;
                font-size: 1.875rem;
            }
        }
    }
    .button-group {
        @apply justify-between;
        display: inherit;
        margin-left: 2.5rem;
        gap: 1rem;
    }
}
</style>
