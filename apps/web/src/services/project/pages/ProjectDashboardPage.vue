<script lang="ts" setup>
import {
    reactive, watch,
} from 'vue';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardRefreshDropdown from '@/services/dashboards/components/DashboardRefreshDropdown.vue';
import DashboardVariablesV2 from '@/services/dashboards/components/DashboardVariablesV2.vue';
import DashboardWidgetContainerV2 from '@/services/dashboards/components/DashboardWidgetContainerV2.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    id: string;
}
const props = defineProps<Props>();

const dashboardStore = useDashboardStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardDetailState = dashboardDetailStore.state;


const state = reactive({
    hasAlertConfig: false,
    dashboardVariablesLoading: false,
    currentDashboardId: undefined as string|undefined,
});


const handleUpdateDashboardVariables = async (params) => {
    if (!state.currentDashboardId) return;
    state.dashboardVariablesLoading = true;
    try {
        const updatedDashboard = await dashboardStore.updateDashboard(state.currentDashboardId, params);
        dashboardDetailStore.setDashboardInfo(updatedDashboard);
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.dashboardVariablesLoading = false;
    }
};
const handleRefresh = async () => {
    await dashboardDetailStore.listDashboardWidgets();
};

/* api */

const listProjectDashboard = async () => {
    await dashboardStore.load(props.id);
};
const getDashboardData = async (dashboardId: string) => {
    try {
        await dashboardDetailStore.getDashboardInfo(dashboardId);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

(async () => {
    await listProjectDashboard();
})();

watch(() => state.currentDashboardId, async (dashboardId, prevDashboardId) => {
    if (!dashboardId) return;
    /* NOTE: The dashboard data is reset in first entering case */
    if (dashboardId && !prevDashboardId) { // this includes all three cases
        dashboardDetailStore.reset();
    }
    await getDashboardData(dashboardId);
}, { immediate: true });

</script>

<template>
    <div class="project-dashboard-page">
        <div v-if="state.currentDashboardId"
             class="dashboard-wrapper"
        >
            <div class="dashboard-selectors">
                <dashboard-variables-v2 class="variable-selector-wrapper"
                                        :disable-save-button="dashboardDetailGetters.disableManageButtons"
                                        :loading="state.dashboardVariablesLoading"
                                        @update="handleUpdateDashboardVariables"
                />
                <dashboard-refresh-dropdown :dashboard-id="state.currentDashboardId"
                                            :loading="dashboardDetailState.loadingWidgets"
                                            @refresh="handleRefresh"
                />
            </div>
            <dashboard-widget-container-v2 ref="widgetContainerRef" />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
/* custom widget-layout */
:deep(.widget-layout) {
    .title {
        font-size: 1rem;
        font-weight: bold;
        line-height: 1.6;
    }
}

.project-dashboard-page {
    padding: 2rem 1rem 0;

    .dashboard-wrapper {
        .dashboard-selectors {
            @apply relative flex justify-between items-start z-10;
            padding-bottom: 1.25rem;

            .variable-selector-wrapper {
                @apply relative flex items-center flex-wrap;
                gap: 0.5rem;
                padding-right: 1rem;
            }
        }
    }
}
</style>
