<script lang="ts" setup>
import {
    computed,
} from 'vue';


import type { DashboardModel, DashboardFolderModel } from '@/api-clients/dashboard/_types/dashboard-type';



import { DASHBOARD_SHARED_ENTRY_POINT } from '@/services/_shared/dashboard/core/constants/dashboard-shared-constant';
import DashboardDetailLayout from '@/services/_shared/dashboard/dashboard-detail/DashboardDetailLayout.vue';
import { useProjectDashboardFolderQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-folder-query';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';
import { useProjectDashboardModalStore } from '@/services/project/v2/stores/Project-dashboard-modal-store';

interface Props {
    projectId?: string;
    projectGroupId?: string;
    dashboardId: string;
}
const props = defineProps<Props>();

const projectDashboardModalStore = useProjectDashboardModalStore();
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
    if (toolsetId === 'edit') projectDashboardModalStore.openDashboardNameEditModal(props.dashboardId);
    if (toolsetId === 'move') projectDashboardModalStore.openDashboardChangeFolderModal(props.dashboardId);
    if (toolsetId === 'delete') projectDashboardModalStore.openDashboardDeleteModal(props.dashboardId);
    if (toolsetId === 'clone') projectDashboardModalStore.openDashboardCloneModal(props.dashboardId);
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

