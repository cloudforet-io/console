<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PDataTable, PI, PToggleButton, PButtonModal,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import type { DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';



/* Cases
* Single Case: If props.folderId exists, clone single folder
* Multiple Case: Otherwise, clone multiple folders (get selected data from dashboardPageControlGetters)
*/
const CLONE_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'location', label: 'Location' },
    { name: 'private', label: 'Make Private' },
];
interface Props {
    visible?: boolean;
    folderId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    folderId: undefined,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void,
}>();
const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlState = dashboardPageControlStore.state;
const dashboardPageControlGetters = dashboardPageControlStore.getters;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceMember: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    privateMap: {} as Record<string, boolean>,
    tableFields: computed(() => {
        if (storeState.isAdminMode || storeState.isWorkspaceMember) {
            return CLONE_TABLE_FIELDS.filter((f) => f.name !== 'private');
        }
        return CLONE_TABLE_FIELDS;
    }),
    modalTableItems: computed<DashboardDataTableItem[]>(() => {
        // single folder case
        if (props.folderId) {
            const _targetFolderItem = dashboardPageControlGetters.allFolderItems.find((f) => f.folder_id === props.folderId);
            const _folderName = _targetFolderItem?.name || '';
            const _folderItems: DashboardDataTableItem[] = [{
                id: _targetFolderItem?.folder_id || '',
                name: _folderName,
                type: 'FOLDER',
            }];
            const _dashboardItems: DashboardDataTableItem[] = dashboardPageControlGetters.allDashboardItems
                .filter((d) => d.folder_id === props.folderId)
                .map((d) => ({
                    id: d.dashboard_id,
                    name: d.name,
                    location: _folderName,
                    folderId: d.folder_id,
                    type: 'DASHBOARD',
                }));
            return [..._folderItems, ..._dashboardItems];
        }

        // multiple folders case
        if (dashboardPageControlState.folderModalType === 'PUBLIC') {
            return dashboardPageControlGetters.publicModalTableItems;
        }
        return dashboardPageControlGetters.privateModalTableItems;
    }),
});

/* Api */
const cloneDashboard = async (dashboardId: string, isPrivate?: boolean, folderId?: string) => {
    const createdDashboard = await dashboardStore.cloneDashboard(dashboardId, isPrivate, folderId);
    if (createdDashboard) {
        dashboardPageControlStore.setNewIdList([
            ...dashboardPageControlState.newIdList,
            createdDashboard.dashboard_id as string,
        ]);
    }
};

/* Event */
const handleCloneConfirm = async () => {
    state.loading = true;
    const _createDashboardPromises: Promise<void>[] = [];

    await Promise.allSettled(state.modalTableItems.map(async (item) => {
        const _isPrivate = storeState.isWorkspaceMember ? true : state.privateMap[item.id];
        if (item.type === 'FOLDER') {
            const createdFolderId = await dashboardStore.createFolder(item.name, _isPrivate);
            if (!createdFolderId) return;
            dashboardPageControlStore.setNewIdList([...dashboardPageControlState.newIdList, createdFolderId]);
            const _children = state.modalTableItems.filter((d) => d.folderId === item.id);
            _children.forEach((child) => {
                _createDashboardPromises.push(cloneDashboard(child.id, _isPrivate, createdFolderId));
            });
        } else if (!item.folderId) {
            _createDashboardPromises.push(cloneDashboard(item.id, _isPrivate));
        }
    }));
    const _results = await Promise.allSettled(_createDashboardPromises);

    if (_results.every((r) => r.status === 'fulfilled')) {
        showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_S_CLONE_DASHBOARD'), '');
    } else {
        const _failedCount = _results.filter((r) => r.status !== 'fulfilled').length;
        showErrorMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_E_CLONE_DASHBOARD', { count: _failedCount }), '');
    }
    await dashboardStore.load();
    state.loading = false;
    state.proxyVisible = false;
};
const handleChangePrivate = (id: string, value: boolean) => {
    state.privateMap = {
        ...state.privateMap,
        [id]: value,
    };

    const _isFolder = id.includes('folder');
    if (_isFolder) {
        state.modalTableItems.filter((item) => item.folderId === id).forEach((child) => {
            state.privateMap = {
                ...state.privateMap,
                [child.id]: value,
            };
        });
    }
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (!visible) {
        dashboardPageControlStore.reset();
        state.privateMap = {};
    }
});
</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
                    size="md"
                    :header-title="$t('DASHBOARDS.ALL_DASHBOARDS.CLONE_DASHBOARD')"
                    :loading="state.loading"
                    :disabled="state.loading"
                    :enable-scroll="true"
                    class="dashboard-folder-clone-modal"
                    @confirm="handleCloneConfirm"
    >
        <template #body>
            <p-data-table :items="state.modalTableItems"
                          :fields="state.tableFields"
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
                    <div v-if="item.location && item.isFolderSelected"
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
                <template #col-private-format="{item}">
                    <div class="table-column">
                        <p-toggle-button :value="state.privateMap[item.id]"
                                         :disabled="item.isFolderSelected"
                                         @change-toggle="handleChangePrivate(item.id, $event)"
                        />
                    </div>
                </template>
            </p-data-table>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.dashboard-folder-clone-modal {
    .table-column {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
}
</style>
