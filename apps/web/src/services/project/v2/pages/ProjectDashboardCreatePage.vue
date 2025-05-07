<script setup lang="ts">
import {
    computed, toRef,
} from 'vue';

import type { DashboardModel, DashboardFolderModel } from '@/api-clients/dashboard/_types/dashboard-type';



import { DASHBOARD_SHARED_ENTRY_POINT } from '@/services/_shared/dashboard/core/constants/dashboard-shared-constant';
import DashboardCreateLayout from '@/services/_shared/dashboard/dashboard-create/DashboardCreateLayout.vue';
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
    <dashboard-create-layout class="project-dashboard-create-page"
                             :entry-point="DASHBOARD_SHARED_ENTRY_POINT.PROJECT"
                             :dashboard-items="dashboardItems"
                             :folder-items="dashboardFolderItems"
    />
</template>

