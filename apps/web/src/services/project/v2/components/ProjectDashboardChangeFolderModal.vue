<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';


import {
    PButtonModal, PFieldGroup, PI, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { DashboardChangeFolderParams, DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useDashboardChangeFolderMutation } from '@/services/_shared/dashboard/core/composables/mutations/use-dashboard-change-folder-mutation';
import { useProjectDashboardFolderQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-folder-query';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { useProjectDashboardModalStore } from '@/services/project/v2/stores/Project-dashboard-modal-store';

interface Props {
    projectGroupOrProjectId?: string;
}
const props = defineProps<Props>();
const projectDashboardModalStore = useProjectDashboardModalStore();
const visible = computed(() => projectDashboardModalStore.state.dashboardChangeFolderModalVisible);
const dashboardId = computed(() => projectDashboardModalStore.state.targetId);
const projectGroupOrProjectId = computed(() => props.projectGroupOrProjectId);
const { projectGroupId, projectId } = useProjectOrGroupId(projectGroupOrProjectId);


/* Query */
const {
    dashboardFolderList,
    invalidateAllQueries: invalidateDashboardFolderList,
} = useProjectDashboardFolderQuery({
    projectId,
    projectGroupId,
});
const {
    dashboardList,
    invalidateAllQueries: invalidateDashboardList,
} = useProjectDashboardQuery({
    projectId,
    projectGroupId,
});

const currentDashboard = computed<DashboardModel|undefined>(() => dashboardList.value.find((d) => d.dashboard_id === dashboardId.value));


const state = reactive({
    menuItems: computed<SelectDropdownMenuItem[]>(() => {
        const defaultItem = {
            label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.NO_PARENT_FOLDER'),
            name: '',
        };
        return [
            defaultItem,
            ...dashboardFolderList.value.map((folder) => ({
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
        invalidateDashboardFolderList();
        invalidateDashboardList();
    },
    onError: (e) => {
        showErrorMessage(i18n.t('DASHBOARDS.DETAIL.ALT_E_MOVE_DASHBOARD'), e);
    },
    onSettled: () => {
        projectDashboardModalStore.closeDashboardChangeFolderModal();
    },
});

/* Event */
const handleFormConfirm = async () => {
    if (!dashboardId.value) {
        console.error('dashboardId is required');
        return;
    }
    if (state.selectedFolderId === currentDashboard.value?.folder_id) {
        projectDashboardModalStore.closeDashboardChangeFolderModal();
        return;
    }
    const params: DashboardChangeFolderParams = {
        dashboard_id: dashboardId.value,
    };
    if (state.selectedFolderId) {
        params.folder_id = state.selectedFolderId;
    }
    changeFolder(params);
};

/* Watcher */
watch(visible, (_visible) => {
    if (!_visible) {
        state.selectedFolderId = '';
        projectDashboardModalStore.resetTarget();
    } else {
        const _folderId = dashboardFolderList.value.find((d) => d.folder_id === currentDashboard.value?.folder_id)?.folder_id;
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
        :visible="visible"
        @confirm="handleFormConfirm"
        @closed="projectDashboardModalStore.resetTarget"
        @cancel="projectDashboardModalStore.closeDashboardChangeFolderModal"
        @close="projectDashboardModalStore.closeDashboardChangeFolderModal"
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
