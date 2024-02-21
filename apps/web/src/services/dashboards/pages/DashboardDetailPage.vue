<script setup lang="ts">
import {
    computed,
    onUnmounted, reactive, ref, watch,
} from 'vue';

import {
    PDivider,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import type { FavoriteOptions } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useTopBarHeaderStore } from '@/common/modules/navigations/top-bar/modules/top-bar-header/store';

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

const topBarHeaderStore = useTopBarHeaderStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const widgetContainerRef = ref<typeof DashboardWidgetContainer|null>(null);

const state = reactive({
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.DASHBOARD,
        id: props.dashboardId,
    })),
});

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
watch(() => state.favoriteOptions, (favoriteOptions) => {
    topBarHeaderStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });

onUnmounted(() => {
    dashboardDetailStore.reset();
});
</script>

<template>
    <div class="dashboard-detail-page">
        <dashboard-detail-header :dashboard-id="props.dashboardId" />
        <div class="filter-box">
            <dashboard-labels editable
                              @update-labels="handleUpdateLabels"
            />
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
