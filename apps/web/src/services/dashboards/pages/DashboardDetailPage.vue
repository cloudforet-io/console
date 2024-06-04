<script setup lang="ts">
import {
    computed,
    onUnmounted, reactive, ref, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PDivider,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import DashboardDetailHeader from '@/services/dashboards/components/DashboardDetailHeader.vue';
import DashboardLabels from '@/services/dashboards/components/DashboardLabels.vue';
import DashboardRefreshDropdown from '@/services/dashboards/components/DashboardRefreshDropdown.vue';
import DashboardToolsetDateDropdown from '@/services/dashboards/components/DashboardToolsetDateDropdown.vue';
import DashboardVariables from '@/services/dashboards/components/DashboardVariables.vue';
import DashboardWidgetContainer from '@/services/dashboards/components/DashboardWidgetContainer.vue';
import { DASHBOARD_SCOPE } from '@/services/dashboards/constants/dashboard-constant';
import { DASHBOARD_TEMPLATES } from '@/services/dashboards/dashboard-template/template-list';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const gnbStore = useGnbStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardDetailState = dashboardDetailStore.state;
const { breadcrumbs } = useBreadcrumbs();
const router = useRouter();
const route = useRoute();

const { getProperRouteLocation } = useProperRouteLocation();
const appContextStore = useAppContextStore();
const widgetContainerRef = ref<typeof DashboardWidgetContainer|null>(null);

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    templateName: computed(() => DASHBOARD_TEMPLATES[dashboardDetailState.templateId]?.name),
    dashboardScope: computed(() => dashboardDetailState.dashboardScope),
    dashboardMiddleRouteLabel: computed(() => {
        if (state.dashboardScope === DASHBOARD_SCOPE.WORKSPACE) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.WORKSPACE');
        if (state.dashboardScope === DASHBOARD_SCOPE.PROJECT) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.SINGLE_PROJECT');
        if (state.dashboardScope === DASHBOARD_SCOPE.PRIVATE) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE');
        return '';
    }),
    dashboardCustomBreadcrumbs: computed(() => {
        const _breadcrumbs = breadcrumbs.value;
        const customMiddleRoute = router.match({
            name: DASHBOARDS_ROUTE._NAME,
            params: { workspaceId: route.params.workspaceId },
            query: { scope: state.dashboardScope },
        });
        if (state.isAdminMode) return _breadcrumbs;
        const dashboardMiddleRoute = {
            name: state.dashboardMiddleRouteLabel,
            to: { path: customMiddleRoute.fullPath },
        };
        return [_breadcrumbs[0], dashboardMiddleRoute, _breadcrumbs[1]];
    }),
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
        await SpaceRouter.router.push(getProperRouteLocation({ name: DASHBOARDS_ROUTE._NAME }));
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
    // Set Dashboard Detail Custom breadcrumbs
    gnbStore.setBreadcrumbs(state.dashboardCustomBreadcrumbs);
}, { immediate: true });

watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });

onUnmounted(() => {
    gnbStore.setBreadcrumbs([]);
    // Reset Dashboard Detail Custom breadcrumbs
    dashboardDetailStore.reset();
});
</script>

<template>
    <div class="dashboard-detail-page">
        <dashboard-detail-header :dashboard-id="props.dashboardId"
                                 :template-name="state.templateName"
        />
        <div class="filter-box">
            <dashboard-labels :editable="!dashboardDetailGetters.isDeprecatedDashboard"
                              @update-labels="handleUpdateLabels"
            />
            <dashboard-toolset-date-dropdown v-show="dashboardDetailState.options.date_range.enabled"
                                             :date-range="dashboardDetailState.options.date_range"
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
