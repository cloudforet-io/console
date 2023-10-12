<template>
    <div>
        <p-select-dropdown class="more-button"
                           :items="moreMenuItems"
                           style-type="icon-button"
                           button-icon="ic_ellipsis-horizontal"
                           menu-position="left"
                           @select="handleSelectMoreMenu"
        />
        <cost-dashboard-duplicate-modal
            :visible.sync="duplicateModalVisible"
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

<script lang="ts">
/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { computed, reactive, toRefs } from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

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

export default {
    name: 'CostDashboardMoreMenu',
    components: {
        CostDashboardDuplicateModal,
        PSelectDropdown,
        DeleteModal,
    },
    props: {
        dashboard: {
            type: Object as () => DashboardInfo,
            default: () => {},
        },
        dashboardId: {
            type: String,
            default: undefined,
        },
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const costExplorerDashboardStore = useCostExplorerDashboardStore();

        const defaultMenuItems = computed(() => [
            { name: MENU.DUPLICATE, label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.DUPLICATE'), disabled: false },
            { name: MENU.DELETE, label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.DELETE'), disabled: false },
            { name: MENU.SET_HOME, label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.SET_HOME'), disabled: false },
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
            headerTitle: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CHECK_DELETE_MODAL_TITLE'),
            loading: false,
        });

        const handleClickDeleteDashboard = () => {
            checkDeleteState.visible = true;
        };
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
                await SpaceRouter.router.replace({ name: COST_EXPLORER_ROUTE._NAME });
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_DELETE_DASHBOARD'));
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
        return {
            ...toRefs(state),
            checkDeleteState,
            handleSelectMoreMenu,
            handleClickDeleteDashboard,
            handleDeleteDashboardConfirm,
        };
    },
};
</script>
