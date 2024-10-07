<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDataTable, PI, PButtonModal, PRadioGroup, PRadio, PFieldGroup,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { PublicFolderShareParameters } from '@/schema/dashboard/public-folder/api-verbs/share';
import type { PublicFolderUnshareParameters } from '@/schema/dashboard/public-folder/api-verbs/unshare';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PublicFolderReferenceItem, PublicFolderReferenceMap } from '@/store/reference/public-folder-reference-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { useDashboardMainPageStore } from '@/services/dashboards/stores/dashboard-main-page-store';
import type { DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';



const TABLE_FIELDS = [
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
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const dashboardMainPageStore = useDashboardMainPageStore();
const dashboardMainPageState = dashboardMainPageStore.state;
const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    folders: computed<PublicFolderReferenceMap>(() => allReferenceStore.getters.publicFolder),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    targetFolderItem: computed<PublicFolderReferenceItem|undefined>(() => storeState.folders[dashboardMainPageState.selectedFolderId || '']),
    isShared: computed<boolean>(() => !!state.targetFolderItem?.data?.shared),
    modalTableItems: computed<DashboardDataTableItem[]>(() => {
        const _folderName = state.targetFolderItem?.name || '';
        const _folderItems: DashboardDataTableItem[] = [{
            id: state.targetFolderItem?.key || '',
            name: _folderName,
            type: 'FOLDER',
        }];
        const _dashboardItems: DashboardDataTableItem[] = Object.entries(dashboardGetters.allDashboardItems)
            .filter(([, d]) => d.folder_id === dashboardMainPageState.selectedFolderId)
            .map(([, d]) => ({
                id: d.dashboard_id,
                name: d.name,
                location: _folderName,
                type: 'DASHBOARD',
            }));
        return [..._folderItems, ..._dashboardItems];
    }),
    headerTitle: computed(() => {
        if (storeState.isAdminMode) {
            if (!state.isShared) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.SHARE_DASHBOARD');
            if (state.targetFolderItem?.data?.projectId === '*') return i18n.t('DASHBOARDS.ALL_DASHBOARDS.UNSHARE_DASHBOARD_FROM_ALL_PROJECTS');
            return i18n.t('DASHBOARDS.ALL_DASHBOARDS.UNSHARE_DASHBOARD_FROM_ALL_WORKSPACES');
        }
        if (!state.isShared) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.SHARE_DASHBOARD_TO_ALL_PROJECTS');
        return i18n.t('DASHBOARDS.ALL_DASHBOARDS.UNSHARE_DASHBOARD_FROM_ALL_PROJECTS');
    }),
    radioMenuList: computed<MenuItem[]>(() => ([
        { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALL_WORKSPACES'), name: 'WORKSPACE' },
        { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALL_PROJECTS'), name: 'PROJECT' },
    ])),
    selectedTarget: 'WORKSPACE' as 'WORKSPACE' | 'PROJECT',
});

/* Api */
const shareFolder = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.dashboard.publicFolder.share<PublicFolderShareParameters>({
            folder_id: state.targetFolderItem?.key || '',
            scope: storeState.isAdminMode ? state.selectedTarget : 'PROJECT',
        });
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_SHARE_DASHBOARD'), '');
        state.proxyVisible = false;
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const unshareFolder = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.dashboard.publicFolder.unshare<PublicFolderUnshareParameters>({
            folder_id: state.targetFolderItem?.key || '',
        });
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_UNSHARE_DASHBOARD'), '');
        state.proxyVisible = false;
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleConfirm = async () => {
    if (!state.isShared) await shareFolder();
    else await unshareFolder();
    await dashboardMainPageStore.load();
};
const handleChangeTarget = (value: 'WORKSPACE' | 'PROJECT') => {
    state.selectedTarget = value;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (!visible) {
        dashboardMainPageStore.reset();
        state.selectedTarget = 'WORKSPACE';
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
            <p-field-group v-if="storeState.isAdminMode && !state.isShared"
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
                          :fields="TABLE_FIELDS"
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
