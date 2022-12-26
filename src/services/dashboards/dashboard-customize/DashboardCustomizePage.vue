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
        <div class="dashboard-selectors">
            <div class="variable-selector-wrapper">
                <dashboard-variable-dropdown variable-name="Project" />
                <dashboard-variable-dropdown variable-name="Project" />
                <dashboard-variable-dropdown variable-name="Project" />
                <dashboard-variable-dropdown variable-name="Project" />
                <dashboard-variable-dropdown variable-name="Project" />
                <dashboard-variable-dropdown variable-name="Project" />
                <p-button icon-left="ic_plus"
                          style-type="highlight"
                          @click="handleOpenOverlay"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.MORE') }}
                </p-button>
            </div>
            <dashboard-refresh-dropdown :interval-option.sync="state.refreshInterval"
                                        refresh-disabled
            />
        </div>
        <dashboard-widget-container
            ref="widgetContainerRef"
            :widget-info-list="state.dashboardWidgetInfoList"
            :loading.sync="state.loading"
            :edit-mode="true"
        />
        <dashboard-customize-sidebar :widget-info-list.sync="state.dashboardWidgetInfoList" />
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
import { flattenDeep } from 'lodash';

import { SpaceRouter } from '@/router';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import DashboardManageVariableOverlay
    from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/DashboardManageVariableOverlay.vue';
import DashboardCustomizeSidebar from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizeSidebar.vue';
import DashboardVariableDropdown from '@/services/dashboards/dashboard-customize/modules/DashboardVariableDropdown.vue';
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
    isProjectDashboard: computed<boolean>(() => props.dashboardId.startsWith('project')),
    dashboardInfo: {} as DashboardModel,
    dashboardWidgetInfoList: [] as DashboardLayoutWidgetInfo[],
});
const vm = getCurrentInstance()?.proxy as Vue;
const variableState = reactive({
    showOverlay: computed(() => vm.$route.hash === `#${MANAGE_VARIABLES_HASH_NAME}`),
});

/* Api */
const getDashboardData = async () => {
    try {
        state.dashboardInfo = DASHBOARD_TEMPLATES.monthlyCostSummary; // TODO: should be changed to api data
        state.dashboardWidgetInfoList = flattenDeep(state.dashboardInfo?.layouts ?? []);
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

<style lang="postcss" scoped>
.dashboard-customize-page {

    .dashboard-selectors {
        @apply flex justify-between;

        .variable-selector-wrapper {
            @apply flex items-center flex-wrap;
            gap: 0.5rem;
            padding: 1.5rem 0 1.25rem;
        }
    }
}
</style>
