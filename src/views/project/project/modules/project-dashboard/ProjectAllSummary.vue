<template>
    <div class="project-all-summary">
        <div class="title">
            <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.TITLE') }}</span>
        </div>
        <div class="top-part">
            <div v-for="(data, idx) of dataList" :key="idx"
                 class="box"
                 :class="[{'selected': idx === selectedIndex}, data.type]"
                 @click="onClickBox(idx)"
            >
                <span>{{ data.label }}</span>
                <span v-if="data.type === 'storage'" class="suffix">({{ storageSuffix }})</span>
                <span class="count"> {{ data.type === 'storage' ? byteFormatter(count[data.type]).split(' ')[0] : commaFormatter(count[data.type]) }}</span>
            </div>
        </div>
        <div class="bottom-part">
            <div class="content-wrapper grid grid-cols-12 gap-2">
                <div class="chart-wrapper col-span-12 lg:col-span-7">
                    <div class="sub-title">
                        <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.TREND_TITLE') }}</span>
                        <span v-if="selectedType === 'storage'" class="suffix">({{ storageTrendSuffix }})</span>
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
                <div class="col-span-12 md:col-span-4 lg:col-span-2 summary-wrapper">
                    <div class="sub-title">
                        {{ $t('COMMON.WIDGETS.ALL_SUMMARY.TYPE_TITLE', { service: dataList[selectedIndex].label }) }}
                    </div>
                    <template v-if="!loading && summaryData.length > 0">
                        <div class="summary-content-wrapper">
                            <router-link :to="getLocation(selectedType)"
                                         class="summary-row"
                            >
                                <div class="text-group">
                                    <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.ALL') }}</span>
                                </div>
                                <span class="count">{{ selectedType === 'storage' ? byteFormatter(count[selectedType]) : commaFormatter(count[selectedType]) }}</span>
                            </router-link>
                            <router-link v-for="(data, idx) of summaryData" :key="idx"
                                         :to="data.to"
                                         class="summary-row"
                            >
                                <div class="text-group">
                                    <span class="provider" :style="{ color: colorState[data.label.toLowerCase()] }">{{ data.label }}</span>
                                    <span class="type">{{ data.type }}</span>
                                </div>
                                <span class="count">{{ data.count }}</span>
                            </router-link>
                        </div>
                    </template>
                    <template v-else-if="!loading">
                        <div class="summary-content-wrapper no-data-wrapper grid">
                            <div class="m-auto">
                                <img src="@/assets/images/illust_cloud.svg" class="empty-image hidden lg:block">
                                <p class="text">
                                    {{ $t('COMMON.WIDGETS.ALL_SUMMARY.NO_SERVICE', { service: dataList[selectedIndex].label }) }}
                                </p>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div v-for="v in skeletons" :key="v" class="flex items-center p-2 col-span-3">
                            <p-skeleton class="flex-grow" />
                        </div>
                    </template>
                </div>
                <div class="col-span-12 md:col-span-5 lg:col-span-3 region-service-wrapper">
                    <div class="sub-title">
                        <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.REGION_SERVICE_TITLE') }}</span>
                    </div>
                    <project-region-service :project-id="projectId" :label="selectedLabel" :count="count[selectedType]" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    forEach, orderBy, range,
} from 'lodash';
import bytes from 'bytes';
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { TranslateResult } from 'vue-i18n';
import { Location } from 'vue-router';

