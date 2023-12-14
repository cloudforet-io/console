<script setup lang="ts">

import type { DashboardSettings } from '@/schema/dashboard/_types/dashboard-type';

import DashboardToolsetDateDropdown from '@/services/dashboards/components/DashboardToolsetDateDropdown.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';

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

<template>
    <div class="dashboard-toolset">
        <dashboard-toolset-date-dropdown v-show="dashboardDetailState.settings.date_range.enabled"
                                         :date-range="dashboardDetailState.settings.date_range"
                                         @update:date-range="handleUpdateDateRange"
        />
    </div>
</template>

<style scoped>
.dashboard-toolset {
    @apply flex items-center flex-wrap;
}
</style>
