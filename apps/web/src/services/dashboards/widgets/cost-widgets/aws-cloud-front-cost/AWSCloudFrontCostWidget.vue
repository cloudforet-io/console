<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import type * as am5xy from '@amcharts/amcharts5/xy';
import { PDataLoader } from '@spaceone/design-system';
import bytes from 'bytes';
import { cloneDeep } from 'lodash';

import { byteFormatter } from '@cloudforet/core-lib';
import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ReferenceType } from '@/store/reference/all-reference-store';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/cost-analysis/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { Field, WidgetTableData } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrameNew.vue';
import type {
    UsageType, WidgetEmit, WidgetExpose, WidgetProps,
    SelectorType,
} from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import {
    getRefinedXYChartData,
    getXYChartLegends,
} from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import { getWidgetLocationFilters } from '@/services/dashboards/widgets/_helpers/widget-location-helper';
import { getReferenceTypeOfGroupBy } from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import {
    useCostWidgetFrameHeaderDropdown,
} from '@/services/dashboards/widgets/_hooks/use-cost-widget-frame-header-dropdown';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetPagination } from '@/services/dashboards/widgets/_hooks/use-widget-pagination';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';
import type { Legend, CostAnalyzeResponse } from '@/services/dashboards/widgets/type';

const USAGE_SOURCE_UNIT = 'GB';
const USAGE_TYPE_QUERY_KEY = 'additional_info.Usage Type Details';
const USAGE_TYPE_VALUE_KEY = 'Usage Type Details';

interface Data {
    [groupBy: string]: string | any; // product: 'AmazonCloudFront'
    cost_sum?: Array<{
        [field_group: string]: any;
        value: number
    }>;
    date: string;
    usage_quantity_sum?: Array<{
        [field_group: string]: any;
        value: number
    }>;
    _total_cost_sum?: number;
    _total_usage_quantity_sum?: number;
}
type Response = CostAnalyzeResponse<Data>;
interface SubData { [USAGE_TYPE_VALUE_KEY]: string; value: number }
interface TableData extends WidgetTableData {
    [COST_GROUP_BY.PROJECT]: string;
}


const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
        params: {
            dataSourceId: widgetState.options.cost_data_source,
            costQuerySetId: DYNAMIC_COST_QUERY_SET_PARAMS,
        },
        query: {
            granularity: primitiveToQueryString(widgetState.granularity),
            group_by: arrayToQueryString([widgetState.groupBy]),
            period: objectToQueryString(widgetState.dateRange),
            filters: objectToQueryString({
                ...getWidgetLocationFilters(widgetState.options.filters),
                provider: ['aws'],
                product: ['AmazonCloudFront'],
            }),
        },
    })),
});

const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.chartData?.length ?? 0),
});
const { selectorItems, selectedSelectorType } = useCostWidgetFrameHeaderDropdown({
    selectorOptions: computed(() => widgetState.options?.selector_options),
});

const state = reactive({
    loading: true,
    data: null as Response | null,
    fieldsKey: computed<string>(() => (selectedSelectorType.value === 'cost' ? 'cost' : 'usage_quantity')),
    legends: [] as Legend[],
    chartData: computed(() => {
        const dataKey = `${state.fieldsKey}_sum`;
        const _chartData = getRefinedXYChartData(state.data?.results, {
            groupBy: COST_GROUP_BY.PROJECT,
            allReferenceTypeInfo: props.allReferenceTypeInfo,
            arrayDataKey: dataKey,
            categoryKey: USAGE_TYPE_VALUE_KEY,
            valueKey: 'value',
            isHorizontal: true,
        });
        return _chartData.reverse();
    }),
    tableData: computed<TableData[]>(() => {
        if (!state.data?.results?.length) return [];
        const tableData: TableData[] = state.data.results.map((d: Data) => {
            const row: TableData = {
                [COST_GROUP_BY.PROJECT]: d.project_id,
            };
            d[`${state.fieldsKey}_sum`]?.forEach((subData: SubData) => {
                row[subData[USAGE_TYPE_VALUE_KEY]] = subData.value;
            });
            return row;
        });
        return tableData;
    }),
    tableFields: computed<Field[]>(() => {
        if (!widgetState.groupBy) return [];
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

        const groupByLabel = COST_GROUP_BY_ITEM_MAP[widgetState.groupBy]?.label ?? widgetState.groupBy;
        const referenceType = getReferenceTypeOfGroupBy(props.allReferenceTypeInfo, widgetState.groupBy) as ReferenceType;
        return [
            { name: widgetState.groupBy, label: groupByLabel, textOptions: { type: 'reference', referenceType } },
            ...dynamicTableFields,
        ];
    }),
});

