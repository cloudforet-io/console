<template>
    <div class="dashboard-detail-page">
        <dashboard-widget-frame-container />
    </div>
</template>

<script lang="ts">
import DashboardWidgetFrameContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetFrameContainer.vue';

export default {
    name: 'DashboardDetailPage',
    components: { DashboardWidgetFrameContainer },
};
</script>
