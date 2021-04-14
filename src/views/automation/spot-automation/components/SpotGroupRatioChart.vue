<template>
    <div class="spot-group-composition-chart grid grid-cols-12" :class="chartType">
        <div class="text-wrapper on-demand">
            <p>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.ON_DEMAND') }}</p>
            <p><b>{{ onDemandCount }}</b> ({{ onDemandPercentage }}%)</p>
            <template v-if="chartType === CHART_TYPE.long">
                <br>
                <p>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.ON_DEMAND_TOTAL_COST') }}</p>
                <p>$<b>{{ onDemandCost }}</b></p>
            </template>
        </div>
        <p-chart-loader class="chart-wrapper" :loading="loading">
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
        <div class="text-wrapper spot">
            <p>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.SPOT') }}</p>
            <p><b>{{ spotCount }}</b> ({{ spotPercentage }}%)</p>
            <template v-if="chartType === CHART_TYPE.long">
                <br>
                <p>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.SPOT_TOTAL_COST') }}</p>
                <p>$<b>{{ spotCost }}</b></p>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { debounce } from 'lodash';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import { reactive, toRefs, watch } from '@vue/composition-api';

import { PChartLoader } from '@spaceone/design-system';
import {
    gray, peacock, secondary, white,
} from '@/styles/colors';
import { SpaceConnector } from '@/lib/space-connector';


am4core.useTheme(am4themes_animated);

interface InstanceResponse {
    total: number;
    ondemand: number;
    spot: number;
}
interface ChartData {
    type: string;
    count: number;
    color: string;
}

enum CHART_TYPE {
    long = 'long',
    short = 'short'
}

const COLORS = {
    onDemand: secondary,
    spot: peacock[400],
};

export default {
    name: 'SpotGroupRatioChart',
    components: {
        PChartLoader,
    },
    props: {
        chartType: {
            type: String,
            default: 'long',
        },
        spotGroups: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props) {
        const state = reactive({
            loading: false,
            chartRef: null as HTMLElement | null,
            chart: null as null | any,
            chartRegistry: {},
            data: [] as ChartData[],
            onDemandPercentage: 0,
            spotPercentage: 0,
            onDemandCount: 0,
            spotCount: 0,
            onDemandCost: 0,
            spotCost: 0,
        });

        /* util */
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
            chart.logo.disabled = true;
            chart.responsive.enabled = true;

            if (props.chartType === CHART_TYPE.long) {
                chart.radius = am4core.percent(70);
                chart.innerRadius = am4core.percent(45);
            } else {
                chart.innerRadius = am4core.percent(55);
            }

            chart.data = state.data;

            const series = chart.series.create();
            series.slices.template.togglable = false;
            series.slices.template.clickable = false;
            series.dataFields.value = 'count';
            series.dataFields.category = 'type';
            series.slices.template.fill = am4core.color(gray[400]);
            series.slices.template.propertyFields.fill = 'color';
            series.slices.template.stroke = am4core.color(white);
            series.slices.template.strokeWidth = 2;
            series.slices.template.strokeOpacity = 1;
            series.slices.template.states.getKey('hover').properties.scale = 1;
            series.tooltip.disabled = true;
            series.ticks.template.disabled = true;
            series.labels.template.text = '';

            state.chart = chart;
        };

        /* api */
        const getData = debounce(async (spotGroups) => {
            try {
                state.loading = true;
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceCount({
                    spot_groups: spotGroups,
                });
                const dataList = Object.values(res.spot_groups) as InstanceResponse[];
                const formattedRes: InstanceResponse = dataList.reduce((result, d) => {
                    result.total += d.total;
                    result.ondemand += d.ondemand;
                    result.spot += d.spot;
                    return result;
                }, {
                    total: 0,
                    ondemand: 0,
                    spot: 0,
                });
                state.onDemandCount = formattedRes.ondemand;
                state.spotCount = formattedRes.spot;
                state.onDemandPercentage = Math.round((formattedRes.ondemand / formattedRes.total) * 100);
                state.spotPercentage = 100 - state.onDemandPercentage;

                state.data = [
                    {
                        type: 'spot',
                        count: state.spotCount,
                        color: COLORS.spot,
                    },
                    {
                        type: 'onDemand',
                        count: state.onDemandCount,
                        color: COLORS.onDemand,
                    },
                ];
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        }, 300);

        watch(() => props.spotGroups, (spotGroups) => {
            if (spotGroups.length > 0) {
                getData(spotGroups);
            }
        }, { immediate: false });
        watch([() => state.loading, () => state.chartRef], ([loading, chartCtx]) => {
            if (!loading && chartCtx) {
                drawChart(chartCtx);
            }
        }, { immediate: false });

        return {
            ...toRefs(state),
            CHART_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-composition-chart {
    @apply bg-secondary2;
    width: 100%;
    height: 5.5rem;
    font-size: 0.875rem;
    border-radius: 0.375rem;

    &.long {
        height: auto;
        font-size: 0.75rem;
        padding: 1rem 0.5rem;

        @media lg {
            .text-wrapper {
                @apply col-span-4;
            }
            .chart-wrapper {
                @apply col-span-4;
            }
        }
    }

    .text-wrapper {
        @apply col-span-5;
        padding: 0 0.5rem;
        margin: auto 0;
        &.on-demand {
            @apply text-secondary;
            text-align: right;
        }
        &.spot {
            @apply text-peacock-400;
        }
    }
    .chart-wrapper {
        @apply col-span-2;
    }
    .p-chart-loader {
        margin: auto;
        .chart {
            max-width: 4rem;
            max-height: 4rem;
        }
    }
}
</style>
