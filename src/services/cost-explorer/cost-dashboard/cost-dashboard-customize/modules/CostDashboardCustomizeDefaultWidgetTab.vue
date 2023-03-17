<template>
    <div class="default-widget-tab">
        <div class="left-area">
            <div v-if="recommendedWidgetList.length > 0"
                 class="widgets-area widgets-all"
            >
                <p-field-title>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.RECOMMENDED_WIDGET') }} ({{ recommendedWidgetList.length }})</p-field-title>
                <ul class="widget-list">
                    <li v-for="(widget, index) in recommendedWidgetList"
                        :key="widget.widget_id"
                        class="widget-card"
                        :class="{'selected' : costDashboardPageState.originSelectedWidget?.widget_id === widget.widget_id}"
                        @click="selectWidget(widget)"
                    >
                        <div class="card-header">
                            <p-radio
                                :selected="widget"
                                :value="costDashboardPageState.originSelectedWidget"
                                @click="selectWidget(widget)"
                            >
                                <span @click="selectWidget(widget)">{{ widgetLabel(widget.widget_id) }}</span>
                            </p-radio>
                        </div>
                        <div class="card-content">
                            <img class="card-image"
                                 :src="widgetCardImageList[index]?.value.default"
                            >
                        </div>
                    </li>
                </ul>
            </div>
            <div class="widgets-area widgets-all">
                <p-field-title>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.ALL') }} ({{ widgetList.length }})</p-field-title>
                <ul class="widget-list">
                    <li v-for="(widget, index) in widgetList"
                        :key="widget.widget_id"
                        class="widget-card"
                        :class="{'selected' : costDashboardPageState.originSelectedWidget?.widget_id === widget.widget_id}"
                        @click="selectWidget(widget)"
                    >
                        <div class="card-header">
                            <p-radio
                                :selected="widget"
                                :value="costDashboardPageState.originSelectedWidget"
                                @click="selectWidget(widget)"
                            >
                                <span @click="selectWidget(widget)">{{ widgetLabel(widget.widget_id) }}</span>
                            </p-radio>
                        </div>
                        <div class="card-content">
                            <img class="card-image"
                                 :src="widgetCardImageList[index]?.value.default"
                            >
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
            <cost-dashboard-customize-widget-config v-if="Object.keys(costDashboardPageState.originSelectedWidget ?? {}).length"
                                                    :editable-widget-option-list="editableWidgetOptionList"
            />
            <default-widget-preview v-if="Object.keys(costDashboardPageState.originSelectedWidget ?? {}).length" />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import { PRadio, PFieldTitle, PTextPagination } from '@spaceone/design-system';

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
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';
import { defaultWidgetMap } from '@/services/cost-explorer/widgets/lib/config';


const PAGE_SIZE = 6;

export default {
    name: 'CostDashboardCustomizeDefaultWidgetTab',
    components: {
        DefaultWidgetPreview,
        CostDashboardCustomizeWidgetConfig,
        PRadio,
        PFieldTitle,
        PTextPagination,
    },

    setup() {
        const costDashboardPageStore = useCostDashboardPageStore();
        const costDashboardPageState = costDashboardPageStore.$state;

        const state = reactive({
            widgetList: [] as WidgetInfo[],
            recommendedWidgetList: computed<WidgetInfo[]>(() => {
                if (costDashboardPageState.layoutOfSpace) return state.widgetList.filter((widget) => widget.options.layout === costDashboardPageState.layoutOfSpace);
                return [];
            }),
            editableWidgetOptionList: computed<EDITABLE_WIDGET_OPTIONS_TYPE[]>(() => {
                const optionList: EDITABLE_WIDGET_OPTIONS_TYPE[] = [];
                if (costDashboardPageState.originSelectedWidget?.options?.group_by) optionList.push(EDITABLE_WIDGET_OPTIONS.GROUP_BY);
                if (costDashboardPageState.originSelectedWidget?.options?.granularity) optionList.push(EDITABLE_WIDGET_OPTIONS.GRANULARITY);
                return optionList;
            }),
            widgetLabel: computed(() => (widgetId) => defaultWidgetMap[widgetId]?.widget_name ?? ''),
            // pagination
            totalCount: 0,
            thisPage: 1,
            allPage: computed(() => Math.ceil(state.totalCount / PAGE_SIZE) || 1),
            widgetCardImageList: [],
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
            costDashboardPageStore.$patch({
                originSelectedWidget: value,
                editedSelectedWidget: value,
            });
        };

        const getWidgetCardImageList = async (): Promise<void> => {
            state.widgetCardImageList = await Promise.allSettled(
                state.widgetList.map((d) => import(`../../../../../assets/images/${getChartTypeImageFileName(d.options.chart_type)}.svg`)),
            );
        };

        (async () => {
            await getWidgets();
            await getWidgetCardImageList();
        })();

        return {
            ...toRefs(state),
            costDashboardPageState,
            defaultWidgetMap,
            selectWidget,
            getWidgets,
            getChartTypeImageFileName,
        };
    },
};
</script>

<style lang="postcss" scoped>
.left-area {
    @apply overflow-auto flex flex-col flex-grow flex-shrink border-r border-gray-200;
    height: inherit;
    .widgets-area {
        + .widgets-area {
            @apply mt-4 border-t border-gray-200;
        }
        .p-field-title {
            @apply mt-6 mb-2;
        }
    }
    .widget-list {
        @apply grid grid-cols-3 gap-2 pr-8;
        .widget-card {
            @apply flex flex-col overflow-hidden border border-gray-300 rounded-md cursor-pointer;
            max-width: 20rem;
            min-height: 7.1875rem;

            &.selected {
                @apply border border-blue-600;
            }
            .card-header {
                @apply flex items-center pl-4 pr-4 flex-grow;
                min-height: 3.125rem;

                /* custom design-system component - p-radio */
                :deep(.p-radio) {
                    @apply flex items-center;
                    .radio-icon {
                        @apply flex-shrink-0 mr-2;
                    }
                }
            }
            .card-content {
                @apply flex justify-center items-center bg-gray-100;
                min-height: 4rem;
            }
        }
    }
    .text-pagination {
        @apply flex justify-center w-full mt-6 mb-6;
    }
}
.right-area {
    @apply overflow-auto flex-shrink-0 ml-8;
    width: 16.5rem;
    height: inherit;
    .cost-dashboard-customize-widget-config {
        @apply mt-6;
    }
}
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
