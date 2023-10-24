<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';

import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import {
    PBalloonTab, PSelectButton, PDataLoader, PSkeleton, PSpinner,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import dayjs from 'dayjs';
import {
    cloneDeep, forEach, orderBy, range,
} from 'lodash';

import { byteFormatter, commaFormatter, numberFormatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { primary } from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import type { Period } from '@/services/cost-explorer/type';
import AllSummaryDataSummary from '@/services/home-dashboard/modules/all-summary/AllSummaryDataSummary.vue';
import type { DateItem, DateType, DataType } from '@/services/home-dashboard/modules/type';
import { DATA_TYPE } from '@/services/home-dashboard/modules/type';


/* type */
type Unit = 'b' | 'gb' | 'kb' | 'mb' | 'pb' | 'tb' | 'B' | 'GB' | 'KB' | 'MB' | 'PB' | 'TB';
interface ChartData {
    date: string;
    count: number | null;
    bulletText?: string | number;
    tooltipText?: string | number;
}
interface CountMap {
    [key: string]: number | string;
}

interface Props {
    extraParams?: {
        [key: string]: string | number | boolean;
    };
}
const props = withDefaults(defineProps<Props>(), {
    extraParams: () => ({}),
});

const DAY_COUNT = 14;
const MONTH_COUNT = 12;

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);
const state = reactive({
    chart: null as any,
    //
    period: computed<Period>(() => {
        if (state.selectedDateType === 'MONTHLY') {
            return {
                start: dayjs.utc().subtract(MONTH_COUNT - 1, 'month').format('YYYY-MM'),
                end: dayjs.utc().format('YYYY-MM'),
            };
        }
        return {
            start: dayjs.utc().subtract(DAY_COUNT, 'day').format('YYYY-MM-DD'),
            end: dayjs.utc().subtract(1, 'day').format('YYYY-MM-DD'),
        };
    }),
    selectedDateType: 'DAILY' as DateType,
    dateTypes: computed<DateItem[]>(() => ([
        { name: 'DAILY', label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.DAY') },
        { name: 'MONTHLY', label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.MONTH') },
    ])),
    //
    loading: true,
    count: {
        [DATA_TYPE.SERVER]: 0,
        [DATA_TYPE.DATABASE]: 0,
        [DATA_TYPE.STORAGE]: 0,
    } as CountMap,
    storageBoxSuffix: 'TB' as Unit,
    storageTrendSuffix: 'TB' as Unit,
    activeTab: DATA_TYPE.SERVER as DataType,
    tabs: computed<TabItem[]>(() => [
        {
            name: DATA_TYPE.SERVER,
            label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.SERVER'),
        },
        {
            name: DATA_TYPE.DATABASE,
            label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.DATABASE'),
        },
        {
            name: DATA_TYPE.STORAGE,
            label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.STORAGE'),
        },
    ]),
});
const chartState = reactive({
    loading: true,
    registry: {},
    data: [] as ChartData[],
});

/* Util */
const drawChart = () => {
    // refresh root for deleting previous chart
    chartHelper.refreshRoot();

    // set date formatter for tooltip text
    if (state.selectedDateType === 'DAILY') {
        chartHelper.root.value?.dateFormatter.setAll({
            dateFormat: 'd MMM, yyyy',
            dateFields: ['valueX'],
        });
    }

    let timeUnit: TimeUnit = 'day';
    if (state.selectedDateType === 'MONTHLY') timeUnit = 'month';

    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart({
        paddingLeft: -5,
        paddingTop: 10,
        paddingBottom: 0,
    });

    // set base interval of xAxis
    xAxis.get('baseInterval').timeUnit = timeUnit;
    yAxis.set('extraMax', 0.02);

    // create column series
    const columnSeries = chartHelper.createXYColumnSeries(chart, {
        name: 'date',
        valueYField: 'count',
        stacked: true,
    });
    columnSeries.columns.template.setAll({
        width: chartHelper.percent(25),
        cornerRadiusTL: 3,
        cornerRadiusTR: 3,
    });

    // set data processor
    let dateFormat = 'yyyy-MM-dd';
    if (state.selectedDateType === 'MONTHLY') dateFormat = 'yyyy-MM';
    columnSeries.data.processor = chartHelper.createDataProcessor({
        dateFormat,
        dateFields: ['date'],
    });

    // create bullet
    columnSeries.bullets.push(() => {
        const label = chartHelper.createLabel({
            text: '{bulletText}',
            populateText: true,
            fontSize: 14,
            fill: chartHelper.color(primary),
            textAlign: 'center',
            centerX: chartHelper.percent(50),
            centerY: chartHelper.percent(80),
        });
        return chartHelper.createBullet({
            locationX: 0.5,
            locationY: 1,
            sprite: label,
            dynamic: true,
        });
    });

    // set series to chart and set data
    columnSeries.data.setAll(cloneDeep(chartState.data));
    chart.series.push(columnSeries);

    // create tooltip
    const tooltip = chartHelper.createTooltip();
    chartHelper.setXYSingleTooltipText(chart, tooltip);
    columnSeries.set('tooltip', tooltip);

    state.chart = chart;
};

const getChartData = (data): ChartData[] => {
    const chartData: ChartData[] = [];
    const dateType = state.selectedDateType;
    const dateRange = dateType === 'MONTHLY' ? MONTH_COUNT : DAY_COUNT;
    const dateUnit = dateType === 'MONTHLY' ? 'month' : 'day';
    const dateFormat = dateType === 'MONTHLY' ? 'YYYY-MM' : 'YYYY-MM-DD';

    if (state.activeTab === DATA_TYPE.STORAGE) {
        const smallestCount = Math.min(...data.map((d) => d.total));
        const formattedSize = byteFormatter(smallestCount);
        if (formattedSize) state.storageTrendSuffix = formattedSize.split(' ')[1] as Unit;
    }
    const formattedData = data.map((d) => {
        let count = d.total;
        if (state.activeTab === DATA_TYPE.STORAGE) {
            const formattedSize = byteFormatter(d.total, { unit: state.storageTrendSuffix });
            if (formattedSize) count = Number(formattedSize.split(' ')[0]);
        }
        return {
            date: d.date,
            count,
        };
    });

    // fill default value
    forEach(range(0, dateRange), (i) => {
        const date = dayjs.utc().subtract(i, dateUnit);
        if (formattedData.find((d) => date.format(dateFormat) === d.date)) {
            chartData.push(formattedData.find((d) => date.format(dateFormat) === d.date));
        } else {
            chartData.push({ date: date.format(dateFormat), count: null });
        }
    });

    const orderedData = orderBy(chartData, ['date'], ['asc']);
    return orderedData.map((d, idx) => {
        const tooltipText = d.count || '';
        let bulletText;
        if ((dateType === 'DAILY' && idx % 3 === 1) || (dateType === 'MONTHLY' && idx % 3 === 2)) {
            bulletText = tooltipText;
        }

        const date = dayjs.utc(d.date).format(dateFormat);

        return {
            date,
            count: d.count,
            bulletText,
            tooltipText,
        };
    });
};

/* Api */
const getCount = async () => {
    try {
        const { results } = await SpaceConnector.client.statistics.topic.cloudServiceSummary({
            ...props.extraParams,
            labels: Object.values(DATA_TYPE),
        });

        results.forEach((result) => {
            let count;
            const label: DataType = result.label;
            if (label === DATA_TYPE.STORAGE) {
                state.storageBoxSuffix = byteFormatter(result.total).split(' ')[1] as Unit;
                count = parseFloat(byteFormatter(result.total).split(' ')[0]);
                count = commaFormatter(count);
            } else {
                count = numberFormatter(result.total);
            }
            state.count[label] = count;
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const getTrend = async (type) => {
    try {
        chartState.loading = true;
        const res = await SpaceConnector.client.statistics.topic.dailyCloudServiceSummary({
            ...props.extraParams,
            label: type,
            granularity: state.selectedDateType,
        });
        const data = res.results;
        chartState.data = getChartData(data);
    } catch (e) {
        ErrorHandler.handleError(e);
        chartState.data = [];
    } finally {
        chartState.loading = false;
    }
};

/* Event */
const handleChangeTab = async (name) => {
    if (state.activeTab !== name) chartHelper.refreshRoot();
    state.activeTab = name;
};
const handleChangeDateType = (type) => {
    state.selectedDateType = type;
};

const init = async () => {
    state.loading = true;
    await Promise.all([
        getCount(),
        getTrend(DATA_TYPE.SERVER),
    ]);
    state.loading = false;
};
init();

/* Watcher */
watch([() => chartState.loading, () => chartContext.value], async ([loading, _chartContext]) => {
    if (!loading && _chartContext) {
        drawChart();
    }
}, { immediate: false });
watch(() => state.activeTab, async (type) => {
    await getTrend(type);
    drawChart();
}, { immediate: false });
watch(() => state.selectedDateType, async () => {
    await getTrend(state.activeTab);
    drawChart();
}, { immediate: false });
</script>

<template>
    <div class="all-summary">
        <p-balloon-tab :active-tab="state.activeTab"
                       :tabs="state.tabs"
                       tail
                       stretch
                       @change="handleChangeTab"
        >
            <template #tab="{name, label}">
                <div class="tab-box-wrapper"
                     :class="{selected: name === state.activeTab}"
                >
                    <div class="count">
                        <p-spinner v-if="state.loading"
                                   class="loading-spinner"
                                   size="xl"
                        />
                        <template v-else>
                            <router-link :to="{
                                             name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                                             query: { service: name },
                                         }"
                                         class="anchor"
                            >
                                <span class="number">
                                    <span class="value">{{ state.count[name] }}</span>
                                </span>
                            </router-link>
                            <span v-if="name === DATA_TYPE.STORAGE"
                                  class="suffix"
                            >{{ state.storageBoxSuffix }}</span>
                        </template>
                    </div>
                    <div class="title">
                        {{ label }}
                    </div>
                </div>
            </template>
            <div class="content-wrapper">
                <div class="chart-wrapper col-span-12 lg:col-span-9">
                    <div class="title">
                        <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.TREND_TITLE') }}</span>
                        <span v-if="state.activeTab === 'storage'"
                              class="suffix"
                        >({{ state.storageTrendSuffix }})</span>
                    </div>
                    <div class="toggle-button-group">
                        <p-select-button v-for="(d, idx) in state.dateTypes"
                                         :key="`date-${d.name}-${idx}`"
                                         :class="{'selected': state.selectedDateType === d.name}"
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
                        <div ref="chartContext"
                             class="chart"
                        />
                    </p-data-loader>
                </div>
                <all-summary-data-summary :extra-params="props.extraParams"
                                          :active-tab="state.activeTab"
                                          :label="state.tabs.find(d => d.name === state.activeTab).label"
                                          :count="state.count[state.activeTab]"
                                          :selected-date-type="state.selectedDateType"
                                          :storage-suffix="state.storageBoxSuffix"
                                          :data-source-id="state.dataSourceId"
                />
            </div>
        </p-balloon-tab>
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-balloon-tab */
:deep(.p-balloon-tab) {
    .balloon-group {
        flex-wrap: nowrap;
        justify-content: space-evenly;
        button {
            width: 100%;
            &:not(.active) {
                @apply border-transparent;
            }
        }
    }

    @screen mobile {
        .balloon-group {
            flex-wrap: wrap;
            button {
                width: 40%;
            }
        }
    }
}
.tab-box-wrapper {
    text-align: left;
    padding: 0.5rem 0;
    .count {
        @apply text-indigo-400;
        align-self: flex-end;
        display: inline-flex;
        height: 3rem;
        line-height: 2rem;
        &:hover {
            .anchor {
                .value {
                    border-bottom: 2px solid;
                }
            }
        }
        .loading-spinner {
            height: 2.5rem;
        }
        .dollar-sign {
            @apply text-gray-500;
            font-size: 1.5rem;
            font-weight: normal;
            padding-right: 0.25rem;
        }
        .number {
            @apply text-indigo-400;
            font-size: 2rem;
            font-weight: bold;
            display: inline-flex;
            align-self: flex-end;
        }
        .suffix {
            @apply text-gray-500;
            font-size: 0.875rem;
            font-weight: normal;
            padding-left: 0.5rem;
        }
    }
    .title {
        @apply text-gray-900;
        font-size: 1rem;
        text-transform: capitalize;
    }
    &.selected {
        .count {
            @apply text-white;
            .number {
                @apply text-white;
            }

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
    }
}

.content-wrapper {
    @apply bg-white rounded-lg grid grid-cols-12;
    position: relative;
    height: 17.5rem;
    grid-gap: 0.5rem;
    margin-top: 0.75rem;
    padding: 1.25rem 1.5rem;

    @screen tablet {
        height: 25rem;
    }

    @screen mobile {
        height: 27.5rem;
    }

    .title {
        font-size: 1rem;
        font-weight: bold;
        margin-bottom: 1rem;
        .suffix {
            font-size: 0.75rem;
            font-weight: normal;
            padding-left: 0.5rem;
        }
    }
    .chart-wrapper {
        position: relative;
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
}
</style>
