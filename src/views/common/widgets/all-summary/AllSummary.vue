<template>
    <div class="all-summary-page">
        <div class="top-part grid grid-cols-12 gap-2">
            <div v-for="(data, idx) of serviceDataList" :key="idx"
                 class="box col-span-3"
                 :class="[{'activated': idx === activatedIndex}, data.type]"
                 @click="activatedIndex = idx"
            >
                <div class="content">
                    <div class="count">
                        <!--                        숫자 마우스오버 했을 때 밑줄 링크 router-link나 a tag-->
                        <!--                        클라우드 서비스의 database 라벨 셀렉-->
                        <router-link :to="data.to">
                            <span v-if="data.type === 'spendings'" class="dollar-sign">$</span>
                            <span>{{ numberCommaFormatter(data.count) }}</span>
                            <span class="suffix">{{ data.suffix }}</span>
                        </router-link>
                    </div>
                    <div class="title">
                        {{ data.title }}
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom-part">
            <div class="top-line" :class="serviceDataList[activatedIndex].type" />
            <div class="carousel-wrapper">
                <div class="triangle-wrapper" :class="serviceDataList[activatedIndex].type">
                    <div class="triangle" />
                </div>
                <carousel
                    ref="carousel"
                    :speed="500"
                    :per-page="1"
                    :mouse-drag="false"
                    :touch-drag="false"
                    :loop="true"
                    :pagination-enabled="false"
                    :navigate-to="activatedIndex"
                >
                    <slide class="grid grid-cols-12 gap-4">
                        <div class="chart-wrapper col-span-9">
                            <div class="title">
                                {{ $t('COMMON.WIDGETS.ALL_SUMMARY_TREND_TITLE') }}
                            </div>
                            <p-chart-loader :loading="chartState.loading">
                                <template #loader>
                                    <p-skeleton width="100%" height="100%" />
                                </template>
                                <div ref="serverChartRef" class="chart" />
                            </p-chart-loader>
                        </div>
                        <div class="summary-wrapper col-span-3">
                            <div class="title">
                                {{ $t('COMMON.WIDGETS.ALL_SUMMARY_TYPE_TITLE', { service: $t('COMMON.WIDGETS.ALL_SUMMARY_SERVER')}) }}
                            </div>
                            <div v-for="(data, idx) of serverData" :key="idx" class="summary-row">
                                <span class="provider" :class="data.label.toLowerCase()">{{ data.label }}</span>
                                <span class="type">{{ data.type }}</span>
                                <span class="count">{{ data.count }}</span>
                            </div>
                        </div>
                    </slide>
                    <slide class="grid grid-cols-12 gap-4">
                        <div class="chart-wrapper col-span-9">
                            <div class="title">
                                {{ $t('COMMON.WIDGETS.ALL_SUMMARY_TREND_TITLE') }}
                            </div>
                            <div ref="databaseChartRef" class="chart" />
                        </div>
                        <div class="summary-wrapper col-span-3">
                            <div class="title">
                                {{ $t('COMMON.WIDGETS.ALL_SUMMARY_TYPE_TITLE', { service: $t('COMMON.WIDGETS.ALL_SUMMARY_DATABASE')}) }}
                            </div>
                            <div v-for="(data, idx) of databaseData" :key="idx" class="summary-row">
                                <span class="provider" :class="data.label.toLowerCase()">{{ data.label }}</span>
                                <span class="type">{{ data.type }}</span>
                                <span class="count">{{ data.count }}</span>
                            </div>
                        </div>
                    </slide>
                    <slide class="grid grid-cols-12 gap-4">
                        <div class="chart-wrapper col-span-9">
                            <div class="title">
                                {{ $t('COMMON.WIDGETS.ALL_SUMMARY_TREND_TITLE') }}
                            </div>
                            <div ref="storageChartRef" class="chart" />
                        </div>
                        <div class="summary-wrapper col-span-3">
                            <div class="title">
                                {{ $t('COMMON.WIDGETS.ALL_SUMMARY_TYPE_TITLE', { service: $t('COMMON.WIDGETS.ALL_SUMMARY_STORAGE')}) }}
                            </div>
                            <div v-for="(data, idx) of storageData" :key="idx" class="summary-row">
                                <span class="provider" :class="data.label.toLowerCase()">{{ data.label }}</span>
                                <span class="type">{{ data.type }}</span>
                                <span class="count">{{ data.count }}</span>
                            </div>
                        </div>
                    </slide>
                    <slide>
                        spendings
                    </slide>
                </carousel>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    chain, orderBy, range, forEach, find, rangeRight,
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
import {
    gray, indigo, primary, primary1, coral, peacock,
} from '@/styles/colors';

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
}


