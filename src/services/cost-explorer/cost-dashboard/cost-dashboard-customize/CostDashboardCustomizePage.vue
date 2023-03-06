<template>
    <div class="cost-dashboard-customize-page">
        <section class="header">
            <p-icon-button
                name="ic_arrow-left"
                @click="handleClickCancel"
            />
            <p-text-input v-model="dashboardTitle"
                          block
                          class="dashboard-title"
            />
            <div class="button-group">
                <p-button style-type="transparent"
                          @click="handleClickCancel"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.CANCEL') }}
                </p-button>
                <p-button style-type="highlight"
                          @click="handleClickSave"
                >
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
    computed, onBeforeUnmount, onMounted, reactive, toRefs,
} from 'vue';

import {
    PButton, PTextInput, PIconButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CostDashboardCustomizeSidebar
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeSidebar.vue';
import { getDashboardLayout } from '@/services/cost-explorer/cost-dashboard/lib/helper';
import DashboardLayouts from '@/services/cost-explorer/cost-dashboard/modules/DashboardLayouts.vue';
import type {
    CustomLayout,
    DashboardInfo,
    DefaultLayout, PublicDashboardInfo, WidgetInfo,
} from '@/services/cost-explorer/cost-dashboard/type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { costExplorerStore } from '@/services/cost-explorer/store';
import type { CostFiltersMap, Period } from '@/services/cost-explorer/type';

export default {
    name: 'CostDashboardCustomizePage',
    components: {
        CostDashboardCustomizeSidebar,
        DashboardLayouts,
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
        const state = reactive({
            loading: true,
            layout: [] as CustomLayout[],
            editingCustomLayout: computed<CustomLayout[]|undefined>({
                get() { return costExplorerStore.state.dashboard.editedCustomLayout; },
                set(val) {
                    costExplorerStore.commit('dashboard/setEditedCustomLayout', [...(val ?? [])]);
                },
            }),
            dashboardIdFromRoute: computed(() => props.dashboardId || SpaceRouter.router.currentRoute.params.dashboardId),
            dashboardData: {} as DashboardInfo,
            dashboardTitle: '',
            selectedWidget: computed<WidgetInfo|undefined>(() => costExplorerStore.state.dashboard.editedSelectedWidget),
            selectedTemplate: computed<Record<string, DefaultLayout> | PublicDashboardInfo>(() => costExplorerStore.state.dashboard.selectedTemplate),
            defaultFilter: computed<CostFiltersMap>(() => costExplorerStore.state.dashboard.defaultFilter),
            period: {} as Period,
            periodType: '',
            filters: {} as CostFiltersMap,
            widgetPosition: computed(() => costExplorerStore.state.dashboard.widgetPosition),
            layoutOfSpace: computed(() => costExplorerStore.state.dashboard.layoutOfSpace),
        });

        const goToMainDashboardPage = () => {
            SpaceRouter.router.replace({ name: COST_EXPLORER_ROUTE.DASHBOARD._NAME, params: { dashboardId: state.dashboardIdFromRoute } });
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
                SpaceRouter.router.replace({ name: COST_EXPLORER_ROUTE.DASHBOARD._NAME });
                return;
            }
            goToMainDashboardPage();
        };

        const handleAddWidget = () => {
            if (!state.editingCustomLayout) return;
            if (state.widgetPosition && state.layoutOfSpace) {
                if (state.layoutOfSpace === state.selectedWidget?.options.layout) {
                    state.editingCustomLayout[state.widgetPosition.row ?? ''].splice((state.widgetPosition.col ?? 0) + 1, 0, state.selectedWidget as WidgetInfo);
                } else {
                    state.editingCustomLayout[state.editingCustomLayout.length] = [state.selectedWidget as WidgetInfo];
                    costExplorerStore.commit('dashboard/setEditedCustomLayout', [...(state.editingCustomLayout ?? [])]);
                }
            } else if (state.editingCustomLayout.length === 0) {
                state.editingCustomLayout = [[state.selectedWidget as WidgetInfo]];
            } else {
                state.editingCustomLayout[state.editingCustomLayout.length] = [state.selectedWidget as WidgetInfo];
                costExplorerStore.commit('dashboard/setEditedCustomLayout', [...state.editingCustomLayout]);
            }
        };

        const handleDeleteWidget = () => {
            if (!state.widgetPosition) return;
            if (!state.editingCustomLayout) return;
            state.editingCustomLayout[state.widgetPosition.row ?? ''].splice(state.widgetPosition.col, 1);
            state.editingCustomLayout = state.editingCustomLayout.filter((row) => row.length > 0);
            costExplorerStore.commit('dashboard/setEditedCustomLayout', [...state.editingCustomLayout]);
            costExplorerStore.commit('dashboard/setWidgetPosition', undefined);
            costExplorerStore.commit('dashboard/setEditedSelectedWidget', {});
        };

        const handleUpdateWidget = () => {
            if (!state.widgetPosition) return;
            if (!state.editingCustomLayout) return;
            state.editingCustomLayout[state.widgetPosition.row ?? ''][state.widgetPosition.col ?? ''] = state.selectedWidget;
            costExplorerStore.commit('dashboard/setEditedCustomLayout', [...state.editingCustomLayout]);
            costExplorerStore.commit('dashboard/setWidgetPosition', undefined);
            costExplorerStore.commit('dashboard/setEditedSelectedWidget', {});
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

        /* custom design-system component - p-text-input */
        :deep(.p-text-input) {
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
