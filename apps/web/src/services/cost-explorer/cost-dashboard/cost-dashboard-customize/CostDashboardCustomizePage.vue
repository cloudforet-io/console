<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PTextInput, PIconButton,
} from '@spaceone/design-system';
import {
    computed, onBeforeUnmount, onMounted, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

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
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';
import type { CostFiltersMap, Period } from '@/services/cost-explorer/type';

interface Props {
    dashboardId: string;
}

const props = withDefaults(defineProps<Props>(), {
    dashboardId: '',
});
const router = useRouter();
const store = useStore();
const { t } = useI18n();

const costDashboardPageStore = useCostDashboardPageStore();
const costDashboardPageState = costDashboardPageStore.$state;

const state = reactive({
    loading: true,
    layout: [] as CustomLayout[],
    editingCustomLayout: computed<CustomLayout[]|undefined>({
        get() { return costDashboardPageState.editedCustomLayout; },
        set(val) {
            costDashboardPageStore.$patch((_state) => {
                _state.editedCustomLayout = [...(val ?? [])];
            });
        },
    }),
    dashboardIdFromRoute: computed(() => props.dashboardId || router.currentRoute.value.params.dashboardId as string),
    dashboardData: {} as DashboardInfo,
    dashboardTitle: '',
    selectedWidget: computed<WidgetInfo|undefined>(() => costDashboardPageState.editedSelectedWidget),
    selectedTemplate: computed<Record<string, DefaultLayout> | PublicDashboardInfo>(() => costDashboardPageState.selectedTemplate),
    defaultFilter: computed<CostFiltersMap>(() => costDashboardPageState.defaultFilter),
    period: {} as Period,
    periodType: '',
    filters: {} as CostFiltersMap,
    widgetPosition: computed(() => costDashboardPageState.widgetPosition),
    layoutOfSpace: computed(() => costDashboardPageState.layoutOfSpace),
});

const goToMainDashboardPage = () => {
    router.replace({ name: COST_EXPLORER_ROUTE.DASHBOARD._NAME, params: { dashboardId: state.dashboardIdFromRoute } });
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
    if (router.currentRoute.value.query.from === 'create') {
        rollbackDashboard();
        router.replace({ name: COST_EXPLORER_ROUTE.DASHBOARD._NAME });
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
            costDashboardPageStore.$patch((_state) => {
                _state.editedCustomLayout = [...(state.editingCustomLayout ?? [])];
            });
        }
    } else if (state.editingCustomLayout.length === 0) {
        state.editingCustomLayout = [[state.selectedWidget as WidgetInfo]];
    } else {
        state.editingCustomLayout[state.editingCustomLayout.length] = [state.selectedWidget as WidgetInfo];
        costDashboardPageStore.$patch((_state) => {
            _state.editedCustomLayout = [...(state.editingCustomLayout) ?? []];
        });
    }
};

const handleDeleteWidget = () => {
    if (!state.widgetPosition) return;
    if (!state.editingCustomLayout) return;
    state.editingCustomLayout[state.widgetPosition.row ?? ''].splice(state.widgetPosition.col, 1);
    state.editingCustomLayout = state.editingCustomLayout.filter((row) => row.length > 0);
    costDashboardPageStore.$patch((_state) => {
        _state.editedCustomLayout = [...(state.editingCustomLayout) ?? []];
        _state.widgetPosition = undefined;
        _state.editedSelectedWidget = undefined;
    });
};

const handleUpdateWidget = () => {
    if (!state.widgetPosition) return;
    if (!state.editingCustomLayout) return;
    state.editingCustomLayout[state.widgetPosition.row ?? ''][state.widgetPosition.col ?? ''] = state.selectedWidget;
    costDashboardPageStore.$patch((_state) => {
        _state.editedCustomLayout = [...(state.editingCustomLayout) ?? []];
        _state.widgetPosition = undefined;
        _state.editedSelectedWidget = undefined;
    });
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
        const layout = await getDashboardLayout(state.dashboardData);
        state.layout = layout;
        costDashboardPageStore.$patch((_state) => {
            _state.editedCustomLayout = layout;
        });
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
        if ((state.dashboardIdFromRoute as string).startsWith('user')) {
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

</script>

<template>
    <div class="cost-dashboard-customize-page">
        <section class="header">
            <p-icon-button
                name="ic_arrow-left"
                @click="handleClickCancel"
            />
            <p-text-input v-model:value="state.dashboardTitle"
                          block
                          class="dashboard-title"
            />
            <div class="button-group">
                <p-button style-type="transparent"
                          @click="handleClickCancel"
                >
                    {{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.CANCEL') }}
                </p-button>
                <p-button style-type="highlight"
                          @click="handleClickSave"
                >
                    {{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.SAVE') }}
                </p-button>
            </div>
        </section>
        <dashboard-layouts :loading="state.loading"
                           :layout="state.editingCustomLayout"
                           :period="period"
                           :filters="state.filters"
                           :customize-mode="true"
                           @add-widget="handleAddWidget"
                           @delete-widget="handleDeleteWidget"
                           @update-widget="handleUpdateWidget"
        />
        <cost-dashboard-customize-sidebar @add-widget="handleAddWidget" />
    </div>
</template>

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
