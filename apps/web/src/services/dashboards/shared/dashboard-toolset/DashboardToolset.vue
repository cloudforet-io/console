<template>
    <div class="dashboard-toolset">
        <dashboard-date-range-badge v-show="dashboardDetailState.settings.date_range.enabled"
                                    :date-range="dashboardDetailState.settings.date_range"
        />
        <dashboard-date-dropdown v-show="dashboardDetailState.settings.date_range.enabled"
                                 :date-range="dashboardDetailState.settings.date_range"
                                 @update:date-range="handleUpdateDateRange"
        />
        <currency-select-dropdown v-show="dashboardDetailState.settings.currency.enabled"
                                  default-currency-mode
                                  :currency="dashboardDetailState.settings.currency.value"
                                  @update:currency="handleUpdateCurrency"
        />
    </div>
</template>

<script setup lang="ts">
import type { Currency } from '@/store/modules/settings/type';

import CurrencySelectDropdown from '@/common/modules/dropdown/currency-select-dropdown/CurrencySelectDropdown.vue';

import type { DashboardSettings } from '@/services/dashboards/config';
import DashboardDateDropdown from '@/services/dashboards/shared/dashboard-toolset/DashboardDateDropdown.vue';
import DashboardDateRangeBadge from '@/services/dashboards/shared/dashboard-toolset/DashboardDateRangeBadge.vue';
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
const handleUpdateCurrency = (currency: Currency) => {
    dashboardDetailStore.$patch((_state) => {
        _state.settings.currency = {
            ..._state.settings.currency,
            value: currency,
        };
    });
};
</script>

<style scoped>
.dashboard-toolset {
    @apply flex items-center flex-wrap;
}
</style>
