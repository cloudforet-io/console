<template>
    <ul>
        <li v-for="widget in widgetList" :key="widget.widget_id">
            {{ widget.options.name }}
        </li>
    </ul>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';
import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';

export default {
    name: 'CostDashboardCustomizeDefaultWidgetList',
    components: {},

    setup() {
        const state = reactive({
            widgetList: [] as WidgetInfo[],
        });
        const getWidgets = async () => {
            try {
                const widgets = await import('@/services/billing/cost-management/widgets/lib/defaultWidgetList.json');
                state.widgetList = widgets.default;
            } catch (e) {
                throw new Error('Failed to fetch widget list');
            }
        };

        (() => {
            getWidgets();
        })();

        return {
            ...toRefs(state),
        };
    },
};
</script>
