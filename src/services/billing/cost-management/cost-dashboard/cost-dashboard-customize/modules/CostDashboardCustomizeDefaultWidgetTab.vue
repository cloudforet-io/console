<template>
    <div class="flex">
        <ul class="flex flex-wrap col-gap-2">
            <li v-for="widget in widgetList" :key="widget.widget_id" class="widget-card"
                @click="selectWidget(widget)"
            >
                <div class="card-header">
                    <p-radio
                        :selected="widget" :value="selectedWidget"
                        @click="selectWidget(widget)"
                    >
                        <span @click="selectWidget(widget)">{{ widgetLabel(widget.widget_id) }}</span>
                    </p-radio>
                </div>
                <div class="card-content">
                    {{ widget.options.chart_type }}
                </div>
            </li>
        </ul>
        <div class="right-area">
            <cost-dashboard-customize-widget-config v-if="Object.keys(selectedWidget).length" :selected-widget="selectedWidget" :show-group-by="hasGroupBy" />
            <default-widget-preview v-if="Object.keys(selectedWidget).length" :selected-widget="selectedWidget" />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { defaultWidgetMap } from '@/services/billing/cost-management/widgets/lib/config';
import { PRadio } from '@spaceone/design-system';
import CostDashboardCustomizeWidgetConfig
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetConfig.vue';
import DefaultWidgetPreview
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/DefaultWidgetPreview.vue';
import { store } from '@/store';

export default {
    name: 'CostDashboardCustomizeDefaultWidgetTab',
    components: {
        DefaultWidgetPreview,
        CostDashboardCustomizeWidgetConfig,
        PRadio,
    },

    setup() {
        const state = reactive({
            widgetList: [] as WidgetInfo[],
            selectedWidget: computed(() => store.state.service?.costDashboard?.originSelectedWidget),
            hasGroupBy: computed(() => state.selectedWidget.options?.group_by?.length > 0),
            widgetLabel: computed(() => widgetId => defaultWidgetMap[widgetId].widget_name ?? ''),
        });
        const getWidgets = async () => {
            try {
                const widgets = await import('@/services/billing/cost-management/widgets/lib/defaultWidgetList.json');
                state.widgetList = widgets.default;
            } catch (e) {
                throw new Error('Failed to fetch widget list');
            }
        };

        const selectWidget = (value: WidgetInfo) => {
            store.commit('service/costDashboard/setOriginSelectedWidget', value);
            store.commit('service/costDashboard/setEditedSelectedWidget', value);
        };

        (() => {
            getWidgets();
        })();

        return {
            ...toRefs(state),
            defaultWidgetMap,
            selectWidget,
        };
    },
};
</script>

<style lang="postcss" scoped>
.widget-card {
    @apply border border-gray-300 rounded-md;
    width: 20rem;
    height: 7.1875rem;
    .card-header {
        height: 3.125rem;
    }
    .card-content {
        @apply bg-gray-100;
        height: 4rem;
    }
}
</style>
