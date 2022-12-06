<template>
    <div class="dashboard-customize-page">
        CUSTOMIZE DASHBOARD
        <dashboard-date-dropdown />
    </div>
</template>

<script lang="ts">
import DashboardDateDropdown from '@/services/dashboards/modules/dashboard-toolset/DashboardDateDropdown.vue';

export default {
    name: 'DashboardCustomizePage',
    components: { DashboardDateDropdown },
};
</script>
