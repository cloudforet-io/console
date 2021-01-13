<template>
    <div class="project-region-service">
        <div class="chart-wrapper grid grid-cols-12">
            <p-chart-loader :loading="loading" class="chart col-span-4">
                <template #loader>
                    <div ref="loaderRef" class="w-full h-full" />
                </template>
                <div ref="chartRef" class="w-full h-full" />
            </p-chart-loader>
            <div class="col-span-8 summary-content-wrapper">
                <router-link v-for="(d, idx) of data" :key="idx"
                             :to="d.to"
                             class="summary-row col-span-3 md:col-span-1 lg:col-span-3"
                >
                    <div class="text-group">
                        <span class="provider" :style="{ color: d.color }">{{ d.provider }}</span>
                        <span class="type">{{ d.region }}</span>
                    </div>
                    <span class="count">{{ d.count }}</span>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import {
    PChartLoader,
} from '@spaceone/design-system';

import {
    reactive, toRefs, watch, onUnmounted, computed,
} from '@vue/composition-api';

import { SpaceConnector } from '@/lib/space-connector';
import { gray, violet, white } from '@/styles/colors';
import Color from 'color';
import { store } from '@/store';

am4core.useTheme(am4themes_animated);

interface Data {
    provider: string;
    region_code: string;
    total: number;
}
const DEFAULT_COLORS = [violet[200], Color(violet[200]).alpha(0.5).toString()];

export default {
    name: 'ProjectRegionService',
    components: {
        PChartLoader,
    },
    props: {
        label: {
            type: String,
            default: undefined,
        },
        projectId: {
            type: String,
            required: true,
        },
        count: {
            type: [String, Number],
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            loading: true,
            providers: computed(() => store.state.resource.provider.items),
            regions: computed(() => store.state.resource.region.items),
            loaderRef: null,
            chartRef: null as HTMLElement | null,
            data: [] as Data[],
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
            chart.logo.disabled = true;
            chart.responsive.enabled = true;
            chart.innerRadius = am4core.percent(63);

            if (isLoading) {
                chart.data = [{
                    provider: 'Dummy',
                    service_account_count: 1000,
                    color: DEFAULT_COLORS[0],
                }];
            } else {
                chart.data = state.data;
            }

            const series = chart.series.create();
            series.slices.template.togglable = false;
            series.slices.template.clickable = false;
            series.dataFields.value = 'count';
            series.dataFields.category = 'region';
            series.slices.template.propertyFields.fill = 'color';
            series.slices.template.stroke = am4core.color(white);
            series.slices.template.strokeWidth = 2;
            series.slices.template.strokeOpacity = 1;
            series.tooltip.disabled = true;

            const label = new am4core.Label();
            label.parent = series;
            label.horizontalCenter = 'middle';
            label.verticalCenter = 'middle';
            label.fontSize = 16;
            label.fontWeight = 'lighter';
            label.fill = am4core.color(gray[900]);
            if (isLoading) {
                label.text = '';
            } else {
                label.text = props.count || 0;
            }

            state.chart = chart;
        };

        /* api */
        const getData = async () => {
            try {
                state.loading = true;
                const param: any = {
                    project_id: props.projectId,
                    aggregation: 'inventory.Region',
                };
                if (props.label) param.label = props.label;
                const res = await SpaceConnector.client.statistics.topic.cloudServiceSummary(param);
                state.data = res.results.map(d => ({
                    provider: state.providers[d.provider].label,
                    region: d.region_code, // state.regions[d.region_code]?.name || d.region_code,
                    count: d.total,
                    color: state.providers[d.provider].color,
                    to: '',
                }));
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const init = () => {
            getData();
        };
        init();

        watch([() => state.loaderRef, () => state.chartRef], ([loaderCtx, chartCtx]) => {
            if (loaderCtx) {
                drawChart(loaderCtx, true);
            } else if (chartCtx) {
                drawChart(chartCtx, false);
            }
        }, { immediate: true });
        watch(() => props.label, async () => {
            await getData();
            // drawChart();
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-region-service {
    .summary-content-wrapper {
        overflow-y: auto;
        height: 13rem;
    }
    .summary-row {
        position: relative;
        display: block;
        font-size: 0.875rem;
        line-height: 1.2;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        margin: auto 0;

        &:hover {
            @apply bg-secondary2;
            .provider {
                text-decoration: underline;
            }
            .type {
                text-decoration: underline;
            }
            .count {
                text-decoration: underline;
            }
        }

        .text-group {
            display: inline-block;
            width: 80%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            .type {
                padding-left: 0.5rem;
            }
        }

        .count {
            @apply text-gray-600;
            position: absolute;
            right: 0.5rem;
        }
    }
}
</style>
