<script setup lang="ts">
import {
    computed,
    onUnmounted, reactive, ref, watch,
} from 'vue';

import { useMutation } from '@tanstack/vue-query';

import {
    PDivider, PI,
} from '@cloudforet/mirinae';

import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { SpaceRouter } from '@/router';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import DashboardDetailHeader from '@/services/dashboards/components/dashboard-detail/DashboardDetailHeader.vue';
import DashboardRefreshDropdown from '@/services/dashboards/components/dashboard-detail/DashboardRefreshDropdown.vue';
import DashboardToolsetDateDropdown from '@/services/dashboards/components/dashboard-detail/DashboardToolsetDateDropdown.vue';
import DashboardToolsetScope from '@/services/dashboards/components/dashboard-detail/DashboardToolsetScope.vue';
import DashboardVariablesV2 from '@/services/dashboards/components/dashboard-detail/DashboardVariablesV2.vue';
import DashboardWidgetContainerV2 from '@/services/dashboards/components/dashboard-detail/DashboardWidgetContainerV2.vue';
import DashboardVariables from '@/services/dashboards/components/legacy/DashboardVariables.vue';
import DashboardWidgetContainer from '@/services/dashboards/components/legacy/DashboardWidgetContainer.vue';
import { useDashboardDetailQuery } from '@/services/dashboards/composables/use-dashboard-detail-query';
import { useDashboardManageable } from '@/services/dashboards/composables/use-dashboard-manageable';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';

interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const gnbStore = useGnbStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const widgetGenerateStore = useWidgetGenerateStore();
const { breadcrumbs } = useBreadcrumbs();

const { getProperRouteLocation } = useProperRouteLocation();
const appContextStore = useAppContextStore();
const widgetContainerRef = ref<typeof DashboardWidgetContainer|null>(null);

/* Query */
const {
    dashboard,
    widgetList,
    isError,
    isLoading,
    keys,
    fetcher,
    queryClient,
} = useDashboardDetailQuery({
    dashboardId: computed(() => props.dashboardId),
});
const { isManageable } = useDashboardManageable({
    dashboardId: computed(() => props.dashboardId),
});

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.DASHBOARD,
        id: props.dashboardId,
    })),
    isDeprecatedDashboard: computed(() => dashboard.value?.version === '1.0'),
});

/* Event */
const handleRefresh = async () => {
    if (dashboard.value?.version !== '1.0') {
        const isPrivate = props.dashboardId.startsWith('private');
        const widgetListQueryKey = isPrivate ? keys.privateWidgetListQueryKey : keys.publicWidgetListQueryKey;
        await queryClient.invalidateQueries({ queryKey: widgetListQueryKey.value });
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (widgetContainerRef.value) widgetContainerRef.value.refreshAllWidget();
};
const handleUpdateDashboardVariables = (params) => {
    updateDashboard({
        dashboard_id: props.dashboardId,
        ...params,
    });
};


const { mutate: updateDashboard, isPending: dashboardUpdateLoading } = useMutation(
    {
        mutationFn: fetcher.updateDashboardFn,
        onSuccess: (_dashboard: PublicDashboardModel|PrivateDashboardModel) => {
            const isPrivate = _dashboard.dashboard_id.startsWith('private');
            const dashboardQueryKey = isPrivate ? keys.privateDashboardGetQueryKey : keys.publicDashboardGetQueryKey;
            queryClient.setQueryData(dashboardQueryKey.value, (oldDashboard) => {
                if (!oldDashboard) return _dashboard;
                return {
                    ...oldDashboard,
                    vars: { ..._dashboard.vars },
                };
            });
        },
        onError: (e) => {
            ErrorHandler.handleError(e);
        },
    },
);


watch(() => props.dashboardId, async (dashboardId) => {
    // Set Dashboard Detail Custom breadcrumbs
    if (dashboardId) { // this includes all three cases
        gnbStore.setBreadcrumbs(breadcrumbs.value);
    }
}, { immediate: true });

watch(dashboard, (_dashboard) => {
    if (_dashboard) {
        dashboardDetailStore.reset();
        if (state.isDeprecatedDashboard) {
            dashboardDetailStore.setDashboardInfoStoreState(_dashboard);
        } else {
            dashboardDetailStore.setDashboardInfoStoreStateV2(_dashboard);
        }
    }
}, { immediate: true });
watch(widgetList, (_widgetList) => {
    if (_widgetList.length) {
        dashboardDetailStore.setDashboardWidgets(_widgetList);
    }
});
watch(isError, (error) => {
    if (error) {
        ErrorHandler.handleError(error);
        SpaceRouter.router.push(getProperRouteLocation({ name: DASHBOARDS_ROUTE._NAME }));
    }
});

watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });

