<template>
    <div class="dashboard-detail-page">
        <p-heading :title="dashboardDetailState.name">
            <p-skeleton v-if="!dashboardDetailState.name"
                        width="20rem"
                        height="1.5rem"
            />
            <template v-if="dashboardDetailState.name && dashboardDetailStore.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                      #title-left-extra
            >
                <div class="title-left-extra">
                    <p-i name="ic_globe-filled"
                         width="1rem"
                         height="1rem"
                         :color="PUBLIC_ICON_COLOR"
                    />
                </div>
            </template>
            <template v-if="dashboardDetailState.name"
                      #title-right-extra
            >
                <div class="title-right-extra">
                    <div class="favorite-button-wrapper">
                        <favorite-button :item-id="props.dashboardId"
                                         :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                         scale="0.8"
                        />
                    </div>
                    <p-icon-button name="ic_edit-text"
                                   size="md"
                                   :disabled="!state.hasManagePermission && dashboardDetailStore.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                                   @click="handleVisibleNameEditModal"
                    />
                    <p-icon-button name="ic_delete"
                                   size="md"

                                   :disabled="!state.hasManagePermission && dashboardDetailStore.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                                   class="delete-button"
                                   @click="handleVisibleDeleteModal"
                    />
                </div>
            </template>
            <template #extra>
                <dashboard-control-buttons v-if="state.hasManagePermission"
                                           :dashboard-id="props.dashboardId"
                                           :name="dashboardDetailState.name"
                                           @update:visible-clone-modal="handleVisibleCloneModal"
                />
            </template>
        </p-heading>
        <div class="filter-box">
            <dashboard-labels :editable="state.hasManagePermission"
                              @update-labels="handleUpdateLabels"
            />
            <dashboard-toolset />
        </div>
        <p-divider class="divider" />
        <div class="dashboard-selectors">
            <dashboard-variables class="variable-selector-wrapper"
                                 :is-manageable="state.hasManagePermission"
                                 :dashboard-id="props.dashboardId"
            />
            <dashboard-refresh-dropdown :dashboard-id="props.dashboardId"
                                        :loading="dashboardDetailState.loadingWidgets"
                                        @refresh="handleRefresh"
            />
        </div>
        <dashboard-widget-container ref="widgetContainerRef" />
        <dashboard-name-edit-modal :visible.sync="state.nameEditModalVisible"
                                   :dashboard-id="props.dashboardId"
                                   :name="dashboardDetailState.name"
                                   @confirm="handleNameUpdate"
        />
        <dashboard-delete-modal :visible.sync="state.deleteModalVisible"
                                :dashboard-id="props.dashboardId"
        />
        <dashboard-clone-modal :visible.sync="state.cloneModalVisible"
                               :dashboard="dashboardDetailState"
        />
    </div>
</template>

<script setup lang="ts">
import {
    onUnmounted, reactive, ref, watch,
} from 'vue';

import {
    PDivider, PI, PIconButton, PHeading, PSkeleton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { gray } from '@/styles/colors';

import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import DashboardControlButtons from '@/services/dashboards/dashboard-detail/modules/DashboardControlButtons.vue';
import DashboardDeleteModal from '@/services/dashboards/dashboard-detail/modules/DashboardDeleteModal.vue';
import DashboardNameEditModal from '@/services/dashboards/dashboard-detail/modules/DashboardNameEditModal.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import DashboardToolset from '@/services/dashboards/shared/dashboard-toolset/DashboardToolset.vue';
import DashboardVariables from '@/services/dashboards/shared/dashboard-variables/DashboardVariables.vue';
import DashboardWidgetContainer from '@/services/dashboards/shared/dashboard-widget-container/DashboardWidgetContainer.vue';
import DashboardCloneModal from '@/services/dashboards/shared/DashboardCloneModal.vue';
import DashboardLabels from '@/services/dashboards/shared/DashboardLabels.vue';
import DashboardRefreshDropdown from '@/services/dashboards/shared/DashboardRefreshDropdown.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';


const PUBLIC_ICON_COLOR = gray[500];

interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    nameEditModalVisible: false,
    deleteModalVisible: false,
    cloneModalVisible: false,
});

const widgetContainerRef = ref<typeof DashboardWidgetContainer|null>(null);

const getDashboardData = async (dashboardId: string) => {
    try {
        await dashboardDetailStore.getDashboardInfo(dashboardId, true);
    } catch (e) {
        ErrorHandler.handleError(e);
        await SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.ALL._NAME });
    }
};

// name edit
const handleVisibleNameEditModal = () => {
    state.nameEditModalVisible = true;
};
const handleNameUpdate = (name: string) => {
    dashboardDetailStore.$patch({ name });
    dashboardDetailStore.setOriginDashboardName(name);
};

// delete dashboard
const handleVisibleDeleteModal = () => {
    state.deleteModalVisible = true;
};

// clone dashboard
const handleVisibleCloneModal = () => {
    state.cloneModalVisible = true;
};

// else
const handleRefresh = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (widgetContainerRef.value) widgetContainerRef.value.refreshAllWidget();
};
const handleUpdateLabels = async (labels: string[]) => {
    try {
        const isProjectDashboard = props.dashboardId?.startsWith('project');
        if (isProjectDashboard) {
            await SpaceConnector.clientV2.dashboard.projectDashboard.update({
                project_dashboard_id: props.dashboardId,
                labels,
            });
        } else {
            await SpaceConnector.clientV2.dashboard.domainDashboard.update({
                domain_dashboard_id: props.dashboardId,
                labels,
            });
        }
        await store.dispatch('dashboard/loadAllDashboard');
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};


watch(() => props.dashboardId, async (dashboardId, prevDashboardId) => {
    /* NOTE: The dashboard data is reset in three cases.
        1. the dashboard is changed from project dashboard to domain dashboard
        2. vice versa
        3. first entering case
    * This is because in case of project dashboard, there are some different variables settings, so it is not safe to reuse dashboard store data with domain dashboard.
    * But in case of the same type of dashboard, the dashboard store must be reused to smoothly update the dashboard data without blinking.
     */
    if (dashboardId && !prevDashboardId) { // this includes all three cases
        dashboardDetailStore.$reset();
    }
    await getDashboardData(dashboardId);
}, { immediate: true });

onUnmounted(() => {
    dashboardDetailStore.revertDashboardData();
});

</script>

<style lang="postcss" scoped>
.p-heading {
    margin-bottom: 0.75rem;
}
.dashboard-detail-page {
    .title-left-extra {
        @apply inline-block;
        height: 2rem;
        margin-top: 0.075rem;
    }
    .title-right-extra {
        @apply flex-shrink-0 inline-flex items-center;
        margin-bottom: -0.25rem;
        gap: 0.5rem;
        .favorite-button-wrapper {
            @apply flex items-center justify-center;
            width: 1.25rem;
            height: 1.25rem;
        }
    }
    .divider {
        @apply mb-6;
    }
    .filter-box {
        @apply flex justify-between items-start mb-4;
    }
    .dashboard-selectors {
        @apply relative flex justify-between items-start z-10;
        padding-bottom: 1.25rem;

        .variable-selector-wrapper {
            @apply relative flex items-center flex-wrap;
            gap: 0.5rem;
            padding-right: 1rem;
        }
    }
}
</style>
