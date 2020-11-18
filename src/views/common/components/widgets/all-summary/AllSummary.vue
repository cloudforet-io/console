<template>
    <div class="all-summary-page">
        <div class="top-part grid grid-cols-12 gap-3">
            <div v-for="(data, idx) of dataList" :key="idx"
                 class="box col-span-3"
                 :class="[{'selected': idx === selectedIndex}, data.type]"
                 @click="selectedIndex = idx"
            >
                <div class="content">
                    <div class="count">
                        <router-link :to="data.to" class="anchor" :class="data.type">
                            <span class="number">
                                <span v-if="data.type === 'spendings'" class="dollar-sign">$</span>
                                <span>{{ numberCommaFormatter(data.count) }}</span>
                            </span>
                        </router-link>
                        <span class="suffix" :class="data.type">{{ data.suffix }}</span>
                    </div>
                    <div class="title">
                        {{ data.title }}
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom-part">
            <div class="content-wrapper grid grid-cols-12 gap-2">
                <template v-if="selectedType !== 'spendings'">
                    <div class="chart-wrapper col-span-9">
                        <div class="title">
                            {{ $t('COMMON.WIDGETS.ALL_SUMMARY_TREND_TITLE') }}
                        </div>
                        <p-chart-loader :loading="chartState.loading">
                            <template #loader>
                                <p-skeleton width="100%" height="100%" />
                            </template>
                            <div ref="chartRef" class="chart" />
                        </p-chart-loader>
                    </div>
                    <div class="summary-wrapper col-span-3">
                        <div class="title">
                            {{ $t('COMMON.WIDGETS.ALL_SUMMARY_TYPE_TITLE', { service: dataList[selectedIndex].title }) }}
                        </div>
                        <template v-if="!loading">
                            <router-link v-for="(data, idx) of dataList[selectedIndex].data" :key="idx"
                                         :to="data.to"
                                         class="summary-row"
                            >
                                <div class="text-group">
                                    <span :style="{ color: colorState[data.label.toLowerCase()] }">{{ data.label }}</span>
                                    <span class="type">{{ data.type }}</span>
                                </div>
                                <span class="count">{{ data.count }}</span>
                            </router-link>
                        </template>
                        <template v-else>
                            <div v-for="v in skeletons" :key="v" class="flex items-center p-4">
                                <p-skeleton width="1.5rem" height="1.5rem" class="mr-4 flex-shrink-0" />
                                <p-skeleton class="flex-grow" />
                            </div>
                        </template>
                    </div>
                </template>
                <template v-else>
                    <div class="empty-wrapper col-span-12">
                        <div class="content">
                            <img src="@/assets/images/illust_spaceship.svg" class="empty-image">
                            <div class="empty-text-group">
                                <span class="empty-text large">
                                    {{ $t('COMMON.WIDGETS.ALL_SUMMARY_NO_DATA_1') }}
                                </span>
                                <span class="empty-text small">
                                    {{ $t('COMMON.WIDGETS.ALL_SUMMARY_NO_DATA_2') }}
                                </span>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    orderBy, forEach, find, range,
} from 'lodash';
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { TranslateResult } from 'vue-i18n';

import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { gray, primary1 } from '@/styles/colors';
import PLazyImg from "@/components/organisms/lazy-img/PLazyImg.vue";

am4core.useTheme(am4themes_animated);

interface ChartData {
    date: string;
    count: number;
}
interface TypeData {
    provider: string;
    label: string | TranslateResult;
    count: number;
    type?: string;
    to: string;
}

enum PROVIDER {
    aws = 'AWS',
    google_cloud = 'Google',
    azure = 'Azure',
}

const DAY_COUNT = 14;


