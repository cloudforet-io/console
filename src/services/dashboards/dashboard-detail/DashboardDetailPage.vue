<template>
    <div class="dashboard-detail-page">
        <dashboard-widget-container :widget-size-list="WIDGET_SIZE_MOCK" />
    </div>
</template>

<script lang="ts">
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';

export default {
    name: 'DashboardDetailPage',
    components: { DashboardWidgetContainer },
    setup() {
        const WIDGET_SIZE_MOCK = ['MD', 'MD', 'SM', 'MD', 'LG', 'SM'];

        return { WIDGET_SIZE_MOCK };
    },
};
</script>
