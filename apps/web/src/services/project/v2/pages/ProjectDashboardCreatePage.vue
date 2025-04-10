<script setup lang="ts">
import {
    computed, toRef,
} from 'vue';

import type { DashboardModel, DashboardFolderModel } from '@/api-clients/dashboard/_types/dashboard-type';



import DashboardCreateBody from '@/services/dashboard-shared/dashboard-create/DashboardCreateBody.vue';
import { useProjectDashboardFolderQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-folder-query';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';

const props = defineProps<{
    projectGroupOrProjectId: string;
}>();

const { projectGroupId, projectId } = useProjectOrGroupId(toRef(props, 'projectGroupOrProjectId'));

/* Query */
const {
    dashboardList,
    dashboardSharedList,
} = useProjectDashboardQuery({
    projectGroupId,
    projectId,
});
const {
    dashboardFolderList,
    dashboardFolderSharedList,
} = useProjectDashboardFolderQuery({
    projectGroupId,
    projectId,
});

const dashboardItems = computed<Array<DashboardModel>>(() => [...dashboardSharedList.value, ...dashboardList.value]);
const dashboardFolderItems = computed<Array<DashboardFolderModel>>(() => [...dashboardFolderSharedList.value, ...dashboardFolderList.value]);

</script>

<template>
    <dashboard-create-body class="project-dashboard-create-page"
                           :dashboard-items="dashboardItems"
                           :folder-items="dashboardFolderItems"
    />
</template>

