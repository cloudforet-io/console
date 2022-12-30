<template>
    <div class="dashboard-customize-page">
        <dashboard-customize-page-name :name="state.dashboardName"
                                       @update:name="handleUpdateDashboardName"
        />
        <div class="filters-box">
            <dashboard-labels editable
                              :label-list="state.labelList"
                              @update:labelList="handleUpdateLabelList"
            />
            <dashboard-toolset :date-range.sync="state.dashboardSettings.date_range"
                               :currency.sync="state.dashboardSettings.currency"
            />
        </div>
        <p-divider />
        <div class="dashboard-selectors">
            <div class="variable-selector-wrapper">
                <template v-for="(name, idx) in variableState.order">
                    <variable-selector-dropdown v-if="variableState.variableProperties[name].use"
                                                :key="`${name}-${idx}`"
                                                :variable-name="name"
                                                :default-selected="variableState.variableData[name]"
                                                :variable-options="variableState.variableProperties[name].options"
                                                :selection-type="variableState.variableProperties[name].selection_type"
                                                @change="handleChangeVariable(name, $event)"
                    />
                </template>
                <variable-more-button-dropdown :variable-map="variableState.variableProperties"
                                               :variable-order="variableState.order"
                                               @change="handleChangeVariableUse"
                />
            </div>
            <dashboard-refresh-dropdown :interval-option.sync="state.refreshInterval"
                                        refresh-disabled
            />
        </div>
        <dashboard-widget-container
            ref="widgetContainerRef"
            :widget-info-list="state.dashboardWidgetInfoList"
            :edit-mode="true"
            :dashboard-variables="state.dashboardInfo.variables"
            :dashboard-settings="state.dashboardSettings"
        />
        <dashboard-customize-sidebar :widget-info-list.sync="state.dashboardWidgetInfoList"
                                     :dashboard-id="props.dashboardId"
                                     :enable-date-range.sync="state.dashboardSettings.date_range.enabled"
                                     :enable-currency.sync="state.dashboardSettings.currency.enabled"
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

import { CURRENCY } from '@/store/modules/display/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    DashboardConfig, DashboardVariablesSchema, DashboardSettings,
} from '@/services/dashboards/config';
import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';
import DashboardManageVariableOverlay
    from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/DashboardManageVariableOverlay.vue';
import DashboardCustomizePageName
    from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizePageName.vue';
import DashboardCustomizeSidebar from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizeSidebar.vue';
import VariableMoreButtonDropdown
    from '@/services/dashboards/dashboard-customize/modules/VariableMoreButtonDropdown.vue';
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
    isProjectDashboard: computed<boolean>(() => props.dashboardId.startsWith('project')),
    dashboardInfo: {} as DashboardModel,
    dashboardName: '',
    dashboardWidgetInfoList: [] as DashboardLayoutWidgetInfo[],
    dashboardSettings: {
        date_range: {
            start: dayjs.utc().format('YYYY-MM-01'),
            end: dayjs.utc().format('YYYY-MM-DD'),
        },
        currency: {
            value: CURRENCY.USD,
        },
    } as DashboardSettings,
});
const vm = getCurrentInstance()?.proxy as Vue;
const variableState = reactive({
    showOverlay: computed(() => vm.$route.hash === `#${MANAGE_VARIABLES_HASH_NAME}`),
    variableData: {
        project: ['test2', 'test3'],
        // serviceAccount: 'test4', // undefined case
        // provider: ['test1', 'test4'], // undefined case
        user: ['test4'],
        region: ['test3'],
        node: 'test1',
    },
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
        let result: DashboardModel;
        if (state.isProjectDashboard) {
            result = await SpaceConnector.clientV2.dashboard.projectDashboard.get({ project_dashboard_id: props.dashboardId });
        } else {
            result = await SpaceConnector.clientV2.dashboard.domainDashboard.get({ domain_dashboard_id: props.dashboardId });
        }
        state.dashboardInfo = result;
        state.dashboardWidgetInfoList = flattenDeep(result?.layouts ?? []);
        state.dashboardName = result.name;

        state.dashboardSettings = {
            date_range: {
                enabled: result.settings.date_range.enabled,
                start: result.settings.date_range.start,
                end: result.settings.date_range.end,
            },
            currency: {
                enabled: result.settings.currency.enabled,
                value: result.settings.currency?.value ?? CURRENCY.USD,
            },
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        await SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.ALL._NAME });
    }
};
const updateDashboardData = async () => {
    try {
        const param: Partial<DashboardConfig> = {
            name: state.dashboardName,
            layouts: [state.dashboardWidgetInfoList],
            labels: state.labelList,
            settings: state.dashboardSettings,
            // TODO: add other params
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
const handleUpdateDashboardName = (name: string) => {
    state.dashboardName = name;
};
const handleUpdateLabelList = (labelList: Array<string>) => {
    state.labelList = labelList;
};
const handleSave = async () => {
    await updateDashboardData();
};
const handleChangeVariableUse = (variables: DashboardVariablesSchema['properties']) => {
    variableState.variableProperties = variables;
};
const handleChangeVariable = (name: string, selected: string|string[]) => {
    variableState.variableData[name] = selected;
};

onMounted(() => {
    getDashboardData();
});
</script>

<style lang="postcss" scoped>
.dashboard-customize-page {
    @apply relative;
    .filters-box {
        @apply flex justify-between mt-4 items-start;
    }

    .dashboard-selectors {
        @apply relative flex justify-between z-10;

        .variable-selector-wrapper {
            @apply relative flex items-center flex-wrap;
            gap: 0.5rem;
            padding: 1.5rem 0 1.25rem;
        }
    }
}
</style>
