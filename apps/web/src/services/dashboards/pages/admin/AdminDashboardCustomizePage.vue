<script setup lang="ts">
import { reactive, defineProps } from 'vue';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardCustomize from '@/services/dashboards/components/DashboardCustomize.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    dashboardId?: string;
}

const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    loading: false,
});

const handleClickBackButton = () => {
    SpaceRouter.router.back();
};

const updateDashboardData = async () => {
    try {
        state.loading = true;

        await dashboardDetailStore.updateDashboard(props.dashboardId as string, {
            name: dashboardDetailState.name,
            labels: dashboardDetailState.labels,
            settings: dashboardDetailState.settings,
            layouts: [dashboardDetailState.dashboardWidgetInfoList],
            variables: dashboardDetailState.variables,
            variables_schema: dashboardDetailState.variablesSchema,
            tags: { created_by: store.state.user.userId },
        });
        await SpaceRouter.router.push({
            name: makeAdminRouteName(DASHBOARDS_ROUTE.DETAIL._NAME),
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

<template>
    <div class="dashboard-customize-page">
        <dashboard-customize :dashboard-id="props.dashboardId"
                             :loading="state.loading"
                             @go-back="handleClickBackButton"
                             @save="updateDashboardData"
        />
    </div>
</template>
