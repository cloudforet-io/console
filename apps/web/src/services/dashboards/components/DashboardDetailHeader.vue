<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PSkeleton, PSelectDropdown, PButtonModal, PI, PBadge, PSelectCard,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';


import type { DashboardScope } from '@/schema/dashboard/_types/dashboard-type';
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
    shareToProjectModalVisible: false,
    shareModalVisible: false,
    unshareModalVisible: false,
    isSharedDashboard: computed<boolean>(() => !!dashboardDetailState.dashboardInfo?.shared),
    sharedScope: computed<DashboardScope|undefined>(() => dashboardDetailState.dashboardInfo?.scope),
    selectedSharedScope: 'WORKSPACE' as DashboardScope,
    showBadge: computed<boolean>(() => {
        if (dashboardDetailState.dashboardInfo?.user_id) return true;
        // HACK: temp code for legacy project dashboard
        return dashboardDetailState.dashboardInfo?.workspace_id === '*'; // || dashboardDetailState.dashboardInfo?.project_id === '*';
    }),
    badgeStyleType: computed<string>(() => {
        if (dashboardDetailState.dashboardScope === 'PRIVATE') return 'gray150';
        if (state.sharedScope === 'PROJECT') return 'primary3';
        return 'indigo100';
    }),
    badgeText: computed(() => {
        if (dashboardDetailState.dashboardScope === 'PRIVATE') return i18n.t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE');
        if (state.isSharedDashboard) {
            if (storeState.isAdminMode) {
                // HACK: temp code for legacy project dashboard
                if (state.sharedScope === 'PROJECT') return undefined; // i18n.t('DASHBOARDS.DETAIL.SHARED_TO_ALL_PROJECTS');
                return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_WORKSPACES');
            }
            if (state.sharedScope === 'PROJECT') return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_ALL_PROJECTS');
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
        let _shareMenuItems: MenuItem[] = [];
        if (storeState.isAdminMode) {
            _shareMenuItems = [{
                type: 'item',
                name: state.isSharedDashboard ? 'unshare' : 'share',
                label: state.isSharedDashboard ? i18n.t('DASHBOARDS.DETAIL.UNSHARE_DASHBOARD') : i18n.t('DASHBOARDS.DETAIL.SHARE_DASHBOARD'),
                icon: 'ic_share',
            }];
        }
        // else if (dashboardDetailState.dashboardScope !== 'PRIVATE') {
        //     _shareMenuItems = [{
        //         type: 'item',
        //         name: 'shareProject',
        //         label: state.isSharedDashboard ? i18n.t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_PROJECTS') : i18n.t('DASHBOARDS.DETAIL.SHARE_TO_ALL_PROJECTS'),
        //         icon: 'ic_share',
        //     }];
        // }
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
            ..._shareMenuItems,
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
const shareDashboard = async (scope) => {
    state.loading = true;
    try {
        const updatedDashboard = await SpaceConnector.clientV2.dashboard.publicDashboard.share<PublicDashboardShareParameters>({
            dashboard_id: props.dashboardId,
            scope,
        });
        dashboardDetailStore.setDashboardInfo(updatedDashboard);
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_SHARE_DASHBOARD'), '');
        state.shareModalVisible = false;
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const unshareDashboard = async () => {
    state.loading = true;
    try {
        const updatedDashboard = await SpaceConnector.clientV2.dashboard.publicDashboard.unshare<PublicDashboardUnshareParameters>({
            dashboard_id: props.dashboardId,
        });
        dashboardDetailStore.setDashboardInfo(updatedDashboard);
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_UNSHARE_DASHBOARD'), '');
        state.unshareModalVisible = false;
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
    if (selected.name === 'share') {
        state.selectedSharedScope = 'WORKSPACE';
        state.shareModalVisible = true;
    }
    if (selected.name === 'unshare') state.unshareModalVisible = true;
    if (selected.name === 'shareProject') {
        state.shareToProjectModalVisible = true;
    }
};
const handleNameUpdate = (name: string) => {
    dashboardDetailStore.setName(name);
    dashboardDetailStore.setOriginDashboardName(name);
};
const handleConfirmShare = async () => {
    await shareDashboard(state.selectedSharedScope);
};
const handleConfirmUnshare = async () => {
    await unshareDashboard();
};
const handleConfirmShareToProject = async () => {
    if (state.isSharedDashboard) {
        await unshareDashboard();
    } else {
        await shareDashboard('PROJECT');
    }
    state.shareToProjectModalVisible = false;
};
const handleSelectSharedDashboardScope = (scope: DashboardScope) => {
    state.selectedSharedScope = scope;
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
        <!-- Admin / Share Modal -->
        <p-button-modal :header-title="$t('DASHBOARDS.DETAIL.SHARE_DASHBOARD')"
                        :visible.sync="state.shareModalVisible"
                        size="sm"
                        :loading="state.loading"
                        @confirm="handleConfirmShare"
        >
            <template #body>
                <div class="select-card-wrapper">
                    <p-select-card :label="i18n.t('DASHBOARDS.DETAIL.ALL_WORKSPACES')"
                                   icon="ic_workspaces"
                                   value="WORKSPACE"
                                   :selected="state.selectedSharedScope"
                                   @click="handleSelectSharedDashboardScope('WORKSPACE')"
                    />
                    <p-select-card :label="i18n.t('DASHBOARDS.DETAIL.ALL_PROJECTS')"
                                   icon="ic_service_project"
                                   value="PROJECT"
                                   :selected="state.selectedSharedScope"
                                   @click="handleSelectSharedDashboardScope('PROJECT')"
                    />
                </div>
            </template>
        </p-button-modal>
        <!-- Admin / Unshare Modal -->
        <p-button-modal :header-title="state.sharedScope === 'PROJECT' ? $t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_PROJECTS') : $t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_WORKSPACES')"
                        :visible.sync="state.unshareModalVisible"
                        size="sm"
                        :loading="state.loading"
                        @confirm="handleConfirmUnshare"
        >
            <template #body>
                {{ state.sharedScope === 'PROJECT' ? $t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_PROJECTS_DESC') : $t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_WORKSPACES_DESC') }}
            </template>
        </p-button-modal>
        <!-- WORKSPACE / Share Modal -->
        <p-button-modal :header-title="state.isSharedDashboard ? $t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_PROJECTS') : $t('DASHBOARDS.DETAIL.SHARE_TO_ALL_PROJECTS')"
                        :visible.sync="state.shareToProjectModalVisible"
                        size="sm"
                        :loading="state.loading"
                        @confirm="handleConfirmShareToProject"
        >
            <template #body>
                {{ state.isSharedDashboard ? $t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_PROJECTS_DESC') : $t('DASHBOARDS.DETAIL.SHARE_TO_ALL_PROJECTS_DESC') }}
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
.select-card-wrapper {
    @apply grid grid-cols-12;
    gap: 0.5rem;
    .p-select-card {
        @apply col-span-6;
    }
}
</style>
