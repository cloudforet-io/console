<template>
    <div class="dashboard-toolset">
        <dashboard-date-range-badge :date-range="state.dateRange" />
        <dashboard-date-dropdown @update:date-range="handleUpdateDateRange" />
        <currency-select-dropdown default-mode />
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import CurrencySelectDropdown from '@/common/modules/dropdown/currency-select-dropdown/CurrencySelectDropdown.vue';

import type { DateRange } from '@/services/dashboards/config';
import DashboardDateDropdown from '@/services/dashboards/modules/dashboard-toolset/DashboardDateDropdown.vue';
import DashboardDateRangeBadge from '@/services/dashboards/modules/dashboard-toolset/DashboardDateRangeBadge.vue';

const emit = defineEmits(['update:date-range']);

const state = reactive({
    dateRange: { start: '', end: '' } as DateRange,
});

const handleUpdateDateRange = (dateRange: DateRange) => {
    state.dateRange = dateRange;
    emit('update:date-range', dateRange);
};
</script>

<style scoped>
.dashboard-toolset {
    display: flex;
    align-items: center;
}

.dashboard-date-range-badge {
    margin-right: 0.5rem;
    height: 1.25rem;
}
</style>
