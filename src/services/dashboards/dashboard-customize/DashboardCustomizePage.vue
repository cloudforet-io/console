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
                <variable-selector-dropdown variable-name="Project" />
                <variable-selector-dropdown variable-name="Project" />
                <variable-more-button-dropdown :variable-map="variableState.variableProperties"
                                               :variable-order="variableState.order"
                                               @select="handleSelectVariableUse"
                />
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
        <dashboard-customize-sidebar :widget-info-list.sync="state.dashboardWidgetInfoList"
                                     :dashboard-id="props.dashboardId"
        />
        <dashboard-manage-variable-overlay :visible="variableState.showOverlay" />
    </div>
</template>

<script setup lang="ts">
import type Vue from 'vue';
import {
    computed, getCurrentInstance, onMounted, reactive,
} from 'vue';

import { PDivider } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { flattenDeep } from 'lodash';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange, DashboardVariableSchemaProperty } from '@/services/dashboards/config';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';
import DashboardManageVariableOverlay
    from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/DashboardManageVariableOverlay.vue';
import DashboardCustomizeSidebar from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizeSidebar.vue';
import VariableMoreButtonDropdown from '@/services/dashboards/dashboard-customize/modules/VariableMoreButtonDropdown.vue';
import VariableSelectorDropdown from '@/services/dashboards/dashboard-customize/modules/VariableSelectorDropdown.vue';
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
    variableProperties: {
        project: {
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            options: ['test1', 'test2', 'test3', 'test4'],
            name: 'Project',
        },
        serviceAccount: {
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'SINGLE',
            options: ['test1', 'test2', 'test3', 'test4'],
            name: 'Service Account',
        },
        provider: {
            variable_type: 'MANAGED',
            use: true,
            selection_type: 'MULTI',
            options: ['test1', 'test2', 'test3', 'test4'],
            name: 'Provider',
        },
        user: {
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
            options: ['test1', 'test2', 'test3', 'test4'],
            name: 'User',
        },
        region: {
            variable_type: 'MANAGED',
            use: false,
            selection_type: 'MULTI',
            options: ['test1', 'test2', 'test3', 'test4'],
            name: 'Region',
        },
        node: {
            variable_type: 'CUSTOM',
            use: false,
            selection_type: 'SINGLE',
            options: ['test1', 'test2', 'test3', 'test4'],
            name: 'Node',
        },
    } as {[key: string]: DashboardVariableSchemaProperty },
    order: ['project', 'provider', 'serviceAccount', 'region', 'user', 'node'],
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

const handleUpdateLabelList = (labelList: Array<string>) => {
    state.labelList = labelList;
};
const handleSelectVariableUse = (variables: {[key: string]: DashboardVariableSchemaProperty }) => {
    variableState.variableProperties = variables;
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
