<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDataTable, PI, PToggleButton, PButtonModal,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { DashboardModel, DashboardCreateParams } from '@/schema/dashboard/_types/dashboard-type';
import type { FolderCreateParams } from '@/schema/dashboard/_types/folder-type';
import type { WidgetModel, WidgetListParams } from '@/schema/dashboard/_types/widget-type';
import type { PublicFolderCreateParameters } from '@/schema/dashboard/public-folder/api-verbs/create';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { getSharedDashboardLayouts } from '@/services/dashboards/helpers/dashboard-share-helper';
import { useDashboardMainPageStore } from '@/services/dashboards/stores/dashboard-main-page-store';



const DELETE_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'location', label: 'Location' },
    { name: 'private', label: 'Make Private' },
];
interface Props {
    visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void,
}>();
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const dashboardStore = useDashboardStore();
const dashboardMainPageStore = useDashboardMainPageStore();
const dashboardMainPageState = dashboardMainPageStore.state;
const dashboardMainPageGetters = dashboardMainPageStore.getters;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    privateMap: {} as Record<string, boolean>,
});

/* Util */
const getUniqueFolderName = (name: string): string => {
    const _newName = `Clone - ${name}`;
    return dashboardMainPageGetters.existingFolderNameList.find((n) => n === _newName) ? getUniqueFolderName(_newName) : _newName;
};
const getUniqueDashboardName = (name: string): string => {
    const _newName = `Clone - ${name}`;
    return dashboardMainPageGetters.existingDashboardNameList.find((n) => n === _newName) ? getUniqueDashboardName(_newName) : _newName;
};

/* Api */
const listDashboardWidgets = async (dashboardId: string): Promise<WidgetModel[]> => {
    try {
        const isPrivate = dashboardId.startsWith('private');
        const fetcher = isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.list
            : SpaceConnector.clientV2.dashboard.publicWidget.list;
        const { results } = await fetcher<WidgetListParams, ListResponse<WidgetModel>>({
            dashboard_id: dashboardId,
        });
        return results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
const createFolder = async (originFolderName: string, isPrivate: boolean): Promise<string|undefined> => {
    try {
        const fetcher = isPrivate ? SpaceConnector.clientV2.dashboard.privateFolder.create : SpaceConnector.clientV2.dashboard.publicFolder.create;
        const params: FolderCreateParams = {
            name: getUniqueFolderName(originFolderName),
        };
        if (!isPrivate) {
            (params as PublicFolderCreateParameters).resource_group = storeState.isAdminMode ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE;
        }
        const createdFolder = await fetcher(params);
        dashboardMainPageStore.setNewIdList([
            ...dashboardMainPageState.newIdList,
            createdFolder.folder_id as string,
        ]);
        return createdFolder.folder_id;
    } catch (e) {
        return undefined;
    }
};
const createDashboard = async (dashboard: DashboardModel, isPrivate?: boolean, folderId?: string): Promise<boolean> => {
    try {
        const _dashboardType = isPrivate ? 'PRIVATE' : 'PUBLIC';
        const _dashboardWidgets = await listDashboardWidgets(dashboard.dashboard_id);
        const _sharedLayouts = await getSharedDashboardLayouts(dashboard.layouts, _dashboardWidgets, storeState.costDataSource);
        let _sharedDashboard: DashboardCreateParams = {
            name: getUniqueDashboardName(dashboard.name),
            layouts: _sharedLayouts,
            options: dashboard.options || {},
            labels: dashboard.labels || [],
            tags: { created_by: store.state.user.userId },
            folder_id: folderId,
        };
        if (storeState.isAdminMode) {
            _sharedDashboard = {
                ..._sharedDashboard,
                resource_group: RESOURCE_GROUP.DOMAIN,
            };
        } else if (!isPrivate) {
            _sharedDashboard = {
                ..._sharedDashboard,
                resource_group: dashboard?.resource_group || RESOURCE_GROUP.WORKSPACE,
            };
        }
        const createdDashboard = await dashboardStore.createDashboard(_dashboardType, _sharedDashboard);
        dashboardMainPageStore.setNewIdList([
            ...dashboardMainPageState.newIdList,
            createdDashboard.dashboard_id as string,
        ]);
        return true;
    } catch (e) {
        return false;
    }
};

/* Event */
const handleCloneConfirm = async () => {
    state.loading = true;
    const _createDashboardPromises: Promise<boolean>[] = [];

    // 상단 버튼 클릭 시
    await Promise.all(dashboardMainPageGetters.selectedTreeData.map(async (item) => {
        if (item.data.type === 'FOLDER') {
            const _isPrivate = state.privateMap[item.data.id];
            const createdFolderId = await createFolder(item.data.name, _isPrivate);
            item.children.forEach((child) => {
                _createDashboardPromises.push(createDashboard(child.data, _isPrivate, createdFolderId));
            });
        } else {
            _createDashboardPromises.push(createDashboard(item.data, false));
        }
    }));
    const _results = await Promise.all(_createDashboardPromises);

    if (_results.every((r) => r)) {
        showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_S_CLONE_DASHBOARD'), '');
    } else {
        ErrorHandler.handleRequestError(new Error('Delete failed'), i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_E_CLONE_DASHBOARD'));
    }
    await dashboardStore.load();
    dashboardMainPageStore.setSelectedIdMap({});
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
        dashboardMainPageGetters.selectedTreeData.find((item) => item.data.id === id)?.children.forEach((child) => {
            state.privateMap = {
                ...state.privateMap,
                [child.data.id]: value,
            };
        });
    }
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (!visible) {
        dashboardMainPageStore.reset();
        state.privateMap = {};
    }
});
</script>

<template>
    <p-button-modal v-if="state.proxyVisible && !state.loading"
                    :visible.sync="state.proxyVisible"
                    size="md"
                    :header-title="$t('DASHBOARDS.ALL_DASHBOARDS.CLONE_DASHBOARD')"
                    :loading="state.loading"
                    :enable-scroll="true"
                    class="dashboard-folder-clone-modal"
                    @confirm="handleCloneConfirm"
    >
        <template #body>
            <p-data-table :items="dashboardMainPageGetters.modalTableItems"
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
