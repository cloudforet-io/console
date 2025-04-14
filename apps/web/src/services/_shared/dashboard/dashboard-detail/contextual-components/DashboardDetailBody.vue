<script lang="ts" setup>
import {
    computed, ref, watch, onUnmounted,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PDivider, PSkeleton } from '@cloudforet/mirinae';

import type { DashboardFolderModel, DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import { useDashboardManageable } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-manageable';
import { useDashboardSharedContext } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-shared-context';
import DashboardManageVariablePortalTargets from '@/services/_shared/dashboard/dashboard-detail/components/DashboardManageVariablePortalTargets.vue';
import DashboardRefreshDropdown
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardRefreshDropdown.vue';
import DashboardToolsetDateDropdown
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardToolsetDateDropdown.vue';
import DashboardToolsetScope
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardToolsetScope.vue';
import DashboardWidgetContainerV2
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardWidgetContainerV2.vue';
import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';
import { useDashboardWidgetListQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-widget-list-query';
import DashboardDetailHeader from '@/services/_shared/dashboard/dashboard-detail/contextual-components/DashboardDetailHeader.vue';
import DashboardVariablesV2
    from '@/services/_shared/dashboard/dashboard-detail/contextual-components/DashboardVariablesV2.vue';
import DashboardVariables from '@/services/_shared/dashboard/dashboard-detail/legacy/DashboardVariables.vue';
import DashboardWidgetContainer from '@/services/_shared/dashboard/dashboard-detail/legacy/DashboardWidgetContainer.vue';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

interface Props {
    dashboardId: string;
    dashboardItems?: Array<DashboardModel>;
    folderItems: Array<DashboardFolderModel>;
}

const props = withDefaults(defineProps<Props>(), {
    dashboardItems: () => [],
    folderItems: () => [],
});


const emit = defineEmits<{(e: 'select-toolset', toolsetId: string|undefined): void;
}>();
const dashboardId = computed(() => props.dashboardId);
const router = useRouter();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const widgetGenerateStore = useWidgetGenerateStore();
const widgetContainerRef = ref<typeof DashboardWidgetContainer|typeof DashboardWidgetContainerV2|null>(null);

const { getDashboardManageable } = useDashboardManageable();
const {
    isAdminMode, entryPoint, projectGroupOrProjectId, projectContextType,
} = useDashboardSharedContext();

/* Query */
const queryClient = useQueryClient();
const {
    dashboard,
    isError: dashboardError,
    isLoading: dashboardLoading,
    keys: dashboardKeys,
    fetcher: dashboardFetcher,
} = useDashboardGetQuery({
    dashboardId,
});
const {
    widgetList,
    isLoading: widgetLoading,
    isError: widgetError,
    keys: widgetListKeys,
} = useDashboardWidgetListQuery({
    dashboardId,
});

const isDeprecatedDashboard = computed(() => dashboard.value?.version === '1.0');
const dashboardItemsV2 = computed(() => props.dashboardItems?.filter((d) => d.version !== '1.0'));

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
const handleSelectToolset = (toolsetId: string|undefined) => {
    emit('select-toolset', toolsetId);
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
        } else if (entryPoint.value === 'PROJECT' && projectGroupOrProjectId.value) {
            if (projectContextType.value === 'PROJECT') {
                dashboardDetailStore.setDashboardInfoStoreStateV2({
                    ..._dashboard,
                    project_id: projectGroupOrProjectId.value,
                });
            } else if (projectContextType.value === 'PROJECT_GROUP') {
                dashboardDetailStore.setDashboardInfoStoreStateV2({
                    ..._dashboard,
                    project_group_id: projectGroupOrProjectId.value,
                });
            }
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
        if (entryPoint.value === 'PROJECT') {
            if (!projectGroupOrProjectId.value) {
                console.error('projectGroupOrProjectId is not provided');
                return;
            }
            router.push({
                name: PROJECT_ROUTE_V2._NAME,
                params: {
                    projectGroupOrProjectId: projectGroupOrProjectId.value,
                },
            });
        } else if (entryPoint.value === 'DASHBOARDS') {
            if (isAdminMode.value) {
                router.push({
                    name: ADMIN_DASHBOARDS_ROUTE._NAME,
                });
            } else {
                router.push({
                    name: DASHBOARDS_ROUTE._NAME,
                });
            }
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
        <dashboard-detail-header :dashboard-id="props.dashboardId"
                                 :folder-items="props.folderItems"
                                 @select-toolset="handleSelectToolset"
        />
        <p-divider v-if="entryPoint !== 'PROJECT'"
                   class="divider"
        />
        <div class="dashboard-detail-content"
             :class="{ 'project-dashboard': entryPoint === 'PROJECT' }"
        >
            <div class="fixed-header">
                <div class="filter-box">
                    <div class="left-part">
                        <dashboard-toolset-date-dropdown :date-range="dashboardDetailState.options.date_range" />
                        <dashboard-toolset-scope v-if="entryPoint === 'DASHBOARDS' && isAdminMode" />
                    </div>
                    <div class="right-part">
                        <dashboard-refresh-dropdown :dashboard-id="props.dashboardId"
                                                    :loading="dashboardLoading || widgetLoading || dashboardUpdateLoading"
                                                    @refresh="handleRefresh"
                        />
                    </div>
                </div>

                <div class="dashboard-selectors">
                    <p-skeleton v-if="dashboardUpdateLoading || dashboardLoading"
                                width="100%"
                                height="2rem"
                    />
                    <template v-else>
                        <dashboard-variables v-if="isDeprecatedDashboard"
                                             class="variable-selector-wrapper"
                                             :loading="dashboardUpdateLoading"
                                             @update="handleUpdateDashboardVariables"
                        />
                        <dashboard-variables-v2 v-else
                                                class="variable-selector-wrapper"
                                                :disable-save-button="!getDashboardManageable(dashboard)"
                                                :loading="dashboardUpdateLoading"
                                                :dashboard-id="props.dashboardId"
                                                :dashboard-items="dashboardItemsV2"
                                                :folder-items="folderItems"
                                                @update="handleUpdateDashboardVariables"
                        />
                    </template>
                </div>
            </div>

            <div class="widget-container-body">
                <dashboard-widget-container v-if="isDeprecatedDashboard"
                                            ref="widgetContainerRef"
                />
                <dashboard-widget-container-v2 v-else
                                               ref="widgetContainerRef"
                                               :dashboard-id="props.dashboardId"
                />
            </div>
            <dashboard-manage-variable-portal-targets />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-detail-body {
    .divider {
        @apply mb-4;
    }
    .dashboard-detail-content {
        &.project-dashboard {
            @apply bg-gray-100 rounded-lg px-2 pb-2 mx-4;

            .fixed-header {
                position: unset;
            }
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
}

</style>
