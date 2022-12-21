<template>
    <div class="dashboard-detail-page">
        <p-page-title :title="state.dashboardName">
            <template v-if="state.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                      #title-left-extra
            >
                <p-i name="ic_public"
                     width="1rem"
                     height="1rem"
                     :color="PUBLIC_ICON_COLOR"
                />
            </template>
            <template #title-right-extra>
                <span class="dashboard-title-icon-buttons-wrapper">
                    <favorite-button :item-id="state.dashboardId"
                                     :favorite-type="FAVORITE_TYPE.DASHBOARD"
                    />
                    <p-icon-button name="ic_edit-text"
                                   width="1.5rem"
                                   height="1.5rem"
                                   :disabled="!state.hasManagePermission && state.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                                   @click="handleNameEditModal"
                    />
                    <dashboard-more-menu :dashboard-id="state.dashboardId"
                                         :manage-disabled="!state.hasManagePermission"
                                         :dashboard-viewer="state.dashboardViewer"
                    />
                </span>
            </template>
            <template #extra>
                <dashboard-control-buttons @update:visible-clone-modal="handleVisibleCloneModal" />
            </template>
        </p-page-title>
        <div class="filter-box">
            <dashboard-labels :label-list="state.labelList" />
            <dashboard-toolset />
        </div>
        <p-divider class="divider" />
        <div class="filter-box">
            <div>filters</div>
            <dashboard-refresh-dropdown :interval-option.sync="state.refreshInterval"
                                        :loading="state.loading"
                                        @refresh="handleRefresh"
            />
        </div>
        <dashboard-widget-container
            ref="widgetContainerRef"
            :widget-size-list="WIDGET_SIZE_MOCK"
            :widget-theme-option-list="WIDGET_THEME_OPTION_MOCK"
            :loading.sync="state.loading"
        />
        <dashboard-name-edit-modal :visible.sync="state.nameEditModalVisible"
                                   :dashboard-id="props.dashboardId"
                                   :dashboard-name="state.dashboardName"
                                   @confirm="handleNameUpdate"
        />
        <dashboard-clone-modal :visible.sync="state.cloneModalVisible" />
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';

import {
    PDivider, PI, PIconButton, PPageTitle,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { gray } from '@/styles/colors';

import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import type { DashboardViewer } from '@/services/dashboards/config';
import DashboardControlButtons from '@/services/dashboards/dashboard-detail/modules/DashboardControlButtons.vue';
import DashboardMoreMenu from '@/services/dashboards/dashboard-detail/modules/DashboardMoreMenu.vue';
import DashboardNameEditModal from '@/services/dashboards/dashboard-detail/modules/DashboardNameEditModal.vue';
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';
import type { DomainDashboardModel, ProjectDashboardModel } from '@/services/dashboards/model';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import DashboardCloneModal from '@/services/dashboards/modules/DashboardCloneModal.vue';
import DashboardRefreshDropdown from '@/services/dashboards/modules/DashboardRefreshDropdown.vue';
import costPieWidgetConfig from '@/services/dashboards/widgets/cost-pie/widget-config';


const PUBLIC_ICON_COLOR = gray[500];

interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    dashboardId: computed<string>(() => props.dashboardId),
    dashboardViewer: DASHBOARD_VIEWER.PRIVATE as DashboardViewer,
    dashboardName: 'Dashboard',
    labelList: [] as Array<string>,
    nameEditModalVisible: false,
    cloneModalVisible: false,
    refreshInterval: '15s',
    loading: false,
});
const isProjectDashboard = Boolean(props.dashboardId.startsWith('project'));

const widgetContainerRef = ref<any>(null);

const WIDGET_SIZE_MOCK = ['lg', 'lg', 'lg', 'lg', 'lg', 'lg'];
const WIDGET_THEME_OPTION_MOCK = [
    costPieWidgetConfig,
    { inherit: true, inherit_count: 3 },
    { inherit: true, inherit_count: undefined },
    { inherit: false, inherit_count: undefined },
    { inherit: true, inherit_count: undefined },
    { inherit: true, inherit_count: undefined },
    { inherit: true, inherit_count: undefined },
];

const handleNameEditModal = () => {
    state.nameEditModalVisible = true;
};
const handleNameUpdate = (name: string) => {
    state.dashboardName = name;
};
const handleVisibleCloneModal = () => {
    state.cloneModalVisible = true;
};
const handleRefresh = () => {
    widgetContainerRef.value?.refreshAllWidget();
};

const getDashboardData = async () => {
    try {
        let result: ProjectDashboardModel|DomainDashboardModel;
        if (isProjectDashboard) {
            result = await SpaceConnector.clientV2.dashboard.projectDashboard.get({ project_dashboard_id: props.dashboardId });
        } else {
            result = await SpaceConnector.clientV2.dashboard.domainDashboard.get({ project_dashboard_id: props.dashboardId });
        }
        state.labelList = result.labels;
        state.dashboardName = result.name;
        state.dashboardViewer = result.viewers;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

// INIT
(async () => {
    await getDashboardData();
})();
</script>

<style lang="postcss" scoped>
.dashboard-title-icon-buttons-wrapper {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    margin-left: 0.25rem;
}
.divider {
    @apply mt-4 mb-6;
}
.filter-box {
    @apply flex justify-between items-center mb-4;
}
</style>
