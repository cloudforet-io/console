<template>
    <div class="dashboard-detail-page">
        <dashboard-card-container />
    </div>
</template>

<script lang="ts">
import DashboardCardContainer from '@/services/dashboards/dashboard-detail/modules/DashboardCardContainer.vue';

export default {
    name: 'DashboardDetailPage',
    components: { DashboardCardContainer },
};
</script>
