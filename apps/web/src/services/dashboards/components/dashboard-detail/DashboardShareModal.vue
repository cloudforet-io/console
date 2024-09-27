<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PDataTable, PFieldGroup, PI, PRadio, PRadioGroup,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { PublicDashboardGetParameters } from '@/schema/dashboard/public-dashboard/api-verbs/get';
import type { PublicDashboardShareParameters } from '@/schema/dashboard/public-dashboard/api-verbs/share';
import type { PublicDashboardUnshareParameters } from '@/schema/dashboard/public-dashboard/api-verbs/unshare';
import type { PublicFolderShareParameters } from '@/schema/dashboard/public-folder/api-verbs/share';
import type { PublicFolderUnshareParameters } from '@/schema/dashboard/public-folder/api-verbs/unshare';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type {
    PublicDashboardReferenceItem,
    PublicDashboardReferenceMap,
} from '@/store/reference/public-dashboard-reference-store';
import type { PublicFolderReferenceItem, PublicFolderReferenceMap } from '@/store/reference/public-folder-reference-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import type { DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';



const TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'location', label: 'Location' },
];
interface Props {
    visible: boolean;
    dashboardId: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
}>();
const appContextStore = useAppContextStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    dashboards: computed<PublicDashboardReferenceMap>(() => allReferenceStore.getters.publicDashboard),
    folders: computed<PublicFolderReferenceMap>(() => allReferenceStore.getters.publicFolder),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    targetDashboardItem: computed<PublicDashboardReferenceItem|undefined>(() => storeState.dashboards[props.dashboardId]),
    targetFolderItem: computed<PublicFolderReferenceItem|undefined>(() => {
        if (!state.hasFolder) return undefined;
        return storeState.folders[state.targetDashboardItem?.data?.folderId || ''];
    }),
    shareToMenuList: computed<MenuItem[]>(() => ([
        { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALL_WORKSPACES'), name: 'WORKSPACE' },
        { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALL_PROJECTS'), name: 'PROJECT' },
    ])),
    selectedShareTo: 'WORKSPACE' as 'WORKSPACE' | 'PROJECT',
    isShared: computed<boolean>(() => !!state.targetDashboardItem?.data?.shared),
    hasFolder: computed<boolean>(() => !!state.targetDashboardItem?.data?.folderId),
    headerTitle: computed(() => {
        // admin
        if (storeState.isAdminMode) {
            if (!state.isShared) {
                if (state.hasFolder) return i18n.t('DASHBOARDS.DETAIL.SHARE_ENTIRE_FOLDER');
                return i18n.t('DASHBOARDS.DETAIL.SHARE_DASHBOARD');
            }
            if (state.targetDashboardItem?.data?.scope === 'WORKSPACE') {
                if (state.hasFolder) return i18n.t('DASHBOARDS.DETAIL.UNSHARE_ENTIRE_FOLDER_FROM_ALL_WORKSPACES');
                return i18n.t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_WORKSPACES');
            }
            if (state.hasFolder) return i18n.t('DASHBOARDS.DETAIL.UNSHARE_ENTIRE_FOLDER_FROM_ALL_PROJECTS');
            return i18n.t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_PROJECTS');
        }
        // workspace owner
        if (!state.isShared) {
            if (state.hasFolder) return i18n.t('DASHBOARDS.DETAIL.SHARE_ENTIRE_FOLDER_TO_ALL_PROJECTS');
            return i18n.t('DASHBOARDS.DETAIL.SHARE_TO_ALL_PROJECTS');
        }
        if (state.hasFolder) return i18n.t('DASHBOARDS.DETAIL.UNSHARE_ENTIRE_FOLDER_FROM_ALL_PROJECTS');
        return i18n.t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_PROJECTS');
    }),
    tableFields: computed<DataTableField[]>(() => {
        if (state.hasFolder) return TABLE_FIELDS;
        return TABLE_FIELDS.filter((f) => f.name !== 'location');
    }),
    tableItems: computed<DashboardDataTableItem[]>(() => {
        if (!state.hasFolder) {
            return [{
                id: state.targetDashboardItem?.key || '',
                name: state.targetDashboardItem?.name || '',
                type: 'DASHBOARD',
            }];
        }
        const _folderName = state.targetFolderItem?.name || '';
        const _folderItems: DashboardDataTableItem[] = [{
            id: state.targetFolderItem?.key || '',
            name: _folderName,
            type: 'FOLDER',
        }];
        const _dashboardItems: DashboardDataTableItem[] = Object.entries(storeState.dashboards)
            .filter(([, d]) => d.data.folderId === state.targetDashboardItem?.data.folderId)
            .map(([, d]) => ({
                id: d.key,
                name: d.name,
                location: _folderName,
                type: 'DASHBOARD',
            }));
        return [..._folderItems, ..._dashboardItems];
    }),
});

