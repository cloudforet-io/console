<template>
    <div class="cost-dashboard-customize-page">
        <nav>
            <p-breadcrumbs :routes="routeState.route" />
        </nav>
        <section class="header">
            <p-icon-button
                name="ic_back"
                @click="$router.go(-1)"
            />
            <p-text-input v-model="dashboardTitle" block class="dashboard-title" />
            <div class="button-group">
                <p-button style-type="transparent" :outline="true" @click="handleClickCancel">
                    {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.CANCEL') }}
                </p-button>
                <p-button style-type="secondary" @click="handleClickSave">
                    {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.SAVE') }}
                </p-button>
            </div>
        </section>
        <dashboard-layouts :loading="loading"
                           :layout="editingCustomLayout"
                           :period="period"
                           :filters="filters"
                           :customize-mode="true"
                           @add-widget="handleAddWidget"
                           @delete-widget="handleDeleteWidget"
                           @update-widget="handleUpdateWidget"
        />
        <cost-dashboard-customize-sidebar @add-widget="handleAddWidget" />
    </div>
</template>

<script lang="ts">
import {
    PBreadcrumbs, PButton, PTextInput, PIconButton,
} from '@spaceone/design-system';
import {
    computed, onBeforeUnmount, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import { i18n } from '@/translations';
import { registerServiceStore } from '@/common/composables/register-service-store';
import CostDashboardStoreModule
    from '@/services/billing/cost-management/cost-dashboard/store';
import { CostDashboardState } from '@/services/billing/cost-management/cost-dashboard/store/type';
import {
    CustomLayout,
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
import DashboardLayouts from '@/services/billing/cost-management/cost-dashboard/modules/DashboardLayouts.vue';
import { getDashboardLayout } from '@/services/billing/cost-management/cost-dashboard/lib/helper';
import { CostQueryFilters, Period } from '@/services/billing/cost-management/type';


export default {
    name: 'CostDashboardCustomizePage',
    components: {
        CostDashboardCustomizeSidebar,
        DashboardLayouts,
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
        registerServiceStore<CostDashboardState>('costDashboard', CostDashboardStoreModule);
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), path: '/billing' },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), path: '/billing/cost-management' },
                { name: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.CUSTOMIZE_TITLE') },
            ]),
        });

        const state = reactive({
            loading: true,
            layout: [] as CustomLayout[],
            editingCustomLayout: computed<CustomLayout[]>({
                get() { return store.state.service.costDashboard.editedCustomLayout; },
                set(val) {
                    store.commit('service/costDashboard/setEditedCustomLayout', [...val]);
                },
            }),
            dashboardIdFromRoute: computed(() => props.dashboardId || SpaceRouter.router.currentRoute.params.dashboardId),
            dashboardData: {} as DashboardInfo,
            dashboardTitle: '',
            selectedWidget: computed(() => store.state.service.costDashboard?.editedSelectedWidget),
            selectedTemplate: computed<Record<string, DefaultLayout> | PublicDashboardInfo>(() => store.state.service?.costDashboard?.selectedTemplate),
            defaultFilter: computed<Record<string, string[]>>(() => store.state.service?.costDashboard?.defaultFilter),
            period: {} as Period,
            periodType: '',
            filters: {} as CostQueryFilters,
            widgetPosition: computed(() => store.state.service.costDashboard?.widgetPosition),
            layoutOfSpace: computed(() => store.state.service.costDashboard?.layoutOfSpace),
        });

        const goToMainDashboardPage = () => {
            SpaceRouter.router.replace({ name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME, params: { dashboardId: state.dashboardIdFromRoute } });
        };

        const rollbackDashboard = async () => {
            try {
                if (state.dashboardIdFromRoute?.startsWith('user')) {
                    await SpaceConnector.client.costAnalysis.userDashboard.delete({
                        user_dashboard_id: state.dashboardIdFromRoute,
                    });
                } else {
                    await SpaceConnector.client.costAnalysis.publicDashboard.delete({
                        public_dashboard_id: state.dashboardIdFromRoute,
                    });
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        const handleClickCancel = () => {
            if (SpaceRouter.router.currentRoute.query.from === 'create') {
                rollbackDashboard();
                SpaceRouter.router.replace({ name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME });
                return;
            }
            goToMainDashboardPage();
        };

        const handleAddWidget = () => {
            if (state.widgetPosition && state.layoutOfSpace) {
                if (state.layoutOfSpace === state.selectedWidget.options.layout) {
                    state.editingCustomLayout[state.widgetPosition.row].splice(state.widgetPosition.col + 1, 0, state.selectedWidget);
                } else {
                    state.editingCustomLayout[state.editingCustomLayout.length] = [state.selectedWidget];
                    store.commit('service/costDashboard/setEditedCustomLayout', [...state.editingCustomLayout]);
                }
            } else if (state.editingCustomLayout?.length === 0) {
                state.editingCustomLayout = [[state.selectedWidget]];
            } else {
                state.editingCustomLayout[state.editingCustomLayout.length] = [state.selectedWidget];
                store.commit('service/costDashboard/setEditedCustomLayout', [...state.editingCustomLayout]);
            }
        };

        const handleDeleteWidget = () => {
            if (!state.widgetPosition) return;
            state.editingCustomLayout[state.widgetPosition.row].splice(state.widgetPosition.col, 1);
            state.editingCustomLayout = state.editingCustomLayout.filter(row => row.length > 0);
            store.commit('service/costDashboard/setEditedCustomLayout', [...state.editingCustomLayout]);
            store.commit('service/costDashboard/setWidgetPosition', undefined);
            store.commit('service/costDashboard/setEditedSelectedWidget', {});
        };

        const handleUpdateWidget = () => {
            if (!state.widgetPosition) return;
            state.editingCustomLayout[state.widgetPosition.row][state.widgetPosition.col] = state.selectedWidget;
            store.commit('service/costDashboard/setEditedCustomLayout', [...state.editingCustomLayout]);
            store.commit('service/costDashboard/setWidgetPosition', undefined);
            store.commit('service/costDashboard/setEditedSelectedWidget', {});
        };

        const getDashboardData = async () => {
            try {
                state.loading = true;
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
                state.layout = await getDashboardLayout(state.dashboardData);
                state.filters = state.dashboardData.default_filter ?? {};
                state.period = state.dashboardData.period ?? {};
                state.periodType = state.dashboardData.period_type ?? 'AUTO';
                state.loading = false;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dashboardData = {} as DashboardInfo;
            }
        };

        const saveDashboardWithUpdatedData = async () => {
            try {
                if (state.dashboardIdFromRoute.startsWith('user')) {
                    await SpaceConnector.client.costAnalysis.userDashboard.update({
                        user_dashboard_id: state.dashboardIdFromRoute,
                        name: state.dashboardTitle,
                        custom_layouts: state.editingCustomLayout,
                    });
                } else {
                    await SpaceConnector.client.costAnalysis.publicDashboard.update({
                        public_dashboard_id: state.dashboardIdFromRoute,
                        name: state.dashboardTitle,
                        custom_layouts: state.editingCustomLayout,
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

        (() => {
            getDashboardData();
            store.dispatch('display/showWidget');
        })();

        // for preventing refresh
        const handleUnload = (event) => {
            event.preventDefault(); event.returnValue = '';
        };

        onMounted(() => {
            window.addEventListener('beforeunload', handleUnload);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('beforeunload', handleUnload);
        });

        return {
            routeState,
            ...toRefs(state),
            handleClickCancel,
            handleClickSave,
            handleAddWidget,
            handleDeleteWidget,
            handleUpdateWidget,
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
                font-size: 1.5rem;
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
