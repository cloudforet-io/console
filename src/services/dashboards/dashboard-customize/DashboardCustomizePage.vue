<template>
    <div class="dashboard-customize-page">
        CUSTOMIZE DASHBOARD
        <div class="flex justify-between">
            <dashboard-labels editable
                              :label-list="state.labelList"
                              @update:labelList="handleUpdateLabelList"
            />
            <dashboard-toolset :date-range.sync="state.dateRange" />
        </div>
        <p-divider />
        <div>
            <p-button icon-left="ic_plus"
                      style-type="highlight"
                      @click="handleOpenOverlay"
            >
                {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.MORE') }}
            </p-button>
            <dashboard-refresh-dropdown :interval-option.sync="state.refreshInterval"
                                        refresh-disabled
            />
        </div>
        <dashboard-widget-container
            ref="widgetContainerRef"
            :dashboard-widget-layouts="state.dashboardWidgetLayouts"
            :loading.sync="state.loading"
        />
        <dashboard-customize-sidebar />
        <dashboard-manage-variable-overlay :visible="variableState.showOverlay" />
    </div>
</template>

<script setup lang="ts">
import type Vue from 'vue';
import {
    computed, getCurrentInstance, onMounted, reactive,
} from 'vue';

import { PButton, PDivider } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceRouter } from '@/router';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import DashboardManageVariableOverlay
    from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/DashboardManageVariableOverlay.vue';
import DashboardCustomizeSidebar from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizeSidebar.vue';
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';
import { DASHBOARD_TEMPLATES } from '@/services/dashboards/default-dashboard/template-list';
import type { DashboardModel } from '@/services/dashboards/model';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import DashboardRefreshDropdown from '@/services/dashboards/modules/DashboardRefreshDropdown.vue';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/config';

interface Props {
    dashboardId: string;
}

const MANAGE_VARIABLES_HASH_NAME = 'manage-variables';

const props = defineProps<Props>();
const state = reactive({
    labelList: [] as Array<string>,
    refreshInterval: undefined,
    dateRange: {
        start: dayjs.utc().format('YYYY-MM-01'),
        end: dayjs.utc().format('YYYY-MM-DD'),
    } as DateRange,
    isProjectDashboard: computed<boolean>(() => Boolean(props.dashboardId.startsWith('project'))),
    dashboardInfo: {} as DashboardModel,
    dashboardWidgetLayouts: computed<DashboardLayoutWidgetInfo[][]>(() => state.dashboardInfo?.layouts ?? []),
});
const vm = getCurrentInstance()?.proxy as Vue;
const variableState = reactive({
    showOverlay: computed(() => vm.$route.hash === `#${MANAGE_VARIABLES_HASH_NAME}`),
});

/* Api */
const getDashboardData = async () => {
    try {
        state.dashboardInfo = DASHBOARD_TEMPLATES.monthlyCostSummary; // TODO: should be changed to api data
        // let result: ProjectDashboardModel|DomainDashboardModel;
        // if (state.isProjectDashboard) {
        //     result = await SpaceConnector.clientV2.dashboard.projectDashboard.get({ project_dashboard_id: props.dashboardId });
        // } else {
        //     result = await SpaceConnector.clientV2.dashboard.domainDashboard.get({ domain_dashboard_id: props.dashboardId });
        // }
        // state.dashboardInfo = result;
        // state.dashboardName = result.name;
    } catch (e) {
        // state.dashboardInfo = {}; // TODO: temporarily disabled
        ErrorHandler.handleError(e);
    }
};

/* Event */
const handleOpenOverlay = () => {
    SpaceRouter.router.push({ hash: MANAGE_VARIABLES_HASH_NAME });
};
const handleUpdateLabelList = (labelList: Array<string>) => {
    state.labelList = labelList;
};

onMounted(() => {
    getDashboardData();
});
</script>
