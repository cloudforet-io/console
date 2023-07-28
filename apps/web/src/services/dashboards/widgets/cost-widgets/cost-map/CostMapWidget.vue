<template>
    <widget-frame v-bind="widgetFrameProps"
                  @refresh="handleRefresh"
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

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed,
    defineExpose,
    defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';


import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { setTreemapLabelText } from '@/common/composables/amcharts5/tree-map-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    gray, palette, transparent, white,
} from '@/styles/colors';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/_configs/view-config';
import { getRefinedTreemapChartData } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
// eslint-disable-next-line import/no-cycle
import { getWidgetLocationFilters } from '@/services/dashboards/widgets/_helpers/widget-helper';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { CostAnalyzeDataModel, TreemapChartData } from '@/services/dashboards/widgets/type';

const COLOR_FIELD_NAME = 'background_color';
const TEXT_COLOR_FIELD_NAME = 'font_color';

interface CostMapData {
    [groupBy: string]: string | any;
    value: number;
    background_color?: string;
    font_color?: string;
}

const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);

const state = reactive({
    ...toRefs(useWidgetState<CostAnalyzeDataModel['results']>(props)),
    chartData: computed(() => getRefinedTreemapChartData(state.data, state.groupBy, props.allReferenceTypeInfo)),
    dateRange: computed<DateRange>(() => {
        const end = state.settings?.date_range?.end ?? dayjs.utc().format('YYYY-MM');
        const start = state.settings?.date_range?.start ?? dayjs.utc().format('YYYY-MM');
        return { start, end };
    }),
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
        params: {},
        query: {
            granularity: primitiveToQueryString(state.granularity),
            group_by: arrayToQueryString([state.groupBy]),
            period: objectToQueryString(state.dateRange),
            filters: objectToQueryString(getWidgetLocationFilters(state.options.filters)),
        },
    })),
});

const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<TreemapChartData[]> => {
    try {
        apiQueryHelper.setFilters(state.consoleFilters);
        const LIMIT_DATA = props.size === WIDGET_SIZE.md ? 10 : 15;
        const res = await fetchCostAnalyze({
            query: {
                granularity: state.options.granularity,
                start: state.dateRange.start,
                end: state.dateRange.end,
                group_by: [state.groupBy],
                fields: {
                    usd_cost_sum: {
                        key: 'usd_cost',
                        operator: 'sum',
                    },
                },
                sort: [{ key: 'usd_cost_sum', desc: true }],
                page: { limit: LIMIT_DATA },
                ...apiQueryHelper.data,
            },
        });
        if (res) return res.results;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return [];
};

const drawChart = (chartData) => {
    const seriesSettings = {
        valueField: 'usd_cost_sum',
        categoryField: 'value',
        nodePaddingInner: 4,
    };
    const series = chartHelper.createTreeMapSeries(seriesSettings);

    const setColorData = (rawData): CostMapData[] => {
        const themeColorName: WidgetTheme = props.theme || 'violet';
        const results: CostMapData[] = [];

        rawData.forEach((d, idx) => {
            let backgroundColor = palette[themeColorName][200];
            let fontColor;

            switch (true) {
            case [0].includes(idx):
                backgroundColor = palette[themeColorName][700];
                fontColor = white;
                break;
            case [1].includes(idx):
                backgroundColor = palette[themeColorName][500];
                fontColor = gray[900];
                break;
            case [2].includes(idx):
                backgroundColor = palette[themeColorName][400];
                fontColor = gray[900];
                break;
            case [3].includes(idx):
                backgroundColor = palette[themeColorName][300];
                fontColor = gray[900];
                break;
            case [4, 5, 6, 7].includes(idx):
                backgroundColor = palette[themeColorName][300];
                fontColor = transparent;
                break;
            default:
                backgroundColor = palette[themeColorName][200];
                fontColor = transparent;
                break;
            }

            results.push({
                ...d,
                background_color: backgroundColor,
                font_color: fontColor,
            });
        });
        return results;
    };
    chartData[0].children = setColorData(chartData[0].children);
    series.rectangles.template.adapters.add('fill', (fill, target) => target.dataItem?.dataContext?.[COLOR_FIELD_NAME]);

    const tooltip = chartHelper.createTooltip();
    series.set('tooltip', tooltip);
    chartHelper.setTreemapTooltipText(series, tooltip, state.currency, props.currencyRates);

    setTreemapLabelText(series, {
        oversizedBehavior: 'truncate',
    });
    series.labels.template.adapters.add('fill', (fill, target) => target.dataItem?.dataContext?.[TEXT_COLOR_FIELD_NAME]);

    series.data.setAll(chartData);
};

const initWidget = async (data?: TreemapChartData['children']): Promise<TreemapChartData['children']> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (): Promise<TreemapChartData['children']> => {
    await nextTick();
    state.loading = true;
    state.data = await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const handleRefresh = () => {
    refreshWidget();
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    state,
    onCurrencyUpdate: async () => {
        if (!state.data) return;
        chartHelper.refreshRoot();
        await nextTick();
        if (chartHelper.root.value) drawChart(state.chartData);
    },
});

defineExpose<WidgetExpose<TreemapChartData['children']>>({
    initWidget,
    refreshWidget,
});
</script>
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