enum PROVIDER {
    aws = 'AWS',
    google_cloud = 'GCP',
    azure = 'Azure',
}

const DAY_COUNT = 14;

const SERVER_COLOR = indigo[400];
const SERVER_HOVER_COLOR = indigo[600];
const DATABASE_COLOR = primary1;
const DATABASE_HOVER_COLOR = primary;
const STORAGE_COLOR = coral[400];
const STORAGE_HOVER_COLOR = coral[600];
const SPENDINGS_COLOR = peacock[500];
const SPENDINGS_HOVER_COLOR = peacock[700];


export default {
    name: 'AllSummary',
    components: {
        PSkeleton,
        PChartLoader,
    },
    props: {
    },
    setup(props, { refs }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: true,
            serverChartRef: null as HTMLElement | null,
            databaseChartRef: null as HTMLElement | null,
            storageChartRef: null as HTMLElement | null,
            // countLoading: false,
            activatedIndex: 0,
            serverCount: 0,
            databaseCount: 0,
            storageCount: 0,
            overallSpendings: 500,
            serviceDataList: computed(() => ([
                {
                    type: 'server',
                    title: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_SERVER'),
                    count: state.serverCount,
                    suffix: 'ea',
                    to: '/inventory/server',
                },
                {
                    type: 'database',
                    title: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_DATABASE'),
                    count: state.databaseCount,
                    suffix: 'ea',
                    to: '/',
                },
                {
                    type: 'storage',
                    title: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_STORAGE'),
                    count: state.storageCount,
                    suffix: 'TB',
                    to: '/',
                },
                {
                    type: 'spendings',
                    title: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_SPENDINGS'),
                    count: state.overallSpendings,
                    to: '/',
                },
            ])),
            serverData: [] as TypeData[],
            databaseData: [] as TypeData[],
            storageData: [] as TypeData[],
        });
        const chartState = reactive({
            loading: false,
            loaderRef: null,
            serverData: [] as ChartData[],
            databaseData: [] as ChartData[],
            storageData: [] as ChartData[],
        });

        /* api */
        const getCount = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.serverCount();
                state.serverCount = res.results[0]?.count || 0;
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
                chartState.loading = true;

                let res;
                if (type === 'server') res = await SpaceConnector.client.statistics.topic.dailyServerCount();
                else if (type === 'database') res = await SpaceConnector.client.statistics.topic.dailyDatabaseCount();
                else res = await SpaceConnector.client.statistics.topic.dailyStorageCount();

                const chartData = res.results.map(d => ({
                    date: dayjs(d.date).format('MM/DD'),
                    count: d.count,
                }));
                forEach(rangeRight(0, DAY_COUNT), (i) => {
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

                if (type === 'server') chartState.serverData = formattedData;
                else if (type === 'database') chartState.databaseData = formattedData;
                else chartState.storageData = formattedData;
            } catch (e) {
                console.error(e);
            } finally {
                chartState.loading = false;
            }
        };
        const getServerInfo = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.serverByProvider();
                const serverData: TypeData[] = [
                    { provider: 'all', label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_ALL_SERVERS'), count: state.serverCount },
                ];
                res.results.forEach((d) => {
                    serverData.push({
                        provider: d.provider,
                        label: PROVIDER[d.provider],
                        type: d.server_type,
                        count: d.count,
                    });
                });
                state.serverData = serverData;
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
                    { provider: 'all', label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_ALL_DATABASE'), count: state.databaseCount },
                ];
                res.results.forEach((d) => {
                    databaseData.push({
                        provider: d.provider,
                        label: PROVIDER[d.provider],
                        type: d.cloud_service_type,
                        count: d.count,
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
                    { provider: 'all', label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_ALL_STORAGE'), count: state.storageCount },
                ];
                res.results.forEach((d) => {
                    storageData.push({
                        provider: d.provider,
                        label: PROVIDER[d.provider],
                        type: d.cloud_service_type,
                        count: d.count,
                    });
                });
                state.storageData = storageData;
            } catch (e) {
                console.error(e);
            }
        };

        /* util */
        const drawChart = (chartContext, type, color, hoverColor) => {
            const chart = am4core.create(chartContext, am4charts.XYChart);
            chart.responsive.enabled = true;
            chart.logo.disabled = true;
            chart.paddingLeft = -5;
            chart.paddingBottom = 0;
            if (type === 'server') chart.data = chartState.serverData;
            else if (type === 'database') chart.data = chartState.databaseData;
            else if (type === 'storage') chart.data = chartState.storageData;

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'date';
            dateAxis.renderer.grid.template.disabled = true;
            dateAxis.renderer.minGridDistance = 10;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[500]);
            dateAxis.fontSize = 12;

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.minGridDistance = 30;
            valueAxis.renderer.grid.template.strokeWidth = 1;
            valueAxis.renderer.grid.template.strokeOpacity = 0.7;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(gray[500]);
            valueAxis.fontSize = 10;
            valueAxis.min = 0;

            const series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = 'count';
            series.dataFields.categoryX = 'date';
            series.fill = am4core.color(color);
            series.strokeWidth = 0;
            series.columns.template.width = am4core.percent(50);
            series.columns.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
            series.columns.template.events.on('over', (ev) => {
                ev.target.fill = am4core.color(hoverColor);
            });
            series.columns.template.events.on('out', (ev) => {
                ev.target.fill = am4core.color(color);
            });

            const bullet = series.bullets.push(new am4charts.LabelBullet());
            bullet.label.text = '{count}';
            bullet.label.fontSize = 14;
            bullet.label.truncate = false;
            bullet.label.hideOversized = false;
            bullet.label.fill = am4core.color(color);
            bullet.label.dy = -10;
            // bullet.label.adapter.add('text', (text, target) => {
            //     if (target.dataItem && target.dataItem.valueY === 0) {
            //         return '';
            //     }
            //     return text;
            // });
        };
        const numberCommaFormatter = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        const init = async () => {
            state.loading = true;
            await getCount();
            //
            await getTrend('server');
            await getTrend('database');
            await getTrend('storage');
            //
            await getServerInfo();
            await getDatabaseInfo();
            await getStorageInfo();
            //
            state.loading = false;
        };
        init();

        watch([() => state.serverChartRef, () => chartState.serverData], ([chartContext, data]) => {
            if (chartContext && data) {
                drawChart(state.serverChartRef, 'server', SERVER_COLOR, SERVER_HOVER_COLOR);
            }
        });
        watch([() => state.databaseChartRef, () => chartState.databaseData], ([chartContext, data]) => {
            if (chartContext && data) {
                drawChart(state.databaseChartRef, 'database', DATABASE_COLOR, DATABASE_HOVER_COLOR);
            }
        });
        watch([() => state.storageChartRef, () => chartState.storageData], ([chartContext, data]) => {
            if (chartContext && data) {
                drawChart(state.storageChartRef, 'storage', STORAGE_COLOR, STORAGE_HOVER_COLOR);
            }
        });

        return {
            ...toRefs(state),
            chartState,
            numberCommaFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>

@define-mixin box-theme $color, $hover-color {
    .count {
        color: $color;
    }

    &:hover {
        background-color: $hover-color;
    }
    &.server:not(.activated):hover {
        background-color: rgba(theme('colors.indigo.400'), 0.1)
    }
    &.activated {
        @apply text-white;
        background-color: $color;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

        .suffix {
            @apply text-white;
        }
        .count {
            color: white;
        }
    }
}

.all-summary-page {
    .top-part {
        height: 8rem;

        .box {
            @apply bg-white border border-gray-100;
            display: flex;
            height: 100%;
            cursor: pointer;
            padding: 1.375rem;

            .count {
                font-size: 2.5rem;
                font-weight: bold;
                line-height: 2.5rem;
                margin-bottom: 1rem;

                .suffix {
                    @apply text-gray-700;
                    font-size: 1rem;
                    font-weight: normal;
                    padding-left: 0.5rem;
                }
                .dollar-sign {
                    font-size: 2rem;
                    font-weight: normal;
                }
            }

            .title {
                font-size: 1rem;
                text-transform: capitalize;
            }

            &.server {
                @mixin box-theme theme('colors.indigo.400'), rgba(theme('colors.indigo.400'), 0.1);
            }
            &.database {
                @mixin box-theme theme('colors.primary1'), theme('colors.primary3');
            }
            &.storage {
                @mixin box-theme theme('colors.coral.400'), theme('colors.coral.100');
            }
            &.spendings {
                @mixin box-theme theme('colors.peacock.500'), theme('colors.peacock.100');
            }
        }
    }

    .bottom-part {
        @apply border border-gray-100;
        border-top-width: 0;
        margin-top: 1.375rem;

        .top-line {
            width: 100%;
            height: 0.15625rem;
            &.server {
                @apply bg-indigo-400;
            }
            &.database {
                @apply bg-primary1;
            }
            &.storage {
                @apply bg-coral-400;
            }
            &.spendings {
                @apply bg-peacock-500;
            }
        }
    }

    .carousel-wrapper {
        @apply bg-white;
        position: relative;
        padding: 1rem 1.5rem;

        .triangle-wrapper {
            position: absolute;
            width: 25%;
            height: 16px;
            top: -1rem;
            transition: left 0.3s linear;

            &.server {
                left: 0;
                .triangle {
                    border-bottom-color: theme('colors.indigo.400');
                }
            }
            &.database {
                left: 25%;
                .triangle {
                    border-bottom-color: theme('colors.primary1');
                }
            }
            &.storage {
                left: 50%;
                .triangle {
                    border-bottom-color: theme('colors.coral.400');
                }
            }
            &.spendings {
                left: 75%;
                .triangle {
                    border-bottom-color: theme('colors.peacock.500');
                }
            }
            .triangle {
                position: relative;
                width: 0;
                height: 0;
                margin: 0 auto;
                border-left: 12px solid transparent;
                border-right: 12px solid transparent;
                border-bottom: 14px solid;

                &:before {
                    position: absolute;
                    width: 0;
                    height: 0;
                    top: 4px;
                    left: -12px;
                    content: '';
                    border-left: 12px solid transparent;
                    border-right: 12px solid transparent;
                    border-bottom: 14px solid white;
                }
            }
        }

        .title {
            font-size: 1rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        .chart-wrapper {
            .chart {
                height: 15rem;
            }
        }
        .summary-wrapper {
            .title {
                margin-bottom: 1.25rem;
            }
            .summary-row {
                font-size: 0.875rem;
                padding: 0.5rem 0;
                .provider {
                    &.aws {
                        font-weight: bold;
                        color: #FF9900;
                    }
                    &.gcp {
                        font-weight: bold;
                        color: #4285F4;
                    }
                    &.azure {
                        font-weight: bold;
                        color: #00BCF2;
                    }
                }
                .type {
                    padding-left: 0.5rem;
                }
                .count {
                    @apply text-gray-700;
                    float: right;
                }
            }
        }
    }
}
</style>
