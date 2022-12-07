<template>
    <div class="dashboard-customize-page">
        CUSTOMIZE DASHBOARD
        <dashboard-date-dropdown />
        <currency-select-dropdown default-currency-mode
                                  default-mode
        />
    </div>
</template>

<script lang="ts">
import CurrencySelectDropdown from '@/common/modules/dropdown/currency-select-dropdown/CurrencySelectDropdown.vue';

import DashboardDateDropdown from '@/services/dashboards/modules/dashboard-toolset/DashboardDateDropdown.vue';

export default {
    name: 'DashboardCustomizePage',
    components: { CurrencySelectDropdown, DashboardDateDropdown },
};
</script>
