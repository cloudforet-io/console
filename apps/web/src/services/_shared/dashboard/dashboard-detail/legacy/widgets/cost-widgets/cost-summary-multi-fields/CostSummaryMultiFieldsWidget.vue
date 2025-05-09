<script setup lang="ts">
import {
    computed, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { Root } from '@amcharts/amcharts5';
import type { IRootSettings } from '@amcharts/amcharts5/.internal/core/Root';
import type * as am5xy from '@amcharts/amcharts5/xy';
import { cloneDeep, uniqBy } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PSkeleton } from '@cloudforet/mirinae';

import { COST_DATA_FIELD_MAP } from '@/api-clients/dashboard/_constants/widget-constant';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { usageUnitFormatter } from '@/lib/helper/usage-formatter';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import WidgetDataTable from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetColorSet } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidgetPagination } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-pagination';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import { getRefinedXYChartData } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-chart-data-helper';
import { getXYChartLegends } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-chart-helper';
import { getWidgetDataTableRowLocation } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-location-helper';
import { getReferenceTypeOfDataField } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-table-helper';
import { getWidgetValueLabel } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-value-label-helper';
import type { Field, WidgetTableData } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-data-table-type';
import type {
    WidgetEmit, WidgetExpose, WidgetProps,
    CostAnalyzeResponse, Legend,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';
import type { ReferenceType } from '@/services/dashboards/stores/all-reference-type-info-store';


interface SubData {
    value: number;
    usage_unit: string | null;
    [secondaryParsedDataField: string]: any;
}
interface Data {
    value_sum: SubData[];
    _total_value_sum: number;
    date: string;
    [parsedDataField: string]: string | any; // product: 'AmazonCloudFront'
}
type Response = CostAnalyzeResponse<Data>;
interface TableData extends WidgetTableData {
    [parsedDataField: string]: string | any;
}
interface ChartData {
    [key: string]: number | any; // // project_id: 'project-1', HTTP Requests: 0.0, HTTPS Requests: 0.0, TransferOut: 0, ...
}

const router = useRouter();
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const COLUMN_DATA_LIMIT = 10;
const CHART_ROOT_OPTIONS: IRootSettings = {
    tooltipContainerBounds: {
        top: 1000,
        right: 0,
        bottom: 1000,
        left: 0,
    },
};

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit);

const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.chartData?.length ?? 0),
});

const state = reactive({
    loading: true,
    data: null as Response | null,
    slicedData: computed<Response|null>(() => {
        if (!state.data) return null;
        return {
            results: state.data.results.map((d) => ({ ...d, value_sum: d.value_sum.slice(0, COLUMN_DATA_LIMIT) })),
            more: state.data.more,
        };
    }),
    dataType: computed<string|undefined>(() => (widgetState.options.cost_data_type)),
    legends: computed<Legend[]>(() => (state.slicedData?.results ? getXYChartLegends(state.slicedData.results, widgetState.parsedDataField, props.allReferenceTypeInfo) : [])),
    chartData: computed<ChartData[]>(() => {
        const _chartData = getRefinedXYChartData<Data, ChartData>(state.slicedData?.results, {
            dataField: widgetState.parsedDataField,
            allReferenceTypeInfo: props.allReferenceTypeInfo,
            arrayDataKey: 'value_sum',
            categoryKey: widgetState.parsedSecondaryDataField,
            valueKey: 'value',
            isHorizontal: true,
        });
        return _chartData.reverse();
    }),
    tableData: computed<TableData[]>(() => {
        if (!widgetState.dataField || !state.slicedData?.results?.length) return [];
        return state.slicedData.results.map((d: Data) => {
            const row: TableData = {
                [widgetState.parsedDataField]: d[widgetState.parsedDataField] ?? 'Unknown',
            } as TableData;
            d.value_sum?.forEach((subData: SubData) => {
                const rowKey = state.dataType === 'usage_quantity' ? `${subData[widgetState.parsedSecondaryDataField]}_${subData.usage_unit}` : subData[widgetState.parsedSecondaryDataField];
                row[rowKey] = subData.value;
            });
            return row;
        });
    }),
    tableFields: computed<Field[]>(() => {
        if (!widgetState.dataField) return [];
        let textOptions: Field['textOptions'];
        if (state.dataType === 'cost') {
            textOptions = { type: 'cost' };
        } else if (state.dataType === 'usage_quantity') {
            textOptions = { type: 'usage', unitPath: 'usage_unit' };
        }

        const dynamicTableFields: Field[] = [];
        state.slicedData?.results?.[0]?.value_sum?.forEach((d: SubData) => {
            dynamicTableFields.push({
                label: getWidgetValueLabel(d[widgetState.parsedSecondaryDataField], {
                    allReferenceTypeInfo: props.allReferenceTypeInfo,
                    referenceIdKey: widgetState.parsedSecondaryDataField,
                }),
                name: state.dataType === 'usage_quantity' ? `${d[widgetState.parsedSecondaryDataField]}_${d.usage_unit}` : d[widgetState.parsedSecondaryDataField], // HTTP Requests_Bytes
                textOptions: { ...textOptions, unit: d.usage_unit } as Field['textOptions'],
                textAlign: 'right',
            });
        });

        // set width of table fields
        const dataFieldTableFieldWidth = dynamicTableFields.length > 4 ? '28%' : '34%';
        const otherFieldWidth = dynamicTableFields.length > 4 ? '18%' : '22%';

        const dataFieldLabel = Object.values(COST_DATA_FIELD_MAP).find((d) => d.name === widgetState.dataField)?.label ?? widgetState.parsedDataField;
        const referenceType = getReferenceTypeOfDataField(props.allReferenceTypeInfo, widgetState.dataField) as ReferenceType;

        const fixedFields: Field[] = [{
            name: widgetState.parsedDataField,
            label: dataFieldLabel,
            textOptions: referenceType ? { type: 'reference', referenceType } : undefined,
            width: dataFieldTableFieldWidth,
        }];
        return [
            ...fixedFields,
            ...dynamicTableFields.map((field) => ({ ...field, width: otherFieldWidth })),
        ];
    }),
    //
    showChart: computed<boolean>(() => {
        if (state.dataType !== 'usage_quantity') return true;
        if (!state.slicedData?.results?.length) return true;
        // hide chart when there are different usage_unit in data or usage_unit is null
        if (state.slicedData.results[0].value_sum.map((d) => d.usage_unit).some((d) => d === null)) return false;
        return uniqBy(state.slicedData.results[0].value_sum, 'usage_unit').length === 1;
    }),
    usageUnit: computed<string|null>(() => state.slicedData?.results?.[0]?.value_sum[0]?.usage_unit),
    chartSeriesList: computed<string[]>(() => {
        if (!state.chartData?.length) return [];
        return Object.keys(state.chartData[0]).filter((d) => d !== widgetState.parsedDataField);
    }),
});

