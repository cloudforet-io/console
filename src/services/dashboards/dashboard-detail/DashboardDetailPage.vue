<template>
    <div class="dashboard-detail-page">
        <p-page-title :title="dashboardDetailState.dashboardName">
            <template v-if="dashboardDetailState.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
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
                                   :disabled="!state.hasManagePermission && dashboardDetailState.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                                   class="ml-1"
                                   @click="handleVisibleNameEditModal"
                    />
                    <p-icon-button name="ic_trashcan"
                                   width="1.5rem"
                                   height="1.5rem"
                                   :disabled="!state.hasManagePermission && dashboardDetailState.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                                   @click="handleVisibleDeleteModal"
                    />
                </span>
            </template>
            <template #extra>
                <dashboard-control-buttons :dashboard-id="props.dashboardId"
                                           :dashboard-name="dashboardDetailState.dashboardName"
                                           @update:visible-clone-modal="handleVisibleCloneModal"
                />
            </template>
        </p-page-title>
        <div class="filter-box">
            <dashboard-labels :label-list="dashboardDetailState.labels" />
            <dashboard-toolset
                :currency.sync="dashboardDetailState.currency"
                :date-range.sync="dashboardDetailState.dateRange"
                @update:dateRange="handleUpdateURLParam"
                @update:currency="handleUpdateURLParam"
            />
        </div>
        <p-divider class="divider" />
        <div class="filter-box">
            <div>filters</div>
            <dashboard-refresh-dropdown :interval-option.sync="state.refreshInterval"
                                        :loading="dashboardDetailState.loadingWidgets"
                                        @refresh="handleRefresh"
            />
        </div>
        <dashboard-widget-container ref="widgetContainerRef" />
        <dashboard-name-edit-modal :visible.sync="state.nameEditModalVisible"
                                   :dashboard-id="props.dashboardId"
                                   :dashboard-name="dashboardDetailState.dashboardName"
                                   @confirm="handleNameUpdate"
        />
        <dashboard-delete-modal :visible.sync="state.deleteModalVisible"
                                :dashboard-id="props.dashboardId"
        />
        <dashboard-clone-modal :visible.sync="state.cloneModalVisible" />
    </div>
</template>

<script setup lang="ts">
import {
    reactive, ref, watch,
} from 'vue';

import {
    PDivider, PI, PIconButton, PPageTitle,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { gray } from '@/styles/colors';

import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import DashboardControlButtons from '@/services/dashboards/dashboard-detail/modules/DashboardControlButtons.vue';
import DashboardDeleteModal from '@/services/dashboards/dashboard-detail/modules/DashboardDeleteModal.vue';
import DashboardNameEditModal from '@/services/dashboards/dashboard-detail/modules/DashboardNameEditModal.vue';
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import DashboardCloneModal from '@/services/dashboards/modules/DashboardCloneModal.vue';
import DashboardRefreshDropdown from '@/services/dashboards/modules/DashboardRefreshDropdown.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

const PUBLIC_ICON_COLOR = gray[500];

interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    //
    nameEditModalVisible: false,
    deleteModalVisible: false,
    cloneModalVisible: false,
    refreshInterval: '15s',
});

const widgetContainerRef = ref<typeof DashboardWidgetContainer|null>(null);


const getDashboardData = async (dashboardId: string) => {
    try {
        await dashboardDetailStore.getDashboardInfo(dashboardId);
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
    dashboardDetailState.dashboardName = name;
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
const handleRefresh = async () => {
    dashboardDetailState.loadingWidgets = true;
    if (widgetContainerRef.value) await widgetContainerRef.value.refreshAllWidget();
    dashboardDetailState.loadingWidgets = false;
};
const handleUpdateURLParam = () => {
    // TODO: write currency/dateRange data in url parameters
};

watch(() => props.dashboardId, (_dashboardId) => {
    getDashboardData(_dashboardId);
}, { immediate: true });


</script>

<style lang="postcss" scoped>
.dashboard-title-icon-buttons-wrapper {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    margin-left: 0.25rem;
}
.divider {
    @apply mb-6;
}
.filter-box {
    @apply flex justify-between items-start mt-5;
}
</style>
