<template>
    <div class="dashboard-customize-page">
        <dashboard-customize-page-name :name.sync="state.name"
                                       :dashboard-id="props.dashboardId"
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
                                                :reference-map="variableState.allReferenceTypeInfo[propertyName]?.referenceMap"
                    />
                </template>
                <variable-more-button-dropdown />
                <button class="reset-button"
                        @click="resetVariables"
                >
                    <p-i name="ic_refresh"
                         width="1rem"
                         height="1rem"
                         color="inherit"
                    />
                    <span>{{ $t('DASHBOARDS.CUSTOMIZE.RESET') }}</span>
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
        <dashboard-manage-variable-overlay :visible="variableState.showOverlay" />
    </div>
</template>

<script setup lang="ts">
import type Vue from 'vue';
import {
    computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, watch,
} from 'vue';

import { PDivider, PI } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';


import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    DashboardConfig,
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
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import DashboardRefreshDropdown from '@/services/dashboards/modules/DashboardRefreshDropdown.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

interface Props {
    dashboardId?: string;
}

const props = defineProps<Props>();
const dashboardDetailStore = useDashboardDetailInfoStore();
const { resetVariables } = dashboardDetailStore;
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailOriginState = dashboardDetailStore.originState;

const state = reactive({
    name: dashboardDetailState.dashboardName,
    refreshInterval: undefined,
    apiParam: computed<Partial<DashboardConfig>>(() => ({
        name: dashboardDetailState.dashboardName,
        labels: dashboardDetailState.labels,
        settings: dashboardDetailState.settings,
        layouts: [dashboardDetailState.dashboardWidgetInfoList],
        variables: dashboardDetailState.variables,
        variables_schema: dashboardDetailState.variablesSchema,
    })),
});
const vm = getCurrentInstance()?.proxy as Vue;
const variableState = reactive({
    showOverlay: computed(() => vm.$route.hash === `#${MANAGE_VARIABLES_HASH_NAME}`),
    variableData: computed(() => dashboardDetailState.variables),
    variableProperties: computed(() => dashboardDetailState.variablesSchema.properties),
    order: computed(() => dashboardDetailState.variablesSchema.order),
    allReferenceTypeInfo: computed(() => store.getters['reference/allReferenceTypeInfo']),
});

/* Api */
const getDashboardData = async () => {
    try {
        await dashboardDetailStore.getDashboardInfo(props.dashboardId);
    } catch (e) {
        ErrorHandler.handleError(e);
        await SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.ALL._NAME });
    }
};
const updateDashboardData = async () => {
    try {
        if (dashboardDetailOriginState.isProjectDashboard) {
            await SpaceConnector.clientV2.dashboard.projectDashboard.update({
                ...state.apiParam,
                name: state.name,
                project_dashboard_id: props.dashboardId,
            });
        } else {
            await SpaceConnector.clientV2.dashboard.domainDashboard.update({
                ...state.apiParam,
                name: state.name,
                domain_dashboard_id: props.dashboardId,
            });
        }
        await dashboardDetailStore.getDashboardInfo(props.dashboardId, true);
        await SpaceRouter.router.push({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: props.dashboardId as string,
                dashboardScope: dashboardDetailOriginState.isProjectDashboard ? DASHBOARD_SCOPE.PROJECT : DASHBOARD_SCOPE.DOMAIN,
            },
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.CUSTOMIZE.ALT_E_UPDATE_DASHBOARD'));
    }
};
const createDashboard = async () => {
    try {
        if (dashboardDetailOriginState.isProjectDashboard) {
            const result = await SpaceConnector.clientV2.dashboard.projectDashboard.create({
                ...state.apiParam,
                name: state.name,
                viewers: dashboardDetailOriginState.dashboardViewer,
            });
            dashboardDetailState.dashboardId = result.project_dashboard_id;
        } else {
            const result = await SpaceConnector.clientV2.dashboard.domainDashboard.create({
                ...state.apiParam,
                name: state.name,
                viewers: dashboardDetailOriginState.dashboardViewer,
            });
            dashboardDetailState.dashboardId = result.domain_dashboard_id;
        }
        await dashboardDetailStore.getDashboardInfo(dashboardDetailState.dashboardId, true);
        await SpaceRouter.router.push({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: dashboardDetailState.dashboardId as string,
                dashboardScope: dashboardDetailOriginState.isProjectDashboard ? DASHBOARD_SCOPE.PROJECT : DASHBOARD_SCOPE.DOMAIN,
            },
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.CUSTOMIZE.ALT_E_UPDATE_DASHBOARD'));
    }
};

/* Event */
const handleUpdateDashboardName = (name: string) => {
    state.name = name;
};
const handleUpdateLabelList = (labels: Array<string>) => {
    dashboardDetailState.labels = [...labels];
};
const handleSave = async () => {
    if (dashboardDetailState.dashboardId) await updateDashboardData();
    if (dashboardDetailState.dashboardId === undefined) await createDashboard();
};

// for preventing refresh
const handleUnload = (event) => {
    event.preventDefault(); event.returnValue = '';
};

watch(() => dashboardDetailState.dashboardName, (name: string) => {
    state.name = name;
});

onMounted(() => {
    getDashboardData();
    window.addEventListener('beforeunload', handleUnload);
});

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleUnload);
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
