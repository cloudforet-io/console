<script setup lang="ts">
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import DashboardsLSB from '@/services/dashboards/DashboardsLSB.vue';


const dashboardStore = useDashboardStore();
const loadDashboard = async () => {
    await dashboardStore.load();
};
const { callApiWithGrantGuard } = useGrantScopeGuard(['WORKSPACE', 'DOMAIN'], loadDashboard);
callApiWithGrantGuard();

</script>

<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lsbVisible">
            <template #sidebar>
                <dashboards-l-s-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <centered-page-layout v-else-if="$route.meta.centeredLayout"
                              has-nav-bar
        >
            <router-view />
        </centered-page-layout>
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
    </fragment>
</template>