onUnmounted(() => {
    gnbStore.setBreadcrumbs([]);
    // Reset Dashboard Detail Custom breadcrumbs
    dashboardDetailStore.reset();
    widgetGenerateStore.reset();
});
</script>

<template>
    <div class="dashboard-detail-page">
        <portal-target name="dashboard-detail-page" />
        <div v-if="state.isDeprecatedDashboard"
             class="deprecated-banner"
        >
            <p-i name="ic_limit-filled"
                 width="1.25rem"
                 height="1.25rem"
                 color="inherit"
            />
            <div class="banner-content-wrapper">
                <p class="title">
                    {{ $t('DASHBOARDS.ALL_DASHBOARDS.DEPRECATED') }}
                </p>
                <p class="description">
                    {{ $t('DASHBOARDS.ALL_DASHBOARDS.DEPRECATED_DESCRIPTION') }}
                </p>
            </div>
        </div>
        <dashboard-detail-header :dashboard-id="props.dashboardId" />
        <p-divider class="divider" />
        <div class="fixed-header">
            <div class="filter-box">
                <div class="left-part">
                    <dashboard-toolset-date-dropdown :date-range="dashboardDetailState.options.date_range" />
                    <dashboard-toolset-scope v-if="state.isAdminMode" />
                </div>
                <div class="right-part">
                    <dashboard-refresh-dropdown :dashboard-id="props.dashboardId"
                                                :loading="isLoading || dashboardUpdateLoading"
                                                @refresh="handleRefresh"
                    />
                </div>
            </div>
            <div v-if="!dashboardUpdateLoading"
                 class="dashboard-selectors"
            >
                <dashboard-variables v-if="state.isDeprecatedDashboard"
                                     class="variable-selector-wrapper"
                                     :loading="dashboardUpdateLoading"
                                     @update="handleUpdateDashboardVariables"
                />
                <dashboard-variables-v2 v-else
                                        class="variable-selector-wrapper"
                                        :disable-save-button="!isManageable"
                                        :loading="dashboardUpdateLoading"
                                        @update="handleUpdateDashboardVariables"
                />
            </div>
        </div>
        <div />

        <div class="widget-container-body">
            <dashboard-widget-container v-if="state.isDeprecatedDashboard"
                                        ref="widgetContainerRef"
            />
            <dashboard-widget-container-v2 v-else
                                           ref="widgetContainerRef"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-detail-page {
    @apply relative;

    .deprecated-banner {
        @apply bg-red-100 text-red-500;
        top: 0;
        width: 105%;
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 1.125rem 1.5rem;
        margin: -1.5rem 0 1.5rem -1.5rem;
        .banner-content-wrapper {
            .title {
                @apply text-label-lg text-red-500 font-bold;
                padding-bottom: 0.25rem;
            }
            .description {
                @apply text-paragraph-md text-gray-900;
            }
        }
    }
    .divider {
        @apply mb-4;
    }
    .fixed-header {
        @apply sticky bg-gray-100;
        z-index: 20;
        top: 0;
        padding-top: 1rem;

        .filter-box {
            @apply flex justify-between items-start mb-4;
            flex-wrap: wrap;
            row-gap: 0.25rem;

            .left-part {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                column-gap: 1rem;
            }

            .right-part {
                display: flex;
                flex-wrap: wrap;
                flex-shrink: 0;
            }
        }

        .dashboard-selectors {
            padding-bottom: 0.75rem;

            .variable-selector-wrapper {
                @apply relative flex items-center flex-wrap;
                gap: 0.5rem;
                padding-right: 1rem;
            }
        }
    }
    .widget-container-body {
        padding-top: 0.75rem;
    }
}
</style>
