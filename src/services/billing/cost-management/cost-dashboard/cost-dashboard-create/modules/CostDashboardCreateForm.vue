<template>
    <p-pane-layout class="cost-dashboard-create-option-list">
        <h2>Template</h2>
        <cost-dashboard-create-with-layout />
        <p-divider class="w-full" />
        <cost-dashboard-create-with-dashboard />
        <cost-dashboard-create-default-filter />
    </p-pane-layout>
</template>

<script lang="ts">
import CostDashboardCreateWithLayout
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateWithLayout.vue';
import CostDashboardCreateWithDashboard
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateWithDashboard.vue';
import CostDashboardCreateDefaultFilter
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateDefaultFilter.vue';
import { PDivider, PPaneLayout } from '@spaceone/design-system';


export default {
    name: 'CostDashboardCreateForm',
    components: {
        CostDashboardCreateDefaultFilter,
        CostDashboardCreateWithDashboard,
        CostDashboardCreateWithLayout,
        PPaneLayout,
        PDivider,
    },

    setup() {
        return {
        };
    },
};
</script>
