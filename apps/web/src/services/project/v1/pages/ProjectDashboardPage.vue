<script lang="ts" setup>
import {
    computed,
    onUnmounted,
    ref, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { useQueryClient } from '@tanstack/vue-query';

import { PSkeleton } from '@cloudforet/mirinae';


import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardLabelsButton from '@/services/_shared/dashboard/dashboard-detail/components/DashboardLabelsButton.vue';
import DashboardRefreshDropdown from '@/services/_shared/dashboard/dashboard-detail/components/DashboardRefreshDropdown.vue';
import DashboardToolsetDateDropdown
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardToolsetDateDropdown.vue';
import DashboardWidgetContainerV2
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardWidgetContainerV2.vue';
import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';
import { useDashboardWidgetListQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-widget-list-query';
import DashboardVariablesV2
    from '@/services/_shared/dashboard/dashboard-detail/contextual-components/DashboardVariablesV2.vue';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';
import type DashboardWidgetContainer from '@/services/dashboards/components/legacy/DashboardWidgetContainer.vue';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';



interface Props {
    id: string;
    dashboardId: string;
}
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const widgetContainerRef = ref<typeof DashboardWidgetContainer|null>(null);
const route = useRoute();
const router = useRouter();

/* Query */
const {
    dashboard,
    isError: dashboardError,
    isLoading: dashboardLoading,
} = useDashboardGetQuery({
    dashboardId: computed(() => route.params.dashboardId),
});
const {
    widgetList,
    isLoading: widgetLoading,
    isError: widgetError,
    keys: widgetListKeys,
} = useDashboardWidgetListQuery({
    dashboardId: computed(() => route.params.dashboardId),
});
const queryClient = useQueryClient();

const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: widgetListKeys.publicWidgetListQueryKey.value });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (widgetContainerRef.value) widgetContainerRef.value.refreshAllWidget();
};
watch([dashboard, () => route.params], ([_dashboard]) => {
    if (_dashboard) {
        dashboardDetailStore.reset();
        dashboardDetailStore.setDashboardInfoStoreStateV2({
            ..._dashboard,
            project_id: route.params.id,
        });
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
        router.push({ name: PROJECT_ROUTE_V1.DETAIL._NAME });
    }
});

onUnmounted(() => {
    dashboardDetailStore.reset();
});
</script>

<template>
    <div class="project-dashboard-page">
        <div class="dashboard-wrapper">
            <div class="title-wrapper">
                <p-skeleton v-if="!dashboard?.name"
                            width="20rem"
                            height="1.5rem"
                />
                <div v-else
                     class="dashboard-title"
                >
                    <p class="title">
                        {{ dashboard?.name }}
                    </p>
                    <span class="beta-mark">beta</span>
                </div>
                <dashboard-labels-button class="ml-4"
                                         dashboard-id="props.dashboardId"
                />
            </div>
            <div class="contents-wrapper">
                <div class="toolset">
                    <dashboard-toolset-date-dropdown :date-range="dashboardDetailState.options.date_range" />
                    <dashboard-refresh-dropdown :dashboard-id="props.dashboardId"
                                                :loading="dashboardLoading || widgetLoading"
                                                disable-interval
                                                @refresh="handleRefresh"
                    />
                </div>
                <div v-if="!dashboardLoading && !widgetLoading"
                     class="selectors"
                >
                    <dashboard-variables-v2 class="variable-selector-wrapper"
                                            is-project-dashboard
                                            disable-save-button
                                            :loading="dashboardLoading || widgetLoading"
                                            :dashboard-id="props.dashboardId"
                    />
                </div>
                <dashboard-widget-container-v2 ref="widgetContainerRef"
                                               :dashboard-id="props.dashboardId"
                />
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.project-dashboard-page {
    .dashboard-wrapper {
        .title-wrapper {
            @apply flex items-center;
            padding: 1.5rem 1rem;
            .dashboard-title {
                @apply flex;
                .title {
                    @apply text-label-xl font-bold text-gray-800;
                }
                .beta-mark {
                    @apply text-coral-default;
                    font-size: 0.625rem;
                    cursor: default;
                    margin-left: 0.125rem;
                    height: 1.5rem;
                }
            }
        }

        .contents-wrapper {
            @apply bg-gray-100 rounded-lg;
            padding: 1rem 0.5rem 0.5rem;
            margin: 0 1rem;
            .toolset {
                @apply flex justify-between items-center;
            }
            .selectors {
                .variable-selector-wrapper {
                    @apply flex flex-wrap gap-2;
                    padding: 1rem 0 1.5rem;
                    background-color: unset;
                }
            }
        }
    }

    /* custom design-system component - p-heading */
    :deep(.p-heading) {
        .heading-wrapper {
            line-height: unset;
        }
    }
}
</style>

