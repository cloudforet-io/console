<template>
    <div class="base-trend-widget">
        <p-data-loader class="chart-wrapper"
                       :loading="loading"
        >
            <div ref="chartRef"
                 class="chart"
            />
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, onUnmounted, reactive, toRef, toRefs, watch,
} from 'vue';

import * as am5 from '@amcharts/amcharts5';
import type { Root } from '@amcharts/amcharts5';
import type { XYSeries } from '@amcharts/amcharts5/.internal/charts/xy/series/XYSeries';
import type { IPieSeriesSettings } from '@amcharts/amcharts5/percent';
import type { IXYSeriesSettings } from '@amcharts/amcharts5/xy';
import { PDataLoader } from '@spaceone/design-system';
import { random, range } from 'lodash';

import {
    setSingleTooltipText,
    setSharedTooltipText, setChartColors,
} from '@/lib/amcharts5/helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { DATE_FIELD_NAME } from '@/common/composables/amcharts5/type';

import { gray, red } from '@/styles/colors';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
}

// TODO: sample data
const SAMPLE_XY_CHART_DATA = range(4).map((d) => ({
    date: `2022-${11 + d}`,
    projectA: 10,
    projectB: 20,
    projectC: 30,
}));
const SAMPLE_PIE_CHART_DATA = [
    { category: 'google cloud', value: random(1000, 5000) },
    { category: 'aws', value: random(1000, 5000) },
    { category: 'azure', value: random(1000, 5000) },
    { category: 'alibaba', value: random(1000, 5000) },
];

const SAMPLE_XY_SINGLE_CHART = range(4).map((d) => ({
    date: `2022-${11 + d}`,
    projectA: random(10000, 50000),
}));

// const SAMPLE_WIDGET_CONFIG: WidgetConfig = {
//     widget_name: 'costTrend',
//     title: 'Cost Trend',
//     labels: [],
//     scopes: ['DOMAIN'],
//     theme: {
//         inherit: true,
//         inherit_count: 5,
//     },
//     sizes: [WIDGET_SIZE.lg, WIDGET_SIZE.full],
//     widget_options_schema: {},
//     base_widget_name: 'BaseTrend',
//     widget_options: {
//         date_range: {
//             start: '',
//             end: '2022-11',
//         },
//         granularity: GRANULARITY.MONTHLY,
//         enable_legends: false,
//         group_by: ['project'],
//         page: {
//             start: 0,
//             limit: 5,
//         },
//     },
// };

export default defineComponent<Props>({
    name: 'BaseTrendWidget',
    components: {
        PDataLoader,
    },
    props: {
        chartType: { // TODO: just for example
            type: String,
            default: 'LINE',
        },
    },
    setup(props) {
        const state = reactive({
            loading: false,
            chartRef: null as HTMLElement | null,
            chartRoot: computed(() => root.value),
            chartData: SAMPLE_XY_CHART_DATA, // TODO: mock data
            timeUnit: 'month', // TODO: mock data
            labels: ['projectA', 'projectB', 'projectC'], // TODO: mock data
            chartSeriesDataProcessor: computed<undefined | am5.DataProcessor>(() => {
                if (!state.chartRoot) return undefined;
                return am5.DataProcessor.new(state.chartRoot, {
                    dateFormat: 'yyyy-M', // TODO: will be changed dynamically
                    dateFields: [DATE_FIELD_NAME],
                });
            }),
        });

        const {
            root,
            createXYDateChart,
            createPieChart,
            createDonutChart,
            createPieSeries,
            createXYLineSeries,
            createXYStackedColumnSeries,
            createXYTooltip,
            disposeRoot,
        } = useAmcharts5(toRef(state, 'chartRef'));

        /* Util */
        const drawXYChart = (chartType) => {
            const { chart, xAxis } = createXYDateChart();
            setChartColors(chart, [red[500], gray[500]]);
            xAxis.get('baseInterval').timeUnit = 'month';

            const seriesDefaultSettings: Partial<IXYSeriesSettings> = {};
            state.labels.forEach((label) => {
                seriesDefaultSettings.name = label;
                seriesDefaultSettings.valueYField = label;
                const series: XYSeries = chartType === 'LINE'
                    ? createXYLineSeries(chart, seriesDefaultSettings)
                    : createXYStackedColumnSeries(chart, seriesDefaultSettings);

                // set processor
                series.data.processor = state.chartSeriesDataProcessor;

                // tooltip
                const tooltip = createXYTooltip(chart);
                setSharedTooltipText(chart, tooltip);
                series.set('tooltip', tooltip);

                // set data
                series.data.setAll(SAMPLE_XY_CHART_DATA); // TODO: mock data
            });
        };
        const drawXYSingleChart = () => {
            const { chart, xAxis, yAxis } = createXYDateChart();

            const seriesDefaultSettings: IXYSeriesSettings = { xAxis, yAxis };
            seriesDefaultSettings.name = 'projectA';
            seriesDefaultSettings.valueYField = 'projectA';
            const series = createXYStackedColumnSeries(chart, seriesDefaultSettings);
            series.data.processor = state.chartSeriesDataProcessor;

            // tooltip
            const tooltip = createXYTooltip(chart);
            setSingleTooltipText(chart, tooltip, 'KRW', { KRW: 1200 });
            series.set('tooltip', tooltip);

            // set data
            series.data.setAll(SAMPLE_XY_SINGLE_CHART); // TODO: mock data
        };
        const drawPieChart = (chartRoot: Root, chartType: string) => {
            const { chart } = chartType === 'DONUT' ? createDonutChart() : createPieChart();

            const seriesSettings: IPieSeriesSettings = {
                categoryField: 'category', // TODO: will be changed dynamically
                valueField: 'value', // TODO: will be changed dynamically
            };
            const series = createPieSeries(chart, seriesSettings);
            series.data.setAll(SAMPLE_PIE_CHART_DATA);
        };

        /* Watcher */
        watch(() => state.chartRoot, (chartRoot) => {
            if (chartRoot) {
                if (['LINE', 'STACKED_COLUMN'].includes(props.chartType)) {
                    drawXYChart(props.chartType);
                } else if (['PIE', 'DONUT'].includes(props.chartType)) {
                    drawPieChart(chartRoot, props.chartType);
                } else if (props.chartType === 'SINGLE') {
                    drawXYSingleChart();
                }
            }
        });
        onUnmounted(() => disposeRoot());

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.base-trend-widget {
    width: 44rem;
    height: 29rem;
    .chart-wrapper {
        height: 15rem;
        .chart {
            height: 100%;
        }
    }
}
</style>
