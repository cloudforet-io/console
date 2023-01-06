<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="aws-data-transfer-cost-trend"
                  @refresh="handleRefresh"
    >
        <template v-if="state.selectorItems.length"
                  #header-right
        >
            <widget-frame-header-dropdown :items="state.selectorItems"
                                          :selected="state.selectedSelectorType"
                                          @select="handleSelectSelectorType"
            />
        </template>
        <div class="chart-wrapper">
            <p-data-loader class="chart-loader"
                           :loading="state.loading"
                           :data="state.chartData"
                           loader-type="skeleton"
                           show-data-from-scratch
            >
                <div ref="chartContext"
                     class="chart"
                />
            </p-data-loader>
        </div>

        <widget-data-table :loading="state.loading"
                           :fields="state.tableFields"
                           :items="state.data"
                           :currency="state.currency"
                           :currency-rates="props.currencyRates"
                           :all-reference-type-info="allReferenceTypeInfo"
                           :legends.sync="state.legends"
                           :color-set="state.colorSet"
        />
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import type { WidgetProps, WidgetExpose, UsageType } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import {
    getDateAxisSettings,
    getXYChartLegends,
    getRefinedXYChartData,
} from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import {
    getWidgetTableDateFields, sortTableData,
} from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { CostAnalyzeDataModel, Legend, XYChartData } from '@/services/dashboards/widgets/type';

const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';
const USAGE_SOURCE_UNIT = 'GB';
const USAGE_TYPE_LABEL_MAP: Record<Extract<UsageType, 'data-transfer.out'|'data-transfer.in'|'data-transfer.etc'>, TranslateResult> = {
    'data-transfer.out': 'Transfer-out',
    'data-transfer.in': 'Transfer-in',
    'data-transfer.etc': 'etc.',
};

const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

const state = reactive({
    ...toRefs(useWidgetState<CostAnalyzeDataModel['results']>(props)),
    fieldsKey: computed<string>(() => (state.selectedSelectorType === 'cost' ? 'usd_cost' : 'usage_quantity')),
    chartData: computed<XYChartData[]>(() => {
        const valueKey = `${state.fieldsKey}_sum`;
        return getRefinedXYChartData(state.data, state.groupBy, DATE_FIELD_NAME, valueKey);
    }),
    tableFields: computed<Field[]>(() => {
        if (!state.groupBy) return [];
        const _textOptions: Field['textOptions'] = {
            type: state.fieldsKey === 'usd_cost' ? 'cost' : 'size',
            sourceUnit: USAGE_SOURCE_UNIT,
        };
        const refinedFields = getWidgetTableDateFields(state.granularity, state.dateRange, _textOptions, state.fieldsKey);
        return [
            { label: ' ', name: state.groupBy },
            ...refinedFields,
        ];
    }),
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT);
        const range = props.size === WIDGET_SIZE.full ? 11 : 3;
        const start = dayjs.utc(end).subtract(range, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    legends: [] as Legend[],
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Util */
const getRefinedTableData = (results: CostAnalyzeDataModel['results']): CostAnalyzeDataModel['results'] => results.map((result) => ({
    ...result,
    [state.groupBy]: USAGE_TYPE_LABEL_MAP[result[state.groupBy]],
}));

/* Api */
const fetchData = async (): Promise<CostAnalyzeDataModel['results']> => {
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters([
            { k: state.groupBy, v: ['data-transfer.out', 'data-transfer.in', 'data-transfer.etc'], o: '' },
            { k: 'product', v: 'AWSDataTransfer', o: '=' },
            { k: 'usage_type', v: null, o: '!=' },
        ]);
        const { results } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({
            query: {
                granularity: state.granularity,
                group_by: [state.groupBy],
                start: state.dateRange.start,
                end: state.dateRange.end,
                fields: {
                    usd_cost_sum: {
                        key: 'usd_cost',
                        operator: 'sum',
                    },
                    usage_quantity_sum: {
                        key: 'usage_quantity',
                        operator: 'sum',
                    },
                },
                sort: [{ key: state.groupBy, desc: true }],
                field_group: ['date'],
                ...apiQueryHelper.data,
            },
        });
        const _refinedData = getRefinedTableData(results);
        return sortTableData(_refinedData);
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

/* Util */
const drawChart = (chartData: XYChartData[]) => {
    const { chart, xAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(state.dateRange));
    xAxis.get('baseInterval').timeUnit = 'month';
    chartHelper.setChartColors(chart, state.colorSet);

    if (state.chartType === CHART_TYPE.LINE) {
        chart.get('cursor')?.lineX.setAll({
            visible: true,
        });
    }

    let legend;
    if (state.options.legend_options?.enabled && state.options.legend_options.show_at === 'chart') {
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
        const series = state.chartType === CHART_TYPE.LINE
            ? chartHelper.createXYLineSeries(chart, seriesSettings)
            : chartHelper.createXYColumnSeries(chart, { ...seriesSettings, stacked: true });
        chart.series.push(series);
        // set data processor
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat: DATE_FORMAT,
            dateFields: [DATE_FIELD_NAME],
        });
        const tooltip = chartHelper.createTooltip();
        if (state.selectedSelectorType === 'usage') {
            chartHelper.setXYSharedTooltipTextByUsage(chart, tooltip, USAGE_SOURCE_UNIT);
        } else {
            chartHelper.setXYSharedTooltipText(chart, tooltip, state.currency, props.currencyRates);
        }
        series.set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
    if (legend) legend.data.setAll(chart.series.values);
    state.chart = chart;
};

const initWidget = async (data?: CostAnalyzeDataModel['results']) => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.legends = getXYChartLegends(state.data, state.groupBy, props.allReferenceTypeInfo);
    await nextTick();
    drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    state.legends = getXYChartLegends(state.data, state.groupBy, props.allReferenceTypeInfo);
    await nextTick();
    chartHelper.refreshRoot();
    drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleSelectSelectorType = (selected: string) => {
    state.selectedSelectorType = selected;
    chartHelper.refreshRoot();
    drawChart(state.chartData);
};

const handleRefresh = () => {
    refreshWidget();
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
});

defineExpose<WidgetExpose<CostAnalyzeDataModel['results']>>({
    initWidget,
    refreshWidget,
});
</script>

<style lang="postcss" scoped>
.aws-data-transfer-cost-trend {
    .chart-wrapper {
        height: 11.5rem;
        .chart-loader {
            height: 100%;
            .chart {
                height: 100%;
            }
        }
    }
}
</style>
