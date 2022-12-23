<template>
    <div class="dashboard-toolset">
        <dashboard-date-range-badge :date-range="state.proxyDateRange" />
        <dashboard-date-dropdown :date-range.sync="state.proxyDateRange" />
        <currency-select-dropdown default-mode />
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { reactive } from 'vue';

import { useProxyValue } from '@/common/composables/proxy-state';
import CurrencySelectDropdown from '@/common/modules/dropdown/currency-select-dropdown/CurrencySelectDropdown.vue';

import type { DateRange } from '@/services/dashboards/config';
import DashboardDateDropdown from '@/services/dashboards/modules/dashboard-toolset/DashboardDateDropdown.vue';
import DashboardDateRangeBadge from '@/services/dashboards/modules/dashboard-toolset/DashboardDateRangeBadge.vue';

export default {
    name: 'DashboardToolset',
    components: {
        CurrencySelectDropdown,
        DashboardDateDropdown,
        DashboardDateRangeBadge,
    },
    props: {
        dateRange: {
            type: Object as PropType<DateRange>,
            default: undefined,
            required: true,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyDateRange: useProxyValue('dateRange', props, emit),
        });

        return {
            state,
        };
    },
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
