<script lang="ts" setup>
import {
    computed, ref, watch, onUnmounted,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import { useDashboardRouteContext } from '@/services/dashboard-shared/composables/use-dashboard-route-context';
import DashboardToolsetScope from '@/services/dashboards/components/dashboard-detail/DashboardToolsetScope.vue';
import DashboardVariables from '@/services/dashboards/components/legacy/DashboardVariables.vue';
import DashboardWidgetContainer from '@/services/dashboards/components/legacy/DashboardWidgetContainer.vue';
import { useDashboardManageable } from '@/services/dashboards/composables/use-dashboard-manageable';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import DashboardRefreshDropdown from '@/services/dashboards/shared/components/DashboardRefreshDropdown.vue';
import DashboardToolsetDateDropdown from '@/services/dashboards/shared/components/DashboardToolsetDateDropdown.vue';
import DashboardVariablesV2 from '@/services/dashboards/shared/components/DashboardVariablesV2.vue';
import DashboardWidgetContainerV2 from '@/services/dashboards/shared/components/DashboardWidgetContainerV2.vue';
import { useDashboardGetQuery } from '@/services/dashboards/shared/composables/use-dashboard-get-query';
import { useDashboardWidgetListQuery } from '@/services/dashboards/shared/composables/use-dashboard-widget-list-query';
import { useDashboardDetailInfoStore } from '@/services/dashboards/shared/stores/dashboard-detail-info-store';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

interface Props {
    dashboardId: string;
}

const props = defineProps<Props>();
const router = useRouter();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const widgetGenerateStore = useWidgetGenerateStore();
const widgetContainerRef = ref<typeof DashboardWidgetContainer|typeof DashboardWidgetContainerV2|null>(null);

const { isManageable } = useDashboardManageable({
    dashboardId: computed(() => props.dashboardId),
});
const {
    entryPoint, projectGroupOrProjectId,
} = useDashboardRouteContext();

/* Query */
const queryClient = useQueryClient();
const {
    dashboard,
    isError: dashboardError,
    isLoading: dashboardLoading,
    keys: dashboardKeys,
    fetcher: dashboardFetcher,
} = useDashboardGetQuery({
    dashboardId: computed(() => props.dashboardId),
});
const {
    widgetList,
    isLoading: widgetLoading,
    isError: widgetError,
    keys: widgetListKeys,
} = useDashboardWidgetListQuery({
    dashboardId: computed(() => props.dashboardId),
});

const isDeprecatedDashboard = computed(() => dashboard.value?.version === '1.0');


const handleRefresh = async () => {
    if (dashboard.value?.version !== '1.0') {
        const isPrivate = props.dashboardId.startsWith('private');
        const widgetListQueryKey = isPrivate ? widgetListKeys.privateWidgetListQueryKey : widgetListKeys.publicWidgetListQueryKey;
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
        mutationFn: dashboardFetcher.updateDashboardFn,
        onSuccess: (_dashboard: PublicDashboardModel | PrivateDashboardModel) => {
            const isPrivate = _dashboard.dashboard_id.startsWith('private');
            const dashboardQueryKey = isPrivate ? dashboardKeys.privateDashboardGetQueryKey : dashboardKeys.publicDashboardGetQueryKey;
            queryClient.setQueryData(dashboardQueryKey.value, (oldDashboard) => {
                if (!oldDashboard) return _dashboard;
                return {
                    ...oldDashboard,
                    vars: { ..._dashboard.vars },
                };
            });
        },
        onError: (e) => {
            showErrorMessage(e.message, e);
            ErrorHandler.handleError(e);
        },
    },
);


watch(dashboard, (_dashboard) => {
    if (_dashboard) {
        dashboardDetailStore.reset();
        if (isDeprecatedDashboard.value) {
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
watch([dashboardError, widgetError], ([_dashboardError, _widgetError]) => {
    if (_dashboardError || _widgetError) {
        ErrorHandler.handleError(_dashboardError || _widgetError);
        if (entryPoint.value === 'PROJECT' && projectGroupOrProjectId.value) {
            router.push({
                name: PROJECT_ROUTE_V2._NAME,
                params: {
                    projectGroupOrProjectId: projectGroupOrProjectId.value,
                },
            });
        } else if (entryPoint.value === 'WORKSPACE') {
            router.push({
                name: DASHBOARDS_ROUTE._NAME,
            });
        } else if (entryPoint.value === 'ADMIN') {
            router.push({
                name: ADMIN_DASHBOARDS_ROUTE._NAME,
            });
        } else {
            console.error('Invalid entry point');
        }
    }
});


onUnmounted(() => {
    // gnbStore.setBreadcrumbs([]);
    // Reset Dashboard Detail Custom breadcrumbs
    dashboardDetailStore.reset();
    widgetGenerateStore.reset();
});
</script>

<template>
    <div class="dashboard-detail-body">
        <div class="fixed-header">
            <div class="filter-box">
                <div class="left-part">
                    <dashboard-toolset-date-dropdown :date-range="dashboardDetailState.options.date_range" />
                    <dashboard-toolset-scope v-if="entryPoint === 'ADMIN'" />
                </div>
                <div class="right-part">
                    <dashboard-refresh-dropdown :dashboard-id="props.dashboardId"
                                                :loading="dashboardLoading || widgetLoading || dashboardUpdateLoading"
                                                @refresh="handleRefresh"
                    />
                </div>
            </div>
            <div v-if="!dashboardUpdateLoading"
                 class="dashboard-selectors"
            >
                <dashboard-variables v-if="isDeprecatedDashboard"
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

        <div class="widget-container-body">
            <dashboard-widget-container v-if="isDeprecatedDashboard"
                                        ref="widgetContainerRef"
            />
            <dashboard-widget-container-v2 v-else
                                           ref="widgetContainerRef"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-detail-body {
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