/* Api */
const fetchDashboard = async () => {
    try {
        const dashboard = await SpaceConnector.clientV2.dashboard.publicDashboard.get<PublicDashboardGetParameters>({
            dashboard_id: props.dashboardId,
        });
        dashboardDetailStore.setDashboardInfo(dashboard);
    } catch (e: any) {
        ErrorHandler.handleError(e);
    }
};
const shareDashboard = async () => {
    state.loading = true;
    try {
        const updatedDashboard = await SpaceConnector.clientV2.dashboard.publicDashboard.share<PublicDashboardShareParameters>({
            dashboard_id: props.dashboardId,
            scope: storeState.isAdminMode ? state.selectedShareTo : 'PROJECT',
        });
        dashboardDetailStore.setDashboardInfo(updatedDashboard);
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_SHARE_DASHBOARD'), '');
        state.proxyVisible = false;
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const unshareDashboard = async () => {
    state.loading = true;
    try {
        const updatedDashboard = await SpaceConnector.clientV2.dashboard.publicDashboard.unshare<PublicDashboardUnshareParameters>({
            dashboard_id: props.dashboardId,
        });
        dashboardDetailStore.setDashboardInfo(updatedDashboard);
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_UNSHARE_DASHBOARD'), '');
        state.proxyVisible = false;
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const shareFolder = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.dashboard.publicFolder.share<PublicFolderShareParameters>({
            folder_id: state.targetFolderItem?.key || '',
            scope: storeState.isAdminMode ? state.selectedShareTo : 'PROJECT',
        });
        await fetchDashboard();
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
        await fetchDashboard();
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
const handleChangeShareTo = (value: 'WORKSPACE' | 'PROJECT') => {
    state.selectedShareTo = value;
};
const handleConfirm = async () => {
    if (!state.isShared) {
        if (state.hasFolder) await shareFolder();
        else await shareDashboard();
        return;
    }
    if (state.hasFolder) await unshareFolder();
    else await unshareDashboard();
};
</script>

<template>
    <p-button-modal :header-title="state.headerTitle"
                    :visible.sync="state.proxyVisible"
                    :loading="state.loading"
                    class="dashboard-share-modal"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div v-if="state.hasFolder"
                 class="entire-folder-desc"
            >
                <span>
                    <b>{{ $t('DASHBOARDS.DETAIL.SHARE_ENTIRE_FOLDER_DESC_1') }}</b> {{ $t('DASHBOARDS.DETAIL.SHARE_ENTIRE_FOLDER_DESC_2') }}
                </span>
            </div>
            <p-field-group v-if="storeState.isAdminMode && !state.isShared"
                           :label="$t('DASHBOARDS.ALL_DASHBOARDS.SHARE_TO')"
                           required
                           class="share-to-wrapper"
            >
                <p-radio-group>
                    <p-radio v-for="(item, idx) in state.shareToMenuList"
                             :key="`share-to-${idx}`"
                             :value="item.name"
                             :selected="state.selectedShareTo"
                             @change="handleChangeShareTo"
                    >
                        {{ item.label }}
                    </p-radio>
                </p-radio-group>
            </p-field-group>
            <p-data-table :items="state.tableItems"
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
                <template v-if="state.hasFolder"
                          #col-location-format="{item}"
                >
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
.dashboard-share-modal {
    .entire-folder-desc {
        @apply text-paragraph-lg;
        padding-bottom: 1rem;
    }
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
