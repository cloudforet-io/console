<template>
    <div class="spot-group-composition-chart grid grid-cols-12" :class="chartType">
        <div class="text-wrapper on-demand">
            <p>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.ON_DEMAND') }}</p>
            <p><b>{{ onDemandCount }}</b> ({{ onDemandPercentage }}%)</p>
            <div v-if="chartType === CHART_TYPE.long" class="total-cost-wrapper">
                <p>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.ON_DEMAND_TOTAL_COST') }}</p>
                <p>$<b>{{ onDemandCost }}</b></p>
            </div>
        </div>
        <p-chart-loader class="chart-wrapper" :loading="loading">
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
        <div class="text-wrapper spot">
            <p>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.SPOT') }}</p>
            <p><b>{{ spotCount }}</b> ({{ spotPercentage }}%)</p>
            <div v-if="chartType === CHART_TYPE.long" class="total-cost-wrapper">
                <p>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.SPOT_TOTAL_COST') }}</p>
                <p>$<b>{{ spotCost }}</b></p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { debounce } from 'lodash';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import { reactive, toRefs, watch } from '@vue/composition-api';

import { PChartLoader } from '@spaceone/design-system';
import {
    gray, peacock, secondary, white,
} from '@/styles/colors';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import config from '@/lib/config';
import ErrorHandler from '@/common/composables/error/errorHandler';


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
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.responsive.enabled = true;
            chart.padding = 12;

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
                ErrorHandler.handleError(e);
                state.data = [];
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
    @apply bg-secondary2 rounded-lg;
    width: 100%;
    height: auto;
    font-size: 0.875rem;
    padding: 1rem;

    &.long {
        font-size: 0.75rem;
    }

    .text-wrapper {
        @apply col-span-4;

        @screen sm {
            @apply col-span-5;
        }

        @screen md {
            @apply col-span-4;
        }

        margin: auto 0;
        &.on-demand {
            @apply text-secondary;
            text-align: right;
        }
        &.spot {
            @apply text-peacock-400;
        }

        .total-cost-wrapper {
            margin-top: 0.75rem;
        }
    }
    .chart-wrapper {
        @apply col-span-4;

        @screen sm {
            @apply col-span-2;
        }

        @screen md {
            @apply col-span-4;
        }
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
