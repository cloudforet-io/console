<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import type { Circle } from '@amcharts/amcharts5';
import { Template } from '@amcharts/amcharts5';
import { PDataLoader } from '@spaceone/design-system';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { RegionReferenceMap } from '@/store/modules/reference/region/type';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { Field, WidgetTableData } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrameNew.vue';
import type {
    WidgetExpose, WidgetProps, SelectorType, WidgetEmit,
} from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { getPieChartLegends } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import { getWidgetLocationFilters } from '@/services/dashboards/widgets/_helpers/widget-location-helper';
import {
    useCostWidgetFrameHeaderDropdown,
} from '@/services/dashboards/widgets/_hooks/use-cost-widget-frame-header-dropdown';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
import { useWidgetPagination } from '@/services/dashboards/widgets/_hooks/use-widget-pagination';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';
import type { Legend, CostAnalyzeResponse } from '@/services/dashboards/widgets/type';


const USAGE_TYPE_QUERY_KEY = 'additional_info.Usage Type Details';
const USAGE_TYPE_VALUE_KEY = 'Usage Type Details';
const USAGE_SOURCE_UNIT = 'GB';

interface SubData { [USAGE_TYPE_VALUE_KEY]: string; value: number }
interface Data {
    date: string;
    cost_sum: SubData[];
    usage_quantity_sum: SubData[];
    _total_cost_sum: number;
    _total_usage_quantity_sum: number;
    [COST_GROUP_BY.REGION]: string;
}

interface TableData extends WidgetTableData {
    [COST_GROUP_BY.REGION]: string;
}

type FullData = CostAnalyzeResponse<Data>;

interface CircleData {
    [COST_GROUP_BY.REGION]: string;
    latitude: number;
    longitude: number;
    _total_cost_sum?: number;
    _total_usage_quantity?: number;
    circleSettings?: {
        fill: string;
    }
}

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed(() => {
        const { end } = widgetState.settings?.date_range ?? {};
        return {
            start: end,
            end,
        };
    }),
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
        params: {
            // TODO: after hook refactor, add params
        },
        query: {
            granularity: primitiveToQueryString(widgetState.granularity),
            group_by: arrayToQueryString([widgetState.groupBy]),
            period: objectToQueryString(widgetState.dateRange),
            filters: objectToQueryString({
                ...getWidgetLocationFilters(widgetState.options.filters),
                provider: ['aws'],
                product: ['AWSDataTransfer'],
            }),
        },
    })),
});

const state = reactive({
    loading: true,
    data: null as FullData | null,
    fieldsKey: computed<string>(() => (selectedSelectorType.value === 'cost' ? 'cost' : 'usage_quantity')),
    legends: computed<Legend[]>(() => (state.data?.results ? getPieChartLegends(state.data.results, widgetState.groupBy) : [])),
    chartData: computed<CircleData[]>(() => getRefinedCircleData(state.data?.results, props.allReferenceTypeInfo?.region?.referenceMap as RegionReferenceMap)),
    tableData: computed<TableData[]>(() => {
        if (!state.data?.results?.length) return [];
        const tableData: TableData[] = state.data.results.map((d: Data) => {
            const row: TableData = {
                [COST_GROUP_BY.REGION]: d.region_code,
            };
            d[`${state.fieldsKey}_sum`]?.forEach((subData: SubData) => {
                row[subData[USAGE_TYPE_VALUE_KEY]] = subData.value;
            });
            return row;
        });
        return tableData;
    }),
    tableFields: computed<Field[]>(() => {
        const textOptions: Field['textOptions'] = {
            type: state.fieldsKey === 'cost' ? 'cost' : 'size',
            sourceUnit: USAGE_SOURCE_UNIT,
        };
        const dynamicTableFields: Field[] = state.data?.results?.[0]?.cost_sum?.map((d: SubData) => ({
            label: d[USAGE_TYPE_VALUE_KEY],
            name: d[USAGE_TYPE_VALUE_KEY],
            textOptions,
            textAlign: 'right',
        })) ?? [];
        return [
            { label: 'Region', name: COST_GROUP_BY.REGION, textOptions: { type: 'reference', referenceType: 'region' } },
            ...dynamicTableFields,
        ];
    }),
});

const { pageSize, thisPage } = useWidgetPagination(widgetState);


const { selectorItems, selectedSelectorType } = useCostWidgetFrameHeaderDropdown({
    selectorOptions: computed(() => widgetState.options?.selector_options),
});

