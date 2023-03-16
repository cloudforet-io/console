<template>
    <div class="p-metric-chart">
        <div class="chart-title-wrapper">
            <p-tooltip
                :contents="title"
            >
                <span class="chart-title">{{ title }}</span>
            </p-tooltip>
            <span class="chart-unit ">&nbsp; {{ unit.y ? `(${unit.y})` : '' }}</span>
            <p-spinner v-if="loading && chart" />
        </div>
        <p-data-loader :loading="loading && !chart"
                       :data="data"
                       class="chart-wrapper"
        >
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef"
                 class="chart"
            />
            <transition name="fade-in">
                <div v-if="error"
                     class="shade"
                >
                    <span>{{ $t('COMMON.COMPONENTS.METRIC_CHART.UNAVAILABLE') }}</span>
                </div>
            </transition>
            <template #no-data>
                <span class="no-data-text">
                    {{ $t('COMMON.COMPONENTS.METRIC_CHART.NO_DATA') }}
                </span>
            </template>
        </p-data-loader>
        <transition name="fade">
            <div class="tooltip-wrapper"
                 :class="{ 'tooltip-visible': visibleTooltip }"
            >
                <p class="date">
                    {{ tooltip.date }}
                </p>
                <table class="legend-table">
                    <tr v-for="legend in tooltip.legends"
                        :key="legend.serverId"
                        class="legend"
                    >
                        <td>
                            <span class="circle"
                                  :style="{ 'background-color': legend.color }"
                            />
                            <span class="count">{{ legend.count ? commaFormatter(numberFormatter(legend.count)) : 0 }}</span>
                        </td>
                        <td>
                            <p v-if="legend.serverName">
                                {{ legend.serverName }}
                            </p>
                            <p class="server-id-text">
                                {{ legend.serverId }}
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">

import {
    defineComponent, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { PropType } from 'vue';

import * as am4charts from '@amcharts/amcharts4/charts';
import type { XYChart } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import {
    PDataLoader, PSkeleton, PSpinner, PTooltip,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { get } from 'lodash';

import { commaFormatter, numberFormatter } from '@cloudforet/core-lib';

import config from '@/lib/config';

import type { MetricChartProps, MonitoringResourceType, Unit } from '@/common/components/charts/metric-chart/type';

import { gray } from '@/styles/colors';

interface ChartData {
    label: string;
    [key: string]: number | string;
}

interface Legend {
    serverId: string;
    serverName?: string;
    color?: string;
    count: number;
}

interface Tooltip {
    date: string;
    legends: Legend[];
}

export default defineComponent<MetricChartProps>({
    name: 'PMetricChart',
    components: {
        PSkeleton, PDataLoader, PSpinner, PTooltip,
    },
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        dataset: {
            type: Object as PropType<Record<string, number[]>>,
            default: () => ({}),
        },
        labels: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
        resources: {
            type: Array as PropType<MonitoringResourceType[]>,
            default: () => ([]),
        },
        unit: {
            type: Object as PropType<Unit>,
            default: () => ({ x: 'Timestamp', y: 'Count' }),
            validator(unit: Unit) {
                return typeof unit.x === 'string' && typeof unit.y === 'string';
            },
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        title: {
            type: String,
            default: '',
        },
        error: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            chartRef: null as null | HTMLElement,
            chart: null as null | XYChart,
            data: [] as ChartData[],
            //
            visibleTooltip: false,
            tooltip: {
                date: '',
                legends: [],
            } as Tooltip,
        });

        const convertChartData = async () => {
            const chartDataList: ChartData[] = [];
            const labels = props.labels.map((label) => dayjs.tz(dayjs(label), props.timezone).format('MM/DD HH:mm'));
            labels.forEach((label, index) => {
                const chartData: ChartData = { label };
                Object.entries(props.dataset).forEach(([key, value]) => {
                    chartData[key] = value[index] as number;
                });
                chartDataList.push(chartData);
            });
            state.data = chartDataList;
        };

        const drawChart = (ctx) => {
            const chart: any = am4core.create(ctx, am4charts.XYChart);
            chart.paddingLeft = -5;
            chart.paddingBottom = -10;
            chart.paddingTop = 10;
            chart.data = state.data;
            if (state.data.length > 0) {
                chart.events.on('over', () => {
                    state.visibleTooltip = true;
                });
                chart.events.on('out', () => {
                    state.visibleTooltip = false;
                });
            }

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'label';
            dateAxis.tooltip.label.fontSize = 12;
            dateAxis.tooltip.label.adapter.add('text', (text) => {
                if (text) return text.split(' ').join('\n');
                return text;
            });
            dateAxis.renderer.minGridDistance = 60;
            dateAxis.fontSize = 12;
            dateAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            dateAxis.renderer.grid.template.strokeOpacity = 1;
            dateAxis.renderer.labels.template.adapter.add('text', (label, target) => {
                if (target.dataItem && (target.dataItem.category)) {
                    return target.dataItem.category.split(' ').join('\n');
                }
                return label;
            });

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.label.fontSize = 12;
            valueAxis.fontSize = 12;
            valueAxis.extraMax = 0.1;
            valueAxis.min = 0;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.grid.template.strokeOpacity = 1;

            let series;
            props.resources.forEach((d) => {
                series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.categoryX = 'label';
                series.dataFields.valueY = d.id;
                series.stroke = am4core.color(d.color);
            });

            series.adapter.add('tooltipText', (text, target) => {
                if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
                    const tooltipData = target.tooltipDataItem.dataContext;
                    const date = tooltipData.label;
                    const legends = [] as Legend[];
                    props.resources.forEach((d) => {
                        legends.push({
                            serverId: d.id,
                            serverName: d.name,
                            color: d.color,
                            count: get(tooltipData, d.id),
                        });
                    });
                    state.tooltip = { date, legends };
                }
                return text;
            });

            if (state.data.length > 0) {
                chart.cursor = new am4charts.XYCursor();
                chart.cursor.maxTooltipDistance = 20;
                chart.cursor.fontSize = 12;
                chart.cursor.lineX.stroke = am4core.color(gray[900]);
                chart.cursor.lineX.strokeDasharray = '';
                chart.cursor.lineX.strokeOpacity = 1;
            }

            state.chart = chart;
        };

        watch([() => state.chartRef, () => props.loading], async ([ctx, loading]) => {
            if (ctx && !loading) {
                await convertChartData();
                drawChart(ctx);
            }
        });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            numberFormatter,
            commaFormatter,
        };
    },
});
</script>

