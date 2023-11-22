<script lang="ts" setup>
import {
    computed, onBeforeUnmount, reactive, ref, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    green, red, white, yellow,
} from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-config';


const CATEGORY_KEY = 'category';
const VALUE_KEY = 'value';
const CLOUD_SERVICE_GROUP = 'TrustedAdvisor';
const CLOUD_SERVICE_NAME = 'Check';
const STATUS = Object.freeze({
    ERROR: 'error',
    WARNING: 'warning',
    OK: 'ok',
} as const);
const STATUS_COLORS = Object.freeze({
    [STATUS.ERROR]: red[500],
    [STATUS.WARNING]: yellow[500],
    [STATUS.OK]: green[600],
});
type Status = typeof STATUS[keyof typeof STATUS];
interface Data {
    status: Status;
    count: number;
}
interface ChartData {
    category: string;
    value: number;
    pieSettings: {
        fill: string;
    };
}
interface Props {
    extraParams?: object;
}

const props = withDefaults(defineProps<Props>(), {
    extraParams: () => ({}),
});

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const queryHelper = new QueryHelper();
const state = reactive({
    loading: true,
    data: [] as Data[],
    chartData: computed<ChartData[]>(() => state.data.map((d) => ({
        category: d.status,
        value: d.count,
        pieSettings: {
            fill: STATUS_COLORS[d.status],
        },
    }))),
    legendData: computed(() => ({
        [STATUS.ERROR]: {
            name: STATUS.ERROR,
            label: i18n.t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_ERROR'),
            color: STATUS_COLORS[STATUS.ERROR],
            count: state.data.find((d) => d.status === STATUS.ERROR)?.count,
        },
        [STATUS.WARNING]: {
            name: STATUS.WARNING,
            label: i18n.t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_WARNING'),
            color: STATUS_COLORS[STATUS.WARNING],
            count: state.data.find((d) => d.status === STATUS.WARNING)?.count,
        },
        [STATUS.OK]: {
            name: STATUS.OK,
            label: i18n.t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_OK'),
            color: STATUS_COLORS[STATUS.OK],
            count: state.data.find((d) => d.status === STATUS.OK)?.count,
        },
    })),
});

/* Util */
const overallLinkFormatter = (status) => {
    const filters: ConsoleFilter[] = [];
    filters.push({ k: 'data.status', o: '=', v: status });

    return {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
        query: {
            filters: queryHelper.setFilters(filters).rawQueryStrings,
        },
        params: {
            provider: 'aws',
            group: CLOUD_SERVICE_GROUP,
            name: CLOUD_SERVICE_NAME,
        },
    };
};
const drawChart = () => {
    // refresh chart root
    chartHelper.refreshRoot();

    // create donut chart
    const chart = chartHelper.createPieChart();

    // create pie series
    const seriesSettings = {
        categoryField: CATEGORY_KEY,
        valueField: VALUE_KEY,
        strokeWidth: 1,
    };
    const series = chartHelper.createPieSeries(seriesSettings);
    chart.series.push(series);
    series.slices.template.setAll({
        stroke: chartHelper.color(white),
        tooltipText: '',
        templateField: 'pieSettings',
    });
    // set data to series
    series.data.setAll(cloneDeep(state.chartData));

    series.slices.template.adapters.add('fill', (fill, target) => {
        const status = target.dataItem?.dataContext?.[CATEGORY_KEY];
        if (!status) return STATUS_COLORS[status];
        return fill;
    });
};

/* Api */
const getData = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.client.statistics.topic.trustedAdvisorSummary(props.extraParams);
        state.data = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.data = [];
    } finally {
        state.loading = false;
    }
};

/* Init */
(async () => {
    await getData();
})();

/* Watcher */
watch([() => state.loading, () => chartContext.value], async ([loading, _chartContext]) => {
    if (!loading && _chartContext) drawChart();
}, { immediate: true });

onBeforeUnmount(() => {
    chartHelper.disposeRoot();
});
</script>

<template>
    <div class="trusted-advisor-overall">
        <div class="title">
            <span class="text">{{ $t('COMMON.WIDGETS.TRUSTED_ADVISOR.SUB_TITLE_OVERALL') }}</span>
        </div>
        <div class="chart-wrapper">
            <div ref="chartContext"
                 class="chart"
            />
        </div>
        <div class="legend-wrapper">
            <template v-for="([k, v]) of Object.entries(state.legendData)">
                <router-link :key="k"
                             :to="overallLinkFormatter(v.name)"
                             class="legend-row"
                             :class="v.name"
                >
                    <div class="left-part">
                        <span class="legend-circle"
                              :style="{ 'background-color': v.color }"
                        />
                        <span class="legend-text"
                              :class="v.name"
                        >{{ v.label }}</span>
                    </div>
                    <div class="right-part relative lg:absolute">
                        <span :style="{ 'color': v.color }">{{ v.count }}</span>
                    </div>
                </router-link>
            </template>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.trusted-advisor-overall {
    @apply col-span-3 grid grid-cols-12;

    @screen mobile {
        @apply col-span-12;
    }
    .title {
        @apply col-span-12;
        font-size: 1rem;
        line-height: 1.6;
        .text {
            @apply font-bold;
        }
    }
    .chart-wrapper {
        @apply col-span-12;
        height: 8.5rem;

        @screen mobile {
            @apply col-span-4;
            height: 6rem;
        }
        .chart {
            width: 100%;
            height: 100%;
        }
    }
    .legend-wrapper {
        @apply col-span-12;

        @screen mobile {
            @apply col-span-8;
        }
        .legend-row {
            position: relative;
            display: flex;
            align-items: center;
            height: 1.75rem;
            font-size: 0.875rem;
            cursor: pointer;
            padding: 0.25rem 0;
            &:hover {
                @apply bg-secondary2;
                .legend-text {
                    text-decoration: underline;
                    &.error {
                        @apply text-red-500;
                    }
                    &.warning {
                        @apply text-yellow-500;
                    }
                    &.ok {
                        @apply text-green-600;
                    }
                }
                .right-part {
                    text-decoration: underline;
                }
            }
            &.error {
                @apply text-red-500;
            }
            &.warning {
                @apply text-yellow-500;
            }
            &.ok {
                @apply text-green-600;
            }
            .left-part {
                display: inline-flex;
                width: 90%;
                .legend-circle {
                    @apply rounded-full;
                    display: inline-block;
                    width: 0.5rem;
                    height: 0.5rem;
                    margin: auto 0.25rem auto 0;
                }
                .legend-text {
                    @apply text-gray-700;
                    display: inline-block;
                    line-height: 1.4;
                    width: 95%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
            .right-part {
                position: absolute;
                right: 0;
                vertical-align: text-bottom;
            }
        }
    }
}
</style>
