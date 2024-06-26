<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PHeading, PSkeleton, PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PublicDashboardShareParameters } from '@/schema/dashboard/public-dashboard/api-verbs/share';
import type { PublicDashboardUnshareParameters } from '@/schema/dashboard/public-dashboard/api-verbs/unshare';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardCloneModal from '@/services/dashboards/components/DashboardCloneModal.vue';
import DashboardControlButtons from '@/services/dashboards/components/DashboardControlButtons.vue';
import DashboardDeleteModal from '@/services/dashboards/components/DashboardDeleteModal.vue';
import DashboardNameEditModal from '@/services/dashboards/components/DashboardNameEditModal.vue';
import DashboardShareWithCodeModal from '@/services/dashboards/components/DashboardShareWithCodeModal.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    dashboardId: string;
    templateName?: string;
}
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;
const appContextStore = useAppContextStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    loading: false,
    nameEditModalVisible: false,
    deleteModalVisible: false,
    cloneModalVisible: false,
    shareWithCodeModalVisible: false,
    shareToWorkspaceModalVisible: false,
    isSharedDashboard: computed<boolean>(() => !!dashboardDetailState.dashboardInfo?.shared),
    disableManageButtons: computed<boolean>(() => !storeState.isAdminMode && (dashboardDetailState.dashboardInfo?.resource_group === 'DOMAIN')),
    menuItems: computed<MenuItem[]>(() => {
        if (dashboardDetailGetters.isDeprecatedDashboard) {
            return [
                {
                    type: 'item',
                    name: 'edit',
                    label: i18n.t('DASHBOARDS.DETAIL.EDIT_DASHBOARD_NAME'),
                    icon: 'ic_edit-text',
                },
                {
                    type: 'item',
                    name: 'delete',
                    label: i18n.t('DASHBOARDS.DETAIL.DELETE'),
                    icon: 'ic_delete',
                },
            ];
        }
        let _shareToAllWorkspacesMenuItems: MenuItem[] = [];
        if (storeState.isAdminMode) {
            _shareToAllWorkspacesMenuItems = [{
                type: 'item',
                name: 'shareToAllWorkspaces',
                label: state.isSharedDashboard ? i18n.t('DASHBOARDS.DETAIL.UNSHARE_TO_ALL_WORKSPACES') : i18n.t('DASHBOARDS.DETAIL.SHARE_TO_ALL_WORKSPACES'),
                icon: 'ic_share',
            }];
        }
        return [
            {
                type: 'item',
                name: 'edit',
                label: i18n.t('DASHBOARDS.DETAIL.EDIT_DASHBOARD_NAME'),
                icon: 'ic_edit-text',
            },
            {
                type: 'item',
                name: 'duplicate',
                label: i18n.t('DASHBOARDS.DETAIL.CLONE'),
                icon: 'ic_duplicate',
            },
            { type: 'divider', name: 'divider' },
            {
                type: 'item',
                name: 'shareWithCode',
                label: i18n.t('DASHBOARDS.DETAIL.SHARE_WITH_CODE'),
                icon: 'ic_share-code',
            },
            ..._shareToAllWorkspacesMenuItems,
            { type: 'divider', name: 'divider' },
            {
                type: 'item',
                name: 'delete',
                label: i18n.t('DASHBOARDS.DETAIL.DELETE'),
                icon: 'ic_delete',
            },
        ];
    }),
});

/* Api */
const shareDashboard = async () => {
    state.loading = true;
    try {
        const _message = state.isSharedDashboard
            ? i18n.t('DASHBOARDS.DETAIL.ALT_S_UNSHARE_DASHBOARD')
            : i18n.t('DASHBOARDS.DETAIL.ALT_S_SHARE_DASHBOARD');
        const fetcher = state.isSharedDashboard
            ? SpaceConnector.clientV2.dashboard.publicDashboard.unshare
            : SpaceConnector.clientV2.dashboard.publicDashboard.share;
        const updatedDashboard = await fetcher<PublicDashboardShareParameters|PublicDashboardUnshareParameters>({
            dashboard_id: props.dashboardId,
        });
        dashboardDetailStore.setDashboardInfo(updatedDashboard);
        showSuccessMessage(_message, '');
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleSelectItem = (selected: MenuItem) => {
    if (selected.name === 'edit') state.nameEditModalVisible = true;
    if (selected.name === 'duplicate') state.cloneModalVisible = true;
    if (selected.name === 'shareWithCode') state.shareWithCodeModalVisible = true;
    if (selected.name === 'delete') state.deleteModalVisible = true;
    if (selected.name === 'shareToAllWorkspaces') shareDashboard();
};
const handleNameUpdate = (name: string) => {
    dashboardDetailStore.setName(name);
    dashboardDetailStore.setOriginDashboardName(name);
};
</script>

<template>
    <div class="dashboard-detail-header">
        <p-heading :title="dashboardDetailState.name">
            <p-skeleton v-if="!dashboardDetailState.name"
                        width="20rem"
                        height="1.5rem"
            />
            <template v-if="!state.disableManageButtons"
                      #title-right-extra
            >
                <p-select-dropdown style-type="icon-button"
                                   button-icon="ic_ellipsis-horizontal"
                                   :menu="state.menuItems"
                                   :selected="[]"
                                   use-fixed-menu-style
                                   reset-selection-on-menu-close
                                   @select="handleSelectItem"
                />
            </template>
            <template v-if="!dashboardDetailGetters.isDeprecatedDashboard"
                      #extra
            >
                <dashboard-control-buttons :dashboard-id="props.dashboardId"
                                           :name="dashboardDetailState.name"
                />
            </template>
        </p-heading>
        <p v-if="props.templateName"
           class="template-name"
        >
            {{ props.templateName }}
        </p>
        <dashboard-name-edit-modal :visible.sync="state.nameEditModalVisible"
                                   :dashboard-id="props.dashboardId"
                                   :name="dashboardDetailState.name"
                                   @confirm="handleNameUpdate"
        />
        <dashboard-delete-modal :visible.sync="state.deleteModalVisible"
                                :dashboard-id="props.dashboardId"
        />
        <dashboard-clone-modal :visible.sync="state.cloneModalVisible" />
        <dashboard-share-with-code-modal :visible.sync="state.shareWithCodeModalVisible"
                                         :dashboard-id="props.dashboardId"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-detail-header {
    margin-bottom: 0.75rem;
    .p-heading {
        align-items: center;
        margin-bottom: 0;
    }
    .template-name {
        @apply text-paragraph-sm text-gray-500;
        margin-left: 2.5rem;
    }
}
</style>
