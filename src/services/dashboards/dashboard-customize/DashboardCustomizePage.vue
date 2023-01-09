<template>
    <div class="dashboard-customize-page">
        <dashboard-customize-page-name :name="dashboardDetailState.dashboardName"
                                       :dashboard-id="dashboardId"
                                       @update:name="handleUpdateDashboardName"
        />
        <div class="filters-box">
            <dashboard-labels editable
                              :label-list="dashboardDetailState.labels"
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
                                                :property-name="propertyName"
                    />
                </template>
                <variable-more-button-dropdown :variables="variableState.variableProperties"
                                               :variable-order="variableState.order"
                                               @change="handleChangeVariable"
                />
                <button class="reset-button"
                        @click="handleResetVariables"
                >
                    <p-i name="ic_refresh"
                         width="1rem"
                         height="1rem"
                         color="inherit"
                    />
                    <!--song-lang-->
                    <span>{{ $t('Reset') }}</span>
                </button>
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

import { PDivider, PI } from '@spaceone/design-system';
import { cloneDeep, isEqual } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';


import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    DashboardConfig, DashboardVariablesSchema,
    DashboardVariables,
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
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';

interface Props {
    dashboardId?: string;
}

const props = defineProps<Props>();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    refreshInterval: undefined,
    apiParam: computed<Partial<DashboardConfig>>(() => ({
        name: dashboardDetailState.dashboardName,
        labels: dashboardDetailState.labels,
        settings: dashboardDetailState.settings,
        layouts: [dashboardDetailState.dashboardWidgetInfoList.map((widget) => {
            const result: Partial<DashboardContainerWidgetInfo> = { ...widget };
            delete result.widgetKey;
            return result as DashboardLayoutWidgetInfo;
        })],
        variables: dashboardDetailState.variables,
        variables_schema: dashboardDetailState.variables_schema,
    })),
});
const vm = getCurrentInstance()?.proxy as Vue;
const variableState = reactive({
    showOverlay: computed(() => vm.$route.hash === `#${MANAGE_VARIABLES_HASH_NAME}`),
    variableData: computed(() => dashboardDetailState.variables),
    variableProperties: computed(() => dashboardDetailState.variables_schema.properties),
    order: computed(() => dashboardDetailState.variables_schema.order),
    originVariables: {} as DashboardVariables,
    originVariablesSchema: {} as DashboardVariablesSchema,
});

/* Api */
const getDashboardData = async () => {
    try {
        await dashboardDetailStore.getDashboardData(props.dashboardId);
        console.log('here');
        variableState.originVariables = { ...dashboardDetailState.variables };
        variableState.originVariablesSchema = { ...dashboardDetailState.variables_schema };
    } catch (e) {
        ErrorHandler.handleError(e);
        await SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.ALL._NAME });
    }
};
const updateDashboardData = async () => {
    try {
        if (dashboardDetailState.isProjectDashboard) {
            await SpaceConnector.clientV2.dashboard.projectDashboard.update({
                project_dashboard_id: props.dashboardId,
                ...state.apiParam,
            });
        } else {
            await SpaceConnector.clientV2.dashboard.domainDashboard.update({
                domain_dashboard_id: props.dashboardId,
                ...state.apiParam,
            });
        }
        await SpaceRouter.router.push({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: props.dashboardId as string,
                dashboardScope: dashboardDetailState.isProjectDashboard ? DASHBOARD_SCOPE.PROJECT : DASHBOARD_SCOPE.DOMAIN,
            },
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.CUSTOMIZE.ALT_E_UPDATE_DASHBOARD'));
    }
};
const createDashboard = async () => {
    try {
        if (dashboardDetailState.isProjectDashboard) {
            const result = await SpaceConnector.clientV2.dashboard.projectDashboard.create({
                ...state.apiParam,
                viewers: dashboardDetailState.dashboardViewer,
            });
            dashboardDetailState.dashboardId = result.project_dashboard_id;
        } else {
            const result = await SpaceConnector.clientV2.dashboard.domainDashboard.create({
                ...state.apiParam,
                viewers: dashboardDetailState.dashboardViewer,
            });
            dashboardDetailState.dashboardId = result.domain_dashboard_id;
        }
        await SpaceRouter.router.push({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: dashboardDetailState.dashboardId as string,
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
const handleUpdateLabelList = (labels: Array<string>) => {
    dashboardDetailState.labels = [...labels];
};
const handleSave = async () => {
    if (dashboardDetailState.dashboardId) await updateDashboardData();
    if (dashboardDetailState.dashboardId === undefined) await createDashboard();
};
const handleChangeVariable = (variables: DashboardVariablesSchema['properties'], order?: string[]) => {
    dashboardDetailState.variables_schema.properties = variables;
    if (order) dashboardDetailState.variables_schema.order = order;
    const _variableData = cloneDeep(dashboardDetailState.variables);
    variableState.order.forEach((d) => {
        if (variables[d].use) return;
        if (dashboardDetailState.variables[d]) delete _variableData[d];
    });
    dashboardDetailState.variables = _variableData;
};

const resetVariablesSchema = () => {
    const originProperties = variableState.originVariablesSchema.properties;
    // variableState.order is current variable properties' name list
    // result of reset should reflect updated variables schema.
    variableState.order.forEach((property) => {
        if (!originProperties[property]) return;
        dashboardDetailStore.updateVariableUse(property, originProperties[property].use);
    });
};

const resetVariables = () => {
    const originProperties = variableState.originVariablesSchema.properties;
    const originOrder = variableState.originVariablesSchema.order;
    const originVariables = variableState.originVariables;

    originOrder.forEach((property) => {
        // CASE: existing variable is deleted.
        if (!variableState.variableProperties[property]) return;

        if (isEqual(variableState.variableProperties[property], originProperties[property])) {
            dashboardDetailState.variables = { ...dashboardDetailState.variables, [property]: originVariables[property] };
        }
    });
};

const handleResetVariables = () => {
    resetVariablesSchema();
    resetVariables();
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
        @apply relative flex justify-between items-start z-10;
        padding: 1.5rem 0 1.25rem;

        .variable-selector-wrapper {
            @apply relative flex items-center flex-wrap;
            gap: 0.5rem;

            .reset-button {
                @apply flex items-center text-label-md text-blue-700;
                gap: 0.25rem;
            }
        }
    }
}
</style>
