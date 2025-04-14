<script setup lang="ts">
import {
    computed,
    defineProps, nextTick, reactive, ref,
} from 'vue';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PDataLoader } from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import { WIDGET_SIZE } from '@/api-clients/dashboard/_constants/widget-constant';
import type { CostDataField } from '@/api-clients/dashboard/_types/widget-type';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import type {
    WidgetExpose, WidgetProps, WidgetEmit,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';

import type {
    AnalyzeRawData, TreemapChartData,
} from './costmap-chart-data-helper';
import {
    getRefinedTreemapChartData,
} from './costmap-chart-data-helper';
import { setThemeColorsToTreemapData } from './costmap-draw-chart-helper';


const COLOR_FIELD_NAME = 'background_color';
const TEXT_COLOR_FIELD_NAME = 'font_color';


const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit);

const state = reactive({
    loading: true,
    data: null as AnalyzeRawData[] | null,
    chartData: computed<TreemapChartData[]>(() => {
        if (!state.data) return [];
        return getRefinedTreemapChartData(state.data, widgetState.parsedDataField as CostDataField, props.allReferenceTypeInfo);
    }),
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<AnalyzeRawData[]|null> => {
    try {
        apiQueryHelper.setFilters(widgetState.consoleFilters);
        const LIMIT_DATA = props.size === WIDGET_SIZE.md ? 10 : 15;
        const { status, response } = await fetchCostAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.granularity,
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                group_by: [widgetState.dataField],
                fields: {
                    value_sum: {
                        key: 'cost',
                        operator: 'sum',
                    },
                },
                sort: [{ key: 'value_sum', desc: true }],
                page: { limit: LIMIT_DATA },
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response.results;
        return state.data;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};


const drawChart = (chartData: TreemapChartData[]) => {
    if (!chartData[0]) return;

    const seriesSettings = {
        valueField: 'value_sum',
        categoryField: 'value',
        nodePaddingInner: 4,
    };
    const series = chartHelper.createTreeMapSeries(seriesSettings);
    chartData[0].children = setThemeColorsToTreemapData(chartData[0].children, props.theme);
    series.rectangles.template.adapters.add('fill', (fill, target) => target.dataItem?.dataContext?.[COLOR_FIELD_NAME]);

    const tooltip = chartHelper.createTooltip();
    series.set('tooltip', tooltip);
    const valueFormatter = (val) => numberFormatter(val, { minimumFractionDigits: 2 }) as string;
    chartHelper.setTreemapTooltipText(series, tooltip, valueFormatter);
    chartHelper.setTreemapLabelText(series, {
        oversizedBehavior: 'truncate',
    });
    series.labels.template.adapters.add('fill', (fill, target) => target.dataItem?.dataContext?.[TEXT_COLOR_FIELD_NAME]);

    series.data.setAll(chartData);
};

const initWidget = async (data?: AnalyzeRawData[]): Promise<AnalyzeRawData[]> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (): Promise<AnalyzeRawData[]> => {
    await nextTick();
    state.loading = true;
    state.data = await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    initWidget,
    refreshWidget,
    props,
    emit,
    widgetState,
    onCurrencyUpdate: async () => {
        if (!state.data) return;
        chartHelper.refreshRoot();
        await nextTick();
        if (chartHelper.root.value) drawChart(state.chartData);
    },
});

defineExpose<WidgetExpose<AnalyzeRawData[]>>({
    initWidget,
    refreshWidget,
});

</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="cost-map">
            <div class="chart-wrapper">
                <p-data-loader class="chart-loader"
                               :loading="props.loading || state.loading"
                               :data="state.data"
                               :loader-backdrop-opacity="1"
                               loader-type="skeleton"
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                </p-data-loader>
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.cost-map {
    padding-bottom: 1.25rem;
}

.chart-wrapper {
    @apply relative;
    width: 100%;
    height: 22.125rem;
    .chart {
        height: 100%;
    }
}

.chart-loader {
    height: 100%;
}
</style>
