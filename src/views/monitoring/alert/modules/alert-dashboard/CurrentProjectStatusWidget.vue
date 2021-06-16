<template>
    <div class="current-project-status-widget">
        <p class="title">
            {{ $t('MONITORING.ALERT.DASHBOARD.CURRENT_PROJECT_STATUS') }}
        </p>
        <div class="chart-wrapper">
            <p-chart-loader :loading="loading">
                <template #loader>
                    <div ref="loaderRef" />
                </template>
                <div ref="chartRef" class="chart" />
            </p-chart-loader>
            <div class="legend-wrapper">
                <p class="legend">
                    <span>Total</span>
                    <span class="count">16</span>
                </p>
                <p class="legend issue">
                    <span class="circle" />
                    <span class="label">Issue</span>
                    <span class="count">3</span>
                </p>
                <p class="legend maintenance">
                    <span class="circle" />
                    <span class="label">Maintenance</span>
                    <span class="count">1</span>
                </p>
                <p class="legend healthy">
                    <span class="circle" />
                    <span class="label">Healthy</span>
                    <span class="count">12</span>
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import { reactive, toRefs, watch } from '@vue/composition-api';

import { PChartLoader } from '@spaceone/design-system';

import {
    violet, green, red, yellow, white, gray,
} from '@/styles/colors';
import config from '@/lib/config';


am4core.useTheme(am4themes_animated);

enum PROJECT_STATUS {
    issue = 'issue',
    maintenance = 'maintenance',
    healthy = 'healthy',
}
interface ChartData {
    status: keyof typeof PROJECT_STATUS;
    count: number;
    color: string;
}

export default {
    name: 'CurrentProjectStatusWidget',
    components: {
        PChartLoader,
    },
    setup() {
        const state = reactive({
            loading: false, // todo true,
            loaderRef: null,
            chartRef: null as HTMLElement | null,
            data: [
                {
                    status: PROJECT_STATUS.issue,
                    count: 3,
                    color: green[500],
                },
                {
                    status: PROJECT_STATUS.maintenance,
                    count: 1,
                    color: red[400],
                },
                {
                    status: PROJECT_STATUS.healthy,
                    count: 12,
                    color: yellow[400],
                },
            ] as ChartData[],
            chart: null as null | any,
            chartRegistry: {},
        });

        /* util */
        const disposeChart = (ctx) => {
            if (state.chartRegistry[ctx]) {
                state.chartRegistry[ctx].dispose();
                delete state.chartRegistry[ctx];
            }
        };
        const drawChart = (ctx, isLoading) => {
            const createChart = () => {
                disposeChart(ctx);
                state.chartRegistry[ctx] = am4core.create(ctx, am4charts.PieChart);
                return state.chartRegistry[ctx];
            };

            const chart = createChart();
            state.chart = chart;
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.responsive.enabled = true;
            chart.innerRadius = am4core.percent(62);

            if (isLoading) {
                chart.data = [{
                    status: 'Dummy',
                    count: 1000,
                    color: violet[200],
                }];
            } else {
                chart.data = state.data;
            }

            const series = chart.series.create();
            series.slices.template.togglable = false;
            series.slices.template.clickable = false;
            series.dataFields.value = 'count';
            series.dataFields.category = 'status';
            series.slices.template.propertyFields.fill = 'color';
            series.slices.template.stroke = am4core.color(white);
            series.slices.template.strokeWidth = 2;
            series.slices.template.strokeOpacity = 1;
            series.slices.template.states.getKey('hover').properties.scale = 1;
            series.tooltip.disabled = true;
            series.ticks.template.disabled = true;
            series.labels.template.text = '';

            const label = new am4core.Label();
            label.parent = series;
            label.horizontalCenter = 'middle';
            label.verticalCenter = 'middle';
            label.fontSize = 20;
            label.fontWeight = 'lighter';
            label.fill = am4core.color(gray[900]);
            if (isLoading) label.text = '';
            label.text = '{values.value.sum}';
        };

        watch([() => state.loading, () => state.loaderRef, () => state.chartRef], ([loading, loaderCtx, chartCtx]) => {
            if (loading && loaderCtx) {
                drawChart(loaderCtx, true);
            } else if (!loading && chartCtx) {
                drawChart(chartCtx, false);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.current-project-status-widget {
    @apply bg-white border border-gray-200 rounded-md;
    padding: 1rem;

    .title {
        @apply text-gray-900;
        font-size: 1rem;
        line-height: 1.6;
        font-weight: bold;
    }

    .chart-wrapper {
        display: flex;
        padding-top: 1rem;

        .chart {
            width: 6rem;
            height: 6rem;
            margin-left: -0.5rem;
        }

        .legend-wrapper {
            width: 100%;
            font-size: 0.875rem;
            .legend {
                line-height: 1.8;
                &.issue {
                    .circle {
                        @apply bg-red-400;
                    }
                    .count {
                        @apply text-red-400;
                    }
                }
                &.maintenance {
                    .circle {
                        @apply bg-yellow-400;
                    }
                }
                &.healthy {
                    .circle {
                        @apply bg-safe;
                    }
                    .count {
                        @apply text-safe;
                    }
                }
                .circle {
                    display: inline-block;
                    width: 0.625rem;
                    height: 0.625rem;
                    border-radius: 50%;
                    margin-right: 0.25rem;
                }
                .label {
                    font-size: 0.75rem;
                }
                .count {
                    float: right;
                }
            }
        }
    }
}
</style>
