<template>
    <div class="dashboard-toolset">
        <dashboard-date-range-badge v-show="props.enableDateRange"
                                    :date-range="state.proxyDateRange"
        />
        <dashboard-date-dropdown v-show="props.enableDateRange"
                                 :date-range.sync="state.proxyDateRange"
        />
        <currency-select-dropdown v-show="props.enableCurrency"
                                  :default-currency="DEFAULT_CURRENCY"
                                  :currency.sync="state.proxyCurrency"
        />
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY } from '@/store/modules/display/config';

import { useProxyValue } from '@/common/composables/proxy-state';
import CurrencySelectDropdown from '@/common/modules/dropdown/currency-select-dropdown/CurrencySelectDropdown.vue';

import type { DateRange } from '@/services/dashboards/config';
import DashboardDateDropdown from '@/services/dashboards/modules/dashboard-toolset/DashboardDateDropdown.vue';
import DashboardDateRangeBadge from '@/services/dashboards/modules/dashboard-toolset/DashboardDateRangeBadge.vue';

const DEFAULT_CURRENCY = CURRENCY.USD;

const props = defineProps<{
    enableDateRange?: boolean,
    dateRange: DateRange,
    enableCurrency?: boolean,
    currency: Currency
}>();
const emit = defineEmits<{(e: string, value: string): void}>();

const state = reactive({
    proxyDateRange: useProxyValue('dateRange', props, emit),
    proxyCurrency: useProxyValue('currency', props, emit),
});
</script>

<style scoped>
.dashboard-toolset {
    display: flex;
    align-items: center;
}
</style>
