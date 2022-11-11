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
import type { IPieSeriesSettings } from '@amcharts/amcharts5/percent';
import type { IXYSeriesSettings } from '@amcharts/amcharts5/xy';
import { PDataLoader } from '@spaceone/design-system';
import { random, range } from 'lodash';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { DATE_VALUE_FIELD } from '@/common/composables/amcharts5/type';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
}

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
            chartSeriesDataProcessor: computed<undefined | am5.DataProcessor>(() => {
                if (!state.chartRoot) return undefined;
                return am5.DataProcessor.new(state.chartRoot, {
                    dateFormat: 'yyyy-M', // TODO: will be changed dynamically
                    dateFields: [DATE_VALUE_FIELD],
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
            disposeRoot,
        } = useAmcharts5(computed(() => state.chartRef));

        /* Util */
        const drawXYChart = (chartRoot: Root, chartType) => {
            const { chart, xAxis, yAxis } = createXYDateChart();
            xAxis.get('baseInterval').timeUnit = 'month'; // TODO: will be changed dynamically

            const seriesDefaultSettings: IXYSeriesSettings = { xAxis, yAxis };
            state.labels.forEach((label) => {
                seriesDefaultSettings.name = label;
                seriesDefaultSettings.valueYField = label;
                const series = chartType === 'LINE'
                    ? createXYLineSeries(chart, seriesDefaultSettings, state.chartSeriesDataProcessor)
                    : createXYStackedColumnSeries(chart, seriesDefaultSettings, state.chartSeriesDataProcessor);
                series.data.setAll(SAMPLE_XY_CHART_DATA); // TODO: mock data
            });
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
