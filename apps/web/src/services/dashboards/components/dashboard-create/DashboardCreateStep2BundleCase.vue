<script lang="ts" setup>
import {
    computed, defineExpose, reactive,
} from 'vue';

import { isEmpty } from 'lodash';

import {
    PDataTable, PI, PToggleButton,
} from '@cloudforet/mirinae';
import { getClonedName } from '@cloudforet/utils';

import { SpaceRouter } from '@/router';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { DashboardCreateParams, DashboardModel } from '@/schema/dashboard/_types/dashboard-type';
import type { PublicDashboardCreateParameters } from '@/schema/dashboard/public-dashboard/api-verbs/create';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { gray } from '@/styles/colors';

import {
    convertTreeDataToDataTableItems,
    getDashboardTreeData,
    getSelectedTreeData,
} from '@/services/dashboards/helpers/dashboard-tree-data-helper';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardControlStore } from '@/services/dashboards/stores/dashboard-control-store';
import { useDashboardCreatePageStore } from '@/services/dashboards/stores/dashboard-create-page-store';
import type { DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';



const TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'location', label: 'Location' },
    { name: 'private', label: 'Make Private' },
];
const { getProperRouteLocation } = useProperRouteLocation();
const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const dashboardGetters = dashboardStore.getters;
const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const dashboardMainPageStore = useDashboardControlStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    loading: false,
    bundleCaseType: computed(() => {
        if (!isEmpty(dashboardCreatePageState.selectedOotbIdMap)) return 'TEMPLATE';
        return 'EXISTING';
    }),
    privateMap: {} as Record<string, boolean>,
    tableFields: computed(() => {
        if (storeState.isAdminMode) return TABLE_FIELDS.filter((f) => f.name !== 'private');
        if (state.bundleCaseType === 'TEMPLATE') return TABLE_FIELDS.filter((f) => f.name !== 'location');
        return TABLE_FIELDS;
    }),
    dataTableItems: computed(() => {
        if (state.bundleCaseType === 'TEMPLATE') return state.ootbItems;
        return state.existingDashboardItems;
    }),
    existingFolderNameList: computed<string[]>(() => {
        const _publicNames = dashboardState.publicFolderItems.map((d) => d.name);
        const _privateNames = dashboardState.privateFolderItems.map((d) => d.name);
        return [..._publicNames, ..._privateNames];
    }),
    // template
    ootbItems: computed<DashboardDataTableItem[]>(() => {
        const _selectedOotbList = dashboardCreatePageState.dashboardTemplates.filter((d) => dashboardCreatePageState.selectedOotbIdMap[d.template_id]);
        return _selectedOotbList.map((d) => ({
            id: d.template_id,
            name: d.name,
            type: 'DASHBOARD',
        }));
    }),
    // existing dashboard
    existingDashboardTreeData: computed(() => getDashboardTreeData(dashboardGetters.allFolderItems, dashboardGetters.allDashboardItems)),
    existingSelectedTreeData: computed(() => getSelectedTreeData(state.existingDashboardTreeData, dashboardCreatePageState.selectedExistingDashboardIdMap)),
    existingDashboardItems: computed<DashboardDataTableItem[]>(() => {
        const _items = convertTreeDataToDataTableItems(state.existingDashboardTreeData, state.existingSelectedTreeData);
        return _items;
    }),
    existingPublicDashboardNameList: computed<string[]>(() => dashboardState.publicDashboardItems.map((d) => d.name)),
    existingPrivateDashboardNameList: computed<string[]>(() => dashboardState.privateDashboardItems.map((d) => d.name)),
});

/* Util */
const addToNewIdList = (id: string) => {
    dashboardMainPageStore.setNewIdList([
        ...dashboardMainPageStore.state.newIdList,
        id,
    ]);
};

