<script lang="ts" setup>
import {
    computed,
} from 'vue';

import { PSkeleton } from '@cloudforet/mirinae';

import type { DashboardModel, DashboardFolderModel } from '@/api-clients/dashboard/_types/dashboard-type';

import BetaMark from '@/common/components/marks/BetaMark.vue';

import DashboardLabelsButton from '@/services/dashboard-shared/dashboard-detail/components/DashboardLabelsButton.vue';
import DashboardDetailBody from '@/services/dashboard-shared/dashboard-detail/DashboardDetailBody.vue';
import { useProjectDashboardFolderQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-folder-query';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';

interface Props {
    projectId?: string;
    projectGroupId?: string;
    dashboardId: string;
}
const props = defineProps<Props>();


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
const currentDashboard = computed<DashboardModel|undefined>(() => dashboardItems.value.find((d) => d.dashboard_id === props.dashboardId));

</script>

<template>
    <div>
        <div>
            <div class="flex items-center py-6 px-4">
                <p-skeleton v-if="!currentDashboard?.name"
                            width="20rem"
                            height="1.5rem"
                />
                <div v-else
                     class="flex"
                >
                    <p class="text-label-xl font-bold text-gray-800">
                        {{ currentDashboard?.name }}
                    </p>
                    <beta-mark />
                </div>
                <dashboard-labels-button class="ml-4"
                                         :dashboard-id="props.dashboardId"
                />
            </div>
            <dashboard-detail-body :dashboard-id="props.dashboardId"
                                   :dashboard-items="dashboardItems"
                                   :folder-items="dashboardFolderItems"
            />
        </div>
    </div>
</template>

