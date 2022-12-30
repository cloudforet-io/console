<template>
    <widget-frame :title="state.title"
                  :size="state.size"
                  :width="props.width"
                  :edit-mode="props.editMode"
                  :date-range="state.dateRange"
                  :currency="state.currency"
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
                           :items="state.data"
                           :currency="state.currency"
                           :currency-rates="props.currencyRates"
                           :all-reference-map="allReferenceMap"
        />
    </widget-frame>
</template>

<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import type { Granularity, GroupBy, WidgetProps } from '@/services/dashboards/widgets/config';
import { GROUP_BY, CHART_TYPE, WIDGET_SIZE } from '@/services/dashboards/widgets/config';
import type { HistoryDataModel, Legend, XYChartData } from '@/services/dashboards/widgets/type';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/view-config';
import { getLegends, getRefinedXYChartData } from '@/services/dashboards/widgets/widget-chart-helper';
import { getWidgetTableDateFields, sortTableDataByDate } from '@/services/dashboards/widgets/widget-table-helper';

const DATE_FORMAT = 'yyyy-MM';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement|null>(null);
const {
    createXYDateChart, createXYLineSeries, createXYColumnSeries,
    createTooltip, setXYSharedTooltipText, setChartColors, createDataProcessor, createLegend,
    disposeRoot, refreshRoot,
} = useAmcharts5(chartContext);

const state = reactive({
    ...toRefs(useWidgetState<HistoryDataModel['results']>(props)),
    groupBy: computed<GroupBy>(() => state.options.group_by ?? GROUP_BY.PROVIDER),
    granularity: computed<Granularity>(() => state.widgetConfig.options?.granularity),
    chartData: computed<XYChartData[]>(() => getRefinedXYChartData(state.data, state.groupBy)),
    chartType: computed(() => state.options.chart_type ?? CHART_TYPE.LINE),
    tableFields: computed<Field[]>(() => {
        if (!state.groupBy) return [];
        const refinedFields = getWidgetTableDateFields(state.granularity, state.dateRange);
        const groupByLabel = GROUP_BY_ITEM_MAP[state.groupBy]?.label ?? state.groupBy;
        return [
            {
                label: groupByLabel,
                name: state.groupBy,
                textOptions: { type: 'reference', target: 'provider' }, // TODO: have to be changed!!!
            },
            ...refinedFields,
        ];
    }),
    dateRange: computed<DateRange>(() => {
        const end = state.settings?.date_range?.end ?? dayjs.utc().format('YYYY-MM-DD');
        const range = props.size === WIDGET_SIZE.full ? 11 : 3;
        const start = dayjs.utc(end).subtract(range, 'month').format('YYYY-MM');
        return { start, end };
    }),
    legends: computed<Legend[]>(() => getLegends(state.data, state.groupBy, props.allReferenceMap)),
});

/* Api */
const fetchData = async () => {
    try {
        state.loading = true;
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
                },
                sort: [{ key: '_total_usd_cost_sum', desc: true }],
                field_group: ['date'],
            },
        });
        state.data = sortTableDataByDate(results);
    } catch (e) {
        state.data = [];
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* Util */
const drawChart = (chartData: XYChartData[]) => {
    const { chart, xAxis } = createXYDateChart();
    xAxis.get('baseInterval').timeUnit = 'month';
    setChartColors(chart, state.colorSet);

    if (state.chartType === CHART_TYPE.LINE) {
        chart.get('cursor')?.lineX.setAll({
            visible: true,
        });
    }

    let legend;
    if (state.options.legend_options?.enabled && state.options.legend_options.show_at === 'chart') {
        legend = createLegend({
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
            ? createXYLineSeries(chart, seriesSettings)
            : createXYColumnSeries(chart, { ...seriesSettings, stacked: true });
        chart.series.push(series);
        // set data processor
        series.data.processor = createDataProcessor({
            dateFormat: DATE_FORMAT,
            dateFields: [DATE_FIELD_NAME],
        });
        const tooltip = createTooltip();
        setXYSharedTooltipText(chart, tooltip, state.currency, props.currencyRates);
        series.set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
    if (legend) legend.data.setAll(chart.series.values);
};

const initWidget = async () => {
    await fetchData();
    await nextTick();
    drawChart(state.chartData);
};

const refreshWidget = async () => {
    await fetchData();
    await nextTick();
    refreshRoot();
    drawChart(state.chartData);
};

/* Event */
const handleSelectSelectorType = (selected: string) => {
    state.selectedSelectorType = selected;
    refreshWidget();
};

useWidgetLifecycle({
    disposeWidget: disposeRoot,
});

defineExpose({
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
