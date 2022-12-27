<template>
    <div class="dashboard-customize-page">
        <dashboard-customize-page-title :title="state.dashboardTitle"
                                        @update:title="handleUpdateTitle"
        />
        <div class="filters-box">
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
                                     @save="handleSave"
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

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    DateRange, DashboardConfig, DashboardVariablesSchema,
} from '@/services/dashboards/config';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';
import DashboardManageVariableOverlay
    from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/DashboardManageVariableOverlay.vue';
import DashboardCustomizePageTitle
    from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizePageTitle.vue';
import DashboardCustomizeSidebar from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizeSidebar.vue';
import VariableMoreButtonDropdown from '@/services/dashboards/dashboard-customize/modules/VariableMoreButtonDropdown.vue';
import VariableSelectorDropdown from '@/services/dashboards/dashboard-customize/modules/VariableSelectorDropdown.vue';
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';
import type { DashboardModel } from '@/services/dashboards/model';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import DashboardRefreshDropdown from '@/services/dashboards/modules/DashboardRefreshDropdown.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
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
    dashboardName: '',
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
    } as DashboardVariablesSchema['properties'],
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
        ErrorHandler.handleError(e);
        // await SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.ALL._NAME });
    }
};
const updateDashboardData = async () => {
    try {
        const param: Partial<DashboardConfig> = {
            layouts: [state.dashboardWidgetInfoList],
            // TODO: add other params
            // name: state.dashboardTitle
            // settings: {
            //     date_range: {
            //         enabled: true,
            //         start: '',
            //         end: '',
            //     },
            //     currency: {
            //         enabled: true,
            //         value: 'USD',
            //     },
            // },
            // variables:
            // variables_schema:
        };
        if (state.isProjectDashboard) {
            await SpaceConnector.clientV2.dashboard.projectDashboard.update({
                project_dashboard_id: props.dashboardId,
                ...param,
            });
        } else {
            await SpaceConnector.clientV2.dashboard.domainDashboard.update({
                domain_dashboard_id: props.dashboardId,
                ...param,
            });
        }
        await SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.DETAIL._NAME, params: { dashboardId: props.dashboardId } });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.CUSTOMIZE.ALT_E_UPDATE_DASHBOARD'));
    }
};

/* Event */
const handleUpdateTitle = (title: string) => {
    console.log('page', title);
    state.dashboardTitle = title;
};
const handleUpdateLabelList = (labelList: Array<string>) => {
    state.labelList = labelList;
};
const handleSelectVariableUse = (variables: DashboardVariablesSchema['properties']) => {
    variableState.variableProperties = variables;
};
const handleSave = async () => {
    await updateDashboardData();
};

onMounted(() => {
    getDashboardData();
});
</script>

<style lang="postcss" scoped>
.dashboard-customize-page {
    .filters-box {
        @apply flex justify-between mt-5;
    }

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
