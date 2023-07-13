<script setup lang="ts">
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardCustomize from '@/services/dashboards/dashboard-customize/modules/DashboardCustomize.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';

interface Props {
    dashboardId?: string;
}

const props = defineProps<Props>();
const router = useRouter();
const { t } = useI18n();
const store = useStore();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const state = reactive({
    loading: false,
});

const handleClickBackButton = () => {
    router.back();
};

const updateDashboardData = async () => {
    try {
        state.loading = true;

        const apiParam = {
            name: dashboardDetailState.name,
            labels: dashboardDetailState.labels,
            settings: dashboardDetailState.settings,
            layouts: [dashboardDetailState.dashboardWidgetInfoList],
            variables: dashboardDetailState.variables,
            variables_schema: dashboardDetailState.variablesSchema,
            tags: { created_by: store.state.user.userId },
        };
        if (dashboardDetailStore.isProjectDashboard) {
            await SpaceConnector.clientV2.dashboard.projectDashboard.update({
                ...apiParam,
                project_dashboard_id: props.dashboardId,
            });
        } else {
            await SpaceConnector.clientV2.dashboard.domainDashboard.update({
                ...apiParam,
                domain_dashboard_id: props.dashboardId,
            });
        }
        const routeName = dashboardDetailStore.isProjectDashboard ? DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME : DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME;
        await router.push({
            name: routeName,
            params: {
                dashboardId: props.dashboardId as string,
            },
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('DASHBOARDS.CUSTOMIZE.ALT_E_UPDATE_DASHBOARD'));
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
