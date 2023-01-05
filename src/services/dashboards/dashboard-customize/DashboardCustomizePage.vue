<template>
    <div class="dashboard-customize-page">
        <dashboard-customize-page-name :name="dashboardDetailState.dashboardName"
                                       :dashboard-id="dashboardId"
                                       @update:name="handleUpdateDashboardName"
        />
        <div class="filters-box">
            <dashboard-labels editable
                              :label-list="dashboardDetailState.labelList"
                              @update:labelList="handleUpdateLabelList"
            />
            <dashboard-toolset :date-range.sync="dashboardDetailState.settings.date_range"
                               :currency.sync="dashboardDetailState.settings.currency"
            />
        </div>
        <p-divider />
        <div class="dashboard-selectors">
            <div class="variable-selector-wrapper">
                <template v-for="(propertyName, idx) in variableState.order">
                    <variable-selector-dropdown v-if="variableState.variableProperties[propertyName]?.use"
                                                :key="`${propertyName}-${idx}`"
                                                :variable-name="variableState.variableProperties[propertyName].name"
                                                :default-selected="variableState.variableData[propertyName]"
                                                :variable-options="variableState.variableProperties[propertyName].options"
                                                :selection-type="variableState.variableProperties[propertyName].selection_type"
                                                @change="handleChangeVariableOptions(propertyName, $event)"
                    />
                </template>
                <variable-more-button-dropdown :variables="variableState.variableProperties"
                                               :variable-order="variableState.order"
                                               @change="handleChangeVariable"
                />
            </div>
            <dashboard-refresh-dropdown :interval-option.sync="state.refreshInterval"
                                        refresh-disabled
            />
        </div>
        <dashboard-widget-container edit-mode
                                    reuse-previous-data
        />
        <dashboard-customize-sidebar :widget-info-list.sync="dashboardDetailState.dashboardWidgetInfoList"
                                     :dashboard-id="props.dashboardId"
                                     :enable-date-range.sync="dashboardDetailState.settings.date_range.enabled"
                                     :enable-currency.sync="dashboardDetailState.settings.currency.enabled"
                                     @save="handleSave"
        />
        <dashboard-manage-variable-overlay :visible="variableState.showOverlay"
                                           :variables="variableState.variableProperties"
                                           :order="variableState.order"
                                           @change="handleChangeVariable"
        />
    </div>
</template>

<script setup lang="ts">
import type Vue from 'vue';
import {
    computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive,
} from 'vue';

import { PDivider } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';


import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    DashboardConfig, DashboardVariablesSchema,
} from '@/services/dashboards/config';
import { DASHBOARD_SCOPE, MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/config';
import DashboardManageVariableOverlay
    from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/DashboardManageVariableOverlay.vue';
import DashboardCustomizePageName
    from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizePageName.vue';
import DashboardCustomizeSidebar from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizeSidebar.vue';
import VariableMoreButtonDropdown
    from '@/services/dashboards/dashboard-customize/modules/VariableMoreButtonDropdown.vue';
import VariableSelectorDropdown from '@/services/dashboards/dashboard-customize/modules/VariableSelectorDropdown.vue';
import type { DashboardContainerWidgetInfo } from '@/services/dashboards/dashboard-detail/lib/type';
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import DashboardRefreshDropdown from '@/services/dashboards/modules/DashboardRefreshDropdown.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/config';

interface Props {
    dashboardId?: string;
}

const props = defineProps<Props>();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    refreshInterval: undefined,
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
        randomkeynode: 'test1',
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
        randomkeynode: {
            variable_type: 'CUSTOM',
            use: false,
            selection_type: 'SINGLE',
            options: ['test1', 'test2', 'test3', 'test4'],
            name: 'Node',
        },
    } as DashboardVariablesSchema['properties'],
    order: ['project', 'provider', 'serviceAccount', 'region', 'user', 'randomkeynode'],
});

/* Api */
const getDashboardData = async () => {
    try {
        await dashboardDetailStore.getDashboardData(props.dashboardId);
    } catch (e) {
        ErrorHandler.handleError(e);
        await SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.ALL._NAME });
    }
};
const updateDashboardData = async () => {
    try {
        const param: Partial<DashboardConfig> = {
            name: dashboardDetailState.dashboardName,
            labels: dashboardDetailState.labelList,
            settings: dashboardDetailState.settings,
            layouts: [dashboardDetailState.dashboardWidgetInfoList.map((widget) => {
                const result: Partial<DashboardContainerWidgetInfo> = { ...widget };
                delete result.widgetKey;
                return result as DashboardLayoutWidgetInfo;
            })],
            // TODO: add other params
            // variables:
            // variables_schema:
        };
        if (dashboardDetailState.isProjectDashboard) {
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
        await SpaceRouter.router.push({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                // FIXME:: change dashboardId when creating dashboard
                dashboardId: props?.dashboardId ?? '',
                dashboardScope: dashboardDetailState.isProjectDashboard ? DASHBOARD_SCOPE.PROJECT : DASHBOARD_SCOPE.DOMAIN,
            },
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.CUSTOMIZE.ALT_E_UPDATE_DASHBOARD'));
    }
};

/* Event */
const handleUpdateDashboardName = (name: string) => {
    dashboardDetailState.dashboardName = name;
};
const handleUpdateLabelList = (labelList: Array<string>) => {
    dashboardDetailState.labelList = labelList;
};
const handleSave = async () => {
    await updateDashboardData();
};
const handleChangeVariable = (variables: DashboardVariablesSchema['properties'], order?: string[]) => {
    variableState.variableProperties = variables;
    if (order) variableState.order = order;
   const _variableData = cloneDeep(variableState.variableData);
    variableState.order.forEach((d) => {
        if (variables[d].use) return;
        if (variableState.variableData[d]) delete _variableData[d];
    });
    variableState.variableData = _variableData;
};
const handleChangeVariableOptions = (propertyName: string, selected: string|string[]) => {
    variableState.variableData[propertyName] = selected;
};

// for preventing refresh
const handleUnload = (event) => {
    event.preventDefault(); event.returnValue = '';
};

onMounted(() => {
    window.addEventListener('beforeunload', handleUnload);
});

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleUnload);
});

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
