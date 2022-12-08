<template>
    <div class="dashboard-customize-page">
        CUSTOMIZE DASHBOARD
        <dashboard-toolset />
        <dashboard-customize-sidebar />
    </div>
</template>

<script lang="ts">
import DashboardCustomizeSidebar from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizeSidebar.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';

export default {
    name: 'DashboardCustomizePage',
    components: {
        DashboardToolset,
        DashboardCustomizeSidebar,
    },
};
</script>
