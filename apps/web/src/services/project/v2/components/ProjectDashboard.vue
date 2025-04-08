<script lang="ts" setup>
import {
    computed,
    onUnmounted,
    ref, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { useQueryClient } from '@tanstack/vue-query';

import { PSkeleton } from '@cloudforet/mirinae';


import BetaMark from '@/common/components/marks/BetaMark.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type DashboardWidgetContainer from '@/services/dashboards/components/legacy/DashboardWidgetContainer.vue';
import DashboardLabelsButton from '@/services/dashboards/shared/components/DashboardLabelsButton.vue';
import DashboardRefreshDropdown from '@/services/dashboards/shared/components/DashboardRefreshDropdown.vue';
import DashboardToolsetDateDropdown
    from '@/services/dashboards/shared/components/DashboardToolsetDateDropdown.vue';
import DashboardVariablesV2 from '@/services/dashboards/shared/components/DashboardVariablesV2.vue';
import DashboardWidgetContainerV2
    from '@/services/dashboards/shared/components/DashboardWidgetContainerV2.vue';
import { useDashboardGetQuery } from '@/services/dashboards/shared/composables/use-dashboard-get-query';
import { useDashboardWidgetListQuery } from '@/services/dashboards/shared/composables/use-dashboard-widget-list-query';
import { useDashboardDetailInfoStore } from '@/services/dashboards/shared/stores/dashboard-detail-info-store';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';



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
        router.push({ name: PROJECT_ROUTE_V2._NAME });
    }
});

onUnmounted(() => {
    dashboardDetailStore.reset();
});
</script>

<template>
    <div>
        <div>
            <div class="flex items-center py-6 px-4">
                <p-skeleton v-if="!dashboard?.name"
                            width="20rem"
                            height="1.5rem"
                />
                <div v-else
                     class="flex"
                >
                    <p class="text-label-xl font-bold text-gray-800">
                        {{ dashboard?.name }}
                    </p>
                    <beta-mark />
                </div>
                <dashboard-labels-button class="ml-4"
                                         :dashboard-id="props.dashboardId"
                />
            </div>
            <div class="bg-gray-100 rounded-lg pt-4 px-2 pb-2 mx-4">
                <div class="flex justify-between items-center">
                    <dashboard-toolset-date-dropdown :date-range="dashboardDetailState.options.date_range" />
                    <dashboard-refresh-dropdown :dashboard-id="props.dashboardId"
                                                :loading="dashboardLoading || widgetLoading"
                                                disable-interval
                                                @refresh="handleRefresh"
                    />
                </div>
                <div v-if="!dashboardLoading && !widgetLoading">
                    <dashboard-variables-v2 class="flex flex-wrap gap-2 pt-4 pb-6 !bg-none"
                                            is-project-dashboard
                                            disable-save-button
                                            :loading="dashboardLoading || widgetLoading"
                    />
                </div>
                <dashboard-widget-container-v2 ref="widgetContainerRef" />
            </div>
        </div>
    </div>
</template>

