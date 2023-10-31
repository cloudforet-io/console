<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import type { XYChart } from '@amcharts/amcharts4/charts';
import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep, sortBy, uniqBy } from 'lodash';

import { sortArrayInObjectArray } from '@cloudforet/core-lib';
import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { usageUnitFormatter } from '@/lib/helper/usage-formatter';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/cost-analysis/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type {
    WidgetProps, WidgetExpose, WidgetEmit,
} from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, COST_GROUP_BY, WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import { getRefinedXYChartData } from '@/services/dashboards/widgets/_helpers/widget-chart-data-helper';
import {
    getDateAxisSettings, getXYChartLegends,
} from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import { getWidgetLocationFilters } from '@/services/dashboards/widgets/_helpers/widget-location-helper';
import {
    getRefinedDateTableData,
    getWidgetTableDateFields,
} from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
import { useWidgetPagination } from '@/services/dashboards/widgets/_hooks/use-widget-pagination';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';
import type { CostAnalyzeResponse, Legend } from '@/services/dashboards/widgets/type';


interface SubData { date: string; value: number }
interface Data {
    value_sum: SubData[];
    _total_value_sum: number;
    [dataField: string]: string|any;
    usage_unit: string|null;
}
interface ChartData {
    date: string;
    value: number;
    [dataField: string]: string|any;
    usage_unit?: string|null;
}
type FullData = CostAnalyzeResponse<Data>;


const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(widgetState.settings?.date_range?.end).format(DATE_FORMAT);
        const range = props.size === WIDGET_SIZE.full ? 11 : 3;
        const start = dayjs.utc(end).subtract(range, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
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
                granularity: primitiveToQueryString(widgetState.granularity),
                group_by: arrayToQueryString([COST_GROUP_BY.USAGE_TYPE]),
                period: objectToQueryString(_period),
                filters: objectToQueryString(getWidgetLocationFilters(widgetState.options.filters)),
            },
        };
    }),
});

const state = reactive({
    loading: true,
    data: null as FullData | null,
    dataType: computed<'cost'|'usage_quantity'>(() => (widgetState.options.cost_data_type === 'cost' ? 'cost' : 'usage_quantity')),
    dataFieldKey: computed<string>(() => {
        if (!widgetState.options.cost_data_field) return '';
        return widgetState.options.cost_data_field.split('.').pop() ?? '';
    }),
    chartData: computed<ChartData[]>(() => {
        if (!state.data?.results) return [];

        const chartData: ChartData[] = getRefinedXYChartData<Data, ChartData>(state.data.results, {
            groupBy: state.dataFieldKey,
            arrayDataKey: 'value_sum',
            categoryKey: DATE_FIELD_NAME,
            valueKey: 'value',
        });
        return sortBy(chartData, widgetState.dateRange, DATE_FIELD_NAME);
    }),
    tableFields: computed<Field[]>(() => {
        const _textOptions: Field['textOptions'] = state.dataType === 'cost' ? {
            type: 'cost',
        } : {
            type: 'usage',
            unitPath: 'usage_unit',
        };

        const refinedFields = getWidgetTableDateFields(widgetState.granularity, widgetState.dateRange, _textOptions, 'value_sum');

        // set width of table fields
        const groupByFieldWidth = refinedFields.length > 4 ? '28%' : '34%';
        const otherFieldWidth = refinedFields.length > 4 ? '18%' : '22%';

        const groupByField: Field = {
            label: state.dataFieldKey,
            name: state.dataFieldKey,
            width: groupByFieldWidth,
        };
        return [
            groupByField,
            ...refinedFields.map((field) => ({ ...field, width: otherFieldWidth })),
        ];
    }),
    tableData: computed<Data[]>(() => {
        const tableData: Data[] = sortArrayInObjectArray(
            getRefinedDateTableData(state.data?.results, widgetState.dateRange, ['value_sum']),
            DATE_FIELD_NAME,
            ['value_sum'],
        ).map((data) => {
            let value = data[state.dataFieldKey] ?? 'Unknown';
            if (state.fieldsKey === 'usage_quantity') value = `${value}${data.usage_unit ? ` (${data.usage_unit})` : ''}`;
            return {
                ...data,
                [state.dataFieldKey]: value,
            };
        });

        return tableData;
    }),
    legends: computed<Legend[]>(() => {
        const data = state.data?.results ?? [];
        const legends: Legend[] = getXYChartLegends(data, state.dataFieldKey)
            .map((l, i) => {
                let label = l.label;
                if (state.dataType === 'usage_quantity') label = `${label}${data[i]?.usage_unit ? ` (${data[i]?.usage_unit})` : ''}`;
                return { ...l, label };
            });
        return legends;
    }),
    showLegendsOnTable: computed(() => widgetState.options.legend_options?.enabled && widgetState.options.legend_options.show_at === 'table'),
    chart: null as XYChart | null,
    showChart: computed(() => {
        if (state.dataType === 'cost') return true;
        if (!state.data?.results) return true;
        // hide chart when there are different usage_unit in data or usage_unit is null
        if (state.data.results[0]?.value_sum.map((d) => d.usage_unit).some((d) => d === null)) return false;
        return uniqBy(state.data.results, 'usage_unit').length === 1;
    }),
    usageUnit: computed(() => state.data?.results?.[0]?.usage_unit),
});

