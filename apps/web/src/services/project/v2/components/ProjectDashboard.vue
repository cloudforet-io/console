<script lang="ts" setup>
import {
    computed,
} from 'vue';


import type { DashboardModel, DashboardFolderModel } from '@/api-clients/dashboard/_types/dashboard-type';



import { DASHBOARD_SHARED_ENTRY_POINT } from '@/services/dashboard-shared/core/constants/dashboard-shared-constant';
import DashboardDetailLayout from '@/services/dashboard-shared/dashboard-detail/DashboardDetailLayout.vue';
import { useProjectDashboardFolderQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-folder-query';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

interface Props {
    projectId?: string;
    projectGroupId?: string;
    dashboardId: string;
}
const props = defineProps<Props>();

const projectPageModalStore = useProjectPageModalStore();
/* Query */
const {
    dashboardList,
    dashboardSharedList,
} = useProjectDashboardQuery({
    projectGroupId: computed(() => props.projectGroupId),
    projectId: computed(() => props.projectId),
});
const {
    dashboardFolderList,
    dashboardFolderSharedList,
} = useProjectDashboardFolderQuery({
    projectGroupId: computed(() => props.projectGroupId),
    projectId: computed(() => props.projectId),
});


const dashboardItems = computed<Array<DashboardModel>>(() => [...dashboardSharedList.value, ...dashboardList.value]);
const dashboardFolderItems = computed<Array<DashboardFolderModel>>(() => [...dashboardFolderSharedList.value, ...dashboardFolderList.value]);

const handleSelectToolset = (toolsetId: string|undefined) => {
    if (toolsetId === 'edit') projectPageModalStore.openDashboardNameEditModal(props.dashboardId);
    if (toolsetId === 'move') projectPageModalStore.openDashboardChangeFolderModal(props.dashboardId);
    if (toolsetId === 'delete') projectPageModalStore.openDashboardDeleteModal(props.dashboardId);
    if (toolsetId === 'clone') projectPageModalStore.openDashboardCloneModal(props.dashboardId);
};
</script>

<template>
    <div class="project-dashboard">
        <dashboard-detail-layout :dashboard-id="props.dashboardId"
                                 :dashboard-items="dashboardItems"
                                 :folder-items="dashboardFolderItems"
                                 :entry-point="DASHBOARD_SHARED_ENTRY_POINT.PROJECT"
                                 @select-toolset="handleSelectToolset"
        />
    </div>
</template>

