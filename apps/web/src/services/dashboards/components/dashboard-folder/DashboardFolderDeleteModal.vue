<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataTable, PI } from '@cloudforet/mirinae';
import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';

import type { PrivateDashboardDeleteParameters } from '@/schema/dashboard/private-dashboard/api-verbs/delete';
import type { PrivateFolderDeleteParameters } from '@/schema/dashboard/private-folder/api-verbs/delete';
import type { PublicDashboardDeleteParameters } from '@/schema/dashboard/public-dashboard/api-verbs/delete';
import type { PublicFolderDeleteParameters } from '@/schema/dashboard/public-folder/api-verbs/delete';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { useDashboardMainPageStore } from '@/services/dashboards/stores/dashboard-main-page-store';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';



const DELETE_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'location', label: 'Location' },
];
type FolderDeleteParams = PublicFolderDeleteParameters | PrivateFolderDeleteParameters;
type DashboardDeleteParams = PublicDashboardDeleteParameters | PrivateDashboardDeleteParameters;
interface DataTableItem {
    id: string;
    name: string;
    location?: string;
    type: 'DASHBOARD' | 'FOLDER';
}
interface Props {
    visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void,
}>();
const dashboardStore = useDashboardStore();
const dashboardMainPageStore = useDashboardMainPageStore();
const dashboardMainPageState = dashboardMainPageStore.state;
const dashboardMainPageGetters = dashboardMainPageStore.getters;
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    dashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => [...dashboardMainPageGetters.publicDashboardTreeData, ...dashboardMainPageGetters.privateDashboardTreeData]),
    tableItems: computed<DataTableItem[]>(() => {
        if (dashboardMainPageState.selectedFolderId) return getSelectedFolderItems(dashboardMainPageState.selectedFolderId);
        return getSelectedFolderAndDashboardItems();
    }),
});

/* Util */
const getSelectedFolderAndDashboardItems = (): DataTableItem[] => {
    const _tableItems: DataTableItem[] = [];
    dashboardMainPageGetters.selectedTreeData.forEach((node) => {
        if (node.data.type === 'FOLDER') {
            _tableItems.push({
                id: node.data.id,
                name: node.data.name,
                type: 'FOLDER',
            });
            node.children?.forEach((child) => {
                _tableItems.push({
                    id: child.data.id,
                    name: child.data.name,
                    location: node.data.name,
                    type: 'DASHBOARD',
                });
            });
        } else {
            const _folderId = node.data?.folderId;
            const _folderName = state.dashboardTreeData.find((d) => d.id === _folderId)?.data?.name;
            _tableItems.push({
                id: node.data.id,
                name: node.data.name,
                location: _folderName,
                type: 'DASHBOARD',
            });
        }
    });
    return _tableItems;
};
const getSelectedFolderItems = (selectedFolderId: string): DataTableItem[] => {
    const _tableItems: DataTableItem[] = [];
    const _selectedFolder = state.dashboardTreeData.find((d) => d.id === selectedFolderId);
    if (!_selectedFolder) return _tableItems; // it doesn't happen
    _tableItems.push({
        id: _selectedFolder.id,
        name: _selectedFolder.data.name,
        type: 'FOLDER',
    });
    _selectedFolder.children?.forEach((child) => {
        _tableItems.push({
            id: child.id,
            name: child.data.name,
            location: _selectedFolder.data.name,
            type: 'DASHBOARD',
        });
    });
    return _tableItems;
};

/* Api */
const deleteFolder = async (folderId: string): Promise<boolean> => {
    const fetcher = folderId.startsWith('private')
        ? SpaceConnector.clientV2.dashboard.privateFolder.delete
        : SpaceConnector.clientV2.dashboard.publicFolder.delete;
    try {
        await fetcher<FolderDeleteParams>({ folder_id: folderId });
        return true;
    } catch (e) {
        return false;
    }
};
const deleteDashboard = async (dashboardId: string): Promise<boolean> => {
    const fetcher = dashboardId.startsWith('private')
        ? SpaceConnector.clientV2.dashboard.privateDashboard.delete
        : SpaceConnector.clientV2.dashboard.publicDashboard.delete;
    try {
        await fetcher<DashboardDeleteParams>({ dashboard_id: dashboardId });
        return true;
    } catch (e) {
        return false;
    }
};

/* Event */
const handleDelete = async () => {
    state.loading = true;
    const _deletePromises: Promise<boolean>[] = [];
    state.tableItems.forEach((item) => {
        if (item.type === 'DASHBOARD') {
            _deletePromises.push(deleteDashboard(item.id));
        } else {
            _deletePromises.push(deleteFolder(item.id));
        }
    });
    const _results = await Promise.all(_deletePromises);
    if (_results.every((r) => r)) {
        showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_S_DELETE_DASHBOARD'), '');
    } else {
        ErrorHandler.handleRequestError(new Error('Delete failed'), i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_E_DELETE_DASHBOARD'));
    }
    await dashboardStore.load();
    state.loading = false;
    state.proxyVisible = false;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (!visible) dashboardMainPageStore.reset();
});
</script>

<template>
    <delete-modal v-if="state.proxyVisible && !state.loading"
                  :visible.sync="state.proxyVisible"
                  size="md"
                  :header-title="$t('DASHBOARDS.ALL_DASHBOARDS.DELETE_DASHBOARD')"
                  :loading="state.loading"
                  :enable-scroll="true"
                  class="dashboard-folder-delete-modal"
                  @confirm="handleDelete"
    >
        <template #delete-modal-body>
            <p-data-table :items="state.tableItems"
                          :fields="DELETE_TABLE_FIELDS"
                          :loading="state.loading"
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
