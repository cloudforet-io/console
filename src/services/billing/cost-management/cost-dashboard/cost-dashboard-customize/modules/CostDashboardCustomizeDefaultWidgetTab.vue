<template>
    <div class="default-widget-tab">
        <div class="left-area">
            <div class="widgets-area">
                <p-label>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.RECOMMENDED_WIDGET') }} ({{ widgetList.length }})</p-label>
            </div>
            <div class="widgets-area widgets-all">
                <p-label>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.ALL') }} ({{ widgetList.length }})</p-label>
                <ul class="widget-list">
                    <li v-for="widget in widgetList" :key="widget.widget_id"
                        class="widget-card"
                        :class="{'selected' : selectedWidget.widget_id == widget.widget_id}"
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
                <p-text-pagination :this-page.sync="thisPage"
                                   :all-page="allPage"
                                   @pageChange="getWidgets"
                />
            </div>
        </div>
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
import { PRadio, PLabel, PTextPagination } from '@spaceone/design-system';
import CostDashboardCustomizeWidgetConfig
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetConfig.vue';
import DefaultWidgetPreview
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/DefaultWidgetPreview.vue';
import { store } from '@/store';

const PAGE_SIZE = 6;

export default {
    name: 'CostDashboardCustomizeDefaultWidgetTab',
    components: {
        DefaultWidgetPreview,
        CostDashboardCustomizeWidgetConfig,
        PRadio,
        PLabel,
        PTextPagination,
    },

    setup() {
        const state = reactive({
            widgetList: [] as WidgetInfo[],
            selectedWidget: computed(() => store.state.service?.costDashboard?.originSelectedWidget),
            hasGroupBy: computed(() => state.selectedWidget.options?.group_by?.length > 0),
            widgetLabel: computed(() => widgetId => defaultWidgetMap[widgetId].widget_name ?? ''),
            // pagination
            totalCount: 0,
            thisPage: 1,
            allPage: computed(() => Math.ceil(state.totalCount / PAGE_SIZE) || 1),
        });
        const getWidgets = async () => {
            try {
                const widgets = await import('@/services/billing/cost-management/widgets/lib/defaultWidgetList.json');
                state.totalCount = widgets.length;
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
            getWidgets,
        };
    },
};
</script>

<style lang="postcss" scoped>
.widgets-all {
    @apply flex flex-col flex-grow;
    .text-pagination {
        @apply mt-auto;
    }
}
</style>
