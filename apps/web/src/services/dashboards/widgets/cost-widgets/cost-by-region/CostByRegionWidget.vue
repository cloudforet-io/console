<script setup lang="ts">
import { getPageStart, getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector, SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper, ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import {
    groupBy, isEqual, sum, uniqWith,
} from 'lodash';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';
import type { ComputedRef } from 'vue';
import type { RouteLocation } from 'vue-router';
import { useStore } from 'vuex';


import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { CONTINENT_INFO } from '@/services/dashboards/widgets/_configs/continent-config';
import { getXYChartLegends } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
// eslint-disable-next-line import/no-cycle
import { getWidgetLocationFilters } from '@/services/dashboards/widgets/_helpers/widget-helper';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { Legend, CostAnalyzeDataModel } from '@/services/dashboards/widgets/type';

type FullData = CostAnalyzeDataModel;
interface CostDataByProvider {
    [continent: string]: {
        [provider: string]: number;
    }
}
interface PieChartData {
    category: string;
    color: string;
    provider: string;
    value: number;
    pieSettings: {
        fill: string;
        stroke: string;
    }
}
interface MapChartData {
    title: string;
    continent_code?: string;
    latitude: number;
    longitude: number;
    height: number;
    width: number;
    pieChartData: PieChartData[];
}

const props = defineProps<WidgetProps>();
const store = useStore();

const state = reactive({
    ...toRefs(useWidgetState<FullData>(props)),
    tableFields: computed<Field[]>(() => [
        {
            label: 'Provider', name: COST_GROUP_BY.PROVIDER, textOptions: { type: 'reference', referenceType: 'provider' }, width: '20%',
        },
        {
            label: 'Region', name: COST_GROUP_BY.REGION, textOptions: { type: 'reference', referenceType: 'region' }, width: '50%',
        },
        {
            label: 'Cost', name: 'usd_cost_sum', textOptions: { type: 'cost' }, textAlign: 'right', width: '30%',
        },
    ]),
    legends: [] as Legend[],
    chartLegends: computed(() => uniqWith(state.legends, isEqual)),
    chartData: computed<MapChartData[]>(() => getRefinedMapChartData(state.data?.results)),
    thisPage: 1,
    dateRange: computed<DateRange>(() => ({
        start: state.settings?.date_range?.start ?? dayjs.utc().format('YYYY-MM'),
        end: state.settings?.date_range?.end ?? dayjs.utc().format('YYYY-MM'),
    })),
    widgetLocation: computed<RouteLocation>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
        params: {} as RouteLocation['params'],
        query: {
            granularity: primitiveToQueryString(state.granularity),
            group_by: arrayToQueryString([state.groupBy]),
            period: objectToQueryString(state.dateRange),
            filters: objectToQueryString(getWidgetLocationFilters(state.options.filters)),
        } as RouteLocation['query'],
    } as RouteLocation)),
});
const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
});

const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

