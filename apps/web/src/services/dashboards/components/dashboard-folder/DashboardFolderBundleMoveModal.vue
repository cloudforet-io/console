<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PI, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import type { DashboardChangeFolderParams } from '@/schema/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/schema/dashboard/_types/folder-type';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useDashboardControlStore } from '@/services/dashboards/stores/dashboard-control-store';


interface Props {
    visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();

const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const dashboardMainPageStore = useDashboardControlStore();
const dashboardMainPageState = dashboardMainPageStore.state;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    selectedIdMap: computed<Record<string, boolean>>(() => {
        if (dashboardMainPageState.folderModalType === 'PUBLIC') {
            return dashboardMainPageState.selectedPublicIdMap;
        }
        return dashboardMainPageState.selectedPrivateIdMap;
    }),
    targetDashboardIdList: computed<string[]>(() => Object.entries(state.selectedIdMap)
        .filter(([, value]) => value)
        .filter(([key]) => key.includes('dash'))
        .map(([key]) => key)),
    availableFolderItems: computed<FolderModel[]>(() => {
        if (dashboardMainPageState.folderModalType === 'PRIVATE') return dashboardState.privateFolderItems;
        if (storeState.isAdminMode) return dashboardState.publicFolderItems;
        return dashboardState.publicFolderItems.filter((d) => !(d.shared && d.workspace_id === '*'));
    }),
    headerTitle: computed<TranslateResult>(() => i18n.t('DASHBOARDS.ALL_DASHBOARDS.MOVE_DASHBOARDS', { count: state.targetDashboardIdList.length })),
    menuItems: computed<SelectDropdownMenuItem[]>(() => {
        const defaultItem = {
            label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.NO_PARENT_FOLDER'),
            name: '',
        };
        if (dashboardMainPageState.folderModalType === 'PUBLIC') {
            return [
                defaultItem,
                ...state.availableFolderItems.map((folder) => ({
                    label: folder.name,
                    name: folder.folder_id,
                })),
            ];
        }
        return [
            defaultItem,
            ...state.availableFolderItems.map((folder) => ({
                label: folder.name,
                name: folder.folder_id,
            })),
        ];
    }),
    selectedItem: '' as string,
});

/* Api */
const updateDashboard = async (dashboardId: string): Promise<boolean> => {
    try {
        const _isPrivate = dashboardId.startsWith('private');
        const fetcher = _isPrivate ? SpaceConnector.clientV2.dashboard.privateDashboard.changeFolder : SpaceConnector.clientV2.dashboard.publicDashboard.changeFolder;
        const params: DashboardChangeFolderParams = {
            dashboard_id: dashboardId,
        };
        if (state.selectedItem) {
            params.folder_id = state.selectedItem;
        }
        await fetcher(params);
        return true;
    } catch (e) {
        return false;
    }
};

/* Event */
const handleFormConfirm = async () => {
    const responses = await Promise.all(state.targetDashboardIdList.map((id) => updateDashboard(id)));
    const successCount = responses.filter((d) => d).length;
    const failCount = responses.length - successCount;
    if (successCount > 0) {
        showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_S_MOVE_DASHBOARD'), '');
    } if (failCount > 0) {
        ErrorHandler.handleRequestError(new Error(''), i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_E_MOVE_DASHBOARD', { count: failCount }));
    }
    await Promise.allSettled([
        dashboardStore.load(),
        dashboardMainPageStore.load(),
    ]);
    dashboardMainPageStore.resetSelectedIdMap(dashboardMainPageState.folderModalType);
    state.proxyVisible = false;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (!visible) {
        dashboardMainPageStore.reset();
        state.selectedItem = '';
    }
});
</script>

<template>
    <p-button-modal
        :header-title="state.headerTitle"
        size="sm"
        fade
        backdrop
        :visible.sync="state.proxyVisible"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <p-field-group :label="$t('DASHBOARDS.ALL_DASHBOARDS.LOCATION')"
                           required
            >
                <p-select-dropdown :selected.sync="state.selectedItem"
                                   :menu="state.menuItems"
                                   block
                                   show-select-marker
                                   use-fixed-menu-style
                                   class="location-dropdown"
                >
                    <template #menu-item--format="{item}">
                        <p-i v-if="item.name"
                             name="ic_folder"
                             width="1rem"
                             height="1rem"
                        />
                        {{ item.label }}
                    </template>
                </p-select-dropdown>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.location-dropdown {
    width: 100%;
}
</style>
