<script lang="ts" setup>
import {
    onUnmounted,
    reactive, ref, watch,
} from 'vue';

import { PSkeleton } from '@cloudforet/mirinae';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardLabelsButton from '@/services/dashboards/components/dashboard-detail/DashboardLabelsButton.vue';
import DashboardRefreshDropdown from '@/services/dashboards/components/dashboard-detail/DashboardRefreshDropdown.vue';
import DashboardToolsetDateDropdown
    from '@/services/dashboards/components/dashboard-detail/DashboardToolsetDateDropdown.vue';
import DashboardVariablesV2 from '@/services/dashboards/components/dashboard-detail/DashboardVariablesV2.vue';
import DashboardWidgetContainerV2
    from '@/services/dashboards/components/dashboard-detail/DashboardWidgetContainerV2.vue';
import type DashboardWidgetContainer from '@/services/dashboards/components/legacy/DashboardWidgetContainer.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';



interface Props {
    id: string;
    dashboardId: string;
}
const props = defineProps<Props>();

const dashboardStore = useDashboardStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardDetailState = dashboardDetailStore.state;
const widgetContainerRef = ref<typeof DashboardWidgetContainer|null>(null);


const state = reactive({
    hasAlertConfig: false,
    dashboardVariablesLoading: false,
});


const handleUpdateDashboardVariables = async (params) => {
    if (!props.dashboardId) return;
    state.dashboardVariablesLoading = true;
    try {
        await dashboardStore.updateDashboard(props.dashboardId, params);
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.dashboardVariablesLoading = false;
    }
};
const handleRefresh = async () => {
    await dashboardDetailStore.listDashboardWidgets();
    if (widgetContainerRef.value) widgetContainerRef.value.refreshAllWidget();
};
/* api */
const getDashboardData = async (dashboardId: string) => {
    try {
        await dashboardDetailStore.getDashboardInfo(dashboardId);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

watch(() => props.dashboardId, async (dashboardId, prevDashboardId) => {
    if (!dashboardId || !props.id) return;
    /* NOTE: The dashboard data is reset in first entering case */
    if (dashboardId && !prevDashboardId) { // this includes all three cases
        dashboardDetailStore.reset();
    }
    dashboardDetailStore.setProjectId(props.id);
    await getDashboardData(dashboardId);
}, { immediate: true });

onUnmounted(() => {
    dashboardDetailStore.reset();
});
</script>

<template>
    <div class="project-dashboard-page">
        <div class="dashboard-wrapper">
            <div class="title-wrapper">
                <p-skeleton v-if="!dashboardDetailGetters.dashboardName"
                            width="20rem"
                            height="1.5rem"
                />
                <div v-else
                     class="dashboard-title"
                >
                    <p class="title">
                        {{ dashboardDetailGetters.dashboardName }}
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
                                                :loading="dashboardDetailState.loadingWidgets"
                                                @refresh="handleRefresh"
                    />
                </div>
                <div class="selectors">
                    <dashboard-variables-v2 class="variable-selector-wrapper"
                                            is-project-dashboard
                                            :disable-save-button="dashboardDetailGetters.disableManageButtons"
                                            :loading="state.dashboardVariablesLoading"
                                            @update="handleUpdateDashboardVariables"
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
                    @apply text-coral;
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

