<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PI, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { DashboardChangeFolderParams } from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { useDashboardChangeFolderMutation } from '@/services/_shared/dashboard/core/composables/mutations/use-dashboard-change-folder-mutation';
import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';


interface Props {
    visible: boolean;
    dashboardId: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    dashboardId: '',
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();
const appContextStore = useAppContextStore();
const dashboardPageControlStore = useDashboardPageControlStore();

/* Query */
const queryClient = useQueryClient();
const {
    keys: dashboardKeys,
} = useDashboardQuery();
const {
    publicFolderList,
    privateFolderList,
    keys: dashboardFolderKeys,
} = useDashboardFolderQuery();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    publicFolderItems: computed(() => {
        if (storeState.isAdminMode) return publicFolderList.value;
        return publicFolderList.value.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateFolderItems: computed(() => privateFolderList.value),
    menuItems: computed<SelectDropdownMenuItem[]>(() => {
        const defaultItem = {
            label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.NO_PARENT_FOLDER'),
            name: '',
        };
        if (props.dashboardId.startsWith('public')) {
            return [
                defaultItem,
                ...state.publicFolderItems.map((folder) => ({
                    label: folder.name,
                    name: folder.folder_id,
                })),
            ];
        }
        return [
            defaultItem,
            ...state.privateFolderItems.map((folder) => ({
                label: folder.name,
                name: folder.folder_id,
            })),
        ];
    }),
    selectedFolderId: '' as string,
});

/* Api */
const { mutate: changeFolder } = useDashboardChangeFolderMutation({
    onSuccess: () => {
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.ALT_S_MOVE_DASHBOARD'), '');
        const isPrivate = props.dashboardId.startsWith('private');
        const dashboardListQueryKey = isPrivate ? dashboardKeys.privateDashboardListQueryKey : dashboardKeys.publicDashboardListQueryKey;
        const dashboardFolderListQueryKey = isPrivate ? dashboardFolderKeys.privateFolderListQueryKey : dashboardFolderKeys.publicFolderListQueryKey;
        queryClient.invalidateQueries({ queryKey: dashboardListQueryKey.value });
        queryClient.invalidateQueries({ queryKey: dashboardFolderListQueryKey.value });
    },
    onError: (e) => {
        showErrorMessage(i18n.t('DASHBOARDS.DETAIL.ALT_E_MOVE_DASHBOARD'), e);
    },
    onSettled: () => {
        state.proxyVisible = false;
    },
});

/* Event */
const handleFormConfirm = async () => {
    const params: DashboardChangeFolderParams = {
        dashboard_id: props.dashboardId,
    };
    if (state.selectedFolderId) {
        params.folder_id = state.selectedFolderId;
    }
    changeFolder(params);
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (!visible) {
        state.selectedFolderId = '';
        dashboardPageControlStore.reset();
    } else {
        const _folderId = [...state.publicFolderItems, ...state.privateFolderItems].find((d) => d.dashboard_id === props.dashboardId)?.folder_id;
        if (_folderId) state.selectedFolderId = _folderId;
    }
}, { immediate: true });
</script>

<template>
    <p-button-modal
        :header-title="$t('DASHBOARDS.DETAIL.MOVE_DASHBOARDS')"
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
                <p-select-dropdown :selected.sync="state.selectedFolderId"
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
