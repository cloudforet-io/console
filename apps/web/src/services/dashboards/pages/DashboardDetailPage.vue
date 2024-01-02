<script setup lang="ts">
import {
    onUnmounted, ref, watch,
} from 'vue';

import {
    PDivider,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardDetailHeader from '@/services/dashboards/components/DashboardDetailHeader.vue';
import DashboardLabels from '@/services/dashboards/components/DashboardLabels.vue';
import DashboardRefreshDropdown from '@/services/dashboards/components/DashboardRefreshDropdown.vue';
import DashboardToolset from '@/services/dashboards/components/DashboardToolset.vue';
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
        await SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.ALL._NAME });
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
    /* NOTE: The dashboard data is reset in first entering case */
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
            <dashboard-toolset />
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
