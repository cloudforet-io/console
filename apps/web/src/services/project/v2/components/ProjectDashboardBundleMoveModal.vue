<script lang="ts" setup>
import {
    computed, watch,
    ref,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';


import {
    PButtonModal, PFieldGroup, PI, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { DashboardChangeFolderParams } from '@/api-clients/dashboard/_types/dashboard-type';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import { i18n } from '@/translations';


import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useDashboardTreeControlStore } from '@/services/dashboards/stores/dashboard-tree-control-store';
import { useProjectDashboardFolderQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-folder-query';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { useProjectDashboardModalStore } from '@/services/project/v2/stores/Project-dashboard-modal-store';

interface Props {
    projectGroupOrProjectId?: string;
}
const props = defineProps<Props>();

const projectDashboardModalStore = useProjectDashboardModalStore();
const projectDashboardModalState = projectDashboardModalStore.state;
const dashboardTreeControlStore = useDashboardTreeControlStore();
const dashboardTreeControlState = dashboardTreeControlStore.state;
const visible = computed(() => projectDashboardModalState.dashboardBundleMoveModalVisible);
const projectGroupOrProjectId = computed(() => props.projectGroupOrProjectId);
const { projectGroupId, projectId } = useProjectOrGroupId(projectGroupOrProjectId);
const { publicDashboardAPI } = usePublicDashboardApi();


/* Query */
const {
    invalidateAllQueries: invalidateDashboardList,
} = useProjectDashboardQuery({
    projectGroupId,
    projectId,
});
const {
    dashboardFolderList,
} = useProjectDashboardFolderQuery({
    projectGroupId,
    projectId,
});
const selectedIdMap = computed<Record<string, boolean>>(() => dashboardTreeControlState.selectedPublicIdMap);
const targetDashboardIdList = computed<string[]>(() => Object.entries(selectedIdMap.value)
    .filter(([, value]) => value)
    .filter(([key]) => key.includes('dash'))
    .map(([key]) => key));

const menuItems = computed<SelectDropdownMenuItem[]>(() => {
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
});
const headerTitle = computed<TranslateResult>(() => i18n.t('DASHBOARDS.ALL_DASHBOARDS.MOVE_DASHBOARDS', { count: targetDashboardIdList.value.length }));
const selectedItem = ref<string>('');

/* Api */
const updateDashboard = async (dashboardId: string): Promise<boolean> => {
    try {
        const params: DashboardChangeFolderParams = {
            dashboard_id: dashboardId,
        };
        if (selectedItem.value) {
            params.folder_id = selectedItem.value;
        }
        await publicDashboardAPI.changeFolder(params);
        return true;
    } catch (e) {
        return false;
    }
};

/* Event */
const handleFormConfirm = async () => {
    const responses = await Promise.all(targetDashboardIdList.value.map((id) => updateDashboard(id)));
    const successCount = responses.filter((d) => d).length;
    const failCount = responses.length - successCount;
    if (successCount > 0) {
        showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_S_MOVE_DASHBOARD'), '');
    } if (failCount > 0) {
        ErrorHandler.handleRequestError(new Error(''), i18n.t('DASHBOARDS.ALL_DASHBOARDS.ALT_E_MOVE_DASHBOARD', { count: failCount }));
    }
    await invalidateDashboardList();
    dashboardTreeControlStore.reset();
    projectDashboardModalStore.closeDashboardBundleMoveModal();
};

/* Watcher */
watch(visible, (_visible) => {
    if (!_visible) {
        selectedItem.value = '';
    }
});
</script>

<template>
    <p-button-modal
        :header-title="headerTitle"
        size="sm"
        fade
        backdrop
        :visible="visible"
        @confirm="handleFormConfirm"
        @closed="projectDashboardModalStore.resetTarget"
        @cancel="projectDashboardModalStore.closeDashboardBundleMoveModal"
        @close="projectDashboardModalStore.closeDashboardBundleMoveModal"
    >
        <template #body>
            <p-field-group :label="$t('DASHBOARDS.ALL_DASHBOARDS.LOCATION')"
                           required
            >
                <p-select-dropdown :selected.sync="selectedItem"
                                   :menu="menuItems"
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
