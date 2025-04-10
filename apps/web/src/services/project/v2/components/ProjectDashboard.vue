<script lang="ts" setup>
import {
    computed,
} from 'vue';


import type { DashboardModel, DashboardFolderModel } from '@/api-clients/dashboard/_types/dashboard-type';



import DashboardDetailBody from '@/services/dashboard-shared/dashboard-detail/DashboardDetailBody.vue';
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
};
</script>

<template>
    <div class="project-dashboard">
        <dashboard-detail-body :dashboard-id="props.dashboardId"
                               :dashboard-items="dashboardItems"
                               :folder-items="dashboardFolderItems"
                               @select-toolset="handleSelectToolset"
        />
    </div>
</template>

