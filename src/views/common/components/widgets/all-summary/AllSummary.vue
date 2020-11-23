<template>
    <div class="all-summary-page">
        <div class="top-part grid grid-cols-12 gap-3">
            <div v-for="(data, idx) of dataList" :key="idx"
                 class="box col-span-6 sm:col-span-3 md:col-span-3 lg:col-span-3"
                 :class="[{'selected': idx === selectedIndex}, data.type]"
                 @click="onClickBox(idx)"
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
                    <div class="chart-wrapper col-span-12 lg:col-span-9">
                        <div class="title">
                            {{ $t('COMMON.WIDGETS.ALL_SUMMARY_TREND_TITLE') }}
                        </div>
                        <div class="toggle-button-group">
                            <p-button v-for="(d, idx) in dateTypes"
                                      :key="idx"
                                      :class="{'selected': selectedDateType === d.name}"
                                      @click="onClickDateTypeButton(d.name)"
                            >
                                {{ d.label }}
                            </p-button>
                        </div>
                        <p-chart-loader :loading="chartState.loading">
                            <template #loader>
                                <p-skeleton width="100%" height="100%" />
                            </template>
                            <div ref="chartRef" class="chart" />
                        </p-chart-loader>
                    </div>
                    <div class="summary-wrapper col-span-12 lg:col-span-3">
                        <div class="grid grid-cols-3">
                            <div class="title col-span-3">
                                {{ $t('COMMON.WIDGETS.ALL_SUMMARY_TYPE_TITLE', { service: dataList[selectedIndex].title }) }}
                            </div>
                            <template v-if="!loading" class="">
                                <router-link v-for="(data, idx) of dataList[selectedIndex].summaryData" :key="idx"
                                             :to="data.to"
                                             class="summary-row col-span-3 md:col-span-1 lg:col-span-3"
                                >
                                    <div class="text-group">
                                        <span class="provider" :style="{ color: colorState[data.label.toLowerCase()] }">
                                            {{ data.provider === 'all' ? $t('COMMON.WIDGETS.ALL_SUMMARY_ALL') : data.label }}
                                        </span>
                                        <span class="type">{{ data.type }}</span>
                                    </div>
                                    <span class="count">{{ data.count }}</span>
                                </router-link>
                            </template>
                            <template v-else>
                                <div v-for="v in skeletons" :key="v" class="flex items-center p-4 col-span-3">
                                    <p-skeleton width="1.5rem" height="1.5rem" class="mr-4 flex-shrink-0" />
                                    <p-skeleton class="flex-grow" />
                                </div>
                            </template>
                        </div>
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
    find, forEach, orderBy, range,
} from 'lodash';
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { TranslateResult } from 'vue-i18n';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';

import { referenceRouter } from '@/lib/reference/referenceRouter';
import { SpaceConnector } from '@/lib/space-connector';
import { gray, primary, primary1 } from '@/styles/colors';

am4core.useTheme(am4themes_animated);
am4core.options.autoSetClassName = true;
am4core.options.classNamePrefix = 'allSummary';

interface ChartData {
    date: string;
    count: number;
}
interface SummaryData {
    provider: string;
    label: string | TranslateResult;
    count: number | string;
    type?: string;
    to: string;
}

enum DATE_TYPE {
    daily = 'daily',
    monthly = 'monthly',
}
enum CLOUD_SERVICE_LABEL {
    compute = 'Compute',
    database = 'Database',
    storage = 'Storage',
}

const DAY_COUNT = 14;
const MONTH_COUNT = 12;
const BOX_SWITCH_INTERVAL = 5000;