import {
    reactive, toRefs, watch, computed,
    onUnmounted, ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import ProjectRegionService from '@/views/project/project/modules/project-dashboard/ProjectRegionService.vue';
import {
    PChartLoader, PSkeleton, PButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@/lib/space-connector';
import { QueryHelper } from '@/lib/query';
import { QueryStoreFilter } from '@/lib/query/type';
import { gray, peacock } from '@/styles/colors';
import { store } from '@/store';

am4core.useTheme(am4themes_animated);

/* enum */
enum DATE_TYPE {
    daily = 'DAILY',
    monthly = 'MONTHLY',
}
enum DATA_TYPE {
    compute = 'compute',
    container = 'container',
    database = 'database',
    networking = 'networking',
    storage = 'storage',
    security = 'security',
    analytics = 'analytics',
    all = 'all',
}
enum CLOUD_SERVICE_LABEL {
    compute = 'Compute',
    container = 'Container',
    database = 'Database',
    networking = 'Networking',
    storage = 'Storage',
    security = 'Security',
    analytics = 'Analytics',
    all = 'All',
}

/* type */
type Unit = 'b' | 'gb' | 'kb' | 'mb' | 'pb' | 'tb' | 'B' | 'GB' | 'KB' | 'MB' | 'PB' | 'TB';
interface ChartData {
    date: string;
    count: number;
}
interface Data {
    type: keyof typeof DATA_TYPE;
    label: TranslateResult;
}
interface SummaryData {
    type: string;
    provider: string;
    label: string | TranslateResult;
    count: number | string;
    to: string | Location;
}

const DAY_COUNT = 14;
const MONTH_COUNT = 12;

export default {
    name: 'ProjectAllSummary',
    components: {
        ProjectRegionService,
        PButton,
        PSkeleton,
        PChartLoader,
    },
    props: {
        projectId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper();

        const byteFormatter = (num, option = {}) => bytes(num, { ...option, unitSeparator: ' ', decimalPlaces: 1 });
        const numberFormatter = (num) => {
            if (Math.abs(num) < 10000) {
                return Math.round(num * 10) / 10;
            }
            const options = {
                notation: 'compact',
                signDisplay: 'auto',
                maximumFractionDigits: 1,
            };
            return Intl.NumberFormat('en', options).format(num);
        };
        const commaFormatter = (num) => {
            if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return num;
        };

        const state = reactive({
            loading: false,
            chart: null,
            chartRef: null as HTMLElement | null,
            skeletons: range(4),
            providers: computed(() => store.state.resource.provider.items),
            //
            selectedIndex: 0,
            selectedType: computed(() => state.dataList[state.selectedIndex].type),
            selectedLabel: computed(() => CLOUD_SERVICE_LABEL[state.selectedType]),
            selectedDateType: DATE_TYPE.daily,
            dateTypes: computed(() => ([
                { name: DATE_TYPE.daily, label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY.DAY') },
                { name: DATE_TYPE.monthly, label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY.MONTH') },
            ])),
            //
            count: {
                compute: 0,
                container: 0,
                database: 0,
                networking: 0,
                storage: 0,
                security: 0,
                analytics: 0,
                all: 0,
            },
            storageSuffix: 'TB' as Unit,
            storageTrendSuffix: 'TB' as Unit,
            dataList: computed(() => ([
                { type: DATA_TYPE.compute, label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY.COMPUTE') },
                { type: DATA_TYPE.container, label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY.CONTAINER') },
                { type: DATA_TYPE.database, label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY.DATABASE') },
                { type: DATA_TYPE.networking, label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY.NETWORKING') },
                { type: DATA_TYPE.storage, label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY.STORAGE') },
                { type: DATA_TYPE.security, label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY.SECURITY') },
                { type: DATA_TYPE.analytics, label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY.ANALYTICS') },
                { type: DATA_TYPE.all, label: vm.$t('COMMON.WIDGETS.ALL_SUMMARY.CLOUD_SERVICE') },
            ] as Data[])),
            summaryData: [] as SummaryData[],
        });
        const chartState = reactive({
            loading: true,
            registry: {},
            data: [] as ChartData[],
        });
        const colorState = reactive({
            aws: computed(() => state.providers.aws.color),
            google: computed(() => state.providers.google_cloud.color),
            azure: computed(() => state.providers.azure.color),
        });

        /* util */
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
            state.chart = chart;

            chart.logo.disabled = true;
            chart.paddingLeft = -5;
            chart.paddingBottom = 0;
            chart.paddingTop = 10;
            chart.data = chartState.data;

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'date';
            dateAxis.renderer.minGridDistance = 40;
            dateAxis.renderer.grid.template.disabled = true;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            dateAxis.tooltip.disabled = true;
            dateAxis.fontSize = 11;

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.minGridDistance = 30;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(peacock[500]);
            valueAxis.tooltip.disabled = true;
            valueAxis.fontSize = 11;
            valueAxis.extraMax = 0.25;
            valueAxis.min = 0;

            const series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = 'count';
            series.dataFields.categoryX = 'date';
            series.fill = am4core.color(peacock[500]);
            series.columns.template.width = am4core.percent(15);
            series.strokeWidth = 0;
            series.tooltipText = '{count}';
            series.tooltip.pointerOrientation = 'down';
            series.tooltip.fontSize = 14;
            series.tooltip.strokeWidth = 0;
            series.tooltip.dy = -5;
            series.tooltip.getFillFromObject = false;
            series.tooltip.label.fill = am4core.color(peacock[600]);
            series.tooltip.background.stroke = am4core.color(peacock[400]);

            const bullet = series.bullets.push(new am4charts.LabelBullet());
            bullet.label.text = '{bulletText}';
            bullet.label.fontSize = 14;
            bullet.label.truncate = false;
            bullet.label.hideOversized = false;
            bullet.label.fill = am4core.color(peacock[600]);
            bullet.label.dy = -10;

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.lineX.strokeOpacity = 0;
            chart.cursor.lineY.strokeOpacity = 0;
            chart.cursor.behavior = 'none';
        };
        const getLocation = (type) => {
            const query: Location['query'] = {
                provider: 'all',
                service: CLOUD_SERVICE_LABEL[type],
            };
            if (type === DATA_TYPE.storage) query.primary = 'false';

            // set filters
            queryHelper.setFilters([{ k: 'project_id', o: '=', v: props.projectId }]);

            const location: Location = {
                name: 'cloudServiceMain',
                query: {
                    filters: queryHelper.rawQueryStrings,
                    ...query,
                },
            };
            return location;
        };

        /* api */
        const getCount = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.cloudServiceSummary({
                    project_id: props.projectId,
                });
                let count = 0 as number | string;
                res.results.forEach((d) => {
                    if (d.label === CLOUD_SERVICE_LABEL.storage) {
                        state.storageSuffix = byteFormatter(d.total).split(' ')[1];
                    }
                    count = d.total;
                    state.count[Object.keys(CLOUD_SERVICE_LABEL)[Object.values(CLOUD_SERVICE_LABEL).indexOf(d.label)]] = count;
                });
            } catch (e) {
                console.error(e);
            }
        };
        const getTrend = async (type) => {
            const utcToday = dayjs().utc();
            const dateRange = state.selectedDateType === DATE_TYPE.monthly ? MONTH_COUNT : DAY_COUNT;
            const dateUnit = state.selectedDateType === DATE_TYPE.monthly ? 'month' : 'day';
            const dateFormat = state.selectedDateType === DATE_TYPE.monthly ? 'MMM' : 'MM/DD';

            try {
                const param: any = {
                    granularity: state.selectedDateType,
                    project_id: props.projectId,
                };
                if (type !== DATA_TYPE.all) param.label = CLOUD_SERVICE_LABEL[type];
                const res = await SpaceConnector.client.statistics.topic.dailyCloudServiceSummary(param);
                const data = res.results;

                if (type === DATA_TYPE.storage) {
                    const smallestCount = Math.min(...data.map(d => d.total));
                    const formattedSize = byteFormatter(smallestCount);
                    if (formattedSize) state.storageTrendSuffix = formattedSize.split(' ')[1] as Unit;
                }
                const chartData = data.map((d) => {
                    let count = d.total;
                    if (type === DATA_TYPE.storage) {
                        const formattedSize = byteFormatter(d.total, { unit: state.storageTrendSuffix });
                        if (formattedSize) count = formattedSize.split(' ')[0];
                    }
                    return {
                        date: dayjs(d.date),
                        count,
                    };
                });
                forEach(range(0, dateRange), (i) => {
                    const date = utcToday.subtract(i, dateUnit);
                    if (!(chartData.find(d => d.date.isSame(date, 'day')))) {
                        chartData.push({ date, count: null });
                    }
                });

                const orderedData = orderBy(chartData, ['date'], ['asc']);
                chartState.data = orderedData.map((d, idx) => {
                    let bulletText = '';
                    if (idx % 3 === 1) bulletText = d.count;
                    if (state.selectedDateType === DATE_TYPE.monthly && (d.date.format('M') === '1' || d.date.format('M') === '12')) {
                        return {
                            date: d.date.format('MMM, YY'),
                            count: d.count,
                            bulletText,
                        };
                    }
                    return {
                        date: d.date.format(dateFormat),
                        count: d.count,
                        bulletText,
                    };
                });
            } catch (e) {
                console.error(e);
            }
        };
        const getApiParameter = (type) => {
            let param;
            const defaultParam: any = {
                query: {
                    sort: {
                        name: 'count',
                        desc: true,
                    },
                },
            };
            if (type !== DATA_TYPE.all) defaultParam.labels = [CLOUD_SERVICE_LABEL[type]];
            defaultParam.query.filter = {
                key: 'project_id',
                operator: 'eq',
                value: props.projectId,
            };

            if (type === DATA_TYPE.compute) {
                param = {
                    ...defaultParam,
                    resource_type: 'inventory.Server',
                    is_primary: true,
                };
            } else if (type === DATA_TYPE.storage) {
                param = {
                    ...defaultParam,
                    is_major: true,
                };
                param.query.sort = { name: 'size', desc: true };
                param.fields = [
                    {
                        name: 'size',
                        operator: 'sum',
                        key: 'data.size',
                    },
                ];
            } else {
                param = {
                    ...defaultParam,
                    is_primary: true,
                };
            }
            return param;
        };
        const getSummaryInfo = async (type) => {
            try {
                state.loading = true;
                const param = getApiParameter(type);
                const res = await SpaceConnector.client.statistics.topic.cloudServiceResources(param);
                const summaryData: SummaryData[] = [];

                const summaryQueryHelper = new QueryHelper();
                res.results.forEach((d) => {
                    let detailLocation: Location;
                    const filters: QueryStoreFilter[] = [];
                    filters.push({
                        k: 'project_id', o: '=', v: props.projectId,
                    });

                    if (d.resource_type === 'inventory.Server') {
                        filters.push(
                            { k: 'provider', o: '=', v: d.provider },
                            { k: 'cloud_service_type', o: '=', v: d.cloud_service_type },
                        );
                        detailLocation = {
                            name: 'server',
                            query: {
                                filters: summaryQueryHelper.setFilters(filters).rawQueryStrings,
                            },
                        };
                    } else {
                        detailLocation = {
                            name: 'cloudServicePage',
                            params: {
                                provider: d.provider,
                                group: d.cloud_service_group,
                                name: d.cloud_service_type,
                            },
                            query: {
                                filters: summaryQueryHelper.setFilters(filters).rawQueryStrings,
                            },
                        };
                    }
                    summaryData.push({
                        provider: d.provider,
                        label: state.providers[d.provider].label,
                        type: d.display_name || d.cloud_service_group,
                        count: type === DATA_TYPE.storage ? byteFormatter(d.size) : commaFormatter(d.count),
                        to: detailLocation,
                    });
                });
                state.summaryData = summaryData;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        /* event */
        const onClickBox = (idx) => {
            if (idx !== state.selectedIndex) disposeChart();
            state.selectedIndex = idx;
        };
        const onClickDateTypeButton = (type) => {
            state.selectedDateType = type;
        };

        const init = async () => {
            await Promise.all([getSummaryInfo(DATA_TYPE.compute), getCount()]);
        };
        const chartInit = async () => {
            await getTrend(DATA_TYPE.compute);
            setTimeout(() => {
                chartState.loading = false;
            }, 300);
        };
        init();
        chartInit();

        watch([() => chartState.loading, () => state.chartRef], async ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart();
            }
        }, { immediate: false });
        watch(() => state.selectedType, async (type) => {
            await Promise.all([getSummaryInfo(type), getTrend(type)]);
            drawChart();
        }, { immediate: false });
        watch(() => state.selectedDateType, async () => {
            await getTrend(state.selectedType);
            drawChart();
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            chartState,
            colorState,
            onClickBox,
            onClickDateTypeButton,
            byteFormatter,
            commaFormatter,
            numberFormatter,
            getLocation,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title {
    font-size: 1.5rem;
    line-height: 1.6;
    margin-bottom: 0.5rem;
}
.sub-title {
    font-size: 0.875rem;
    line-height: 1.5;
    font-weight: bold;
    margin-bottom: 1rem;
    .suffix {
        font-size: 0.75rem;
        font-weight: normal;
        padding-left: 0.5rem;
    }
}
.top-part {
    .box {
        @apply bg-white border border-gray-200;
        position: relative;
        display: inline-block;
        width: auto;
        line-height: 1.6;
        font-size: 1rem;
        cursor: pointer;
        border-radius: 0.375rem;
        padding: 0.375rem 1rem;
        margin-right: 0.375rem;
        margin-bottom: 0.375rem;
        .suffix {
            @apply text-gray-500;
            font-size: 0.75rem;
            padding-left: 0.125rem;
        }
        .count {
            @apply text-peacock-600;
            font-weight: bold;
        }

        &:hover {
            @apply bg-secondary2;
        }
        &.selected {
            @apply bg-peacock-600 text-white border-peacock-600;
            .suffix, .count {
                @apply text-white;
            }
            &::after {
                position: absolute;
                display: none;
                content: '';
                width: 0;
                border-style: solid;
                border-color: theme('colors.peacock.600') transparent;
                border-width: 0.5rem 0.5rem 0;
                border-radius: 0.125rem;
                bottom: -0.45rem;
                left: 50%;
                margin-left: -0.5rem;

                @screen lg {
                    display: block;
                }
            }
        }
        &.compute {
            width: 8.5rem;
        }
        &.container {
            width: 8.875rem;
        }
        &.database {
            width: 8.625rem;
        }
        &.networking {
            width: 9.75rem;
        }
        &.storage {
            width: 9.625rem;
        }
        &.security {
            width: 8rem;
        }
        &.analytics {
            width: 8.375rem;
        }
        &.all {
            width: 10.5rem;
        }
    }
}
.bottom-part {
    margin-top: 0.625rem;

    .content-wrapper {
        @apply bg-white border border-gray-200;
        position: relative;
        height: auto;
        border-radius: 0.125rem;
        padding: 1rem;

        @screen lg {
            height: 17.5rem;
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
            .sub-title {
                padding-left: 0.5rem;
            }
            .summary-content-wrapper {
                height: 5rem;
                overflow-y: auto;
                overflow-x: hidden;

                @screen lg {
                    height: 13rem;
                }

                &.no-data-wrapper {
                    .empty-image {
                        margin: 0 auto 0.5rem auto;
                    }

                    .text {
                        @apply text-primary2;
                        font-size: 0.875rem;
                        font-weight: bold;
                        line-height: 1.5;
                        text-align: center;
                        opacity: 0.7;
                        margin-bottom: 0.625rem;
                    }
                }
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
        .region-service-wrapper {
            .sub-title {
                padding-left: 0.5rem;
            }
        }
    }
}
</style>
