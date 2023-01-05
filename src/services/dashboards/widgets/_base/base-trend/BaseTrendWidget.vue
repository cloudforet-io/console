<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="base-trend-widget"
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
                           :items="state.data?.results"
                           :currency="state.currency"
                           :currency-rates="props.currencyRates"
                           :all-reference-type-info="props.allReferenceTypeInfo"
                           :legends.sync="state.legends"
                           :color-set="state.colorSet"
                           :this-page="state.thisPage"
                           :show-next-page="state.data?.more"
                           show-legend
                           @toggle-legend="handleToggleLegend"
                           @update:thisPage="handleUpdateThisPage"
        />
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import type { XYChart } from '@amcharts/amcharts5/xy';
import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ReferenceType } from '@/store/modules/reference/type';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import { CHART_TYPE, WIDGET_SIZE } from '@/services/dashboards/widgets/config';
import type {
    WidgetExpose, WidgetProps,
} from '@/services/dashboards/widgets/config';
import type { HistoryDataModel, Legend, XYChartData } from '@/services/dashboards/widgets/type';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/use-widget-frame-props';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/view-config';
import {
    getDateAxisSettings,
    getLegends,
    getRefinedXYChartData,
} from '@/services/dashboards/widgets/widget-chart-helper';
import {
    getReferenceTypeOfGroupBy, getWidgetTableDateFields, sortTableData,
} from '@/services/dashboards/widgets/widget-table-helper';

type Data = HistoryDataModel['results'];
interface FullData {
    results: Data;
    more: boolean;
}
const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

const state = reactive({
    ...toRefs(useWidgetState<FullData>(props)),
    chart: null as null | XYChart,
    chartData: computed<XYChartData[]>(() => getRefinedXYChartData(state.data?.results, state.groupBy)),
    tableFields: computed<Field[]>(() => {
        if (!state.groupBy) return [];
        const refinedFields = getWidgetTableDateFields(state.granularity, state.dateRange, { type: 'cost' });
        const groupByLabel = GROUP_BY_ITEM_MAP[state.groupBy]?.label ?? state.groupBy;
        const referenceType = getReferenceTypeOfGroupBy(props.allReferenceTypeInfo, state.groupBy) as ReferenceType;
        return [
            {
                label: groupByLabel,
                name: state.groupBy,
                textOptions: { type: 'reference', referenceType },
            },
            ...refinedFields,
        ];
    }),
    dateRange: computed<DateRange>(() => {
        const end = state.settings?.date_range?.end ?? dayjs.utc().format(DATE_FORMAT);
        const range = props.size === WIDGET_SIZE.full ? 11 : 3;
        const start = dayjs.utc(end).subtract(range, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    legends: [] as Legend[],
    thisPage: 1,
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const fetchData = async (): Promise<FullData> => {
    try {
        const query: any = {
            granularity: state.granularity,
            group_by: [state.groupBy],
            start: state.dateRange.start,
            end: state.dateRange.end,
            fields: {
                usd_cost_sum: {
                    key: 'usd_cost',
                    operator: 'sum',
                },
            },
            sort: [{ key: '_total_usd_cost_sum', desc: true }],
            field_group: ['date'],
        };
        if (state.pageSize) {
            query.page = { start: getPageStart(state.thisPage, state.pageSize), limit: state.pageSize };
        }
        const { results, more } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({ query });
        return { results: sortTableData(results), more };
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], more: false };
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
        chartHelper.setXYSharedTooltipText(chart, tooltip, state.currency, props.currencyRates);
        series.set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
    if (legend) legend.data.setAll(chart.series.values);
    state.chart = chart;
};

const initWidget = async (data?: FullData) => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.legends = getLegends(state.data.results, state.groupBy, props.allReferenceTypeInfo);
    await nextTick();
    drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (thisPage = 1) => {
    state.loading = true;
    state.thisPage = thisPage;
    state.data = await fetchData();
    state.legends = getLegends(state.data.results, state.groupBy, props.allReferenceTypeInfo);
    await nextTick();
    chartHelper.refreshRoot();
    drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleSelectSelectorType = (selected: string) => {
    state.selectedSelectorType = selected;
    refreshWidget();
};
const handleToggleLegend = (index) => {
    chartHelper.toggleSeries(state.chart, index);
};
const handleUpdateThisPage = (thisPage: number) => {
    state.thisPage = thisPage;
    refreshWidget(thisPage);
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
});

defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});
</script>

<style lang="postcss" scoped>
.base-trend-widget {
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
