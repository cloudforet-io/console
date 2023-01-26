<!--This component is temporary code for the pdf converting test. -->
<template>
    <div ref="dashboardRef"
         class="dashboard-detail-preview"
    >
        <p-page-title ref="dashboardTitleRef"
                      :title="state.name"
        >
            <template #extra>
                <dashboard-toolset />
            </template>
        </p-page-title>
        <div class="filter-box">
            <div>{{ $t('DASHBOARDS.DETAIL.PDF_EXPORT.APPLIED_FILTERS') }}</div> <dashboard-labels :label-list="state.labelList" />
        </div>
        <div class="divider" />
        <dashboard-widget-container reuse-previous-data
                                    @rendered="handleAllRendered"
        />
    </div>
</template>

<script setup lang="ts">
import type Vue from 'vue';
import {
    reactive, computed, watch, onMounted, ref,
} from 'vue';

import { PPageTitle } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import type { DashboardViewer } from '@/services/dashboards/config';
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';
import { DASHBOARD_TEMPLATES } from '@/services/dashboards/default-dashboard/template-list';
import type { DashboardModel, DomainDashboardModel, ProjectDashboardModel } from '@/services/dashboards/model';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';


interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const dashboardRef = ref<HTMLElement|null>(null);
const dashboardTitleRef = ref<Vue|null>(null);

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    dashboardInfo: DASHBOARD_TEMPLATES.monthlyCostSummary as DashboardModel, // TODO: should be changed to api data
    dashboardViewer: computed<DashboardViewer>(() => state.dashboardInfo?.viewers ?? DASHBOARD_VIEWER.PRIVATE),
    name: '',
    labelList: computed<string[]>(() => state.dashboardInfo?.labels ?? []),
    dashboardWidgetLayouts: computed<DashboardLayoutWidgetInfo[][]>(() => state.dashboardInfo?.layouts ?? []),
    //
    nameEditModalVisible: false,
    deleteModalVisible: false,
    cloneModalVisible: false,
    refreshInterval: '5m',
    loading: true,
    widgetElementList: null as HTMLElement[]|null,
    isPageMounted: false,
    isWidgetsRendered: false,
    isAllRendered: computed<boolean>(() => {
        if (!state.isPageMounted) return false;
        if (state.widgetElementList === null) return false;
        return state.isWidgetsRendered;
    }),
});

const emit = defineEmits(['rendered']);

const isProjectDashboard = props.dashboardId.startsWith('project');

const getDashboardData = async () => {
    try {
        let result: ProjectDashboardModel|DomainDashboardModel;
        if (isProjectDashboard) {
            result = await SpaceConnector.clientV2.dashboard.projectDashboard.get({ project_dashboard_id: props.dashboardId });
        } else {
            result = await SpaceConnector.clientV2.dashboard.domainDashboard.get({ project_dashboard_id: props.dashboardId });
        }
        // state.dashboardInfo = result;
        state.name = result.name;
    } catch (e) {
        state.dashboardInfo = {};
        ErrorHandler.handleError(e);
    }
};

const handleAllRendered = (widgetElement:HTMLElement[]) => {
    state.widgetElementList = widgetElement;
    state.isWidgetsRendered = true;
};


watch(() => state.isAllRendered, async (isAllRendered) => {
    if (isAllRendered) {
        await setTimeout(() => {
            emit('rendered', [dashboardTitleRef.value, ...state.widgetElementList]);
        }, 10000);
    }
});
onMounted(() => {
    state.isPageMounted = true;
});
// INIT
(async () => {
    await getDashboardData();
})();
</script>

<style lang="postcss" scoped>
.dashboard-title-icon-buttons-wrapper {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    margin-left: 0.25rem;
}
.divider {
    @apply mt-4 mb-6;
}
.filter-box {
    @apply flex justify-between items-center mb-4 mt-5;
}
</style>
