<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PDataTable, PI, PButtonModal, PRadioGroup, PRadio, PFieldGroup,
} from '@cloudforet/mirinae';
import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
// import { useDashboardStore } from '@/store/dashboard/dashboard-store';
// import { useAllReferenceStore } from '@/store/reference/all-reference-store';

// import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

// import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { useDashboardMainPageStore } from '@/services/dashboards/stores/dashboard-main-page-store';
import type { DashboardTreeDataType, DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';



const DELETE_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'location', label: 'Location' },
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
// const allReferenceStore = useAllReferenceStore();
// const dashboardStore = useDashboardStore();
const dashboardMainPageStore = useDashboardMainPageStore();
const dashboardMainPageState = dashboardMainPageStore.state;
const dashboardMainPageGetters = dashboardMainPageStore.getters;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    selectedTreeData: computed<TreeNode<DashboardTreeDataType>|undefined>(() => {
        const _selectedFolderId = dashboardMainPageState.selectedFolderId;
        if (!_selectedFolderId) return undefined;
        return dashboardMainPageGetters.publicDashboardTreeData.find((d) => d.data.id === _selectedFolderId);
    }),
    needToShare: computed<boolean>(() => !state.selectedTreeData?.data?.shared),
    modalTableItems: computed<DashboardDataTableItem[]>(() => getModalTableItems(state.selectedTreeData)),
    headerTitle: computed(() => {
        if (storeState.isAdminMode) {
            if (state.needToShare) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.SHARE_DASHBOARD');
            return i18n.t('DASHBOARDS.ALL_DASHBOARDS.UNSHARE_DASHBOARD');
        }

        if (state.needToShare) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.SHARE_DASHBOARD_TO_ALL_PROJECTS');
        return i18n.t('DASHBOARDS.ALL_DASHBOARDS.UNSHARE_DASHBOARD_FROM_ALL_PROJECTS');
    }),
    radioMenuList: computed<MenuItem[]>(() => ([
        { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALL_WORKSPACES'), name: 'WORKSPACE' },
        { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALL_PROJECTS'), name: 'PROJECT' },
    ])),
    selectedTarget: 'WORKSPACE' as 'WORKSPACE' | 'PROJECT',
});

/* Util */
const getModalTableItems = (selectedTreeData: TreeNode<DashboardTreeDataType>): DashboardDataTableItem[] => {
    if (!selectedTreeData) return [];
    const _tableItems: DashboardDataTableItem[] = [];

    // set folder
    _tableItems.push({
        id: selectedTreeData.data.id,
        name: selectedTreeData.data.name,
        type: 'FOLDER',
    });
    // set children dashboards
    selectedTreeData.children?.forEach((child) => {
        _tableItems.push({
            id: child.data.id,
            name: child.data.name,
            location: selectedTreeData.data.name,
            type: 'DASHBOARD',
            isFolderSelected: true,
        });
    });
    return _tableItems;
};

/* Api */
// const shareFolder = async (folderId: string) => {
//     // share
// };
// const shareDashboard = async (dashboardId: string) => {
//     // share dashboard
// };

/* Event */
const handleConfirm = async () => {
    if (!state.selectedTreeData) return;
    state.loading = true;
    // const _promises: Promise<void>[] = [];

    // share folder
    // await shareFolder(state.selectedTreeData.data.id);

    // share dashboards
    // await Promise.allSettled(state.selectedTreeData.children?.forEach((child) => {
    //     _promises.push(shareDashboard(child.data.id));
    // }));
    // const _results = await Promise.allSettled(_promises);

    // if (_results.every((r) => r.status === 'fulfilled')) {
    //     showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_S_SHARE_DASHBOARD'), '');
    // } else {
    //     const _failedCount = _results.map((r) => r.status !== 'fulfilled').length;
    //     ErrorHandler.handleRequestError(new Error('Share failed'), i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_E_SHARE_DASHBOARD', { count: _failedCount }));
    // }
    // await dashboardStore.load();
    // dashboardMainPageStore.setSelectedIdMap({}, dashboardMainPageState.folderModalType);
    state.loading = false;
    state.proxyVisible = false;
};
const handleChangeTarget = (value: 'WORKSPACE' | 'PROJECT') => {
    state.selectedTarget = value;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (!visible) {
        dashboardMainPageStore.reset();
    }
});
</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
                    size="md"
                    :header-title="state.headerTitle"
                    :loading="state.loading"
                    :disabled="state.loading"
                    :enable-scroll="true"
                    class="dashboard-folder-share-modal"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group v-if="storeState.isAdminMode && state.needToShare"
                           :label="$t('DASHBOARDS.ALL_DASHBOARDS.SHARE_TO')"
                           required
                           class="share-to-wrapper"
            >
                <p-radio-group>
                    <p-radio v-for="(item, idx) in state.radioMenuList"
                             :key="`share-to-${idx}`"
                             :value="item.name"
                             :selected="state.selectedTarget"
                             @change="handleChangeTarget"
                    >
                        {{ item.label }}
                    </p-radio>
                </p-radio-group>
            </p-field-group>
            <p-data-table :items="state.modalTableItems"
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
            </p-data-table>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.dashboard-folder-share-modal {
    .share-to-wrapper {
        margin-bottom: 1.5rem;
    }
    .table-column {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
}
</style>
