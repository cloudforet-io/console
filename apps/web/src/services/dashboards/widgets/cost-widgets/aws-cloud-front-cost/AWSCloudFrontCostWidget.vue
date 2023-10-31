<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import type * as am5xy from '@amcharts/amcharts5/xy';
import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep, uniqBy } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ReferenceType } from '@/store/reference/all-reference-store';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { usageUnitFormatter } from '@/lib/helper/usage-formatter';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/cost-analysis/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { Field, WidgetTableData } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import type {
    SelectorType, UsageType, WidgetEmit, WidgetExpose, WidgetProps,
} from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY, GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import { getRefinedXYChartData } from '@/services/dashboards/widgets/_helpers/widget-chart-data-helper';
import { getXYChartLegends } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
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
import type { CostAnalyzeResponse, Legend } from '@/services/dashboards/widgets/type';

const USAGE_TYPE_QUERY_KEY = 'additional_info.Usage Type Details';
const USAGE_TYPE_VALUE_KEY = 'Usage Type Details';
interface SubData {
    [USAGE_TYPE_VALUE_KEY]: string;
    value: number;
    usage_unit: string | null;
}
interface Data {
    value_sum: SubData[];
    _total_value_sum: number;
    date: string;
    [groupBy: string]: string | any; // product: 'AmazonCloudFront'
}
type Response = CostAnalyzeResponse<Data>;
interface TableData extends WidgetTableData {
    [groupBy: string]: string | any;
}
interface ChartData {
    [key: string]: number | any; // // project_id: 'project-1', HTTP Requests: 0.0, HTTPS Requests: 0.0, TransferOut: 0, ...
}


