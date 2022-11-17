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
import type { PropType } from 'vue';
import {
    computed, defineComponent, onUnmounted, reactive, toRef, toRefs, watch,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import { random, range } from 'lodash';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { DATE_FIELD_NAME } from '@/common/composables/amcharts5/type';

import type { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/config';
import type { WidgetProps } from '@/services/dashboards/widgets/type';

// TODO: sample data
const SAMPLE_XY_CHART_DATA = range(4).map((d) => ({
    date: `2022-${11 + d}`,
    projectA: random(1000, 5000),
    projectB: random(1000, 5000),
    projectC: random(1000, 5000),
}));
const SAMPLE_PIE_CHART_DATA = [
    { category: 'google cloud', value: random(1000, 5000) },
    { category: 'aws', value: random(1000, 5000) },
    { category: 'azure', value: random(1000, 5000) },
    { category: 'alibaba', value: random(1000, 5000) },
];

// const SAMPLE_XY_SINGLE_CHART = range(4).map((d) => ({
//     date: `2022-${11 + d}`,
//     projectA: random(10000, 50000),
// }));

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

export default defineComponent<WidgetProps>({
    name: 'BaseTrendWidget',
    components: {
        PDataLoader,
    },
    props: {
        chartType: {
            type: String,
            default: undefined,
        },
        widgetName: {
            type: String,
            default: undefined,
        },
        options: {
            type: Object as PropType<WidgetOptions>,
            default: () => ({}),
        },
        inheritOptions: {
            type: Object,
            default: () => ({}),
        },
        dashboardOptions: {
            type: Object,
            default: () => ({}),
        },
        size: {
            type: String,
            default: WIDGET_SIZE.md,
        },
        theme: {
            type: String,
            default: 'violet',
        },
        widgetKey: {
            type: String,
            default: undefined,
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
            createXYLineSeries,
            createXYStackedColumnSeries,
            createTooltip,
            disposeRoot,
            setXYSharedTooltipText,
            createDataProcessor,
            setPieTooltipText,
        } = useAmcharts5(toRef(state, 'chartRef'));

        /* Util */
        const drawXYChart = (chartType) => {
            const { chart, xAxis } = createXYDateChart();
            xAxis.get('baseInterval').timeUnit = 'month';

            state.labels.forEach((label) => {
                const seriesSettings = {
                    name: label,
                    valueYField: label,
                };
                const series = chartType === 'LINE'
                    ? createXYLineSeries(chart, seriesSettings)
                    : createXYStackedColumnSeries(chart, seriesSettings);

                // set data processor
                series.data.processor = createDataProcessor({
                    dateFormat: 'yyyy-M', // TODO will be changed dynamically
                    dateFields: [DATE_FIELD_NAME],
                });

                // tooltip
                const tooltip = createTooltip();
                setXYSharedTooltipText(chart, tooltip, 'KRW', { KRW: 1200 }); // mock currency
                series.set('tooltip', tooltip);

                // set data
                series.data.setAll(SAMPLE_XY_CHART_DATA); // TODO: mock data
            });
        };
        const drawPieChart = (chartType: string) => {
            const chart = chartType === 'DONUT' ? createDonutChart() : createPieChart();

            const seriesSettings = {
                categoryField: 'category', // TODO: will be changed dynamically
                valueField: 'value', // TODO: will be changed dynamically
            };
            const series = createPieSeries(chart, seriesSettings);
            const tooltip = createTooltip();
            setPieTooltipText(series, tooltip, 'KRW', { KRW: 1200 });
            series.slices.template.set('tooltip', tooltip);
            series.data.setAll(SAMPLE_PIE_CHART_DATA);
        };

        /* Watcher */
        watch(() => state.chartRoot, (chartRoot) => {
            if (chartRoot) {
                if (['LINE', 'STACKED_COLUMN'].includes(props.chartType)) {
                    drawXYChart(props.chartType);
                } else if (['PIE', 'DONUT'].includes(props.chartType)) {
                    drawPieChart(props.chartType);
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
