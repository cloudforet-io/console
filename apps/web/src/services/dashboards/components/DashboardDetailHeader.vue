<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PHeading, PSkeleton, PSelectDropdown, PButtonModal,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import DashboardCloneModal from '@/services/dashboards/components/DashboardCloneModal.vue';
import DashboardControlButtons from '@/services/dashboards/components/DashboardControlButtons.vue';
import DashboardDeleteModal from '@/services/dashboards/components/DashboardDeleteModal.vue';
import DashboardNameEditModal from '@/services/dashboards/components/DashboardNameEditModal.vue';
import DashboardShareWithCodeModal from '@/services/dashboards/components/DashboardShareWithCodeModal.vue';
// import { getSharedDashboardLayouts } from '@/services/dashboards/helpers/dashboard-share-helper';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    dashboardId: string;
    templateName?: string;
}
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;
const state = reactive({
    loading: false,
    nameEditModalVisible: false,
    deleteModalVisible: false,
    cloneModalVisible: false,
    shareWithCodeModalVisible: false,
    shareToWorkspaceModalVisible: false,
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
            {
                type: 'item',
                name: 'shareToAllWorkspaces',
                label: i18n.t('DASHBOARDS.DETAIL.SHARE_TO_ALL_WORKSPACES'),
                icon: 'ic_share',
            },
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
    state.loading = true;
    // TODO: Share to all workspaces
    // const _sharedLayouts = await getSharedDashboardLayouts(dashboardDetailState.dashboardLayouts, dashboardDetailState.dashboardWidgets);
    // const _sharedDashboard = {
    //     name: dashboardDetailState.name || '',
    //     layouts: _sharedLayouts,
    //     options: dashboardDetailState.options || {},
    //     labels: dashboardDetailState.labels || [],
    // };
    state.loading = false;
};
</script>

<template>
    <div class="dashboard-detail-header">
        <p-heading :title="dashboardDetailState.name">
            <p-skeleton v-if="!dashboardDetailState.name"
                        width="20rem"
                        height="1.5rem"
            />
            <template v-if="dashboardDetailState.name"
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
        <dashboard-clone-modal :visible.sync="state.cloneModalVisible"
                               :dashboard-id="props.dashboardId"
        />
        <dashboard-share-with-code-modal :visible.sync="state.shareWithCodeModalVisible"
                                         :dashboard-id="props.dashboardId"
        />
        <p-button-modal :header-title="$t('DASHBOARDS.DETAIL.SHARE_TO_ALL_WORKSPACES')"
                        :visible.sync="state.shareToWorkspaceModalVisible"
                        size="sm"
                        :loading="state.loading"
                        @confirm="handleConfirmShareToAllWorkspaces"
        >
            <template #body>
                {{ $t('DASHBOARDS.DETAIL.SHARE_TO_ALL_WORKSPACES_DESC') }}
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-detail-header {
    margin-bottom: 0.75rem;
    .p-heading {
        margin-bottom: 0;
    }
    .template-name {
        @apply text-paragraph-sm text-gray-500;
        margin-left: 2.5rem;
    }
}
</style>
