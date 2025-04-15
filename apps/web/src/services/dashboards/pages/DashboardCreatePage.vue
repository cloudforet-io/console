<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import type { DashboardModel, DashboardFolderModel } from '@/api-clients/dashboard/_types/dashboard-type';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { DASHBOARD_SHARED_ENTRY_POINT } from '@/services/_shared/dashboard/core/constants/dashboard-shared-constant';
import DashboardCreateLayout from '@/services/_shared/dashboard/dashboard-create/DashboardCreateLayout.vue';
import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';

const appContextStore = useAppContextStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});

/* Query */
const {
    publicDashboardList,
    privateDashboardList,
} = useDashboardQuery();
const {
    publicFolderList,
    privateFolderList,
} = useDashboardFolderQuery();


const dashboardState = reactive({
    publicDashboardItems: computed<Array<DashboardModel>>(() => {
        const _v2DashboardItems = publicDashboardList.value.filter((d) => d.version !== '1.0');
        if (storeState.isAdminMode) return _v2DashboardItems;
        return _v2DashboardItems.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateDashboardItems: computed<Array<DashboardModel>>(() => privateDashboardList.value.filter((d) => d.version !== '1.0')),
    allDashboardItems: computed<Array<DashboardModel>>(() => [...dashboardState.publicDashboardItems, ...dashboardState.privateDashboardItems]),
    publicFolderItems: computed<Array<DashboardFolderModel>>(() => {
        if (storeState.isAdminMode) return publicFolderList.value;
        return publicFolderList.value.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateFolderItems: computed<Array<DashboardFolderModel>>(() => privateFolderList.value),
    allDashboardFolderItems: computed<Array<DashboardFolderModel>>(() => [...dashboardState.publicFolderItems, ...dashboardState.privateFolderItems]),
});

</script>

<template>
    <dashboard-create-layout class="dashboard-create-page"
                             :entry-point="DASHBOARD_SHARED_ENTRY_POINT.DASHBOARDS"
                             :dashboard-items="dashboardState.allDashboardItems"
                             :folder-items="dashboardState.allDashboardFolderItems"
    />
</template>
