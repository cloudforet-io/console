<template>
    <div>
        <p-select-dropdown class="more-button"
                           :items="state.moreMenuItems"
                           style-type="icon-button"
                           button-icon="ic_more"
                           menu-position="left"
                           @select="handleSelectMoreMenu"
        />
        <dashboard-duplicate-modal
            :visible.sync="state.duplicateModalVisible"
            :dashboard="dashboard"
            :manage-disabled="manageDisabled"
        />
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :loading="checkDeleteState.loading"
                      @confirm="handleDeleteDashboardConfirm"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceRouter } from '@/router';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { DASHBOARD_TYPE } from '@/services/cost-explorer/cost-dashboard/lib/config';
import type { DashboardViewerType } from '@/services/dashboards/dashboard-create/type';
import DashboardDuplicateModal
    from '@/services/dashboards/dashboard-detail/modules/DashboardDuplicateModal.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';





const MENU = Object.freeze({
    DUPLICATE: 'duplicate',
    DELETE: 'delete',
    SET_HOME: 'setHome',
} as const);

const defaultMenuItems = computed(() => [
    // song-lang
    { name: MENU.DUPLICATE, label: 'Duplicate', disabled: false },
    // song-lang
    { name: MENU.DELETE, label: 'Delete', disabled: false },
    // song-lang
    { name: MENU.SET_HOME, label: 'Set as Home Dashboard', disabled: false },
]);


interface DashboardMoreMenuProps {
    dashboardId: string;
    dashboardType: DashboardViewerType;
    manageDisabled: boolean;
    dashboard: any;
}

const props = defineProps<DashboardMoreMenuProps>();

const state = reactive({
    moreMenuItems: computed(() => {
        const menuItems = cloneDeep(defaultMenuItems.value);
        if (state.homeDashboardId === props.dashboardId) {
            menuItems[1].disabled = true;
            menuItems[2].disabled = true;
            return menuItems;
        }
        if (state.dashboardType === DASHBOARD_TYPE.PUBLIC && props.manageDisabled) {
            if (state.homeDashboardId === props.dashboardId) {
                menuItems[1].disabled = true;
                menuItems[2].disabled = true;
            }
            menuItems[1].disabled = true;
            return menuItems;
        }
        return defaultMenuItems.value;
    }),
    // FIXME:: connect dashboardStore
    // homeDashboardId: computed<string|undefined>(() => costExplorerStore.getters.homeDashboardId),
    homeDashboardId: '',
    dashboardType: computed(() => (Object.prototype.hasOwnProperty.call(props.dashboard, 'public_dashboard_id') ? DASHBOARD_TYPE.PUBLIC : DASHBOARD_TYPE.USER)),
    duplicateModalVisible: false,
});


const checkDeleteState = reactive({
    visible: false,
    // song-lang
    headerTitle: 'Are you sure you want to delete dashboard?',
    loading: false,
});

const handleSelectMoreMenu = (item) => {
    if (item === MENU.SET_HOME && props.dashboardId) {
        // FIXME:: connect dashboardStore
        // costExplorerStore.dispatch('setHomeDashboard', props.dashboardId);
    } else if (item === MENU.DUPLICATE) {
        state.duplicateModalVisible = true;
    } else if (item === MENU.DELETE) {
        checkDeleteState.visible = true;
    }
};

const handleDeleteDashboardConfirm = async () => {
    try {
        checkDeleteState.loading = true;
        if (props.dashboardId?.startsWith('user')) {
            // await SpaceConnector.client.costAnalysis.userDashboard.delete({
            //     user_dashboard_id: props.dashboardId,
            // });
        } else {
            // await SpaceConnector.client.costAnalysis.publicDashboard.delete({
            //     public_dashboard_id: props.dashboardId,
            // });
        }
        // await costExplorerStore.dispatch('setDashboardList');
        await SpaceRouter.router.replace({ name: DASHBOARDS_ROUTE._NAME });
    } catch (e) {
        // song-lang
        ErrorHandler.handleRequestError(e, 'Failed to delete dashboard');
    } finally {
        checkDeleteState.loading = false;
        checkDeleteState.visible = false;
    }
};

</script>
