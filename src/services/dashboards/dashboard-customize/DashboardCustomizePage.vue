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
            <dashboard-variables-selector class="variable-selector-wrapper" />
            <dashboard-refresh-dropdown :dashboard-id="props.dashboardId"
                                        :interval-option.sync="dashboardDetailState.settings.refresh_interval_option"
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
                                     :loading="state.loading"
                                     @save="handleSave"
        />
    </div>
</template>

<script setup lang="ts">
import {
    computed, onBeforeUnmount, onMounted, reactive, watch,
} from 'vue';

import { PDivider } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';


import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    DashboardConfig,
} from '@/services/dashboards/config';
import DashboardCustomizePageName
    from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizePageName.vue';
import DashboardCustomizeSidebar from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizeSidebar.vue';
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/dashboard-widget-container/DashboardWidgetContainer.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import DashboardRefreshDropdown from '@/services/dashboards/modules/DashboardRefreshDropdown.vue';
import DashboardVariablesSelector from '@/services/dashboards/modules/DashboardVariablesSelector.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

interface Props {
    dashboardId?: string;
}

const props = defineProps<Props>();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailOriginState = dashboardDetailStore.originState;

const state = reactive({
    name: dashboardDetailState.name,
    apiParam: computed<Partial<DashboardConfig>>(() => ({
        name: dashboardDetailState.name,
        labels: dashboardDetailState.labels,
        settings: dashboardDetailState.settings,
        layouts: [dashboardDetailState.dashboardWidgetInfoList],
        variables: dashboardDetailState.variables,
        variables_schema: dashboardDetailState.variablesSchema,
        tags: { created_by: store.state.user.userId },
    })),
    loading: false,
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
        const routeName = dashboardDetailOriginState.isProjectDashboard ? DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME : DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME;
        await SpaceRouter.router.push({
            name: routeName,
            params: {
                dashboardId: props.dashboardId as string,
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
                project_id: dashboardDetailState.projectId,
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
        const routeName = dashboardDetailOriginState.isProjectDashboard ? DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME : DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME;
        await SpaceRouter.router.push({
            name: routeName,
            params: {
                dashboardId: dashboardDetailState.dashboardId as string,
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
    state.loading = true;
    if (dashboardDetailState.dashboardId) await updateDashboardData();
    if (dashboardDetailState.dashboardId === undefined) await createDashboard();
    state.loading = false;
};

// for preventing refresh
const handleUnload = (event) => {
    event.preventDefault(); event.returnValue = '';
};

watch(() => dashboardDetailState.name, (name: string) => {
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
        @apply flex justify-between items-start;
        margin-bottom: 1.3125rem;
    }

    .dashboard-selectors {
        @apply relative flex justify-between items-start z-10;
        padding: 1.5rem 0 1.25rem;

        .variable-selector-wrapper {
            @apply relative flex items-center flex-wrap;
            gap: 0.5rem;
            padding-right: 1rem;
        }
    }
}
</style>
