<template>
    <div class="dashboard-toolset">
        <dashboard-date-dropdown v-show="dashboardDetailState.settings.date_range.enabled"
                                 :date-range="dashboardDetailState.settings.date_range"
                                 @update:date-range="handleUpdateDateRange"
        />
    </div>
</template>

<script setup lang="ts">

import type { DashboardSettings } from '@/services/dashboards/config';
import DashboardDateDropdown from '@/services/dashboards/shared/dashboard-toolset/DashboardDateDropdown.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const handleUpdateDateRange = (dateRange: DashboardSettings['date_range']) => {
    dashboardDetailStore.$patch((_state) => {
        _state.settings.date_range = {
            ..._state.settings.date_range,
            start: dateRange.start,
            end: dateRange.end,
        };
    });
};

</script>

<style scoped>
.dashboard-toolset {
    @apply flex items-center flex-wrap;
}
</style>
