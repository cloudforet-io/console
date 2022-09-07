<template>
    <div class="default-widget-tab">
        <div class="left-area">
            <div v-if="recommendedWidgetList.length > 0" class="widgets-area widgets-all">
                <p-label>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.RECOMMENDED_WIDGET') }} ({{ recommendedWidgetList.length }})</p-label>
                <ul class="widget-list">
                    <li v-for="widget in recommendedWidgetList" :key="widget.widget_id"
                        class="widget-card"
                        :class="{'selected' : selectedWidget.widget_id === widget.widget_id}"
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
                            <img class="card-image" :src="require(`@/assets/images/${getChartTypeImageFileName(widget.options.chart_type)}.svg`)">
                        </div>
                    </li>
                </ul>
            </div>
            <div class="widgets-area widgets-all">
                <p-label>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.ALL') }} ({{ widgetList.length }})</p-label>
                <ul class="widget-list">
                    <li v-for="widget in widgetList" :key="widget.widget_id"
                        class="widget-card"
                        :class="{'selected' : selectedWidget.widget_id === widget.widget_id}"
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
                            <img class="card-image" :src="require(`@/assets/images/${getChartTypeImageFileName(widget.options.chart_type)}.svg`)">
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
            <cost-dashboard-customize-widget-config v-if="Object.keys(selectedWidget).length" :selected-widget="selectedWidget"
                                                    :editable-widget-option-list="editableWidgetOptionList"
            />
            <default-widget-preview v-if="Object.keys(selectedWidget).length" :selected-widget="selectedWidget" />
        </div>
    </div>
</template>

<script lang="ts">
import { PRadio, PLabel, PTextPagination } from '@spaceone/design-system';
import { computed, reactive, toRefs } from 'vue';


import CostDashboardCustomizeWidgetConfig
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetConfig.vue';
import DefaultWidgetPreview
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/DefaultWidgetPreview.vue';
import { chartTypeItemMap } from '@/services/cost-explorer/cost-dashboard/lib/config';
import type {
    EDITABLE_WIDGET_OPTIONS_TYPE,
    WidgetInfo, ChartType,
} from '@/services/cost-explorer/cost-dashboard/type';
import {
    EDITABLE_WIDGET_OPTIONS,
} from '@/services/cost-explorer/cost-dashboard/type';
import { costExplorerStore } from '@/services/cost-explorer/store';
import { defaultWidgetMap } from '@/services/cost-explorer/widgets/lib/config';

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
            recommendedWidgetList: computed<WidgetInfo[]>(() => {
                if (state.layoutOfSpace) return state.widgetList.filter(widget => widget.options.layout === state.layoutOfSpace);
                return [];
            }),
            selectedWidget: computed<WidgetInfo>(() => costExplorerStore.state.dashboard.originSelectedWidget),
            editableWidgetOptionList: computed<EDITABLE_WIDGET_OPTIONS_TYPE[]>(() => {
                const optionList: EDITABLE_WIDGET_OPTIONS_TYPE[] = [];
                if (state.selectedWidget?.options?.group_by) optionList.push(EDITABLE_WIDGET_OPTIONS.GROUP_BY);
                if (state.selectedWidget?.options?.granularity) optionList.push(EDITABLE_WIDGET_OPTIONS.GRANULARITY);
                return optionList;
            }),
            widgetLabel: computed(() => widgetId => defaultWidgetMap[widgetId]?.widget_name ?? ''),
            // pagination
            totalCount: 0,
            thisPage: 1,
            allPage: computed(() => Math.ceil(state.totalCount / PAGE_SIZE) || 1),
            layoutOfSpace: computed(() => costExplorerStore.state.dashboard.layoutOfSpace),
        });
        const getWidgets = async () => {
            try {
                const widgets = await import('@/services/cost-explorer/widgets/lib/defaultWidgetList.json');
                state.totalCount = widgets.length;
                state.widgetList = widgets.default;
            } catch (e) {
                throw new Error('Failed to fetch widget list');
            }
        };
        const getChartTypeImageFileName = (chartType: ChartType) => chartTypeItemMap[chartType].imageFileName;

        const selectWidget = (value: WidgetInfo) => {
            costExplorerStore.commit('dashboard/setOriginSelectedWidget', value);
            costExplorerStore.commit('dashboard/setEditedSelectedWidget', value);
        };

        (() => {
            getWidgets();
        })();

        return {
            ...toRefs(state),
            defaultWidgetMap,
            selectWidget,
            getWidgets,
            getChartTypeImageFileName,
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
    .card-image {
        height: 3rem;
        margin: auto;
    }
}
</style>
