<template>
    <div class="dashboard-toolset">
        <dashboard-date-range-badge />
        <dashboard-date-dropdown />
        <currency-select-dropdown default-mode />
        <dashboard-refresh-dropdown :filled="false" />
    </div>
</template>

<script setup lang="ts">
import CurrencySelectDropdown from '@/common/modules/dropdown/currency-select-dropdown/CurrencySelectDropdown.vue';

import DashboardDateDropdown from '@/services/dashboards/modules/dashboard-toolset/DashboardDateDropdown.vue';
import DashboardDateRangeBadge from '@/services/dashboards/modules/dashboard-toolset/DashboardDateRangeBadge.vue';
import DashboardRefreshDropdown from '@/services/dashboards/modules/DashboardRefreshDropdown.vue';
</script>

<style scoped>
.dashboard-date-range-badge {
    margin-right: 0.5rem;
}
</style>
