<script setup lang="ts">
import { cloneDeep } from 'lodash';

import type { DashboardSettings } from '@/schema/dashboard/_types/dashboard-type';

import DashboardToolsetDateDropdown from '@/services/dashboards/components/DashboardToolsetDateDropdown.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const handleUpdateDateRange = (dateRange: DashboardSettings['date_range']) => {
    const _settings = cloneDeep(dashboardDetailState.settings);
    _settings.date_range.start = dateRange.start;
    _settings.date_range.end = dateRange.end;
    dashboardDetailStore.setSettings(_settings);
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
