<template>
    <div class="project-all-summary">
        <div class="title">
            <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.TITLE') }}</span>
        </div>
        <p-balloon-tab v-model="activeTab"
                       size="sm"
                       style-type="primary"
                       :tabs="tabs"
                       tail
                       @change="handleChangeTab"
        >
            <template #tab="{name}">
                <div class="box"
                     :class="{selected: name === activeTab}"
                >
                    <span>{{ labelMap[name] }}</span>
                    <span v-if="name === SERVICE_CATEGORY.STORAGE"
                          class="suffix"
                    >({{ storageSuffix }})</span>
                    <p-spinner v-if="summaryLoading"
                               size="sm"
                    />
                    <span v-else
                          class="count"
                    > {{ name === SERVICE_CATEGORY.STORAGE ? byteFormatter(countMap[name]).split(' ')[0] : commaFormatter(countMap[name]) }}</span>
                </div>
            </template>
        </p-balloon-tab>
        <div class="bottom-part">
            <div class="content-wrapper">
                <div class="chart-wrapper">
                    <div class="sub-title">
                        <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.TREND_TITLE') }}</span>
                        <span v-if="activeTab === SERVICE_CATEGORY.STORAGE"
                              class="suffix"
                        >({{ storageTrendSuffix }})</span>
                    </div>
                    <div class="toggle-button-group">
                        <p-select-button v-for="(d, idx) in dateTypes"
                                         :key="`date-${d.name}-${idx}`"
                                         :class="{'selected': selectedDateType === d.name}"
                                         style-type="gray"
                                         size="sm"
                                         @click="handleChangeDateType(d.name)"
                        >
                            {{ d.label }}
                        </p-select-button>
                    </div>
                    <p-data-loader :loading="chartState.loading">
                        <template #loader>
                            <p-skeleton width="100%"
                                        height="100%"
                            />
                        </template>
                        <div ref="chartRef"
                             class="chart"
                        />
                    </p-data-loader>
                </div>
                <div class="summary-wrapper">
                    <div class="sub-title">
                        {{ $t('COMMON.WIDGETS.ALL_SUMMARY.TYPE_TITLE', { service: labelMap[activeTab] }) }}
                    </div>
                    <template v-if="!loading && summaryData.length > 0">
                        <div class="summary-content-wrapper">
                            <router-link :to="getLocation(activeTab)"
                                         class="summary-row"
                            >
                                <div class="text-group">
                                    <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.ALL') }}</span>
                                </div>
                                <span class="count">{{ activeTab === SERVICE_CATEGORY.STORAGE ? byteFormatter(countMap[activeTab]) : commaFormatter(countMap[activeTab]) }}</span>
                            </router-link>
                            <router-link v-for="(data, idx) of summaryData"
                                         :key="idx"
                                         :to="data.to"
                                         class="summary-row"
                            >
                                <div class="text-group">
                                    <span class="provider"
                                          :style="{ color: getColor(data) }"
                                    >{{ data.label }}</span>
                                    <span class="type">{{ data.type }}</span>
                                </div>
                                <span class="count">{{ data.count }}</span>
                            </router-link>
                        </div>
                    </template>
                    <template v-else-if="!loading">
                        <div class="summary-content-wrapper no-data-wrapper">
                            <div class="m-auto">
                                <img src="@/assets/images/illust_cloud.svg"
                                     class="empty-image hidden lg:block"
                                >
                                <p class="text">
                                    {{ $t('COMMON.WIDGETS.ALL_SUMMARY.NO_SERVICE', { service: labelMap[activeTab] }) }}
                                </p>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div v-for="v in skeletons"
                             :key="v"
                             class="flex items-center p-2 col-span-3"
                        >
                            <p-skeleton class="flex-grow" />
                        </div>
                    </template>
                </div>
                <div class="region-service-wrapper">
                    <div class="sub-title">
                        <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.REGION_SERVICE_TITLE') }}</span>
                    </div>
                    <project-region-service :project-id="projectId"
                                            :label="activeTab"
                                            :count="countMap[activeTab]"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { XYChart } from '@amcharts/amcharts4/charts';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import {
    PBalloonTab, PSelectButton, PDataLoader, PSkeleton, PSpinner,
} from '@spaceone/design-system';
import type { Unit } from 'bytes';
import dayjs from 'dayjs';
import { forEach, orderBy, range } from 'lodash';

