<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import type { Circle } from '@amcharts/amcharts5';
import { Template } from '@amcharts/amcharts5';
import { PDataLoader } from '@spaceone/design-system';
import { uniqBy } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { RegionReferenceMap } from '@/store/modules/reference/region/type';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/cost-analysis/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { Field, WidgetTableData } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import type {
    WidgetExpose, WidgetProps, SelectorType, WidgetEmit,
} from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY, GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
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

interface SubData {
    [USAGE_TYPE_VALUE_KEY]: string;
    value: number;
    usage_unit: string | null;
}
interface Data {
    date: string;
    value_sum: SubData[];
    _total_value_sum: number;
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
    _total_value_sum?: number;
    circleSettings?: {
        fill: string;
    }
}

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
        params: {
            dataSourceId: widgetState.options.cost_data_source,
            costQuerySetId: DYNAMIC_COST_QUERY_SET_PARAMS,
        },
        query: {
            granularity: primitiveToQueryString(GRANULARITY.DAILY),
            group_by: arrayToQueryString([COST_GROUP_BY.REGION, COST_GROUP_BY.USAGE_TYPE, 'usage_unit']),
            period: objectToQueryString(widgetState.dateRange),
            filters: objectToQueryString(getWidgetLocationFilters(widgetState.options.filters)),
        },
    })),
});

const state = reactive({
    loading: true,
    data: null as FullData | null,
    fieldsKey: computed<'cost'|'usage_quantity'>(() => (selectedSelectorType.value === 'cost' ? 'cost' : 'usage_quantity')),
    legends: computed<Legend[]>(() => (state.data?.results ? getPieChartLegends(state.data.results, widgetState.groupBy) : [])),
    chartData: computed<CircleData[]>(() => {
        const chartData = getRefinedCircleData(state.data?.results, props.allReferenceTypeInfo?.region?.referenceMap as RegionReferenceMap);
        return chartData;
    }),
    tableData: computed<TableData[]>(() => {
        if (!state.data?.results?.length) return [];
        const tableData: TableData[] = state.data.results.map((d: Data) => {
            const row: TableData = {
                [COST_GROUP_BY.REGION]: d.region_code,
            };
            d.value_sum.forEach((subData: SubData) => {
                const rowKey = state.fieldsKey === 'usage_quantity' ? `${subData[USAGE_TYPE_VALUE_KEY]}_${subData.usage_unit}` : subData[USAGE_TYPE_VALUE_KEY];
                row[rowKey] = subData.value;
            });
            return row;
        });
        return tableData;
    }),
    tableFields: computed<Field[]>(() => {
        const textOptions: Field['textOptions'] = {
            type: state.fieldsKey === 'cost' ? 'cost' : 'usage',
        };

        const dynamicTableFields: Field[] = [];
        state.data?.results?.[0]?.value_sum?.forEach((d: SubData) => {
            dynamicTableFields.push({
                label: d[USAGE_TYPE_VALUE_KEY],
                name: state.fieldsKey === 'usage_quantity' ? `${d[USAGE_TYPE_VALUE_KEY]}_${d.usage_unit}` : d[USAGE_TYPE_VALUE_KEY], // HTTP Requests_Bytes
                textOptions: { ...textOptions, unit: d.usage_unit } as Field['textOptions'],
                textAlign: 'right',
            });
        });

        // set width of table fields
        const groupByFieldWidth = dynamicTableFields.length > 4 ? '28%' : '34%';
        const otherFieldWidth = dynamicTableFields.length > 4 ? '18%' : '22%';

        const fixedFields: Field[] = [{
            label: 'Region',
            name: COST_GROUP_BY.REGION,
            textOptions: { type: 'reference', referenceType: 'region' },
            width: groupByFieldWidth,
        }];
        return [
            ...fixedFields,
            ...dynamicTableFields.map((d) => ({ ...d, width: otherFieldWidth })),
        ];
    }),
    //
    showChart: computed<boolean>(() => {
        if (state.fieldsKey === 'cost') return true;
        if (!state.data?.results) return true;
        // hide chart when there are different usage_unit in data
        return uniqBy(state.data.results[0].value_sum, 'usage_unit').length === 1;
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

        const groupBy = [COST_GROUP_BY.REGION, USAGE_TYPE_QUERY_KEY];
        if (state.fieldsKey === 'usage_quantity') {
            groupBy.push('usage_unit');
        }

        const { status, response } = await fetchCostAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.granularity,
                group_by: groupBy,
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    value_sum: {
                        key: state.fieldsKey,
                        operator: 'sum',
                    },
                },
                field_group: ['usage_unit', USAGE_TYPE_VALUE_KEY],
                sort: [{ key: '_total_value_sum', desc: true }],
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
    if (!state.showChart) return;
    const chart = chartHelper.createMapChart();
    const polygonSeries = chartHelper.createMapPolygonSeries();
    chart.series.push(polygonSeries);
    const pointSeries = chartHelper.createMapPointSeries({
        calculateAggregates: true,
        valueField: '_total_value_sum',
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
const handleSelectSelectorType = (selected: SelectorType) => {
    selectedSelectorType.value = selected;
    refreshWidget();
};
const handleUpdateThisPage = (_thisPage: number) => {
    thisPage.value = _thisPage;
    state.data = undefined;
    refreshWidget(_thisPage);
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    initWidget,
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
            <div v-if="state.showChart"
                 class="chart-wrapper"
            >
                <p-data-loader class="chart-loader"
                               :loading="props.loading || state.loading"
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
            <widget-data-table :loading="props.loading || state.loading"
                               :fields="state.tableFields"
                               :items="state.tableData"
                               :currency="widgetState.currency"
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