export default {
    name: 'AllSummary',
    components: {
        PButton,
        PSkeleton,
        PChartLoader,
    },
    props: {
        providers: {
            type: Object,
            default: () => ({}),
        },
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: false,
            chartRef: null as HTMLElement | null,
            skeletons: range(3),
            //
            selectedIndexInterval: undefined,
            selectedIndex: 0,
            selectedType: computed(() => state.dataList[state.selectedIndex].type),
            selectedDateType: 'daily' as keyof typeof DATE_TYPE,
            dateTypes: computed(() => ([
                { name: 'daily', label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_DAY') },
                { name: 'monthly', label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_MONTH') },
            ])),
            //
            count: {
                compute: 0,
                database: 0,
                storage: 0,
            },
            suffix: {
                compute: 'ea',
                database: 'ea',
                storage: 'TB',
            },
            overallSpendings: computed(() => vm.$t('COMMON.WIDGETS.ALL_SUMMARY_UPCOMING')),
            dataList: computed(() => ([
                {
                    type: 'compute',
                    title: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_COMPUTE'),
                    count: state.count.compute,
                    summaryData: state.computeSummaryData,
                    suffix: state.suffix.compute,
                    to: referenceRouter('', { resource_type: 'inventory.Server' }),
                },
                {
                    type: 'database',
                    title: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_DATABASE'),
                    count: state.count.database,
                    summaryData: state.databaseSummaryData,
                    suffix: state.suffix.database,
                    to: '/inventory/cloud-service?provider=all&service=Database',
                },
                {
                    type: 'storage',
                    title: vm.$t('COMMON.WIDGETS.ALL_SUMMARY_STORAGE'),
                    count: state.count.storage,
                    summaryData: state.storageSummaryData,
                    suffix: state.suffix.storage,
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
            computeSummaryData: [] as SummaryData[],
            databaseSummaryData: [] as SummaryData[],
            storageSummaryData: [] as SummaryData[],
        });
        const chartState = reactive({
            loading: false,
            registry: {},
            data: [] as ChartData[],
        });
        const colorState = reactive({
            aws: computed(() => props.providers.aws.color),
            google: computed(() => props.providers.google_cloud.color),
            azure: computed(() => props.providers.azure.color),
        });

        /* util */
        const formatBytes: any = (bytes, decimals = 2, toString = true) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            if (toString) return `${parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
            return {
                count: parseFloat((bytes / (k ** i)).toFixed(dm)),
                unit: sizes[i],
            };
        };
        const disposeChart = () => {
            if (chartState.registry[state.chartRef]) {
                chartState.registry[state.chartRef].dispose();
                delete chartState.registry[state.chartRef];
            }
        };
        const drawChart = () => {
            const createChart = () => {
                disposeChart();
                chartState.registry[state.chartRef] = am4core.create(state.chartRef, am4charts.XYChart);
                return chartState.registry[state.chartRef];
            };
            const chart = createChart();

            chart.logo.disabled = true;
            chart.paddingLeft = -5;
            chart.paddingBottom = 0;
            chart.paddingTop = 10;
            chart.data = chartState.data;

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'date';
            dateAxis.renderer.minGridDistance = 40;
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
            valueAxis.extraMax = 0.1;

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
            bullet.label.fill = am4core.color(primary);
            bullet.label.dy = -10;
        };
        const setBoxInterval = () => {
            state.selectedIndexInterval = setInterval(() => {
                disposeChart();
                if (state.selectedIndex < 3) {
                    state.selectedIndex += 1;
                } else {
                    state.selectedIndex = 0;
                }
            }, BOX_SWITCH_INTERVAL);
        };
        const numberCommaFormatter = (num) => {
            if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return num;
        };

        /* api */
        const getCount = async (type) => {
            try {
                const res = await SpaceConnector.client.statistics.topic.cloudServiceSummary({
                    label: CLOUD_SERVICE_LABEL[type],
                    project_id: props.projectId,
                });
                const count = res.results[0]?.total || 0;
                if (count === 0) return;

                if (type === 'storage') {
                    const formattedSize = formatBytes(count, 1, false);
                    state.count[type] = formattedSize.count;
                    state.suffix[type] = formattedSize.unit;
                } else {
                    state.count[type] = count;
                }
            } catch (e) {
                console.error(e);
            }
        };
        const getTrend = async (type) => {
            const utcToday = dayjs().utc();
            const dateType = state.selectedDateType;
            const dateRange = dateType === DATE_TYPE.monthly ? MONTH_COUNT : DAY_COUNT;
            const dateUnit = dateType === DATE_TYPE.monthly ? 'month' : 'day';
            const dateFormat = dateType === DATE_TYPE.monthly ? 'MMM' : 'MM/DD';

            try {
                chartState.loading = true;
                const res = await SpaceConnector.client.statistics.topic.dailyCloudServiceSummary({
                    label: CLOUD_SERVICE_LABEL[type],
                    aggregate: dateType,
                    project_id: props.projectId,
                });

                const chartData = res.results.map(d => ({
                    date: dayjs(d.date),
                    count: type === 'storage' ? formatBytes(d.total, 1, false).count : d.total,
                }));
                forEach(range(0, dateRange), (i) => {
                    const date = utcToday.subtract(i, dateUnit);
                    if (!find(chartData, { date })) {
                        chartData.push({ date, count: null });
                    }
                });

                const orderedData = orderBy(chartData, ['date'], ['asc']);
                chartState.data = orderedData.map((d) => {
                    if (dateType === DATE_TYPE.monthly && (d.date.format('M') === '1' || d.date.format('M') === '12')) {
                        return {
                            date: d.date.format('MMM, YY'),
                            count: d.count,
                        };
                    }
                    return {
                        date: d.date.format(dateFormat),
                        count: d.count,
                    };
                });
            } catch (e) {
                console.error(e);
            } finally {
                chartState.loading = false;
            }
        };
        const getSummaryInfo = async (type) => {
            try {
                // set value of 'All' type
                let param;
                let count;
                let allLink;
                const defaultParam: any = {
                    labels: [CLOUD_SERVICE_LABEL[type]],
                    is_major: true,
                    query: {
                        sort: {
                            name: 'count',
                            desc: true,
                        },
                    },
                };
                if (props.projectId) {
                    defaultParam.query.filter = {
                        key: 'project_id',
                        value: [props.projectId],
                        operator: 'in',
                    };
                }
                if (type === 'compute') {
                    param = {
                        ...defaultParam,
                        resource_type: 'inventory.Server',
                    };
                    count = state.count.compute;
                    allLink = referenceRouter('', { resource_type: 'inventory.Server' });
                } else if (type === 'database') {
                    param = {
                        ...defaultParam,
                    };
                    count = state.count.database;
                    allLink = '/inventory/cloud-service?provider=all&service=Database';
                } else {
                    param = {
                        ...defaultParam,
                    };
                    param.query.sort = { name: 'size', desc: true };
                    param.fields = [
                        {
                            name: 'size',
                            operator: 'sum',
                            key: 'data.size',
                        },
                    ];
                    count = `${state.count.storage} ${state.suffix.storage}`;
                    allLink = '/inventory/cloud-service?provider=all&service=Storage';
                }

                // set value of 'each' type
                const res = await SpaceConnector.client.statistics.topic.cloudServiceResources(param);
                const summaryData: SummaryData[] = [
                    {
                        provider: 'all',
                        label: '',
                        count,
                        to: allLink,
                    },
                ];
                res.results.forEach((d) => {
                    let detailLink;
                    if (type === 'compute') {
                        detailLink = `/inventory/server?filters=provider%3A${d.provider}`;
                    } else {
                        detailLink = referenceRouter(d.cloud_service_type_id, { resource_type: 'inventory.CloudServiceType' });
                    }
                    summaryData.push({
                        provider: d.provider,
                        label: props.providers[d.provider].label,
                        type: d.display_name || d.cloud_service_group,
                        count: type === 'storage' ? formatBytes(d.size, 1) : d.count,
                        to: detailLink,
                    });
                });
                if (type === 'compute') {
                    state.computeSummaryData = summaryData;
                } else if (type === 'database') {
                    state.databaseSummaryData = summaryData;
                } else {
                    state.storageSummaryData = summaryData;
                }
            } catch (e) {
                console.error(e);
            }
        };

        /* event */
        const onClickBox = (idx) => {
            if (idx !== state.selectedIndex) disposeChart();
            state.selectedIndex = idx;
            clearInterval(state.selectedIndexInterval);
        };
        const onClickDateTypeButton = (type) => {
            state.selectedDateType = type;
            clearInterval(state.selectedIndexInterval);
        };

        const init = async () => {
            state.loading = true;
            await getCount('compute');
            if (state.count.compute > 0) await getSummaryInfo('compute');
            state.loading = false;
            setBoxInterval();

            await getCount('database');
            if (state.count.database > 0) await getSummaryInfo('database');

            await getCount('storage');
            if (state.count.storage > 0) await getSummaryInfo('storage');
        };
        const chartInit = async () => {
            await getTrend('compute');
        };
        init();
        chartInit();

        watch([() => chartState.loading, () => state.chartRef], async ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart();
            }
        }, { immediate: false });
        watch(() => state.selectedType, (type) => {
            if (type !== 'spendings') {
                getTrend(type);
            }
        }, { immediate: false });
        watch(() => state.selectedDateType, async () => {
            await getTrend(state.selectedType);
            drawChart();
        }, { immediate: false });

        return {
            ...toRefs(state),
            chartState,
            colorState,
            onClickBox,
            onClickDateTypeButton,
            numberCommaFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.all-summary-page {
    .top-part {
        .box {
            @apply bg-white;
            position: relative;
            display: flex;
            height: 7.25rem;
            cursor: pointer;
            border-radius: 0.375rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            padding-left: 1rem;
            @screen lg {
                padding-left: 1.25rem;
            }

            &:hover {
                background-color: rgba(theme('colors.indigo.400'), 0.1);
            }
            &.selected {
                @apply bg-primary1 text-white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
                    display: none;
                    content: '';
                    width: 0;
                    border-style: solid;
                    border-color: theme('colors.primary1') transparent;
                    border-width: 0.5rem 0.5rem 0;
                    bottom: -0.45rem;
                    left: 50%;
                    margin-left: -0.5rem;
                    @screen sm {
                        display: block;
                    }
                }
            }
            &.spendings {
                .count .number {
                    font-size: 1.25rem;
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
                        border-bottom: 2px solid;
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
                    @apply text-gray-500;
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
                @apply text-gray-900;
                font-size: 1rem;
                text-transform: capitalize;
            }
        }
    }

    .bottom-part {
        margin-top: 1rem;

        .content-wrapper {
            @apply bg-white;
            position: relative;
            border-radius: 0.375rem;
            padding: 1.25rem 1.5rem;
            @screen sm {
                min-height: 27rem;
            }
            @screen md {
                min-height: 23.625rem;
            }
            @screen lg {
                min-height: 17.5rem;
            }

            .title {
                font-size: 1rem;
                font-weight: bold;
                margin-bottom: 1rem;
            }
            .chart-wrapper {
                position: relative;
                .toggle-button-group {
                    position: absolute;
                    right: 0.5rem;
                    top: 0;
                    .p-button {
                        @apply border border-gray-200 text-gray-300;
                        height: 1.25rem;
                        min-width: 2rem;
                        font-size: 0.75rem;
                        font-weight: normal;
                        border-radius: 0.125rem;
                        padding: 0.25rem;
                        margin-left: 0.25rem;
                        &.selected {
                            @apply bg-gray-600 border-gray-600 text-white;
                        }
                    }
                }
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
                    line-height: 1.2;
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

<style lang="postcss">
.allSummaryLabelBullet-group {
    display: none;
    &:last-child {
        display: block;
    }
    @screen sm {
        display: block;
    }
}
</style>