/* Util */
const getCostDataByProvider = (results: FullData['results']): CostDataByProvider => {
    const data = results.map((d) => ({
        ...d,
        continent_code: storeState.regions[d.region_code]?.continent?.continent_code,
    }));
    const continentGroupBy = groupBy(data, 'continent_code');
    const result = {};
    Object.entries(continentGroupBy).forEach(([continent, cItem]) => {
        const providerGroupBy = groupBy(cItem, 'provider');
        Object.entries(providerGroupBy).forEach(([provider, pItem]) => {
            if (continent && continent !== 'undefined' && provider && provider !== 'undefined') {
                const providerCost = sum(pItem.map((d) => d.usd_cost_sum));
                if (result[continent]) result[continent][provider] = providerCost;
                else result[continent] = { [provider]: providerCost };
            }
        });
    });
    return result;
};
const getRefinedMapChartData = (results?: FullData['results']): MapChartData[] => {
    if (!results?.length) return [];
    const costDataByProvider = getCostDataByProvider(results);
    return Object.keys(costDataByProvider).map((continent) => ({
        title: CONTINENT_INFO[continent]?.continent_label,
        continent_code: CONTINENT_INFO[continent]?.continent_code,
        latitude: CONTINENT_INFO[continent]?.latitude,
        longitude: CONTINENT_INFO[continent]?.longitude,
        width: 48,
        height: 48,
        pieChartData: Object.entries(costDataByProvider[continent]).map(([provider, cost]) => ({
            category: storeState.providers[provider]?.label || provider,
            color: storeState.providers[provider]?.color || '',
            provider,
            value: cost as number,
            pieSettings: {
                fill: storeState.providers[provider]?.color || '',
                stroke: storeState.providers[provider]?.color || '',
            },
        })),
    }));
};

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher<FullData>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<FullData> => {
    try {
        apiQueryHelper.setFilters(state.consoleFilters);
        if (state.pageSize) apiQueryHelper.setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
        const { status, response } = await fetchCostAnalyze({
            query: {
                granularity: state.granularity,
                group_by: [state.groupBy, COST_GROUP_BY.PROVIDER],
                start: state.dateRange.start,
                end: state.dateRange.end,
                fields: {
                    usd_cost_sum: {
                        key: 'usd_cost',
                        operator: 'sum',
                    },
                },
                sort: [{ key: 'usd_cost_sum', desc: true }],
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return { results: [], more: false };
};

const drawChart = (chartData: MapChartData[]) => {
    const chart = chartHelper.createMapChart();
    const polygonSeries = chartHelper.createMapPolygonSeries();
    chart.series.push(polygonSeries);
    const pointSeries = chartHelper.createMapPointSeries();
    chart.series.push(pointSeries);
    pointSeries.bullets.push((root, series, dataItem) => {
        const _chartData = dataItem?.dataContext?.data;
        const pieChart = chartHelper.createPieChart({
            width: 32,
            height: 32,
        });
        const pieSeries = chartHelper.createPieSeries({
            categoryField: 'category',
            valueField: 'value',
        });
        pieChart.series.push(pieSeries);
        pieSeries.data.setAll(_chartData.pieChartData);
        pieSeries.slices.template.setAll({
            templateField: 'pieSettings',
        });

        const tooltip = chartHelper.createTooltip();
        chartHelper.setPieTooltipText(pieSeries, tooltip, state.currency, props.currencyRates);
        pieSeries.slices.template.set('tooltip', tooltip);

        return chartHelper.createBullet({
            sprite: pieChart,
        });
    });

    chartData.forEach((d) => {
        pointSeries.data.push({
            geometry: { type: 'Point', coordinates: [d.longitude, d.latitude] },
            title: d.title,
            data: d,
        });
    });
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.legends = getXYChartLegends(state.data.results, COST_GROUP_BY.PROVIDER, props.allReferenceTypeInfo);
    chartHelper.clearChildrenOfRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};
const refreshWidget = async (thisPage = 1): Promise<FullData> => {
    await nextTick();
    state.loading = true;
    state.thisPage = thisPage;
    state.data = await fetchData();
    state.legends = getXYChartLegends(state.data.results, COST_GROUP_BY.PROVIDER, props.allReferenceTypeInfo);
    chartHelper.clearChildrenOfRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleUpdateThisPage = (thisPage: number) => {
    state.thisPage = thisPage;
    state.data = undefined;
    refreshWidget(thisPage);
};

const handleRefresh = () => {
    refreshWidget();
};

/* Init */
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/provider/load'),
        store.dispatch('reference/region/load'),
    ]);
})();

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    state,
    onCurrencyUpdate: async () => {
        if (!state.data) return;
        state.legends = getXYChartLegends(state.data.results, COST_GROUP_BY.PROVIDER, props.allReferenceTypeInfo);
        chartHelper.clearChildrenOfRoot();
        await nextTick();
        if (chartHelper.root.value) drawChart(state.chartData);
    },
});

defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="cost-by-region"
                  @refresh="handleRefresh"
    >
        <div class="content-wrapper">
            <p-data-loader class="chart-loader"
                           :loading="state.loading"
                           :data="state.chartData"
                           :loader-backdrop-opacity="1"
                           loader-type="skeleton"
                           show-data-from-scratch
            >
                <div ref="chartContext"
                     class="chart"
                />
                <div class="legend-wrapper">
                    <span v-for="(legend, idx) in state.chartLegends"
                          :key="`${legend.name}-${idx}`"
                          class="circle-wrapper"
                    >
                        <span v-if="legend.name"
                              class="circle"
                              :style="{background: storeState.providers[legend.name]?.color}"
                        /><span class="label">{{ storeState.providers[legend.name]?.label }}</span>
                    </span>
                </div>
            </p-data-loader>
            <widget-data-table v-model:legends="state.legends"
                               :loading="state.loading"
                               :fields="state.tableFields"
                               :items="state.data ? state.data.results : []"
                               :currency="state.currency"
                               :currency-rates="props.currencyRates"
                               :all-reference-type-info="props.allReferenceTypeInfo"
                               :this-page="state.thisPage"
                               :show-next-page="state.data ? state.data.more : false"
                               @update:this-page="handleUpdateThisPage"
            />
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.cost-by-region {
    .content-wrapper {
        @apply grid grid-cols-12;
        grid-column-gap: 1rem;
        height: 100%;
        .chart-loader {
            @apply col-span-5;
            height: 100%;
            padding-bottom: 1rem;
            .chart {
                @apply border border-gray-200;
                height: calc(90% - 2px);
                width: calc(100% - 2px);
            }
            .legend-wrapper {
                .circle-wrapper {
                    display: inline-flex;
                    align-items: center;
                    width: 100%;
                    .circle {
                        @apply inline-block rounded-full;
                        margin-right: 0.25rem;
                        width: 0.5rem;
                        height: 0.5rem;
                    }
                    .label {
                        @apply mr-4 text-label-sm text-gray-700;
                        white-space: nowrap;
                    }
                }
            }
        }
        .widget-data-table {
            @apply col-span-7;
        }
    }
    &.full {
        min-height: 29rem;
    }
}
</style>
