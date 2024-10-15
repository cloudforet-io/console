<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDataTable, PI, PButtonModal, PRadioGroup, PRadio, PFieldGroup,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { PublicDashboardShareParameters } from '@/schema/dashboard/public-dashboard/api-verbs/share';
import type { PublicDashboardUnshareParameters } from '@/schema/dashboard/public-dashboard/api-verbs/unshare';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { PublicFolderShareParameters } from '@/schema/dashboard/public-folder/api-verbs/share';
import type { PublicFolderUnshareParameters } from '@/schema/dashboard/public-folder/api-verbs/unshare';
import type { PublicFolderModel } from '@/schema/dashboard/public-folder/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import type { DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';



const TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'location', label: 'Location' },
];
interface Props {
    visible?: boolean;
    dashboardId?: string;
    folderId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    dashboardId: undefined,
    folderId: undefined,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void,
}>();
const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlGetters = dashboardPageControlStore.getters;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    targetFolderId: computed<string|undefined>(() => props.folderId || state.targetDashboardItem?.folder_id),
    targetFolderItem: computed<PublicFolderModel|undefined>(() => dashboardPageControlGetters.allFolderItems.find((f) => f.folder_id === state.targetFolderId)),
    targetDashboardItem: computed<PublicDashboardModel|undefined>(() => dashboardPageControlGetters.allDashboardItems.find((d) => d.dashboard_id === props.dashboardId)),
    isShared: computed<boolean>(() => {
        if (props.folderId) return !!state.targetFolderItem?.shared;
        return !!state.targetDashboardItem?.shared;
    }),
    modalTableItems: computed<DashboardDataTableItem[]>(() => {
        // share dashboard case
        if (!state.targetFolderId) {
            return [{
                id: state.targetDashboardItem?.dashboard_id || '',
                name: state.targetDashboardItem?.name || '',
                type: 'DASHBOARD',
            }];
        }

        // share folder case
        const _folderName = state.targetFolderItem?.name || '';
        const _folderItems: DashboardDataTableItem[] = [{
            id: state.targetFolderItem?.folder_id || '',
            name: _folderName,
            type: 'FOLDER',
        }];
        const _dashboardItems: DashboardDataTableItem[] = dashboardPageControlGetters.allDashboardItems
            .filter((d) => d.folder_id === state.targetFolderId)
            .map((d) => ({
                id: d.dashboard_id,
                name: d.name,
                location: _folderName,
                type: 'DASHBOARD',
            }));
        return [..._folderItems, ..._dashboardItems];
    }),
    headerTitle: computed<TranslateResult>(() => {
        // admin
        if (storeState.isAdminMode) {
            if (!state.isShared) {
                if (state.targetFolderId) return i18n.t('DASHBOARDS.DETAIL.SHARE_ENTIRE_FOLDER');
                return i18n.t('DASHBOARDS.DETAIL.SHARE_DASHBOARD');
            }
            if (state.targetDashboardItem?.data?.scope === 'WORKSPACE') {
                if (state.targetFolderId) return i18n.t('DASHBOARDS.DETAIL.UNSHARE_ENTIRE_FOLDER_FROM_ALL_WORKSPACES');
                return i18n.t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_WORKSPACES');
            }
            if (state.targetFolderId) return i18n.t('DASHBOARDS.DETAIL.UNSHARE_ENTIRE_FOLDER_FROM_ALL_PROJECTS');
            return i18n.t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_PROJECTS');
        }
        // workspace owner
        if (!state.isShared) {
            if (state.targetFolderId) return i18n.t('DASHBOARDS.DETAIL.SHARE_ENTIRE_FOLDER_TO_ALL_PROJECTS');
            return i18n.t('DASHBOARDS.DETAIL.SHARE_TO_ALL_PROJECTS');
        }
        if (state.targetFolderId) return i18n.t('DASHBOARDS.DETAIL.UNSHARE_ENTIRE_FOLDER_FROM_ALL_PROJECTS');
        return i18n.t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_PROJECTS');
    }),
    modalDescription: computed<TranslateResult[]|undefined>(() => {
        if (!state.targetFolderId) return undefined;
        if (!state.isShared) {
            return [
                i18n.t('DASHBOARDS.DETAIL.SHARE_ENTIRE_FOLDER_DESC_1'),
                i18n.t('DASHBOARDS.DETAIL.SHARE_ENTIRE_FOLDER_DESC_2'),
            ];
        }
        return [
            i18n.t('DASHBOARDS.DETAIL.UNSHARE_ENTIRE_FOLDER_DESC_1'),
            i18n.t('DASHBOARDS.DETAIL.UNSHARE_ENTIRE_FOLDER_DESC_2'),
        ];
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
            folder_id: state.targetFolderId || '',
            scope: storeState.isAdminMode ? state.selectedTarget : 'PROJECT',
        });
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_SHARE_DASHBOARD'), '');
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
            folder_id: state.targetFolderId || '',
        });
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_UNSHARE_DASHBOARD'), '');
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const shareDashboard = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.dashboard.publicDashboard.share<PublicDashboardShareParameters>({
            dashboard_id: props.dashboardId || '',
            scope: storeState.isAdminMode ? state.selectedTarget : 'PROJECT',
        });
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_SHARE_DASHBOARD'), '');
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
        await SpaceConnector.clientV2.dashboard.publicDashboard.unshare<PublicDashboardUnshareParameters>({
            dashboard_id: props.dashboardId || '',
        });
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_UNSHARE_DASHBOARD'), '');
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleConfirm = async () => {
    if (!state.isShared) {
        if (state.targetFolderId) await shareFolder();
        else await shareDashboard();
    } else if (state.targetFolderId) {
        await unshareFolder();
    } else {
        await unshareDashboard();
    }
    await dashboardStore.load();
    dashboardPageControlStore.reset();
    state.proxyVisible = false;
};
const handleChangeTarget = (value: 'WORKSPACE' | 'PROJECT') => {
    state.selectedTarget = value;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (!visible) {
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
            <div v-if="state.modalDescription"
                 class="entire-folder-desc"
            >
                <span>
                    <b>{{ state.modalDescription[0] }}</b> {{ state.modalDescription[1] }}
                </span>
            </div>
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
