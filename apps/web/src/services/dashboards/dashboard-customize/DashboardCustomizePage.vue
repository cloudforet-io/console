<template>
    <div class="dashboard-customize-page">
        <dashboard-customize :dashboard-id="props.dashboardId"
                             :loading="state.loading"
                             @go-back="handleClickBackButton"
                             @save="updateDashboardData"
        />
    </div>
</template>

<script setup lang="ts">
import { reactive, defineProps } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardCustomize from '@/services/dashboards/dashboard-customize/modules/DashboardCustomize.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';


interface Props {
    dashboardId?: string;
}

const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const state = reactive({
    loading: false,
});

const handleClickBackButton = () => {
    SpaceRouter.router.back();
};

const updateDashboardData = async () => {
    try {
        state.loading = true;

        if (dashboardDetailStore.isProjectDashboard) {
            await SpaceConnector.clientV2.dashboard.projectDashboard.update({
                name: dashboardDetailState.name,
                labels: dashboardDetailState.labels,
                settings: dashboardDetailState.settings,
                layouts: [dashboardDetailState.dashboardWidgetInfoList],
                variables: dashboardDetailState.variables,
                variables_schema: dashboardDetailState.variablesSchema,
                tags: { created_by: store.state.user.userId },
                project_dashboard_id: props.dashboardId,
            });
        } else {
            await SpaceConnector.clientV2.dashboard.domainDashboard.update({
                name: dashboardDetailState.name,
                labels: dashboardDetailState.labels,
                settings: dashboardDetailState.settings,
                layouts: [dashboardDetailState.dashboardWidgetInfoList],
                variables: dashboardDetailState.variables,
                variables_schema: dashboardDetailState.variablesSchema,
                tags: { created_by: store.state.user.userId },
                domain_dashboard_id: props.dashboardId,
            });
        }
        const routeName = dashboardDetailStore.isProjectDashboard ? DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME : DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME;
        await SpaceRouter.router.push({
            name: routeName,
            params: {
                dashboardId: props.dashboardId as string,
            },
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.CUSTOMIZE.ALT_E_UPDATE_DASHBOARD'));
    } finally {
        state.loading = false;
    }
};
</script>
