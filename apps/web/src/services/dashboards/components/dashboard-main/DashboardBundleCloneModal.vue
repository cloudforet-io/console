<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useQueryClient } from '@tanstack/vue-query';
import { cloneDeep } from 'lodash';

import {
    PDataTable, PI, PToggleButton, PButtonModal, PTextInput, PFieldGroup, PFieldTitle, PRadioGroup, PRadio, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { getClonedName } from '@cloudforet/utils';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type {
    DashboardCreateParams,
    DashboardModel,
    DashboardType,
} from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderCreateParams, FolderModel } from '@/api-clients/dashboard/_types/folder-type';
import type { WidgetModel } from '@/api-clients/dashboard/_types/widget-type';
import type { PrivateDashboardCreateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/create';
import type { PrivateFolderCreateParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/create';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import type { PublicDashboardCreateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/create';
import type { PublicFolderCreateParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/create';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { getSharedDashboardLayouts } from '@/services/_shared/dashboard/core/helpers/dashboard-layout-template-helper';
import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import { getSelectedDataTableItems } from '@/services/dashboards/helpers/dashboard-tree-data-helper';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import { useDashboardTreeControlStore } from '@/services/dashboards/stores/dashboard-tree-control-store';
import type { DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';



/* Modal Cases
* Single Case: If props.folderId exists, clone single folder
* Multiple Case: Otherwise, clone multiple folders (get selected data from dashboardPageControlGetters)
*/

/* Folder Structure Cases
* 1. Use Existing Folder Structure
* 2. Change Folder Structure
*   2.1. Create New Folder
*   2.2. Select Existing Folder
*   2.3. No Parent Folder
*/
const CLONE_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'location', label: 'Location' },
    { name: 'private', label: 'Make Private' },
];
interface FolderStructureRadioItem {
    name: string;
    label: TranslateResult;
}
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
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlState = dashboardPageControlStore.state;
const dashboardTreeControlStore = useDashboardTreeControlStore();
const dashboardTreeControlState = dashboardTreeControlStore.state;
const userStore = useUserStore();
const authorizationStore = useAuthorizationStore();
const allReferenceStore = useAllReferenceStore();
const { privateWidgetAPI } = usePrivateWidgetApi();
const { publicWidgetAPI } = usePublicWidgetApi();

/* Query */
const {
    publicDashboardList,
    privateDashboardList,
    api,
    keys: dashboardKeys,
} = useDashboardQuery();
const {
    publicFolderList,
    privateFolderList,
    keys: folderKeys,
} = useDashboardFolderQuery();
const queryClient = useQueryClient();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceMember: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    userId: computed<string|undefined>(() => userStore.state.userId),
});

