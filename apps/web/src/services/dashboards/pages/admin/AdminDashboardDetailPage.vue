<script setup lang="ts">
import {
    onUnmounted, ref, watch,
} from 'vue';

import {
    PDivider,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardDetailHeader from '@/services/dashboards/components/DashboardDetailHeader.vue';
import DashboardLabels from '@/services/dashboards/components/DashboardLabels.vue';
import DashboardRefreshDropdown from '@/services/dashboards/components/DashboardRefreshDropdown.vue';
import DashboardToolsetDateDropdown from '@/services/dashboards/components/DashboardToolsetDateDropdown.vue';
import DashboardVariables from '@/services/dashboards/components/DashboardVariables.vue';
import DashboardWidgetContainer from '@/services/dashboards/components/DashboardWidgetContainer.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const widgetContainerRef = ref<typeof DashboardWidgetContainer|null>(null);

const getDashboardData = async (dashboardId: string) => {
    try {
        await dashboardDetailStore.getDashboardInfo(dashboardId, true);
    } catch (e) {
        ErrorHandler.handleError(e);
        await SpaceRouter.router.push({ name: makeAdminRouteName(DASHBOARDS_ROUTE._NAME) });
    }
};

// else
const handleRefresh = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (widgetContainerRef.value) widgetContainerRef.value.refreshAllWidget();
};
const handleUpdateLabels = async (labels: string[]) => {
    try {
        await dashboardDetailStore.updateDashboard(props.dashboardId, {
            labels,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};


watch(() => props.dashboardId, async (dashboardId, prevDashboardId) => {
    /* NOTE: The dashboard data is reset in three cases.
        1. the dashboard is changed from project dashboard to domain dashboard
        2. vice versa
        3. first entering case
    * This is because in case of project dashboard, there are some different variables settings, so it is not safe to reuse dashboard store data with domain dashboard.
    * But in case of the same type of dashboard, the dashboard store must be reused to smoothly update the dashboard data without blinking.
     */
    if (dashboardId && !prevDashboardId) { // this includes all three cases
        dashboardDetailStore.reset();
    }
    await getDashboardData(dashboardId);
}, { immediate: true });

onUnmounted(() => {
    dashboardDetailStore.reset();
});
</script>

<template>
    <div class="dashboard-detail-page">
        <dashboard-detail-header :dashboard-id="props.dashboardId" />
        <div class="filter-box">
            <dashboard-labels @update-labels="handleUpdateLabels" />
            <dashboard-toolset-date-dropdown v-show="dashboardDetailState.settings.date_range.enabled"
                                             :date-range="dashboardDetailState.settings.date_range"
            />
        </div>
        <p-divider class="divider" />
        <div class="dashboard-selectors">
            <dashboard-variables class="variable-selector-wrapper"
                                 :dashboard-id="props.dashboardId"
                                 is-manageable
            />
            <dashboard-refresh-dropdown :dashboard-id="props.dashboardId"
                                        :loading="dashboardDetailState.loadingWidgets"
                                        @refresh="handleRefresh"
            />
        </div>
        <dashboard-widget-container ref="widgetContainerRef" />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-detail-page {
    .divider {
        @apply mb-6;
    }
    .filter-box {
        @apply flex justify-between items-start mb-4;
    }
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
</style>