const { pageSize, thisPage } = useWidgetPagination(widgetState);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => pageSize.value ?? 0),
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher<FullData>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<FullData|null> => {
    try {
        apiQueryHelper.setFilters([
            ...widgetState.consoleFilters]);
        if (pageSize.value) apiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);

        const groupBy = [widgetState.options.cost_data_field, 'date'];
        if (state.dataType === 'usage_quantity') {
            groupBy.push('usage_unit');
        }

        console.debug('widgetState.options.cost_data_source', widgetState.options.cost_data_source);
        const { status, response } = await fetchCostAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.granularity,
                group_by: groupBy,
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    value_sum: {
                        key: state.dataType,
                        operator: 'sum',
                    },
                },
                sort: [{ key: state.dataFieldKey, desc: true }],
                field_group: ['date'],
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            return {
                results: response.results,
                more: response.more,
            };
        }
        return state.data;
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], more: false };
    }
};

/* Util */
const drawChart = (chartData: ChartData[]) => {
    if (!state.showChart) return;
    const { chart, xAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(widgetState.dateRange));
    xAxis.get('baseInterval').timeUnit = 'month';
    chartHelper.setChartColors(chart, colorSet.value);

    chart.zoomOutButton.set('forceHidden', true);

    if (widgetState.chartType === CHART_TYPE.LINE) {
        chart.get('cursor')?.lineX.setAll({
            visible: true,
        });
    }

    let legend;
    if (widgetState.options.legend_options?.enabled && widgetState.options.legend_options.show_at === 'chart') {
        legend = chartHelper.createLegend({
            nameField: 'name',
        });
        chart.children.push(legend);
    }

    state.legends.forEach((l) => {
        const seriesSettings = {
            name: l.label,
            valueYField: l.name,
        };
        const series = widgetState.chartType === CHART_TYPE.LINE
            ? chartHelper.createXYLineSeries(chart, seriesSettings)
            : chartHelper.createXYColumnSeries(chart, { ...seriesSettings, stacked: true });
        chart.series.push(series);
        // set data processor
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat: DATE_FORMAT,
            dateFields: [DATE_FIELD_NAME],
        });
        const tooltip = chartHelper.createTooltip();
        if (state.dataType === 'usage_quantity') {
            chartHelper.setXYSharedTooltipText(
                chart,
                tooltip,
                (value) => usageUnitFormatter(value, { unit: state.usageUnit }),
            );
        } else {
            chartHelper.setXYSharedTooltipText(chart, tooltip, (value) => currencyMoneyFormatter(value, { currency: widgetState.currency }));
        }
        (series as any).set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
    if (legend) legend.data.setAll(chart.series.values);

    state.chart = chart;
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (_thisPage = 1): Promise<FullData> => {
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
const handleToggleLegend = (index: number) => {
    chartHelper.toggleSeries(state.chart, index);
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
        if (!state.data?.results) return;
        chartHelper.refreshRoot();
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
                  refresh-on-resize
                  class="aws-data-transfer-cost-trend"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="data-container">
            <div v-if="state.showChart"
                 class="chart-wrapper"
            >
                <p-data-loader class="chart-loader"
                               :loading="props.loading || state.loading"
                               :data="state.chartData"
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
                               :all-reference-type-info="allReferenceTypeInfo"
                               :this-page="thisPage"
                               :show-next-page="state.data ? state.data.more : false"
                               :legends="state.legends"
                               :color-set="colorSet"
                               :show-legend="state.showLegendsOnTable"
                               @toggle-legend="handleToggleLegend"
                               @update:thisPage="handleUpdateThisPage"
            />
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.aws-data-transfer-cost-trend {

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
        .data-container {
            min-height: 21rem;
        }
        .widget-data-table {
            height: auto;
        }
    }
}
</style>