const { pageSize, thisPage } = useWidgetPagination(widgetState);

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher<object, Response>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<Response> => {
    if (!widgetState.dataField) return { results: [], more: false };
    apiQueryHelper.setFilters(widgetState.consoleFilters);
    if (pageSize.value) apiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);
    try {
        const dataFields = [widgetState.dataField, widgetState.secondaryDataField];
        const fieldGroups = [widgetState.parsedSecondaryDataField];
        if (state.dataType === 'usage_quantity') {
            dataFields.push('usage_unit');
            fieldGroups.push('usage_unit');
        }
        const { status, response } = await fetchCostAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.granularity,
                group_by: dataFields,
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    value_sum: {
                        key: state.dataType,
                        operator: 'sum',
                    },
                },
                sort: [{ key: '_total_value_sum', desc: true }, { key: widgetState.dataField, desc: false }, { key: widgetState.secondaryDataField, desc: false }],
                field_group: fieldGroups,
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
    if (!widgetState.parsedDataField) return;
    chartHelper.disposeRoot();
    chartHelper.setRoot(Root.new(chartContext.value as HTMLElement, CHART_ROOT_OPTIONS));
    const { chart, xAxis, yAxis } = chartHelper.createXYHorizontalChart();
    chartHelper.setChartColors(chart, colorSet.value);
    yAxis.set('categoryField', widgetState.parsedDataField);
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
            categoryYField: widgetState.parsedDataField,
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
            let _text = `[${gray[700]}]${target.dataItem?.dataContext?.[widgetState.parsedDataField]}[/]`;
            chart.series.each((s) => {
                const fieldName = s.get('valueYField') || s.get('valueXField') || '';
                let value = target.dataItem?.dataContext?.[fieldName];
                if (value === undefined) value = '--';
                if (typeof value === 'number') {
                    if (state.dataType === 'cost') {
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
const handleUpdateThisPage = (_thisPage: number) => {
    thisPage.value = _thisPage;
    state.data = undefined;
    refreshWidget(_thisPage);
};
const handleClickRow = (rowData: WidgetTableData) => {
    if (!widgetState.dataField) return;
    const _rowLocation = getWidgetDataTableRowLocation(rowData, widgetState.widgetLocation, [widgetState.dataField]);
    if (_rowLocation) window.open(router.resolve(_rowLocation).href, '_blank');
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
        <div class="data-container">
            <div v-if="state.showChart"
                 class="chart-wrapper"
            >
                <div class="chart-loader">
                    <p-skeleton v-show="props.loading || state.loading"
                                height="100%"
                                width="100%"
                                class="chart-skeleton"
                    />
                    <div ref="chartContext"
                         class="chart"
                    />
                </div>
            </div>
            <widget-data-table :loading="props.loading || state.loading"
                               :fields="state.tableFields"
                               :items="state.tableData"
                               :currency="widgetState.currency"
                               :all-reference-type-info="props.allReferenceTypeInfo"
                               :legends="state.legends"
                               :color-set="colorSet"
                               :this-page="thisPage"
                               :show-next-page="state.slicedData ? state.slicedData.more : false"
                               @update:this-page="handleUpdateThisPage"
                               @click-row="handleClickRow"
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
        overflow: hidden;
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
