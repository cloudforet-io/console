<script lang="ts" setup>
/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PSelectDropdown } from '@spaceone/design-system';
import { cloneDeep } from 'lodash';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { DASHBOARD_TYPE } from '@/services/cost-explorer/cost-dashboard/lib/config';
import CostDashboardDuplicateModal
    from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardDuplicateModal.vue';
import type { DashboardInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useCostExplorerDashboardStore } from '@/services/cost-explorer/store/cost-explorer-dashboard-store';


const MENU = Object.freeze({
    DUPLICATE: 'duplicate',
    DELETE: 'delete',
    SET_HOME: 'setHome',
} as const);

interface Props {
    dashboard: DashboardInfo;
    dashboardId: string;
    manageDisabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    dashboard: () => ({} as DashboardInfo),
    manageDisabled: false,
});

const router = useRouter();
const { t } = useI18n();

const costExplorerDashboardStore = useCostExplorerDashboardStore();

const defaultMenuItems = computed(() => [
    { name: MENU.DUPLICATE, label: t('BILLING.COST_MANAGEMENT.DASHBOARD.DUPLICATE'), disabled: false },
    { name: MENU.DELETE, label: t('BILLING.COST_MANAGEMENT.DASHBOARD.DELETE'), disabled: false },
    { name: MENU.SET_HOME, label: t('BILLING.COST_MANAGEMENT.DASHBOARD.SET_HOME'), disabled: false },
]);

const state = reactive({
    moreMenuItems: computed(() => {
        const menuItems = cloneDeep(defaultMenuItems.value);
        if (costExplorerDashboardStore.homeDashboardId === props.dashboardId) {
                    // below find() never be undefined
                    menuItems.find((d) => d.name === MENU.DELETE)!.disabled = true;
                    menuItems.find((d) => d.name === MENU.SET_HOME)!.disabled = true;
                    return menuItems;
        }
        if (state.dashboardType === DASHBOARD_TYPE.PUBLIC && props.manageDisabled) {
            if (costExplorerDashboardStore.homeDashboardId === props.dashboardId) {
                        // below find() never be undefined
                        menuItems.find((d) => d.name === MENU.DELETE)!.disabled = true;
                        menuItems.find((d) => d.name === MENU.SET_HOME)!.disabled = true;
            }
                    menuItems.find((d) => d.name === MENU.DELETE)!.disabled = true;
                    return menuItems;
        }
        return defaultMenuItems.value;
    }),
    duplicateModalVisible: false,
    dashboardType: computed(() => (Object.prototype.hasOwnProperty.call(props.dashboard, 'public_dashboard_id') ? DASHBOARD_TYPE.PUBLIC : DASHBOARD_TYPE.USER)),
});

const checkDeleteState = reactive({
    visible: false,
    headerTitle: t('BILLING.COST_MANAGEMENT.DASHBOARD.CHECK_DELETE_MODAL_TITLE'),
    loading: false,
});

const handleDeleteDashboardConfirm = async () => {
    try {
        checkDeleteState.loading = true;
        if (props.dashboardId?.startsWith('user')) {
            await SpaceConnector.client.costAnalysis.userDashboard.delete({
                user_dashboard_id: props.dashboardId,
            });
        } else {
            await SpaceConnector.client.costAnalysis.publicDashboard.delete({
                public_dashboard_id: props.dashboardId,
            });
        }
        await costExplorerDashboardStore.setDashboardList();
        await router.replace({ name: COST_EXPLORER_ROUTE._NAME });
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('DASHBOARDS.FORM.ALT_E_DELETE_DASHBOARD'));
    } finally {
        checkDeleteState.loading = false;
        checkDeleteState.visible = false;
    }
};

const handleSelectMoreMenu = (item) => {
    if (item === MENU.SET_HOME && props.dashboardId) {
        costExplorerDashboardStore.setHomeDashboard(props.dashboardId);
    } else if (item === MENU.DUPLICATE) {
        state.duplicateModalVisible = true;
    } else if (item === MENU.DELETE) {
        checkDeleteState.visible = true;
    }
};

</script>

<template>
    <div>
        <p-select-dropdown class="more-button"
                           :items="state.moreMenuItems"
                           style-type="icon-button"
                           button-icon="ic_ellipsis-horizontal"
                           menu-position="left"
                           @select="handleSelectMoreMenu"
        />
        <cost-dashboard-duplicate-modal
            v-model:visible="state.duplicateModalVisible"
            :dashboard="dashboard"
            :manage-disabled="manageDisabled"
        />
        <delete-modal v-model:visible="checkDeleteState.visible"
                      :header-title="checkDeleteState.headerTitle"
                      :loading="checkDeleteState.loading"
                      @confirm="handleDeleteDashboardConfirm"
        />
    </div>
</template>