export default {
    name: 'AllSummary',
    components: {
        PLazyImg,
        PSkeleton,
        PChartLoader,
    },
    props: {
        providers: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: false,
            chartRef: null as HTMLElement | null,
            skeletons: range(3),
            selectedIndex: 0,
            selectedType: computed(() => state.dataList[state.selectedIndex].type),
            computeCount: 0,
            databaseCount: 0,
            storageCount: 0,
            overallSpendings: computed(() => vm.$t('COMMON.WIDGETS.ALL_SUMMARY_UPCOMING')),
            dataList: computed(() => ([
                {
                    type: 'compute',
                    title: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_COMPUTE'),
                    count: state.computeCount,
                    data: state.computeData,
                    suffix: 'ea',
                    to: '/inventory/server',
                },
                {
                    type: 'database',
                    title: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_DATABASE'),
                    count: state.databaseCount,
                    data: state.databaseData,
                    suffix: 'ea',
                    to: '/inventory/cloud-service?provider=all&service=Database',
                },
                {
                    type: 'storage',
                    title: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_STORAGE'),
                    count: state.storageCount,
                    data: state.storageData,
                    suffix: 'TB',
                    to: '/inventory/cloud-service?provider=all&service=Storage',
                },
                {
                    type: 'spendings',
                    title: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_SPENDINGS'),
                    count: state.overallSpendings,
                    to: '/',
                    beta: true,
                },
            ])),
            computeData: [] as TypeData[],
            databaseData: [] as TypeData[],
            storageData: [] as TypeData[],
        });
        const chartState = reactive({
            loading: true,
            registry: {},
            computeData: [] as ChartData[],
            databaseData: [] as ChartData[],
            storageData: [] as ChartData[],
        });
        const colorState = reactive({
            aws: computed(() => props.providers.aws.color),
            google: computed(() => props.providers.google_cloud.color),
            azure: computed(() => props.providers.azure.color),
        });

        /* api */
        const getCount = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.serverCount();
                state.computeCount = res.results[0]?.count || 0;
            } catch (e) {
                console.error(e);
            }

            try {
                const res = await SpaceConnector.client.statistics.topic.cloudServiceCount({
                    category: 'Database',
                });
                state.databaseCount = res.results[0]?.count || 0;
            } catch (e) {
                console.error(e);
            }

            try {
                const res = await SpaceConnector.client.statistics.topic.cloudServiceCount({
                    category: 'Storage',
                });
                state.storageCount = res.results[0]?.count || 0;
            } catch (e) {
                console.error(e);
            }
        };
        const getTrend = async (type) => {
            try {
                let res;
                if (type === 'compute') {
                    res = await SpaceConnector.client.statistics.topic.dailyServerCount();
                } else if (type === 'database') {
                    res = await SpaceConnector.client.statistics.topic.dailyDatabaseCount();
                } else {
                    res = await SpaceConnector.client.statistics.topic.dailyStorageCount();
                }

                const chartData = res.results.map(d => ({
                    date: dayjs(d.date).format('MM/DD'),
                    count: d.count,
                }));
                forEach(range(0, DAY_COUNT), (i) => {
                    const date = dayjs().subtract(i, 'day').format('MM/DD');
                    if (!find(chartData, { date })) {
                        chartData.push({ date, count: null });
                    }
                });
                const orderedData = orderBy(chartData, ['date'], ['asc']);
                const formattedData = orderedData.map(d => ({
                    date: dayjs(d.date).format('M/D'),
                    count: d.count,
                }));

                if (type === 'compute') chartState.computeData = formattedData;
                else if (type === 'database') chartState.databaseData = formattedData;
                else chartState.storageData = formattedData;
            } catch (e) {
                console.error(e);
            } finally {
                chartState.loading = false;
            }
        };
        const getComputeInfo = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.serverByProvider();
                const computeData: TypeData[] = [
                    {
                        provider: 'all',
                        label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_ALL'),
                        count: state.computeCount,
                        to: '/inventory/server',
                    },
                ];
                res.results.forEach((d) => {
                    computeData.push({
                        provider: d.provider,
                        label: props.providers[d.provider].label,
                        type: d.server_type,
                        count: d.count,
                        to: `/inventory/server?filters=provider%3A${d.provider}`,
                    });
                });
                state.computeData = computeData;
            } catch (e) {
                console.error(e);
            }
        };
        const getDatabaseInfo = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.cloudServiceTypePage({
                    labels: ['Database'],
                    query: {
                        sort: {
                            name: 'count',
                            desc: true,
                        },
                    },
                    show_all: false,
                });
                const databaseData: TypeData[] = [
                    {
                        provider: 'all',
                        label: vm?.$t('COMMON.WIDGETS.ALL_SUMMARY_ALL'),
                        count: state.databaseCount,
                        to: '/inventory/cloud-service?provider=all&service=Database',
                    },
                ];
                res.results.forEach((d) => {
                    databaseData.push({
                        provider: d.provider,
                        label: props.providers[d.provider].label,
                        type: d.cloud_service_group,
                        count: d.count,
                        to: `/inventory/cloud-service?provider=${d.provider}&service=Database`,
                    });
                });
                state.databaseData = databaseData;
            } catch (e) {
                console.error(e);
            }
        };
        const getStorageInfo = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.cloudServiceTypePage({
                    labels: ['Storage'],
                    query: {
                        sort: {
                            name: 'count',
                            desc: true,
                        },
                    },
                    show_all: false,
                });
                const storageData: TypeData[] = [
                    {
                        provider: 'all',
                        label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_ALL'),
                        count: state.storageCount,
                        to: '/inventory/cloud-service?provider=all&service=Storage',
                    },
                ];
                res.results.forEach((d) => {
                    storageData.push({
                        provider: d.provider,
                        label: props.providers[d.provider].label,
                        type: d.cloud_service_group,
                        count: d.count,
                        to: `/inventory/cloud-service?provider=${d.provider}&service=Storage`,
                    });
                });
                state.storageData = storageData;
            } catch (e) {
                console.error(e);
            }
        };

        /* util */
        const drawChart = () => {
            const disposeChart = () => {
                if (chartState.registry[state.chartRef]) {
                    chartState.registry[state.chartRef].dispose();
                    delete chartState.registry[state.chartRef];
                }
            };
            const createChart = () => {
                disposeChart();
                chartState.registry[state.chartRef] = am4core.create(state.chartRef, am4charts.XYChart);
                return chartState.registry[state.chartRef];
            };
            const chart = createChart();

            chart.responsive.enabled = true;
            chart.logo.disabled = true;
            chart.paddingLeft = -5;
            chart.paddingBottom = 0;
            if (state.selectedType === 'compute') chart.data = chartState.computeData;
            else if (state.selectedType === 'database') chart.data = chartState.databaseData;
            else if (state.selectedType === 'storage') chart.data = chartState.storageData;

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'date';
            dateAxis.renderer.minGridDistance = 20;
            dateAxis.renderer.grid.template.disabled = true;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            dateAxis.fontSize = 11;

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.minGridDistance = 30;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            valueAxis.fontSize = 11;
            valueAxis.min = 0;

            const series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = 'count';
            series.dataFields.categoryX = 'date';
            series.fill = am4core.color(primary1);
            series.columns.template.width = am4core.percent(30);
            series.columns.template.column.cornerRadiusTopLeft = 3;
            series.columns.template.column.cornerRadiusTopRight = 3;
            series.strokeWidth = 0;

            const bullet = series.bullets.push(new am4charts.LabelBullet());
            bullet.label.text = '{count}';
            bullet.label.fontSize = 14;
            bullet.label.truncate = false;
            bullet.label.hideOversized = false;
            bullet.label.fill = am4core.color(primary1);
            bullet.label.dy = -10;
        };
        const numberCommaFormatter = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        const init = () => {
            getTrend('compute');
            getTrend('database');
            getTrend('storage');
        };
        const asyncInit = async () => {
            state.loading = true;
            await getCount();
            //
            await getComputeInfo();
            state.loading = false;
            await getDatabaseInfo();
            await getStorageInfo();
        };
        init();
        asyncInit();

        watch([() => state.chartRef, () => chartState.loading], ([chartContext, loading]) => {
            if (chartContext && !loading) {
                drawChart();
            }
        });
        watch(() => state.selectedType, () => {
            drawChart();
        }, { immediate: false });

        return {
            ...toRefs(state),
            chartState,
            colorState,
            numberCommaFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.all-summary-page {
    .top-part {
        height: 8rem;

        .box {
            @apply bg-white;
            position: relative;
            display: flex;
            height: 100%;
            cursor: pointer;
            border-radius: 0.375rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            padding-left: 1.5rem;

            &:hover {
                background-color: rgba(theme('colors.indigo.400'), 0.1);
            }
            &.selected {
                @apply bg-primary1 text-white;
                .count {
                    @apply text-white;
                    .dollar-sign {
                        @apply text-white;
                    }
                    .suffix {
                        @apply text-white;
                        opacity: 1;
                    }
                }
                .title {
                    @apply text-white;
                    font-weight: bold;
                }
                &:after {
                    position: absolute;
                    display: block;
                    content: '';
                    width: 0;
                    border-style: solid;
                    border-color: theme('colors.primary1') transparent;
                    border-width: 0.5rem 0.5rem 0;
                    bottom: -0.5rem;
                    left: 50%;
                    margin-left: -0.5rem;
                }
            }
            &.spendings {
                .count .number {
                    font-size: 1.375rem;
                }
            }

            .content {
                margin: auto 0;
            }
            .count {
                @apply text-indigo-400;
                position: relative;
                display: inline-block;
                line-height: 2.5rem;
                &:hover {
                    .anchor {
                        border-bottom: 1px solid;
                        &.spendings {
                            border: none;
                        }
                    }
                }
                .dollar-sign {
                    @apply text-gray-500;
                    font-size: 1.5rem;
                    font-weight: normal;
                    padding-right: 0.25rem;
                }
                .number {
                    font-size: 2rem;
                    font-weight: bold;
                }
                .suffix {
                    @apply text-gray-300;
                    font-size: 1rem;
                    font-weight: normal;
                    opacity: 0.7;
                    padding-left: 0.5rem;
                    &.storage {
                        font-size: 0.875rem;
                    }
                }
            }
            .title {
                @apply text-gray-500;
                font-size: 1rem;
                text-transform: capitalize;
            }
        }
    }

    .bottom-part {
        margin-top: 1rem;

        .content-wrapper {
            @apply bg-white;
            border-radius: 0.375rem;
            position: relative;
            height: 17.5rem;
            padding: 1.25rem 1.5rem;

            .title {
                font-size: 1rem;
                font-weight: bold;
                margin-bottom: 1rem;
            }
            .chart-wrapper {
                .chart {
                    height: 13rem;
                }
            }
            .summary-wrapper {
                .title {
                    padding: 0 0.5rem;
                    margin-bottom: 1.25rem;
                }
                .summary-row {
                    position: relative;
                    display: block;
                    font-size: 0.875rem;
                    line-height: 1.2rem;
                    cursor: pointer;
                    padding: 0.25rem 0.5rem;
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
                        width: 90%;
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
            .empty-wrapper {
                position: relative;
                display: flex;
                height: 100%;

                .content {
                    display: block;
                    margin: auto;
                    .empty-image {
                        margin: auto;
                    }
                    .empty-text-group {
                        text-align: center;
                        line-height: 2rem;
                        padding-top: 0.875rem;
                        .empty-text {
                            display: block;
                            &.large {
                                @apply text-primary;
                                font-size: 1rem;
                            }
                            &.small {
                                @apply text-gray;
                                font-size: 0.875rem;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
