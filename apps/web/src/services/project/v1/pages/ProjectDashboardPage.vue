<script lang="ts" setup>
import {
    computed,
    onUnmounted,
    ref, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PSkeleton } from '@cloudforet/mirinae';


import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardLabelsButton from '@/services/dashboards/components/dashboard-detail/DashboardLabelsButton.vue';
import DashboardRefreshDropdown from '@/services/dashboards/components/dashboard-detail/DashboardRefreshDropdown.vue';
import DashboardToolsetDateDropdown
    from '@/services/dashboards/components/dashboard-detail/DashboardToolsetDateDropdown.vue';
import DashboardVariablesV2 from '@/services/dashboards/components/dashboard-detail/DashboardVariablesV2.vue';
import DashboardWidgetContainerV2
    from '@/services/dashboards/components/dashboard-detail/DashboardWidgetContainerV2.vue';
import type DashboardWidgetContainer from '@/services/dashboards/components/legacy/DashboardWidgetContainer.vue';
import { useDashboardDetailQuery } from '@/services/dashboards/composables/use-dashboard-detail-query';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
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
    widgetList,
    isError,
    isLoading,
    keys,
    queryClient,
} = useDashboardDetailQuery({
    dashboardId: computed(() => route.params.dashboardId),
});

const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: keys.publicWidgetListQueryKey.value });
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
watch(isError, (error) => {
    if (error) {
        ErrorHandler.handleError(error);
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
                                                :loading="isLoading"
                                                disable-interval
                                                @refresh="handleRefresh"
                    />
                </div>
                <div v-if="!isLoading"
                     class="selectors"
                >
                    <dashboard-variables-v2 class="variable-selector-wrapper"
                                            is-project-dashboard
                                            disable-save-button
                                            :loading="isLoading"
                    />
                </div>
                <dashboard-widget-container-v2 ref="widgetContainerRef" />
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

