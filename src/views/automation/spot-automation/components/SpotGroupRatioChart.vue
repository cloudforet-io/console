<template>
    <div class="spot-group-composition-chart grid grid-cols-12" :class="chartType">
        <div class="col-span-5 text-wrapper on-demand">
            <p>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.ON_DEMAND') }}</p>
            <p><b>{{ onDemandCount }}</b> ({{ onDemandPercentage }}%)</p>
            <template v-if="chartType === CHART_TYPE.long">
                <br>
                <p>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.ON_DEMAND_TOTAL_COST') }}</p>
                <p>$<b>{{ onDemandCost }}</b></p>
            </template>
        </div>
        <p-chart-loader class="col-span-2" :loading="loading">
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
        <div class="col-span-5 text-wrapper spot">
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
import { get } from 'lodash';
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

interface ChartData {
    type: string;
    count: number;
    color: string;
}

enum CHART_TYPE {
    long = 'long',
    short = 'short'
}

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
        spotGroupId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const state = reactive({
            loading: false,
            chartRef: null as HTMLElement | null,
            chart: null as null | any,
            chartRegistry: {},
            data: [] as ChartData[],
            colors: {
                onDemand: secondary,
                spot: peacock[400],
            },
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
        const getData = async (spotGroupId) => {
            try {
                state.loading = true;
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceCount({
                    spot_groups: [spotGroupId],
                });
                const totalCount = get(res, `spot_groups.${spotGroupId}.total`);
                state.onDemandCount = get(res, `spot_groups.${spotGroupId}.ondemand`);
                state.spotCount = get(res, `spot_groups.${spotGroupId}.spot`);
                state.onDemandPercentage = (state.onDemandCount / totalCount) * 100;
                state.spotPercentage = 100 - state.onDemandPercentage;

                state.data = [
                    {
                        type: 'spot',
                        count: state.spotCount,
                        color: state.colors.spot,
                    },
                    {
                        type: 'onDemand',
                        count: state.onDemandCount,
                        color: state.colors.onDemand,
                    },
                ];
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        watch(() => props.spotGroupId, (spotGroupId) => {
            getData(spotGroupId);
        });
        watch([() => state.loading, () => state.chartRef], ([loading, chartCtx]) => {
            if (!loading && chartCtx) {
                drawChart(chartCtx);
            }
        }, { immediate: true });

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

    .text-wrapper {
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
    .p-chart-loader {
        margin: auto 0;
        .chart {
            max-width: 4rem;
            max-height: 4rem;
        }
    }

    &.long {
        height: auto;
        font-size: 0.75rem;
        padding: 1rem 0.5rem;
        .text-wrapper {
            padding: 0 0.25rem;
        }
    }
}
</style>
