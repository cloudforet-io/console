<template>
    <div class="dashboard-detail-page">
        <dashboard-widget-frame-container :widget-frame-size-list="WIDGET_FRAME_SIZE_MOCK" />
    </div>
</template>

<script lang="ts">
import DashboardWidgetFrameContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetFrameContainer.vue';

export default {
    name: 'DashboardDetailPage',
    components: { DashboardWidgetFrameContainer },
    setup() {
        const WIDGET_FRAME_SIZE_MOCK = ['MD', 'MD', 'SM', 'MD', 'LG', 'SM'];

        return { WIDGET_FRAME_SIZE_MOCK };
    },
};
</script>
