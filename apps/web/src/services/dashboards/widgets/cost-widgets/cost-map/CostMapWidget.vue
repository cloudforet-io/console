<script setup lang="ts">
import {
    computed,
    defineExpose,
    defineProps, nextTick, reactive, ref,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import { PDataLoader } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrameNew.vue';
import type {
    WidgetExpose, WidgetProps, WidgetEmit, CostGroupBy,
} from '@/services/dashboards/widgets/_configs/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
// eslint-disable-next-line import/no-cycle
import { getWidgetLocationFilters } from '@/services/dashboards/widgets/_helpers/widget-helper';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';


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

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
        params: {},
        query: {
            granularity: primitiveToQueryString(widgetState.granularity),
            group_by: arrayToQueryString([widgetState.groupBy]),
            period: objectToQueryString(widgetState.dateRange),
            filters: objectToQueryString(getWidgetLocationFilters(widgetState.options.filters)),
        },
    })),
});

const state = reactive({
    loading: true,
    data: null as AnalyzeRawData[] | null,
    chartData: computed<TreemapChartData[]>(() => {
        if (!state.data) return [];
        return getRefinedTreemapChartData(state.data, widgetState.groupBy as CostGroupBy, props.allReferenceTypeInfo);
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
                group_by: [widgetState.groupBy],
                fields: {
                    cost_sum: {
                        key: 'cost',
                        operator: 'sum',
                    },
                },
                sort: [{ key: 'cost_sum', desc: true }],
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
        valueField: 'cost_sum',
        categoryField: 'value',
        nodePaddingInner: 4,
    };
    const series = chartHelper.createTreeMapSeries(seriesSettings);
    chartData[0].children = setThemeColorsToTreemapData(chartData[0].children, props.theme);
    series.rectangles.template.adapters.add('fill', (fill, target) => target.dataItem?.dataContext?.[COLOR_FIELD_NAME]);

    const tooltip = chartHelper.createTooltip();
    series.set('tooltip', tooltip);
    chartHelper.setTreemapTooltipText(series, tooltip, widgetState.currency, props.currencyRates);
    chartHelper.setTreemapLabelText(series, {
        oversizedBehavior: 'truncate',
    });
    series.labels.template.adapters.add('fill', (fill, target) => target.dataItem?.dataContext?.[TEXT_COLOR_FIELD_NAME]);

    series.data.setAll(chartData);
};

const initWidget = async (data?: AnalyzeRawData[]): Promise<AnalyzeRawData[]> => {
    state.loading = true;
    state.data = data ?? await fetchData();
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
                               :loading="state.loading"
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
