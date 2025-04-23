<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PDataTable, PI, PButtonModal, PRadioGroup, PRadio, PFieldGroup,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { useDashboardFolderShareMutation } from '@/services/_shared/dashboard/core/composables/mutations/use-dashboard-folder-share-mutation';
import { useDashboardShareMutation } from '@/services/_shared/dashboard/core/composables/mutations/use-dashboard-share-mutation';
import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import { useDashboardTreeControlStore } from '@/services/dashboards/stores/dashboard-tree-control-store';
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
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardTreeControlStore = useDashboardTreeControlStore();

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
    targetFolderId: computed<string|undefined>(() => props.folderId || state.targetDashboardItem?.folder_id),
    targetFolderItem: computed<PublicFolderModel|undefined>(() => queryState.allFolderItems.find((f) => f.folder_id === state.targetFolderId)),
    targetDashboardItem: computed<PublicDashboardModel|undefined>(() => queryState.allDashboardItems.find((d) => d.dashboard_id === props.dashboardId)),
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
        const _dashboardItems: DashboardDataTableItem[] = queryState.allDashboardItems
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
const shareFolder = () => {
    folderShareMutate({
        folder_id: state.targetFolderId || '',
        scope: storeState.isAdminMode ? state.selectedTarget : 'PROJECT',
    });
};
const unshareFolder = () => {
    folderShareMutate({
        folder_id: state.targetFolderId || '',
    });
};
const shareDashboard = () => {
    dashboardShareMutate({
        dashboard_id: props.dashboardId || '',
        scope: storeState.isAdminMode ? state.selectedTarget : 'PROJECT',
    });
};
const unshareDashboard = () => {
    dashboardShareMutate({
        dashboard_id: props.dashboardId || '',
    });
};

const { mutate: folderShareMutate, isPending: folderLoading } = useDashboardFolderShareMutation({
    isShared: computed(() => state.isShared),
    onSuccess: () => {
        if (state.isShared) showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_SHARE_DASHBOARD'), '');
        else showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_UNSHARE_DASHBOARD'), '');
    },
    onError: (e) => {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    },
    onSettled: () => {
        dashboardPageControlStore.reset();
        dashboardTreeControlStore.reset();
        state.proxyVisible = false;
    },
});


const { mutate: dashboardShareMutate, isPending: dashboardLoading } = useDashboardShareMutation({
    isShared: computed(() => state.isShared),
    onSuccess: () => {
        if (state.isShared) showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_SHARE_DASHBOARD'), '');
        else showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_UNSHARE_DASHBOARD'), '');
    },
    onError: (e) => {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    },
    onSettled: () => {
        dashboardPageControlStore.reset();
        dashboardTreeControlStore.reset();
        state.proxyVisible = false;
    },
});

/* Event */
const handleConfirm = () => {
    if (!state.isShared) {
        if (state.targetFolderId) shareFolder();
        else shareDashboard();
    } else if (state.targetFolderId) {
        unshareFolder();
    } else {
        unshareDashboard();
    }
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
                    :loading="folderLoading || dashboardLoading"
                    :disabled="folderLoading || dashboardLoading"
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
                          :loading="folderLoading || dashboardLoading"
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
