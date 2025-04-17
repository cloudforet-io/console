<script lang="ts" setup>
import { computed } from 'vue';

import { PDataTable, PI } from '@cloudforet/mirinae';

import { i18n } from '@/translations';


import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import { useDashboardBundleDeleteWorkflow } from '@/services/dashboards/composables/use-dashboard-bundle-delete-workflow';
import { getSelectedDataTableItems } from '@/services/dashboards/helpers/dashboard-tree-data-helper';
import { useDashboardTreeControlStore } from '@/services/dashboards/stores/dashboard-tree-control-store';
import type { DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';
import { useProjectDashboardFolderQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-folder-query';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { useProjectDashboardModalStore } from '@/services/project/v2/stores/Project-dashboard-modal-store';
/* Cases
* Single Case: If props.folderId exists, delete single folder
* Multiple Case: Otherwise, delete multiple folders (get selected data from dashboardPageControlGetters)
*/
const DELETE_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'location', label: 'Location' },
];

interface Props {
    projectGroupOrProjectId?: string;
}
const props = defineProps<Props>();
const projectDashboardModalStore = useProjectDashboardModalStore();
const projectDashboardModalState = projectDashboardModalStore.state;
const dashboardTreeControlStore = useDashboardTreeControlStore();
const dashboardTreeControlState = dashboardTreeControlStore.state;
const visible = computed(() => projectDashboardModalStore.state.dashboardBundleDeleteModalVisible);
const projectGroupOrProjectId = computed(() => props.projectGroupOrProjectId);
const { projectGroupId, projectId } = useProjectOrGroupId(projectGroupOrProjectId);
const folderId = computed(() => projectDashboardModalState.targetId);

/* Query */
const {
    dashboardList,
} = useProjectDashboardQuery({
    projectGroupId,
    projectId,
});
const {
    dashboardFolderList,
} = useProjectDashboardFolderQuery({
    projectGroupId,
    projectId,
});


const modalTableItems = computed<DashboardDataTableItem[]>(() => {
    let _selectedIdMap = dashboardTreeControlState.selectedPublicIdMap;
    // single case
    if (folderId.value) {
        const _childrenIdList = dashboardList.value.filter((d) => d.folder_id === folderId.value);
        _selectedIdMap = {
            [folderId.value]: true,
            ..._childrenIdList.reduce((acc, d) => ({ ...acc, [d.dashboard_id]: true }), {}),
        };
    }
    return getSelectedDataTableItems(dashboardFolderList.value, dashboardList.value, _selectedIdMap);
});

/* Api */
const { mutate: deleteBundleFolderOrDashboard, isPending: bundleLoading } = useDashboardBundleDeleteWorkflow();

/* Event */
const handleDeleteConfirm = async () => {
    const bundleItems = modalTableItems.value.map((item) => ({
        id: item.id,
        type: item.type,
    }));
    const _results = await deleteBundleFolderOrDashboard(bundleItems);
    if (_results) {
        showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_S_DELETE_DASHBOARD'), '');
    } else {
        ErrorHandler.handleRequestError(new Error('Delete failed'), i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_E_DELETE_DASHBOARD'));
    }
    dashboardTreeControlStore.reset();
    projectDashboardModalStore.closeDashboardBundleDeleteModal();
};
</script>

<template>
    <delete-modal :visible="visible"
                  size="md"
                  :header-title="$t('DASHBOARDS.ALL_DASHBOARDS.DELETE_DASHBOARD')"
                  :loading="bundleLoading"
                  :disabled="bundleLoading"
                  :enable-scroll="true"
                  class="dashboard-folder-delete-modal"
                  @confirm="handleDeleteConfirm"
                  @closed="projectDashboardModalStore.resetTarget"
                  @cancel="projectDashboardModalStore.closeDashboardBundleDeleteModal"
                  @close="projectDashboardModalStore.closeDashboardBundleDeleteModal"
    >
        <template #delete-modal-body>
            <p-data-table :items="modalTableItems"
                          :fields="DELETE_TABLE_FIELDS"
                          :loading="bundleLoading"
            >
                <template #col-name-format="{item}">
                    <div class="table-column">
                        <p-i :name="item.type === 'DASHBOARD' ? 'ic_service_dashboard' : 'ic_folder'"
                             :color="gray[600]"
                             width="1rem"
                             height="1rem"
                        />
                        <span>{{ item.name }}</span>
                    </div>
                </template>
                <template #col-location-format="{item}">
                    <div v-if="item.location"
                         class="table-column"
                    >
                        <p-i name="ic_folder"
                             :color="gray[600]"
                             width="1rem"
                             height="1rem"
                        />
                        <span>{{ item.location }}</span>
                    </div>
                </template>
            </p-data-table>
        </template>
    </delete-modal>
</template>

<style lang="postcss" scoped>
.dashboard-folder-delete-modal {
    .table-column {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
}
</style>
