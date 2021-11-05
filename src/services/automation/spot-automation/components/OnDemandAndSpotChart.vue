<template>
    <section class="on-demand-chart-wrapper"
             :class="chartType"
    >
        <p-chart-loader :loading="loading" class="chart-wrapper">
            <template #loader>
                <div ref="loaderRef" />
            </template>
            <div ref="chartRef" class="chart" />
        </p-chart-loader>

        <div class="summary-wrapper"
             :class="chartType"
        >
            <p class="spot-text">
                {{ data[0].name }} <b>{{ data[0].count }}</b>
                <span v-if="chartType === 'long'"> ({{ Math.round(( data[0].count / totalCount ) * 100) }}%)</span>
            </p>
            <p class="on-demand-text">
                {{ data[1].name }} <b>{{ data[1].count }}</b>
                <span v-if="chartType === 'long'"> ({{ Math.round(( data[1].count / totalCount ) * 100) }}%)</span>
            </p>
        </div>
    </section>
</template>

<script lang="ts">
import {
    defineComponent, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { PChartLoader } from '@spaceone/design-system';
import {
    gray, white, peacock, blue,
} from '@/styles/colors';

import { range } from 'lodash';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';
import config from '@/lib/config';


am4core.useTheme(am4themesAnimated);

export default defineComponent({
    name: 'OnDemandAndSpotChart',
    components: {
        PChartLoader,
    },
    props: {
        chartType: {
            type: String,
            default: 'long',
        },
        spot: {
            type: Number,
            default: 0,
        },
        ondemand: {
            type: Number,
            default: 0,
        },
    },
    setup(props) {
        const state = reactive({
            loading: true,
            skeletons: range(2),
            loaderRef: null,
            chartRef: null as HTMLElement | null,
            chart: null as null | any,
            chartRegistry: {},
            data: [] as unknown,
            totalCount: 0,
        });

        const disposeChart = (ctx) => {
            if (state.chartRegistry[ctx]) {
                state.chartRegistry[ctx].dispose();
                delete state.chartRegistry[ctx];
            }
        };

        const drawChart = (ctx) => {
            const createChart = () => {
                disposeChart(ctx);
                state.chartRegistry[ctx] = am4core.create(ctx, am4charts.PieChart);
                return state.chartRegistry[ctx];
            };
            const chart = createChart();
            state.chart = chart;
            chart.responsive.enabled = true;
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            if (props.chartType === 'long') {
                chart.radius = am4core.percent(50);
                chart.innerRadius = am4core.percent(27);
            }
            if (props.chartType === 'short') {
                chart.radius = am4core.percent(70);
                chart.innerRadius = am4core.percent(47);
            }

            chart.data = state.data;

            const series = chart.series.create();
            series.slices.template.togglable = false;
            series.slices.template.clickable = false;
            series.dataFields.value = 'count';
            series.dataFields.category = 'name';
            series.slices.template.fill = am4core.color(gray[400]);
            series.slices.template.propertyFields.fill = 'color';
            series.slices.template.stroke = am4core.color(white);
            series.slices.template.strokeWidth = 2;
            series.slices.template.strokeOpacity = 1;
            series.tooltip.disabled = true;

            state.chart = chart;
        };

        const getData = async () => {
            state.loading = true;
            state.data = [];
            const colors = [peacock[400], blue[500]];
            try {
                const res = [{
                    name: '스팟',
                    count: props.spot,
                    color: colors[0] || gray[400],
                }, {
                    name: '온디맨드',
                    count: props.ondemand,
                    color: colors[1] || gray[400],
                }];
                state.data = res;
                state.totalCount = res[0].count + res[1].count;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const init = async () => {
            await getData();
        };
        init();

        // draw loader chart or data chart
        watch([() => state.loading, () => state.loaderRef, () => state.chartRef], ([loading, loaderCtx, chartCtx]) => {
            if (loading && loaderCtx) {
                drawChart(loaderCtx);
            } else if (!loading && chartCtx) {
                drawChart(chartCtx);
            }
        }, { immediate: true });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });


        return {
            ...toRefs(state),
        };
    },

});
</script>

<style lang="postcss" scoped>
.on-demand-chart-wrapper {
    @apply flex;
    flex-direction: row;

    .chart-wrapper {
        .chart {
            max-width: 3rem;
            max-height: 3.5rem;
        }
    }

    &.long {
        width: 8.125rem;
        height: 2.25rem;
        .chart {
            margin-top: -1rem;
            margin-left: -0.8rem;
            div {
                left: 0.125rem;
                top: -0.5rem;
            }
        }
    }
    &.short {
        @apply bg-blue-100;
        border-radius: 6.25rem;
        width: 8rem;
        height: 3.5rem;
    }
}

.summary-wrapper {
    &.long {
        margin-top: 0;
        margin-left: -0.2rem;

        .spot-text {
            @apply text-peacock-500;
            font-size: 0.625rem;
            line-height: 100%;
            margin-bottom: 0.25rem;
        }

        .on-demand-text {
            @apply text-blue-500;
            font-size: 0.625rem;
            line-height: 100%;
        }
    }

    &.short {
        margin-top: 0.5rem;

        .spot-text {
            @apply text-peacock-500;
            font-size: 0.75rem;
            line-height: 160%;
        }

        .on-demand-text {
            @apply text-blue-500;
            font-size: 0.75rem;
            line-height: 160%;
        }
    }
}
</style>
