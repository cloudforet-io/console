<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PHeading, PSkeleton, PSelectDropdown, PButtonModal, PI, PBadge,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PublicDashboardShareParameters } from '@/schema/dashboard/public-dashboard/api-verbs/share';
import type { PublicDashboardUnshareParameters } from '@/schema/dashboard/public-dashboard/api-verbs/unshare';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
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
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
});
const state = reactive({
    loading: false,
    nameEditModalVisible: false,
    deleteModalVisible: false,
    cloneModalVisible: false,
    shareWithCodeModalVisible: false,
    shareToWorkspaceModalVisible: false,
    isSharedDashboard: computed<boolean>(() => !!dashboardDetailState.dashboardInfo?.shared),
    showBadge: computed<boolean>(() => {
        if (dashboardDetailState.dashboardScope === 'PRIVATE') return true;
        return dashboardDetailState.dashboardInfo?.workspace_id === '*';
    }),
    badgeStyleType: computed<string>(() => {
        if (dashboardDetailState.dashboardScope === 'PRIVATE') return 'gray150';
        return 'indigo100';
    }),
    badgeText: computed(() => {
        if (dashboardDetailState.dashboardScope === 'PRIVATE') return i18n.t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE');
        if (dashboardDetailState.dashboardInfo?.workspace_id === '*') {
            if (storeState.isAdminMode) return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_WORKSPACES');
            return i18n.t('DASHBOARDS.DETAIL.SHARED_BY_ADMIN');
        }
        return '';
    }),
    menuItems: computed<MenuItem[]>(() => {
        if (dashboardDetailGetters.disableManageButtons) {
            return [{
                type: 'item',
                name: 'duplicate',
                label: i18n.t('DASHBOARDS.DETAIL.CLONE'),
                icon: 'ic_clone',
            }];
        }
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
                label: state.isSharedDashboard ? i18n.t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_WORKSPACES') : i18n.t('DASHBOARDS.DETAIL.SHARE_TO_ALL_WORKSPACES'),
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
                icon: 'ic_clone',
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
        state.shareToWorkspaceModalVisible = false;
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
    if (selected.name === 'shareToAllWorkspaces') state.shareToWorkspaceModalVisible = true;
};
const handleNameUpdate = (name: string) => {
    dashboardDetailStore.setName(name);
    dashboardDetailStore.setOriginDashboardName(name);
};
const handleConfirmShareToAllWorkspaces = async () => {
    await shareDashboard();
};
</script>

<template>
    <div class="dashboard-detail-header">
        <p-heading :title="dashboardDetailState.name">
            <p-skeleton v-if="!dashboardDetailState.name"
                        width="20rem"
                        height="1.5rem"
            />
            <template #title-right-extra>
                <p-badge v-if="state.showBadge"
                         badge-type="subtle"
                         :style-type="state.badgeStyleType"
                >
                    <p-i v-if="dashboardDetailState.dashboardScope === 'PRIVATE'"
                         name="ic_lock-filled"
                         width="0.75rem"
                         height="0.75rem"
                         color="gray900"
                         class="mr-1"
                    />
                    {{ state.badgeText }}
                </p-badge>
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
                <dashboard-control-buttons v-if="!dashboardDetailGetters.disableManageButtons"
                                           :dashboard-id="props.dashboardId"
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
        <p-button-modal :header-title="state.isSharedDashboard ? $t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_WORKSPACES') : $t('DASHBOARDS.DETAIL.SHARE_TO_ALL_WORKSPACES')"
                        :visible.sync="state.shareToWorkspaceModalVisible"
                        size="sm"
                        :loading="state.loading"
                        @confirm="handleConfirmShareToAllWorkspaces"
        >
            <template #body>
                {{ state.isSharedDashboard ? $t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_WORKSPACES_DESC') : $t('DASHBOARDS.DETAIL.SHARE_TO_ALL_WORKSPACES_DESC') }}
            </template>
        </p-button-modal>
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
