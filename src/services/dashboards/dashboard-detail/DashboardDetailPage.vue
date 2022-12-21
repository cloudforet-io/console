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
                    <favorite-button :item-id="props.dashboardId"
                                     :favorite-type="FAVORITE_TYPE.DASHBOARD"
                    />
                    <p-icon-button name="ic_edit-text"
                                   width="1.5rem"
                                   height="1.5rem"
                                   :disabled="!state.hasManagePermission && state.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                                   class="ml-1"
                                   @click="handleVisibleNameEditModal"
                    />
                    <p-icon-button name="ic_trashcan"
                                   width="1.5rem"
                                   height="1.5rem"
                                   :disabled="!state.hasManagePermission && state.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                                   @click="handleVisibleDeleteModal"
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
            :dashboard-widget-layouts="state.dashboardWidgetLayouts"
            :loading.sync="state.loading"
        />
        <dashboard-name-edit-modal :visible.sync="state.nameEditModalVisible"
                                   :dashboard-id="props.dashboardId"
                                   :dashboard-name="state.dashboardName"
                                   @confirm="handleNameUpdate"
        />
        <dashboard-delete-modal :visible.sync="state.deleteModalVisible"
                                :dashboard-id="props.dashboardId"
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
import DashboardDeleteModal from '@/services/dashboards/dashboard-detail/modules/DashboardDeleteModal.vue';
import DashboardNameEditModal from '@/services/dashboards/dashboard-detail/modules/DashboardNameEditModal.vue';
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';
import { DASHBOARD_TEMPLATES } from '@/services/dashboards/default-dashboard/template-list';
import type { DashboardModel, DomainDashboardModel, ProjectDashboardModel } from '@/services/dashboards/model';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import DashboardCloneModal from '@/services/dashboards/modules/DashboardCloneModal.vue';
import DashboardRefreshDropdown from '@/services/dashboards/modules/DashboardRefreshDropdown.vue';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/config';


const PUBLIC_ICON_COLOR = gray[500];

interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    dashboardInfo: DASHBOARD_TEMPLATES.monthlyCostSummary as DashboardModel, // TODO: should be changed to api data
    dashboardViewer: computed<DashboardViewer>(() => state.dashboardInfo?.viewers ?? DASHBOARD_VIEWER.PRIVATE),
    dashboardName: '',
    labelList: computed<string[]>(() => state.dashboardInfo?.labels ?? []),
    dashboardWidgetLayouts: computed<DashboardLayoutWidgetInfo[][]>(() => state.dashboardInfo?.layouts ?? []),
    //
    nameEditModalVisible: false,
    deleteModalVisible: false,
    cloneModalVisible: false,
    refreshInterval: '15s',
    loading: false,
});
const isProjectDashboard = Boolean(props.dashboardId.startsWith('project'));

const widgetContainerRef = ref<any>(null);

const handleVisibleNameEditModal = () => {
    state.nameEditModalVisible = true;
};
const handleNameUpdate = (name: string) => {
    state.dashboardName = name;
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
        state.dashboardInfo = result;
        state.dashboardName = result.name;
    } catch (e) {
        // state.dashboardInfo = {}; // TODO: temporarily disabled
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