const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    widgetLocation: computed<Location>(() => {
        const end = dayjs.utc(widgetState.settings?.date_range?.end);
        const _period = {
            start: end.subtract(5, 'month').format('YYYY-MM'),
            end: end.format('YYYY-MM'),
        };
        return {
            name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
            params: {
                dataSourceId: widgetState.options.cost_data_source,
                costQuerySetId: DYNAMIC_COST_QUERY_SET_PARAMS,
            },
            query: {
                granularity: primitiveToQueryString(GRANULARITY.MONTHLY),
                group_by: arrayToQueryString([widgetState.groupBy, COST_GROUP_BY.USAGE_TYPE]),
                period: objectToQueryString(_period),
                filters: objectToQueryString(getWidgetLocationFilters(widgetState.options.filters)),
            },
        };
    }),
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
    fieldsKey: computed<'cost'|'usage_quantity'>(() => (selectedSelectorType.value === 'cost' ? 'cost' : 'usage_quantity')),
    legends: computed<Legend[]>(() => (state.data?.results ? getXYChartLegends(state.data.results, widgetState.groupBy, props.allReferenceTypeInfo) : [])),
    chartData: computed<ChartData[]>(() => {
        const _chartData = getRefinedXYChartData<Data, ChartData>(state.data?.results, {
            groupBy: widgetState.groupBy,
            allReferenceTypeInfo: props.allReferenceTypeInfo,
            arrayDataKey: 'value_sum',
            categoryKey: USAGE_TYPE_VALUE_KEY,
            valueKey: 'value',
            isHorizontal: true,
        });
        return _chartData.reverse();
    }),
    tableData: computed<TableData[]>(() => {
        const groupBy = widgetState.groupBy;
        if (!state.data?.results?.length || !groupBy) return [];
        return state.data.results.map((d: Data) => {
            const row: TableData = {
                [groupBy]: d[groupBy] ?? 'Unknown',
            } as TableData;
            d.value_sum?.forEach((subData: SubData) => {
                const rowKey = state.fieldsKey === 'usage_quantity' ? `${subData[USAGE_TYPE_VALUE_KEY]}_${subData.usage_unit}` : subData[USAGE_TYPE_VALUE_KEY];
                row[rowKey] = subData.value;
            });
            return row;
        });
    }),
    tableFields: computed<Field[]>(() => {
        if (!widgetState.groupBy) return [];
        const textOptions: Field['textOptions'] = {
            type: state.fieldsKey === 'cost' ? 'cost' : 'usage',
        };

        const dynamicTableFields: Field[] = [];
        state.data?.results?.[0]?.value_sum?.forEach((d: SubData) => {
            dynamicTableFields.push({
                label: d[USAGE_TYPE_VALUE_KEY] ?? 'Unknown',
                name: state.fieldsKey === 'usage_quantity' ? `${d[USAGE_TYPE_VALUE_KEY]}_${d.usage_unit}` : d[USAGE_TYPE_VALUE_KEY], // HTTP Requests_Bytes
                textOptions: { ...textOptions, unit: d.usage_unit } as Field['textOptions'],
                textAlign: 'right',
            });
        });

        // set width of table fields
        const groupByFieldWidth = dynamicTableFields.length > 4 ? '28%' : '34%';
        const otherFieldWidth = dynamicTableFields.length > 4 ? '18%' : '22%';

        const groupByLabel = COST_GROUP_BY_ITEM_MAP[widgetState.groupBy]?.label ?? widgetState.groupBy;
        const referenceType = getReferenceTypeOfGroupBy(props.allReferenceTypeInfo, widgetState.groupBy) as ReferenceType;

        const fixedFields: Field[] = [{
            name: widgetState.groupBy,
            label: groupByLabel,
            textOptions: { type: 'reference', referenceType },
            width: groupByFieldWidth,
        }];
        return [
            ...fixedFields,
            ...dynamicTableFields.map((field) => ({ ...field, width: otherFieldWidth })),
        ];
    }),
    //
    showChart: computed<boolean>(() => {
        if (state.fieldsKey === 'cost') return true;
        if (!state.data?.results) return true;
        // hide chart when there are different usage_unit in data or usage_unit is null
        if (state.data.results[0].value_sum.map((d) => d.usage_unit).some((d) => d === null)) return false;
        return uniqBy(state.data.results[0].value_sum, 'usage_unit').length === 1;
    }),
    usageUnit: computed<string|null>(() => state.data?.results?.[0]?.value_sum[0]?.usage_unit),
    chartSeriesList: computed<string[]>(() => {
        if (!state.chartData?.length) return [];
        return Object.keys(state.chartData[0]).filter((d) => d !== widgetState.groupBy);
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
        const groupBy = [widgetState.groupBy, USAGE_TYPE_QUERY_KEY];
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
                sort: [{ key: '_total_value_sum', desc: true }, { key: USAGE_TYPE_QUERY_KEY, desc: false }],
                field_group: ['usage_unit', USAGE_TYPE_VALUE_KEY],
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
    if (!state.showChart) return;
    const groupBy = widgetState.groupBy;
    if (!groupBy) return;
    const { chart, xAxis, yAxis } = chartHelper.createXYHorizontalChart();
    chartHelper.setChartColors(chart, colorSet.value);
    yAxis.set('categoryField', groupBy);
    yAxis.data.setAll(cloneDeep(chartData));
    // legend
    const legend = chartHelper.createLegend({
        nameField: 'name',
    });
    chart.children.push(legend);

    state.chartSeriesList.forEach((d) => {
        const seriesSettings: Partial<am5xy.IXYSeriesSettings> = {
            name: d,
            valueXField: d,
            categoryYField: groupBy,
            xAxis,
            yAxis,
            baseAxis: yAxis,
            stacked: true,
        };
        const series = chartHelper.createXYColumnSeries(chart, seriesSettings);
        chart.series.push(series);
        series.data.setAll(cloneDeep(chartData));

        const tooltip = chartHelper.createTooltip();
        tooltip.label.adapters.add('text', (text, target) => {
            let _text = `[${gray[700]}]${target.dataItem?.dataContext?.[groupBy]}[/]`;
            chart.series.each((s) => {
                const fieldName = s.get('valueYField') || s.get('valueXField') || '' as UsageType;
                let value = target.dataItem?.dataContext?.[fieldName];
                if (value === undefined) value = '--';
                if (typeof value === 'number') {
                    if (selectedSelectorType.value === 'cost') {
                        if (widgetState.currency) value = currencyMoneyFormatter(value, { currency: widgetState.currency });
                    } else {
                        value = usageUnitFormatter(value, { unit: state.usageUnit });
                    }
                }
                const _seriesName = state.usageUnit ? ` (${state.usageUnit})` : '';
                _text += `\n[${s.get('stroke')?.toString()}; fontSize: 10px]●[/] [fontSize: 14px;}]${s.get('name')}${_seriesName}:[/] [bold; fontSize: 14px]${value}[/]`;
            });
            return _text;
        });
        series.set('tooltip', tooltip);
    });
    if (legend) legend.data.setAll(chart.series.values);
};

const initWidget = async (data?: Response): Promise<Response> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    chartHelper.refreshRoot();
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
    initWidget,
    refreshWidget,
    props,
    emit,
    widgetState,
    onCurrencyUpdate: async () => {
        if (!state.data) return;
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
            <div v-if="state.showChart"
                 class="chart-wrapper"
            >
                <p-data-loader class="chart-loader"
                               :loading="props.loading || state.loading"
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

            <widget-data-table :loading="props.loading || state.loading"
                               :fields="state.tableFields"
                               :items="state.tableData"
                               :currency="widgetState.currency"
                               :all-reference-type-info="props.allReferenceTypeInfo"
                               :legends="state.legends"
                               :color-set="colorSet"
                               :this-page="thisPage"
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
