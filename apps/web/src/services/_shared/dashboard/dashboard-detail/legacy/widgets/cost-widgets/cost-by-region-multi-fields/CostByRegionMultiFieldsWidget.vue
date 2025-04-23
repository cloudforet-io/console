<script setup lang="ts">
import {
    computed, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import type { Circle } from '@amcharts/amcharts5';
import { Template } from '@amcharts/amcharts5';
import { uniqBy } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PDataLoader } from '@cloudforet/mirinae';

import { COST_DATA_FIELD_MAP } from '@/api-clients/dashboard/_constants/widget-constant';

import type { RegionReferenceMap } from '@/store/reference/region-reference-store';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import WidgetDataTable from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetColorSet } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidgetPagination } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-pagination';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import { getPieChartLegends } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-chart-helper';
import { getWidgetDataTableRowLocation } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-location-helper';
import { getReferenceTypeOfDataField } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-table-helper';
import { getWidgetValueLabel } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-value-label-helper';
import type { Field, WidgetTableData } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-data-table-type';
import type {
    WidgetExpose, WidgetProps, WidgetEmit,
    Legend, CostAnalyzeResponse,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';
import type { ReferenceType } from '@/services/dashboards/stores/all-reference-type-info-store';



interface SubData {
    value: number;
    usage_unit?: string;
    [parsedSecondaryDataField: string]: any;
}
interface Data {
    date: string;
    value_sum: SubData[];
    _total_value_sum: number;
    [parsedDataField: string]: any;
}

interface TableData extends WidgetTableData {
    [parsedDataField: string]: any;
}

type FullData = CostAnalyzeResponse<Data>;

interface CircleData {
    latitude: number;
    longitude: number;
    _total_value_sum?: number;
    circleSettings?: {
        fill: string;
    }
}

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const router = useRouter();
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit);

const state = reactive({
    loading: true,
    data: null as FullData | null,
    dataType: computed<string|undefined>(() => (widgetState.options.cost_data_type)),
    legends: computed<Legend[]>(() => (state.data?.results ? getPieChartLegends(state.data.results, widgetState.parsedDataField) : [])),
    chartData: computed<CircleData[]>(() => getRefinedCircleData(state.data?.results, props.allReferenceTypeInfo?.region?.referenceMap as RegionReferenceMap)),
    tableData: computed<TableData[]>(() => {
        if (!state.data?.results?.length) return [];
        const tableData: TableData[] = state.data.results.map((d: Data) => {
            const row: TableData = {
                [widgetState.parsedDataField]: d[widgetState.parsedDataField] ?? 'Unknown',
            };
            d?.value_sum?.forEach((subData: SubData) => {
                let rowKey = subData[widgetState.parsedSecondaryDataField] ?? 'Unknown';
                if (state.dataType === 'usage_quantity') {
                    rowKey = `${rowKey}_${subData.usage_unit}`;
                }
                row[rowKey] = subData.value;
            });
            return row;
        });
        return tableData;
    }),
    tableFields: computed<Field[]>(() => {
        let textOptions: Field['textOptions'];
        if (state.dataType === 'cost') {
            textOptions = { type: 'cost' };
        } else if (state.dataType === 'usage_quantity') {
            textOptions = { type: 'usage' };
        }

        const dynamicTableFields: Field[] = [];
        state.data?.results?.[0]?.value_sum?.forEach((d: SubData) => {
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

        const referenceType = getReferenceTypeOfDataField(props.allReferenceTypeInfo, widgetState.dataField) as ReferenceType;
        const fixedFields: Field[] = [{
            label: Object.values(COST_DATA_FIELD_MAP).find((d) => d.name === widgetState.dataField)?.label ?? widgetState.parsedDataField,
            name: widgetState.parsedDataField,
            textOptions: referenceType ? { type: 'reference', referenceType } : undefined,
            width: dataFieldTableFieldWidth,
        }];
        return [
            ...fixedFields,
            ...dynamicTableFields.map((d) => ({ ...d, width: otherFieldWidth })),
        ];
    }),
    //
    showChart: computed<boolean>(() => {
        if (state.dataType !== 'usage_quantity') return true;
        if (!state.data?.results) return true;
        // hide chart when there are different usage_unit in data or usage_unit is null
        if (state.data.results[0].value_sum.map((d) => d.usage_unit).some((d) => d === null)) return false;
        return uniqBy(state.data.results[0].value_sum, 'usage_unit').length === 1;
    }),
});

const { pageSize, thisPage } = useWidgetPagination(widgetState);


/* Util */
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.data?.results?.length ?? 0),
});
const getRefinedCircleData = (results?: Data[], regionMap: RegionReferenceMap = {}): CircleData[] => {
    if (!results?.length) return [];
    return results.map((d, idx) => {
        const regionInfo = regionMap[d[widgetState.parsedDataField]] ?? {};
        return {
            ...d,
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
const fetchCostAnalyze = getCancellableFetcher<object, FullData>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<FullData> => {
    try {
        apiQueryHelper.setFilters(widgetState.consoleFilters);
        if (pageSize.value) apiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);

        if (!widgetState.dataField) throw new Error('Data field is required');
        if (!widgetState.secondaryDataField) throw new Error('Secondary data field is required');

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
                field_group: fieldGroups,
                sort: [{ key: '_total_value_sum', desc: true }, { key: widgetState.secondaryDataField, desc: false }],
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
                               @click-row="handleClickRow"
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
