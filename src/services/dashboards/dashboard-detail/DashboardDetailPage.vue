<template>
    <div class="dashboard-detail-page">
        <dashboard-widget-container
            :widget-size-list="WIDGET_SIZE_MOCK"
            :widget-theme-option-list="WIDGET_THEME_OPTION_MOCK"
        />
    </div>
</template>

<script lang="ts">
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';

export default {
    name: 'DashboardDetailPage',
    components: { DashboardWidgetContainer },
    setup() {
        const WIDGET_SIZE_MOCK = ['md', 'md', 'sm', 'md', 'lg', 'sm'];
        const WIDGET_THEME_OPTION_MOCK = [
            { inherit: true, inherit_count: 3 },
            { inherit: true, inherit_count: undefined },
            { inherit: false, inherit_count: undefined },
            { inherit: true, inherit_count: undefined },
            { inherit: true, inherit_count: undefined },
            { inherit: true, inherit_count: undefined },
        ];

        return { WIDGET_SIZE_MOCK, WIDGET_THEME_OPTION_MOCK };
    },
};
</script>
