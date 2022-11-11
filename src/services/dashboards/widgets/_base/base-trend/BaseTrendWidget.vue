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
    computed,
    defineComponent, onUnmounted, reactive, toRefs, watchEffect,
} from 'vue';

import * as am5 from '@amcharts/amcharts5';
import type { Root } from '@amcharts/amcharts5';
import type { IPieChartSettings } from '@amcharts/amcharts5/.internal/charts/pie/PieChart';
import type { IPieSeriesSettings } from '@amcharts/amcharts5/percent';
import * as am5xy from '@amcharts/amcharts5/xy';
import { PDataLoader } from '@spaceone/design-system';
import { random, range } from 'lodash';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { CHART_TYPE } from '@/common/composables/amcharts5/type';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
}

const DATE_VALUE_FIELD = 'date';

// TODO: sample data
const SAMPLE_XY_CHART_DATA = range(4).map((d) => ({
    date: `2022-${11 + d}`,
    projectA: random(10000, 50000),
    projectB: random(10000, 50000),
    projectC: random(10000, 50000),
}));
const SAMPLE_PIE_CHART_DATA = [
    { category: 'google cloud', value: random(1000, 5000) },
    { category: 'aws', value: random(1000, 5000) },
    { category: 'azure', value: random(1000, 5000) },
    { category: 'alibaba', value: random(1000, 5000) },
];

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
        });

        const {
            root,
            createXYDateChart,
            createPieChart,
            createDonutChart,
            createPieSeries,
            disposeRoot,
        } = useAmcharts5(computed(() => state.chartRef));
        // 여기서 default widget options 랑 merge 해줄 거임
        // option 에 따라 line / stacked chart 나뉨
        // legend 여부

        /* Util */
        const makeLineSeries = (chartRoot, chart, defaultSettings, processor, name, field) => {
            const series = chart.series.push(am5xy.LineSeries.new(chartRoot, {
                ...defaultSettings,
                name,
                valueYField: field,
            }));
            series.data.processor = processor;
            series.strokes.template.setAll({
                strokeWidth: 2,
            });
            series.data.setAll(SAMPLE_XY_CHART_DATA); // TODO: mock data
        };
        const makeStackedColumnSeries = (chartRoot, chart, defaultSettings, processor, name, field) => {
            const series = chart.series.push(am5xy.ColumnSeries.new(chartRoot, {
                ...defaultSettings,
                name,
                valueYField: field,
                stacked: true,
            }));
            series.data.processor = processor;
            series.data.setAll(SAMPLE_XY_CHART_DATA); // TODO: mock data
        };
        const drawXYChart = (chartRoot: Root, chartType: string) => {
            const { chart, xAxis, yAxis } = createXYDateChart(chartRoot);
            const processor = am5.DataProcessor.new(chartRoot, {
                dateFormat: 'yyyy-M', // TODO: will be changed dynamically
                dateFields: [DATE_VALUE_FIELD],
            });
            xAxis.get('baseInterval').timeUnit = 'month';

            const seriesDefaultSettings = {
                xAxis,
                yAxis,
                valueXField: DATE_VALUE_FIELD,
                tooltip: am5.Tooltip.new(chartRoot, {
                    labelText: '{valueY}',
                }),
            };
            if (chartType === 'LINE') {
                state.labels.forEach((label) => {
                    makeLineSeries(chartRoot, chart, seriesDefaultSettings, processor, label, label);
                });
            } else if (chartType === 'STACKED_COLUMN') {
                state.labels.forEach((label) => {
                    makeStackedColumnSeries(chartRoot, chart, seriesDefaultSettings, processor, label, label);
                });
            }
        };
        const drawPieChart = (chartRoot: Root, chartType: string) => {
            const chartSettings: IPieChartSettings = {};
            if (chartType === CHART_TYPE.DONUT) chartSettings.innerRadius = am5.percent(85);
            const { chart } = chartType === CHART_TYPE.DONUT ? createDonutChart(chartRoot) : createPieChart(chartRoot);

            const seriesSettings: IPieSeriesSettings = {
                categoryField: 'category', // TODO: will be changed dynamically
                valueField: 'value', // TODO: will be changed dynamically
            };
            const series = createPieSeries(chartRoot, chart, seriesSettings);
            series.data.setAll(SAMPLE_PIE_CHART_DATA);
        };

        /* Watcher */
        watchEffect(() => {
            if (state.chartRoot) {
                if (['LINE', 'STACKED_COLUMN'].includes(props.chartType)) {
                    drawXYChart(state.chartRoot, props.chartType);
                } else if (['PIE', 'DONUT'].includes(props.chartType)) {
                    drawPieChart(state.chartRoot, props.chartType);
                }
            }
            // request data with period, currency, and filters
        });
        // watch(() => state.data, (data) => {
        // refine data
        // });
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
