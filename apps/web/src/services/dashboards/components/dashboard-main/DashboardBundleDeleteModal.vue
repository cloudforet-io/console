<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PDataTable, PI } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { useDashboardBundleDeleteWorkflow } from '@/services/dashboards/composables/use-dashboard-bundle-delete-workflow';
import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import { getSelectedDataTableItems } from '@/services/dashboards/helpers/dashboard-tree-data-helper';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import { useDashboardTreeControlStore } from '@/services/dashboards/stores/dashboard-tree-control-store';
import type { DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';

/* Cases
* Single Case: If props.folderId exists, delete single folder
* Multiple Case: Otherwise, delete multiple folders (get selected data from dashboardPageControlGetters)
*/
const DELETE_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'location', label: 'Location' },
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
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlState = dashboardPageControlStore.state;
const dashboardTreeControlStore = useDashboardTreeControlStore();
const dashboardTreeControlState = dashboardTreeControlStore.state;

/* Query */
const {
    publicDashboardList,
    privateDashboardList,
} = useDashboardQuery();
const {
    publicFolderList,
    privateFolderList,
} = useDashboardFolderQuery();

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

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});

const state = reactive({
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    modalTableItems: computed<DashboardDataTableItem[]>(() => {
        let _selectedIdMap = dashboardTreeControlState.selectedPublicIdMap;
        // single case
        if (props.folderId) {
            const _childrenIdList = queryState.allDashboardItems.filter((d) => d.folder_id === props.folderId);
            _selectedIdMap = {
                [props.folderId]: true,
                ..._childrenIdList.reduce((acc, d) => ({ ...acc, [d.dashboard_id]: true }), {}),
            };
        } else if (dashboardPageControlState.folderModalType === 'PRIVATE') { // bundle case
            _selectedIdMap = dashboardTreeControlState.selectedPrivateIdMap;
        }
        return getSelectedDataTableItems(queryState.allFolderItems, queryState.allDashboardItems, _selectedIdMap);
    }),
});

/* Api */
const { mutate: deleteBundleFolderOrDashboard, isPending: bundleLoading } = useDashboardBundleDeleteWorkflow();

/* Event */
const handleDeleteConfirm = async () => {
    const bundleItems = state.modalTableItems.map((item) => ({
        id: item.id,
        type: item.type,
    }));
    const _results = await deleteBundleFolderOrDashboard(bundleItems);
    if (_results) {
        showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_S_DELETE_DASHBOARD'), '');
    } else {
        ErrorHandler.handleRequestError(new Error('Delete failed'), i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_E_DELETE_DASHBOARD'));
    }
    dashboardPageControlStore.reset();
    dashboardTreeControlStore.reset();
    state.proxyVisible = false;
};
</script>

<template>
    <delete-modal :visible.sync="state.proxyVisible"
                  size="md"
                  :header-title="$t('DASHBOARDS.ALL_DASHBOARDS.DELETE_DASHBOARD')"
                  :loading="bundleLoading"
                  :disabled="bundleLoading"
                  :enable-scroll="true"
                  :confirm-text="$t('DASHBOARDS.DETAIL.DELETE')"
                  class="dashboard-folder-delete-modal"
                  @confirm="handleDeleteConfirm"
    >
        <template #delete-modal-body>
            <p-data-table :items="state.modalTableItems"
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
