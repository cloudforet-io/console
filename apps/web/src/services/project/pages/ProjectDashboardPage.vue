<script lang="ts" setup>
import {
    computed,
    reactive, watch,
} from 'vue';

import { PSelectDropdown } from '@cloudforet/mirinae';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardLabels from '@/services/dashboards/components/DashboardLabels.vue';
import DashboardRefreshDropdown from '@/services/dashboards/components/DashboardRefreshDropdown.vue';
import DashboardToolsetDateDropdown from '@/services/dashboards/components/DashboardToolsetDateDropdown.vue';
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

const storeState = reactive({
    dashboardList: computed(() => dashboardStore.state.publicDashboardItems.filter((dashboard) => dashboard.version !== '1.0')), // TODO: remove filter
});

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
const handleSelectDashboard = (dashboardName: string) => {
    const selectedDashbaord = storeState.dashboardList.find((dashboard) => dashboard.name === dashboardName);
    if (selectedDashbaord) {
        state.currentDashboardId = selectedDashbaord.dashboard_id;
    }
};

/* api */

const listProjectDashboard = async () => {
    await dashboardStore.load();
};
const setDefaultDashboard = () => {
    if (storeState.dashboardList.length === 0) return;
    const defaultDashboard = storeState.dashboardList[0];
    if (defaultDashboard) {
        state.currentDashboardId = defaultDashboard.dashboard_id;
    }
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
    setDefaultDashboard();
})();

watch(() => state.currentDashboardId, async (dashboardId, prevDashboardId) => {
    if (!dashboardId) return;
    /* NOTE: The dashboard data is reset in first entering case */
    if (dashboardId && !prevDashboardId) { // this includes all three cases
        dashboardDetailStore.reset();
    }
    dashboardDetailStore.setVars({ project_id: [props.id] }); // TODO: Check Project Dashboard default "vars"
    await getDashboardData(dashboardId);
}, { immediate: true });

</script>

<template>
    <div class="project-dashboard-page">
        <div v-if="storeState.dashboardList.length && state.currentDashboardId"
             class="dashboard-wrapper"
        >
            <div class="title-wrapper">
                <div class="title">
                    <p-select-dropdown style-type="tertiary-icon-button"
                                       button-icon="ic_dots-4-square"
                                       :menu="storeState.dashboardList"
                                       :selected="dashboardDetailState.name"
                                       @select="handleSelectDashboard"
                    >
                        <template #menu-item--format="{ item }">
                            <span class="dashboard-menu-item">{{ item.name }}</span>
                        </template>
                    </p-select-dropdown>
                    <span>{{ dashboardDetailState.name }}</span>
                </div>
                <dashboard-toolset-date-dropdown :date-range="dashboardDetailState.options.date_range" />
            </div>
            <dashboard-labels v-if="!!dashboardDetailState.labels.length"
                              class="labels"
            />
            <div class="contents-wrapper">
                <div class="dashboard-selectors">
                    <dashboard-variables-v2 class="variable-selector-wrapper"
                                            is-project-dashboard
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
        .title-wrapper {
            @apply flex justify-between items-center;
            padding-bottom: 1rem;
            .title {
                @apply inline-flex items-center text-display-md font-medium;
                gap: 0.5rem;
            }
        }
        .labels {
            padding-bottom: 1rem;
        }

        .contents-wrapper {
            @apply bg-gray-100;
            padding: 0 0.5rem;
            .dashboard-selectors {
                @apply relative flex justify-between items-start z-10;
                padding: 1rem 0;

                .variable-selector-wrapper {
                    @apply relative flex items-center flex-wrap;
                    gap: 0.5rem;
                    padding-right: 1rem;
                }
            }
        }
    }
}
</style>