const queryState = reactive({
    publicDashboardItems: computed(() => {
        const _v2DashboardItems = publicDashboardList.value.filter((d) => d.version !== '1.0');
        if (storeState.isAdminMode) return _v2DashboardItems;
        return _v2DashboardItems.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateDashboardItems: computed(() => privateDashboardList.value.filter((d) => d.version !== '1.0')),
    allDashboardItems: computed(() => [...queryState.publicDashboardItems, ...queryState.privateDashboardItems]),
    publicFolderItems: computed(() => {
        if (storeState.isAdminMode) return publicFolderList.value;
        return publicFolderList.value.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateFolderItems: computed(() => privateFolderList.value),
    allFolderItems: computed(() => [...queryState.publicFolderItems, ...queryState.privateFolderItems]),
});

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    privateMap: {} as Record<string, boolean>, // NOTE: only for maintaining the structure
    tableFields: computed<DataTableFieldType[]>(() => {
        let _results = cloneDeep(CLONE_TABLE_FIELDS);
        if (storeState.isAdminMode || storeState.isWorkspaceMember) {
            _results = _results.filter((f) => f.name !== 'private');
        }
        // 2.2. Select Existing Folder
        if (state.changeFolderStructure && state.selectedFolderStructure === 'select_folder') {
            _results = _results.filter((f) => f.name !== 'private');
        }
        // 2.3. No Parent Folder
        if (state.changeFolderStructure && state.selectedFolderStructure === 'no_folder') {
            _results = _results.filter((f) => f.name !== 'location');
        }
        return _results;
    }),
    modalTableItems: computed<DashboardDataTableItem[]>(() => {
        // 1. Use Existing Folder Structure
        if (!state.changeFolderStructure) {
            let _selectedIdMap = dashboardTreeControlState.selectedPublicIdMap;
            if (props.folderId) {
                const _childrenIdList = queryState.allDashboardItems.filter((d) => d.folder_id === props.folderId);
                _selectedIdMap = {
                    [props.folderId]: true,
                    ..._childrenIdList.reduce((acc, d) => ({ ...acc, [d.dashboard_id]: true }), {}),
                };
            } else if (dashboardPageControlState.folderModalType === 'PRIVATE') {
                _selectedIdMap = dashboardTreeControlState.selectedPrivateIdMap;
            }
            return getSelectedDataTableItems(queryState.allFolderItems, queryState.allDashboardItems, _selectedIdMap);
        }

        // 2. Change Folder Structure
        let _targetDashboardList: DashboardModel[] = [];
        if (props.folderId) {
            _targetDashboardList = _targetDashboardList.filter((d) => d.folder_id === props.folderId);
        } else {
            const _selectedIdMap = dashboardPageControlState.folderModalType === 'PRIVATE' ? dashboardTreeControlState.selectedPrivateIdMap : dashboardTreeControlState.selectedPublicIdMap;
            _targetDashboardList = queryState.allDashboardItems.filter((d) => _selectedIdMap[d.dashboard_id]);
        }
        return getChangedFolderModalTableItems(queryState.allFolderItems, _targetDashboardList);
    }),
    disableModalConfirm: computed<boolean>(() => {
        if (!state.changeFolderStructure) return false; // 1. Use Existing Folder Structure
        if (state.selectedFolderStructure === 'new_folder') return !isAllValid.value; // 2.1. Create New Folder
        if (state.selectedFolderStructure === 'select_folder') return !state.selectedFolderId; // 2.2. Select Existing Folder
        return false;
    }),
    // folder structure
    changeFolderStructure: false,
    folderStructureRadioItems: computed<FolderStructureRadioItem[]>(() => ([
        { name: 'new_folder', label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.CREATE_NEW_FOLDER') },
        { name: 'select_folder', label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.SELECT_FOLDER') },
        { name: 'no_folder', label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.NO_PARENT_FOLDER') },
    ])),
    selectedFolderStructure: 'new_folder' as string,
    selectedFolder: computed<FolderModel|string|undefined>(() => {
        if (!state.changeFolderStructure) return undefined;
        if (state.selectedFolderStructure === 'new_folder') return folderName.value;
        if (state.selectedFolderStructure === 'select_folder') {
            return queryState.allFolderItems.find((f) => f.folder_id === state.selectedFolderId);
        }
        return undefined;
    }),
    // 2.1. Create New Folder
    existingNameList: computed<string[]>(() => { // NOTE: only for 'create new folder' case
        const _targetFolderItems = state.isNewFolderPrivate ? queryState.privateFolderItems : queryState.publicFolderItems;
        if (dashboardPageControlState.folderFormModalType === 'UPDATE') {
            return _targetFolderItems.filter((d) => d.folder_id !== state.selectedFolder?.folder_id).map((d) => d.name);
        }
        return _targetFolderItems.map((d) => d.name);
    }),
    isNewFolderPrivate: false,
    // 2.2. Select Existing Folder
    existingFolderMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        const _allFolderItems: FolderModel[] = [...queryState.publicFolderItems, ...queryState.privateFolderItems];
        return _allFolderItems.map((folder) => ({
            label: folder.name,
            name: folder.folder_id,
            isPrivate: folder.folder_id.startsWith('private'),
        }));
    }),
    selectedFolderId: undefined as string | undefined,
});

const {
    forms: { folderName },
    setForm,
    initForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    folderName: undefined as string|undefined,
}, {
    folderName(value: string) {
        if (state.loading) return true;
        if (!value) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME_REQUIRED');
        if (state.existingNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME_DUPLICATED');
        return true;
    },
});

/* Util */
const getDashboardNameList = (dashboardType: DashboardType) => {
    if (dashboardType === 'PRIVATE') {
        return (privateDashboardList.value.filter((i) => i.version !== '1.0')).map((item) => item.name);
    }
    return publicDashboardList.value.filter((i) => i.version !== '1.0').map((item) => item.name);
};
const getChangedFolderModalTableItems = (folderItems: FolderModel[], targetDashboardItems: DashboardModel[]): DashboardDataTableItem[] => {
    // 2.1. Create New Folder
    if (state.selectedFolderStructure === 'new_folder') {
        const _dashboardTableItems: DashboardDataTableItem[] = targetDashboardItems.map((d) => ({
            type: 'DASHBOARD',
            id: d.dashboard_id,
            name: d.name,
            location: folderName.value,
            isFolderSelected: true,
        }));
        return [
            {
                type: 'FOLDER',
                id: '',
                name: folderName.value || '',
            },
            ..._dashboardTableItems,
        ];
    }
    // 2.2. Select Existing Folder
    if (state.selectedFolderStructure === 'select_folder') {
        const _dashboardTableItems: DashboardDataTableItem[] = targetDashboardItems.map((d) => ({
            type: 'DASHBOARD',
            id: d.dashboard_id,
            name: d.name,
            folderId: state.selectedFolderId,
            isFolderSelected: true,
        }));
        const _selectedFolder = folderItems.find((f) => f.folder_id === state.selectedFolderId);
        return [
            {
                type: 'FOLDER',
                id: _selectedFolder?.folder_id || '',
                name: _selectedFolder?.name || '',
            },
            ..._dashboardTableItems,
        ];
    }
    // 2.3. No Parent Folder
    return targetDashboardItems.map((d) => ({
        type: 'DASHBOARD',
        id: d.dashboard_id,
        name: d.name,
    }));
};
const getLocation = (selectedFolder: FolderModel|string|undefined): string => {
    if (!selectedFolder) return '';
    if (typeof selectedFolder === 'string') return selectedFolder; // folder name
    return selectedFolder.name;
};

/* Api */
const dashboardCreateFetcher = (params: DashboardCreateParams, isPrivate?: boolean) => {
    if (isPrivate) {
        return api.privateDashboardAPI.create(params as PrivateDashboardCreateParameters);
    }
    return api.publicDashboardAPI.create(params as PublicDashboardCreateParameters);
};
const listDashboardWidgets = async (dashboardId: string): Promise<WidgetModel[]> => {
    try {
        const isPrivate = dashboardId.startsWith('private');
        const fetcher = isPrivate
            ? privateWidgetAPI.list
            : publicWidgetAPI.list;
        const res = await fetcher({
            dashboard_id: dashboardId,
        });
        return res.results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
const cloneDashboard = async (dashboardId: string, isPrivate?: boolean, folderId?: string) => {
    const _dashboardType = isPrivate ? 'PRIVATE' : 'PUBLIC';
    const _allDashboardItems = [...privateDashboardList.value, ...publicDashboardList.value];
    const _dashboard = _allDashboardItems.find((item) => item.dashboard_id === dashboardId);
    if (!_dashboard) throw new Error('Dashboard not found');

    const _dashboardNameList = getDashboardNameList(_dashboardType);
    const _dashboardWidgets = await listDashboardWidgets(_dashboard.dashboard_id);
    const _createdLayouts = await getSharedDashboardLayouts(_dashboard.layouts, _dashboardWidgets, storeState.costDataSource);
    const _createdDashboardParams: DashboardCreateParams = {
        name: getClonedName(_dashboardNameList, _dashboard.name),
        layouts: _createdLayouts,
        options: _dashboard.options || {},
        labels: _dashboard.labels || [],
        tags: { created_by: storeState.userId },
        folder_id: folderId,
        vars: _dashboard.vars,
        vars_schema: _dashboard.vars_schema,
    };
    if (storeState.isAdminMode) {
        (_createdDashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.DOMAIN;
    } else if (!isPrivate) {
        (_createdDashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.WORKSPACE;
    }

    const createdDashboard = await dashboardCreateFetcher(_createdDashboardParams, isPrivate);
    if (createdDashboard) {
        dashboardTreeControlStore.setNewIdList([
            ...dashboardTreeControlState.newIdList,
            createdDashboard.dashboard_id as string,
        ]);
    }
};
const folderCreateFetcher = (params: FolderCreateParams, isPrivate?: boolean) => {
    if (isPrivate) {
        return api.privateDashboardAPI.create(params as PrivateFolderCreateParameters);
    }
    return api.publicDashboardAPI.create(params as PublicFolderCreateParameters);
};
const createFolder = async (name: string, isPrivate: boolean) => {
    const _existingFolderNameList = isPrivate ? privateFolderList.value.map((d) => d.name) : publicFolderList.value.map((d) => d.name);
    const params: FolderCreateParams = {
        name: getClonedName(_existingFolderNameList, name),
        tags: { created_by: storeState.userId },
    };
    if (!isPrivate) {
        (params as PublicFolderCreateParameters).resource_group = storeState.isAdminMode ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE;
    }
    const createdFolder = await folderCreateFetcher(params, isPrivate);
    return createdFolder?.folder_id;
};

/* Event */
const handleToggleChangeFolderStructure = (value: boolean) => {
    state.changeFolderStructure = value;
    state.privateMap = {};
    state.isNewFolderPrivate = false;
};

const handleCloneConfirm = async () => {
    state.loading = true;
    const _createDashboardPromises: Promise<void>[] = [];

    // 1. Use Existing Folder Structure
    if (!state.changeFolderStructure) {
        await Promise.allSettled(state.modalTableItems.map(async (item) => {
            const _isPrivate = storeState.isWorkspaceMember ? true : state.privateMap[item.id];
            if (item.type === 'FOLDER') {
                const createdFolderId = await createFolder(item.name, _isPrivate);
                if (!createdFolderId) return;
                dashboardTreeControlStore.setNewIdList([...dashboardTreeControlState.newIdList, createdFolderId]);
                const _children = state.modalTableItems.filter((d) => d.folderId === item.id);
                _children.forEach((child) => {
                    _createDashboardPromises.push(cloneDashboard(child.id, _isPrivate, createdFolderId));
                });
            } else if (!item.folderId) {
                _createDashboardPromises.push(cloneDashboard(item.id, _isPrivate));
            } else {
                _createDashboardPromises.push(cloneDashboard(item.id, _isPrivate, item.folderId));
            }
        }));
    } else { // 2. Change Folder Structure
        // 2.1. Create New Folder
        if (state.selectedFolderStructure === 'new_folder') {
            const createdFolderId = await createFolder(folderName.value || '', state.isNewFolderPrivate);
            if (!createdFolderId) return;
            dashboardTreeControlStore.setNewIdList([...dashboardTreeControlState.newIdList, createdFolderId]);
            state.modalTableItems.filter((d) => d.type === 'DASHBOARD').forEach((item) => {
                _createDashboardPromises.push(cloneDashboard(item.id, state.isNewFolderPrivate, createdFolderId));
            });
        }
        // 2.2. Select Existing Folder
        if (state.selectedFolderStructure === 'select_folder') {
            const _isSelectedFolderPrivate: boolean = state.selectedFolderId?.startsWith('private');
            state.modalTableItems.filter((d) => d.type === 'DASHBOARD').forEach((item) => {
                _createDashboardPromises.push(cloneDashboard(item.id, _isSelectedFolderPrivate, state.selectedFolderId));
            });
        }
        // 2.3. No Parent Folder
        if (state.selectedFolderStructure === 'no_folder') {
            state.modalTableItems.filter((d) => d.type === 'DASHBOARD').forEach((item) => {
                _createDashboardPromises.push(cloneDashboard(item.id, state.privateMap[item.id]));
            });
        }
    }
    const _results = await Promise.allSettled(_createDashboardPromises);

    if (_results.every((r) => r.status === 'fulfilled')) {
        showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_S_CLONE_DASHBOARD'), '');
    } else {
        const _failedCount = _results.filter((r) => r.status !== 'fulfilled').length;
        showErrorMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_E_CLONE_DASHBOARD', { count: _failedCount }), '');
    }
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.publicDashboardListQueryKey.value });
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.privateDashboardListQueryKey.value });
    await queryClient.invalidateQueries({ queryKey: folderKeys.publicFolderListQueryKey.value });
    await queryClient.invalidateQueries({ queryKey: folderKeys.privateFolderListQueryKey.value });
    dashboardPageControlStore.reset();
    dashboardTreeControlStore.reset();
    state.proxyVisible = false;
    state.loading = false;
};
const handleChangePrivate = (id: string, value: boolean) => {
    // 1. 'Use Existing Folder Structure' case
    if (!state.changeFolderStructure) {
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
        return;
    }

    // 2.1. Create New Folder
    if (state.changeFolderStructure && state.selectedFolderStructure === 'new_folder') {
        state.isNewFolderPrivate = value;
        state.modalTableItems.forEach((item) => {
            if (item.type === 'DASHBOARD') {
                state.privateMap = {
                    ...state.privateMap,
                    [item.id]: value,
                };
            }
        });
    }
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (!visible) {
        state.privateMap = {};
        state.changeFolderStructure = false;
        state.selectedFolderStructure = 'new_folder';
        state.isNewFolderPrivate = false;
        state.selectedFolderId = undefined;
        initForm();
    }
});
</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
                    size="md"
                    :header-title="$t('DASHBOARDS.ALL_DASHBOARDS.CLONE_DASHBOARD')"
                    :loading="state.loading"
                    :disabled="state.loading || state.disableModalConfirm"
                    :enable-scroll="true"
                    class="dashboard-folder-clone-modal"
                    @confirm="handleCloneConfirm"
    >
        <template #body>
            <div class="change-folder-structure-wrapper">
                <p-field-title inline>
                    <span>{{ $t('DASHBOARDS.ALL_DASHBOARDS.CHANGE_FOLDER_STRUCTURE') }}</span>
                    <template #left>
                        <p-toggle-button :value="state.changeFolderStructure"
                                         @change-toggle="handleToggleChangeFolderStructure"
                        />
                    </template>
                </p-field-title>
                <p-radio-group v-if="state.changeFolderStructure"
                               class="folder-structure-radio-group"
                >
                    <p-radio v-for="(item, idx) in state.folderStructureRadioItems"
                             :key="`folder-structure-${idx}`"
                             v-model="state.selectedFolderStructure"
                             :value="item.name"
                    >
                        {{ item.label }}
                    </p-radio>
                </p-radio-group>
                <template v-if="state.changeFolderStructure">
                    <!-- 1. create new folder -->
                    <p-field-group v-if="state.selectedFolderStructure === 'new_folder'"
                                   :label="$t('DASHBOARDS.ALL_DASHBOARDS.NEW_FOLDER_NAME')"
                                   required
                                   :invalid="invalidState.folderName"
                                   :invalid-text="invalidTexts.folderName"
                                   class="mt-6"
                    >
                        <template #default="{invalid}">
                            <p-text-input :value="folderName"
                                          :placeholder="$t('DASHBOARDS.ALL_DASHBOARDS.ENTER_FOLDER_NAME')"
                                          block
                                          :invalid="invalid"
                                          @update:value="setForm('folderName', $event)"
                            />
                        </template>
                    </p-field-group>
                    <!-- 2. select existing folder -->
                    <p-field-group v-if="state.selectedFolderStructure === 'select_folder'"
                                   :label="$t('DASHBOARDS.ALL_DASHBOARDS.EXISTING_FOLDER')"
                                   required
                                   class="mt-6"
                    >
                        <p-select-dropdown :selected.sync="state.selectedFolderId"
                                           :menu="state.existingFolderMenuItems"
                                           show-select-marker
                                           use-fixed-menu-style
                                           class="w-full"
                        >
                            <template #menu-item--format="{item}">
                                <p-i :name="item.isPrivate ? 'ic_lock-filled' : 'ic_folder'"
                                     width="1rem"
                                     height="1rem"
                                     color="inherit"
                                />
                                {{ item.label }}
                            </template>
                        </p-select-dropdown>
                    </p-field-group>
                </template>
            </div>
            <p-data-table :items="state.modalTableItems"
                          :fields="state.tableFields"
                          :loading="state.loading"
                          class="bundle-item-data-table"
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
                    <div v-if="item.type === 'DASHBOARD'"
                         class="table-column"
                    >
                        <!-- 1. Use Existing Folder Structure -->
                        <template v-if="!state.changeFolderStructure && item.location && item.isFolderSelected">
                            <p-i name="ic_folder"
                                 :color="gray[600]"
                                 width="1rem"
                                 height="1rem"
                            />
                            <span>{{ item.location }}</span>
                        </template>
                        <template v-else>
                            <p-i v-if="state.selectedFolder"
                                 name="ic_folder"
                                 :color="gray[600]"
                                 width="1rem"
                                 height="1rem"
                            />
                            <span>{{ getLocation(state.selectedFolder) }}</span>
                        </template>
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
    .change-folder-structure-wrapper {
        .folder-structure-radio-group {
            padding-left: 2.25rem;
        }
    }
    .bundle-item-data-table {
        margin-top: 1.5rem;
    }
    .table-column {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
}
</style>