/* Util */
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.data?.results?.length ?? 0),
});
const getRefinedCircleData = (results?: Data[], regionMap: RegionReferenceMap = {}): CircleData[] => {
    if (!results?.length) return [];
    return results.map((d, idx) => {
        const regionInfo = regionMap[d.region_code] ?? {};
        return {
            ...d,
            region_code: d.region_code,
            longitude: parseFloat(regionInfo.longitude ?? 0),
            latitude: parseFloat(regionInfo.latitude ?? 0),
            circleSettings: {
                fill: colorSet.value[idx],
            },
        };
    });
};

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher<FullData>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<FullData> => {
    try {
        apiQueryHelper.setFilters(widgetState.consoleFilters);
        if (pageSize.value) apiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);

        const { status, response } = await fetchCostAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.granularity,
                group_by: [COST_GROUP_BY.REGION, USAGE_TYPE_QUERY_KEY],
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    cost_sum: {
                        key: 'cost',
                        operator: 'sum',
                    },
                    usage_quantity_sum: {
                        key: 'usage_quantity',
                        operator: 'sum',
                    },
                },
                field_group: [USAGE_TYPE_VALUE_KEY],
                sort: [{ key: '_total_cost_sum', desc: true }],
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            return {
                results: response.results,
                more: response.more,
            };
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return { results: [], more: false };
};

const drawChart = (chartData: CircleData[]) => {
    const chart = chartHelper.createMapChart();
    const polygonSeries = chartHelper.createMapPolygonSeries();
    chart.series.push(polygonSeries);
    const pointSeries = chartHelper.createMapPointSeries({
        calculateAggregates: true,
        valueField: `_total_${state.fieldsKey}_sum`,
    });
    chart.series.push(pointSeries);

    const circleTemplate = Template.new({}) as Template<Circle>;
    pointSeries.bullets.push(() => {
        const circle = chartHelper.createCircle({
            radius: 5,
            fillOpacity: 0.6,
            templateField: 'circleSettings',
        }, circleTemplate);
        return chartHelper.createBullet({
            sprite: circle,
            dynamic: true,
        });
    });
    pointSeries.set('heatRules', [{
        target: circleTemplate,
        min: 5,
        max: 20,
        key: 'radius',
        dataField: 'value',
    }]);

    pointSeries.data.setAll(chartData);
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    chartHelper.clearChildrenOfRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};
const refreshWidget = async (_thisPage = 1): Promise<FullData> => {
    await nextTick();
    state.loading = true;
    thisPage.value = _thisPage;
    state.data = await fetchData();
    chartHelper.clearChildrenOfRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleSelectSelectorType = async (selected: SelectorType) => {
    selectedSelectorType.value = selected;
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
};
const handleUpdateThisPage = (_thisPage: number) => {
    thisPage.value = _thisPage;
    state.data = undefined;
    refreshWidget(_thisPage);
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    emit,
    widgetState,
    onCurrencyUpdate: async () => {
        if (!state.data) return;
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
                  class="aws-data-transfer-by-region"
                  v-on="widgetFrameEventHandlers"
    >
        <template #header-right>
            <widget-frame-header-dropdown :items="selectorItems"
                                          :selected="selectedSelectorType"
                                          @select="handleSelectSelectorType"
            />
        </template>
        <div class="data-container">
            <div class="chart-wrapper">
                <p-data-loader class="chart-loader"
                               :loading="state.loading"
                               :data="state.data"
                               loader-type="skeleton"
                               disable-empty-case
                               :loader-backdrop-opacity="1"
                               show-data-from-scratch
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                </p-data-loader>
            </div>
            <widget-data-table :loading="state.loading"
                               :fields="state.tableFields"
                               :items="state.tableData"
                               :currency="widgetState.currency"
                               :currency-rates="props.currencyRates"
                               :all-reference-type-info="props.allReferenceTypeInfo"
                               :this-page="thisPage"
                               :show-next-page="state.data ? state.data.more : false"
                               :legends="state.legends"
                               :color-set="colorSet"
                               show-legend
                               disable-toggle
                               @update:thisPage="handleUpdateThisPage"
            />
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.aws-data-transfer-by-region {
    .data-container {
        display: flex;
        flex-direction: column;
        row-gap: 1rem;
        height: 100%;
    }
    .chart-wrapper {
        height: 10.125rem;
        .chart-loader {
            height: 100%;
            .chart {
                @apply border border-gray-200;
                height: calc(100% - 2px);
                width: calc(100% - 2px);
            }
        }
    }
    .widget-data-table {
        @apply flex-grow;
    }
    &.full {
        .widget-data-table {
            height: auto;
        }
    }
}
</style>