<style lang="postcss">
.p-metric-chart {
    @apply bg-white rounded-lg;
    position: relative;
    box-shadow: 0 2px 4px rgba(theme('colors.black'), 0.06);
    padding: 1.25rem;

    .chart-title-wrapper {
        @apply flex justify-between;
        .has-tooltip {
            @apply flex-grow;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
        }
        .chart-title {
            @apply text-sm font-bold capitalize;
        }
        .chart-unit {
            @apply text-sm text-gray flex-shrink ml-2;
        }
    }

    .chart-wrapper {
        position: relative;
        height: 12.5rem;
        margin-top: 1.25rem;
        .chart {
            height: 100%;
            width: 100%;
        }
        .no-data-text {
            @apply text-gray-400;
            position: absolute;
            top: 40%;
            left: 30%;
        }
    }

    .p-data-loader {
        .data-wrapper {
            overflow-y: hidden;
        }
    }

    .tooltip-wrapper {
        @apply bg-white border border-gray-300 rounded-lg;
        position: absolute;
        visibility: hidden;
        width: calc(100% - 1rem);
        top: 17rem;
        left: 0.5rem;
        transition: visibility 0s, opacity 0.3s linear;
        font-size: 0.75rem;
        line-height: 1.2;
        opacity: 0;
        z-index: 1;
        padding: 0.75rem 0;

        &.tooltip-visible {
            opacity: 0.95;
            visibility: visible;
        }

        .date {
            font-weight: bold;
            padding: 0 1rem 0.375rem 1rem;
        }
        .legend-table {
            width: 100%;

            .legend {
                @apply bg-white;
                &:nth-child(odd) {
                    @apply bg-gray-100;
                }

                td {
                    vertical-align: sub;
                    padding-top: 0.25rem;
                    padding-bottom: 0.25rem;
                    padding-left: 1rem;

                    &:first-child {
                        min-width: 4rem;
                        white-space: nowrap;
                    }
                    &:last-child {
                        padding-right: 1rem;
                    }
                }

                .circle {
                    @apply rounded-full;
                    display: inline-block;
                    width: 0.5rem;
                    height: 0.5rem;
                }

                .count {
                    font-weight: bold;
                    margin: 0 0.25rem;
                }
                .server-id-text {
                    @apply text-gray-500;
                }
            }
        }
    }
}
</style>