const { pageSize, thisPage } = useWidgetPagination(widgetState);

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher<Response>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<Response> => {
    if (!widgetState.groupBy) return { results: [], more: false };
    apiQueryHelper.setFilters(widgetState.consoleFilters);
    if (pageSize.value) apiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);
    try {
        const { status, response } = await fetchCostAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.granularity,
                group_by: [COST_GROUP_BY.PROJECT, USAGE_TYPE_QUERY_KEY],
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
                sort: [{ key: '_total_cost_sum', desc: true }],
                field_group: [USAGE_TYPE_VALUE_KEY],
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

const drawChart = (chartData) => {
    if (!widgetState.groupBy) return;
    const { chart, xAxis, yAxis } = chartHelper.createXYHorizontalChart();
    chartHelper.setChartColors(chart, colorSet.value);
    yAxis.set('categoryField', COST_GROUP_BY.PROJECT);
    yAxis.data.setAll(cloneDeep(chartData));
    // legend
    const legend = chartHelper.createLegend({
        nameField: 'name',
    });
    chart.children.push(legend);

    state.data.results[0].cost_sum.forEach((d) => {
        const seriesSettings: Partial<am5xy.IXYSeriesSettings> = {
            name: d[USAGE_TYPE_VALUE_KEY],
            valueXField: d[USAGE_TYPE_VALUE_KEY],
            categoryYField: widgetState.groupBy,
            xAxis,
            yAxis,
            baseAxis: yAxis,
            stacked: true,
        };
        const series = chartHelper.createXYColumnSeries(chart, seriesSettings);
        chart.series.push(series);
        const tooltip = chartHelper.createTooltip();
        tooltip.label.adapters.add('text', (text, target) => {
            // let _text = `[${gray[700]}]{valueX}[/]`;
            let _text = `[${gray[700]}]${target.dataItem?.dataContext?.[state.groupBy]}[/]`;
            chart.series.each((s) => {
                const fieldName = s.get('valueYField') || s.get('valueXField') || '' as UsageType;
                let value = target.dataItem?.dataContext?.[fieldName];
                if (value === undefined) value = '--';
                if (fieldName === 'data-transfer.out') {
                    if (selectedSelectorType.value === 'cost') {
                        if (state.currency) value = currencyMoneyFormatter(value, widgetState.currency, props.currencyRates);
                    } else {
                        value = bytes.parse(`${value}${USAGE_SOURCE_UNIT}`);
                        value = byteFormatter(value);
                    }
                }
                _text += `\n[${s.get('stroke')?.toString()}; fontSize: 10px]●[/] [fontSize: 14px;}]${s.get('name')}:[/] [bold; fontSize: 14px]${value}[/]`;
            });
            return _text;
        });
        series.set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
    if (legend) legend.data.setAll(chart.series.values);
};

const initWidget = async (data?: Response): Promise<Response> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.legends = getXYChartLegends(state.data.results, widgetState.groupBy, props.allReferenceTypeInfo);
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (_thisPage = 1): Promise<Response> => {
    await nextTick();
    state.loading = true;
    thisPage.value = _thisPage;
    state.data = await fetchData();
    state.legends = getXYChartLegends(state.data.results, widgetState.groupBy, props.allReferenceTypeInfo);
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleSelectSelectorType = (selected?: SelectorType) => {
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
    refreshWidget,
    props,
    emit,
    widgetState,
    onCurrencyUpdate: async () => {
        if (!state.data) return;
        state.legends = getXYChartLegends(state.data.results, widgetState.groupBy, props.allReferenceTypeInfo);
        chartHelper.refreshRoot();
        await nextTick();
        if (chartHelper.root.value) drawChart(state.chartData);
    },
});

defineExpose<WidgetExpose<Response>>({
    initWidget,
    refreshWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="aws-cloud-front-cost"
                  v-on="widgetFrameEventHandlers"
    >
        <template v-if="selectorItems.length"
                  #header-right
        >
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
                               :legends.sync="state.legends"
                               :color-set="colorSet"
                               :this-page="state.thisPage"
                               :show-next-page="state.data ? state.data.more : false"
                               @update:this-page="handleUpdateThisPage"
            />
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.aws-cloud-front-cost {
    .data-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        .chart-wrapper {
            height: 185px;
            margin-bottom: 1rem;
            .chart-loader {
                height: 100%;
                .chart {
                    height: 100%;
                }
            }
        }
        .widget-data-table {
            flex-grow: 1;
        }
    }

    &.full {
        .widget-data-table {
            height: auto;
        }
    }
}
</style>
