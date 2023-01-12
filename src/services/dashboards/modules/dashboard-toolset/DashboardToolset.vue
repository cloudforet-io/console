<template>
    <div class="dashboard-toolset">
        <dashboard-date-range-badge v-show="props.dateRange.enabled"
                                    :date-range="state.proxyDateRange"
        />
        <dashboard-date-dropdown v-show="props.dateRange.enabled"
                                 :date-range="state.proxyDateRange"
                                 @update:date-range="handleUpdateDateRange"
        />
        <currency-select-dropdown v-show="props.currency.enabled"
                                  default-currency-mode
                                  :currency="state.proxyCurrency.value"
                                  @update:currency="handleUpdateCurrency"
        />
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { useProxyValue } from '@/common/composables/proxy-state';
import CurrencySelectDropdown from '@/common/modules/dropdown/currency-select-dropdown/CurrencySelectDropdown.vue';

import type { DashboardSettings } from '@/services/dashboards/config';
import DashboardDateDropdown from '@/services/dashboards/modules/dashboard-toolset/DashboardDateDropdown.vue';
import DashboardDateRangeBadge from '@/services/dashboards/modules/dashboard-toolset/DashboardDateRangeBadge.vue';


const props = defineProps<{
    dateRange: DashboardSettings['date_range'];
    currency: DashboardSettings['currency'];
}>();
const emit = defineEmits<{(e: string, value: string): void}>();

const state = reactive({
    proxyDateRange: useProxyValue('dateRange', props, emit),
    proxyCurrency: useProxyValue('currency', props, emit),
});

const handleUpdateDateRange = (dateRange: DashboardSettings['date_range']) => {
    state.proxyDateRange = {
        ...state.proxyDateRange,
        start: dateRange.start,
        end: dateRange.end,
    };
};
const handleUpdateCurrency = (currency: DashboardSettings['currency']) => {
    state.proxyCurrency = {
        ...state.proxyCurrency,
        value: currency,
    };
};
</script>

<style scoped>
.dashboard-toolset {
    display: flex;
    align-items: center;
}
</style>