/* Api */
const createBundleOotb = async () => {
    const _promises: Promise<DashboardModel>[] = [];
    const _selectedOotbList = dashboardCreatePageState.dashboardTemplates.filter((d) => dashboardCreatePageState.selectedOotbIdMap[d.template_id]);
    await Promise.allSettled(_selectedOotbList.map(async (ootb) => {
        const _isPrivate = state.privateMap[ootb.template_id];
        const _dashboard = ootb.dashboards[0];
        const _existingDashboardNameList = _isPrivate ? state.existingPrivateDashboardNameList : state.existingPublicDashboardNameList;
        const _dashboardParams: DashboardCreateParams = {
            name: getClonedName(_existingDashboardNameList, ootb.name),
            labels: ootb.labels,
            layouts: _dashboard.layouts,
            options: _dashboard.options,
            tags: { created_by: store.state.user.userId },
        };
        if (storeState.isAdminMode) {
            (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.DOMAIN;
        } else if (!_isPrivate) {
            (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.WORKSPACE;
        }
        const _createType = _isPrivate ? 'PRIVATE' : 'PUBLIC';
        _promises.push(dashboardStore.createDashboard(_createType, _dashboardParams));
    }));
    const _results = await Promise.allSettled(_promises);
    // TODO: set new id list
    if (_results.every((r) => r.status === 'fulfilled')) {
        showSuccessMessage(i18n.t('DASHBOARDS.CREATE.ALT_S_CREATE_DASHBOARD'), '');
    } else {
        const _failedCount = _results.map((r) => r.status !== 'fulfilled').length;
        showErrorMessage(i18n.t('DASHBOARDS.CREATE.ALT_E_CREATE_DASHBOARD', { count: _failedCount }), '');
    }
};
const createBundleDashboards = async () => {
    const _promises: Promise<DashboardModel>[] = [];
    await Promise.allSettled(state.existingSelectedTreeData.map(async (node) => {
        const _isPrivate = state.privateMap[node.id];
        if (node.data.type === 'FOLDER') {
            const createdFolderId = await dashboardStore.createFolder(node.data.name, _isPrivate);
            if (!createdFolderId) return;
            addToNewIdList(createdFolderId);
            node.children?.forEach((child) => {
                _promises.push(dashboardStore.cloneDashboard(child.data.id, _isPrivate, createdFolderId));
            });
        } else {
            _promises.push(dashboardStore.cloneDashboard(node.data.id, _isPrivate));
        }
    }));
    const _results = await Promise.allSettled(_promises);
    const _fulfilledResults = _results.filter((r) => r.status === 'fulfilled');
    _fulfilledResults.forEach((v) => addToNewIdList(v.value?.dashboard_id as string));
    if (_results.every((r) => r.status === 'fulfilled')) {
        showSuccessMessage(i18n.t('DASHBOARDS.CREATE.ALT_S_CREATE_DASHBOARD'), '');
    } else {
        showErrorMessage(i18n.t('DASHBOARDS.CREATE.ALT_E_CREATE_DASHBOARD', { count: _fulfilledResults.length }), '');
    }
};

/* Event */
const handleChangePrivate = (id: string, value: boolean) => {
    state.privateMap = {
        ...state.privateMap,
        [id]: value,
    };

    const _isFolder = id.includes('folder');
    if (_isFolder) {
        state.existingSelectedTreeData.find((item) => item.data.id === id)?.children.forEach((child) => {
            state.privateMap = {
                ...state.privateMap,
                [child.data.id]: value,
            };
        });
    }
};
const handleConfirm = async () => {
    dashboardCreatePageStore.setLoading(true);
    const _isOotbSelected = Object.values(dashboardCreatePageState.selectedOotbIdMap).some((v) => v);
    if (_isOotbSelected) {
        await createBundleOotb();
    } else {
        await createBundleDashboards();
    }
    await dashboardStore.load();
    await SpaceRouter.router.push(getProperRouteLocation({
        name: DASHBOARDS_ROUTE._NAME,
    }));
};

/* Expose */
defineExpose({
    handleConfirm,
});
</script>

<template>
    <div class="dashboard-create-step2-bundle-case">
        <p-data-table :items="state.dataTableItems"
                      :fields="state.tableFields"
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
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step2-bundle-case {
    .table-column {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
}
</style>