import { byteFormatter, commaFormatter } from '@cloudforet/core-lib';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import config from '@/lib/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray, primary1, primary2 } from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import type { DateType, ServiceCategory } from '@/services/project/project-detail/project-summary/modules/config';
import { DATE_TYPE, SERVICE_CATEGORY } from '@/services/project/project-detail/project-summary/modules/config';
import ProjectRegionService from '@/services/project/project-detail/project-summary/modules/ProjectRegionService.vue';

interface ChartData {
    date: string;
    count: number;
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
        PSelectButton,
        PSkeleton,
        PDataLoader,
        PBalloonTab,
        PSpinner,
    },
    props: {
        projectId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const queryHelper = new QueryHelper();
        const state = reactive({
            loading: true,
            summaryLoading: true,
            chart: null as XYChart | null,
            chartRef: null as HTMLElement | null,
            skeletons: range(4),
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            //
            selectedDateType: DATE_TYPE.DAILY as DateType,
            dateTypes: computed(() => ([
                { name: DATE_TYPE.DAILY, label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.DAY') },
                { name: DATE_TYPE.MONTHLY, label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.MONTH') },
            ])),
            //
            storageSuffix: 'TB' as Unit,
            storageTrendSuffix: 'TB' as Unit,
            tabs: Object.values(SERVICE_CATEGORY),
            activeTab: SERVICE_CATEGORY.SERVER as ServiceCategory,
            labelMap: computed(() => ({
                [SERVICE_CATEGORY.SERVER]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.SERVER'),
                [SERVICE_CATEGORY.CONTAINER]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.CONTAINER'),
                [SERVICE_CATEGORY.DATABASE]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.DATABASE'),
                [SERVICE_CATEGORY.NETWORKING]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.NETWORKING'),
                [SERVICE_CATEGORY.STORAGE]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.STORAGE'),
                [SERVICE_CATEGORY.SECURITY]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.SECURITY'),
                [SERVICE_CATEGORY.ANALYTICS]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.ANALYTICS'),
                [SERVICE_CATEGORY.ALL]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.ALL'),
            })),
            countMap: {},
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

        /* Util */
        const disposeChart = (chartContext) => {
            if (chartState.registry[chartContext]) {
                chartState.registry[chartContext].dispose();
                delete chartState.registry[chartContext];
            }
        };
        const drawChart = (chartContext) => {
            const createChart = () => {
                disposeChart(chartContext);
                chartState.registry[chartContext] = am4core.create(chartContext, am4charts.XYChart);
                return chartState.registry[chartContext];
            };
            const chart = createChart();
            state.chart = chart;

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
            valueAxis.renderer.labels.template.fill = am4core.color(primary1);
            valueAxis.tooltip.disabled = true;
            valueAxis.fontSize = 11;
            valueAxis.extraMax = 0.25;
            valueAxis.min = 0;

            const series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = 'count';
            series.dataFields.categoryX = 'date';
            series.fill = am4core.color(primary2);
            series.columns.template.width = am4core.percent(15);
            series.strokeWidth = 0;
            series.tooltipText = '{count}';
            series.tooltip.pointerOrientation = 'down';
            series.tooltip.fontSize = 14;
            series.tooltip.strokeWidth = 0;
            series.tooltip.dy = -5;
            series.tooltip.getFillFromObject = false;
            series.tooltip.label.fill = am4core.color(primary1);
            series.tooltip.background.stroke = am4core.color(primary1);

            const bullet = series.bullets.push(new am4charts.LabelBullet());
            bullet.label.text = '{bulletText}';
            bullet.label.fontSize = 14;
            bullet.label.truncate = false;
            bullet.label.hideOversized = false;
            bullet.label.fill = am4core.color(primary2);
            bullet.label.dy = -10;

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.lineX.strokeOpacity = 0;
            chart.cursor.lineY.strokeOpacity = 0;
            chart.cursor.behavior = 'none';
        };
        const getLocation = (type: ServiceCategory) => {
            const query: Location['query'] = {};
            if (type !== SERVICE_CATEGORY.ALL) {
                query.service = type;
            }

            // set filters
            queryHelper.setFilters([{ k: 'project_id', o: '=', v: props.projectId }]);

            const location: Location = {
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                query: {
                    filters: queryHelper.rawQueryStrings,
                    ...query,
                },
            };
            return location;
        };
        const getColor = (data?: SummaryData) => {
            const label = data?.label as string;
            if (!label) return '';
            return colorState[label.toLowerCase()];
        };

        /* Api */
        const getCloudServiceSummary = async () => {
            try {
                state.summaryLoading = true;
                const { results } = await SpaceConnector.client.statistics.topic.cloudServiceSummary({
                    project_id: props.projectId,
                    labels: Object.values(SERVICE_CATEGORY),
                });

                state.countMap = {};
                Object.values(SERVICE_CATEGORY).forEach((serviceName) => {
                    const result = results.find((d) => d.label === serviceName);
                    const count = result?.total || 0;
                    state.countMap[serviceName] = count;
                    if (serviceName === SERVICE_CATEGORY.STORAGE) {
                        state.storageSuffix = byteFormatter(count).split(' ')[1] as Unit;
                    }
                });
            } catch (e) {
                state.countMap = {};
                ErrorHandler.handleError(e);
            } finally {
                state.summaryLoading = false;
            }
        };
        const getTrend = async (type) => {
            const utcToday = dayjs.utc();
            const dateRange = state.selectedDateType === DATE_TYPE.MONTHLY ? MONTH_COUNT : DAY_COUNT;
            const dateUnit = state.selectedDateType === DATE_TYPE.MONTHLY ? 'month' : 'day';
            const dateFormat = state.selectedDateType === DATE_TYPE.MONTHLY ? 'MMM' : 'MM/DD';

            try {
                const param: any = {
                    granularity: state.selectedDateType,
                    project_id: props.projectId,
                };
                if (type !== SERVICE_CATEGORY.ALL) param.label = type;
                const res = await SpaceConnector.client.statistics.topic.dailyCloudServiceSummary(param);
                const data = res.results;

                if (type === SERVICE_CATEGORY.STORAGE) {
                    const smallestCount = Math.min(...data.map((d) => d.total));
                    const formattedSize = byteFormatter(smallestCount);
                    if (formattedSize) state.storageTrendSuffix = formattedSize.split(' ')[1] as Unit;
                }
                const chartData = data.map((d) => {
                    let count = d.total;
                    if (type === SERVICE_CATEGORY.STORAGE) {
                        const formattedSize = byteFormatter(d.total, { unit: state.storageTrendSuffix });
                        if (formattedSize) count = formattedSize.split(' ')[0];
                    }
                    return {
                        date: dayjs.utc(d.date),
                        count,
                    };
                });
                forEach(range(0, dateRange), (i) => {
                    const date = utcToday.subtract(i, dateUnit);
                    if (!(chartData.find((d) => d.date.isSame(date, 'day')))) {
                        chartData.push({ date, count: null });
                    }
                });

                const orderedData = orderBy(chartData, ['date'], ['asc']);
                chartState.data = orderedData.map((d, idx) => {
                    let bulletText = '';
                    if (idx % 3 === 1) bulletText = d.count;
                    if (state.selectedDateType === DATE_TYPE.MONTHLY && (d.date.format('M') === '1' || d.date.format('M') === '12')) {
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
                ErrorHandler.handleError(e);
                chartState.data = [];
            }
        };
        const apiQueryHelper = new ApiQueryHelper();
        const getApiParameter = (type) => {
            apiQueryHelper
                .setSort('count', true)
                .setFilters([{ k: 'project_id', v: props.projectId, o: '=' }]);
            const defaultParam: any = {
                query: apiQueryHelper.data,
            };
            if (type !== SERVICE_CATEGORY.ALL) defaultParam.labels = [type];
            if (type !== SERVICE_CATEGORY.STORAGE) {
                return {
                    ...defaultParam,
                    is_primary: true,
                };
            }

            // STORAGE
            apiQueryHelper.setSort('size', true);
            return {
                ...defaultParam,
                is_major: true,
                query: apiQueryHelper.data,
                fields: [{
                    name: 'size',
                    operator: 'sum',
                    key: 'data.size',
                }],
            };
        };
        const getSummaryInfo = async (type) => {
            try {
                state.loading = true;
                const param = getApiParameter(type);
                const res = await SpaceConnector.client.statistics.topic.cloudServiceResources(param);
                const summaryData: SummaryData[] = [];

                const summaryQueryHelper = new QueryHelper();
                res.results.forEach((d) => {
                    const filters: ConsoleFilter[] = [];
                    filters.push({
                        k: 'project_id', o: '=', v: props.projectId,
                    });

                    summaryData.push({
                        provider: d.provider,
                        label: state.providers[d.provider]?.label,
                        type: d.display_name || d.cloud_service_group,
                        count: type === SERVICE_CATEGORY.STORAGE ? byteFormatter(d.size) : commaFormatter(d.count),
                        to: {
                            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                            params: {
                                provider: d.provider,
                                group: d.cloud_service_group,
                                name: d.cloud_service_type,
                            },
                            query: {
                                filters: summaryQueryHelper.setFilters(filters).rawQueryStrings,
                            },
                        },
                    });
                });
                state.summaryData = summaryData;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.summaryData = [];
            } finally {
                state.loading = false;
            }
        };

        /* Event */
        const handleChangeTab = async (type) => {
            await Promise.all([getSummaryInfo(type), getTrend(type)]);
            drawChart(state.chartRef);
        };
        const handleChangeDateType = async (dateType) => {
            state.selectedDateType = dateType;
            await getTrend(state.activeTab);
            drawChart(state.chartRef);
        };

        /* Init */
        (async () => {
            await getCloudServiceSummary();
        })();
        const chartInit = async () => {
            await getTrend(SERVICE_CATEGORY.SERVER);
            setTimeout(() => {
                chartState.loading = false;
            }, 300);
        };
        chartInit();

        /* Watcher */
        watch(() => state.providers, (providers) => {
            if (providers) getSummaryInfo(SERVICE_CATEGORY.SERVER);
        }, { immediate: true });
        watch([() => chartState.loading, () => state.chartRef], async ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart(chartContext);
            }
        }, { immediate: true });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/provider/load');
        })();

        return {
            ...toRefs(state),
            chartState,
            SERVICE_CATEGORY,
            handleChangeTab,
            handleChangeDateType,
            byteFormatter,
            commaFormatter,
            getLocation,
            getColor,
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
.box {
    display: flex;
    align-items: center;
    .suffix {
        @apply text-gray-500;
        font-size: 0.75rem;
        padding-left: 0.125rem;
    }
    .count {
        @apply text-primary1;
        font-weight: bold;
        padding-left: 0.25rem;
    }

    &.selected {
        .suffix, .count {
            @apply text-white;
        }
    }
    .p-spinner {
        padding-left: 0.25rem;
    }
}

/* custom design-system component - p-balloon-tab */
:deep(.p-balloon-tab) {
    .tab-pane {
        padding-bottom: 0;
    }
}
.bottom-part {
    margin-top: 0.625rem;

    .content-wrapper {
        @apply bg-white border border-gray-200 rounded-md grid-cols-12 gap-2;
        position: relative;
        display: grid;
        height: auto;
        padding: 1rem;

        @screen lg {
            height: 17.5rem;
        }

        .chart-wrapper {
            @apply col-span-12;
            position: relative;

            @screen lg {
                @apply col-span-7;
            }
            .toggle-button-group {
                position: absolute;
                right: 0.5rem;
                top: 0;
                .p-select-button {
                    margin-right: 0.375rem;
                    min-width: 2.4375rem;
                }
            }
            .chart {
                height: 13rem;
            }
        }
        .summary-wrapper {
            @apply col-span-12;

            @screen md {
                @apply col-span-4;
            }

            @screen lg {
                @apply col-span-2;
            }
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
                    display: grid;
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
            @apply col-span-12;

            @screen md {
                @apply col-span-5;
            }

            @screen lg {
                @apply col-span-3;
            }
            .sub-title {
                padding-left: 0.5rem;
            }
        }
    }
}
</style>
