<template>
    <widget-frame :title="state.title"
                  :size="state.size"
                  :width="props.width"
                  :edit-mode="props.editMode"
                  :date-range="state.dateRange"
                  :currency="state.settings.currency.value"
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
                           :data="state.data"
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
                           :items="state.chartData"
                           :currency="state.settings.currency.value"
                           :currency-rates="props.currencyRates"
        />
    </widget-frame>
</template>

<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep, random } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import { GRANULARITY } from '@/services/dashboards/config';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import type { GroupBy, WidgetProps } from '@/services/dashboards/widgets/config';
import { GROUP_BY, CHART_TYPE, WIDGET_SIZE } from '@/services/dashboards/widgets/config';
import type { HistoryDataModel, XYChartData } from '@/services/dashboards/widgets/type';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/view-config';
// eslint-disable-next-line import/no-cycle
import { getRefinedXYChartData } from '@/services/dashboards/widgets/widget-helper';

// TODO: sample data
const SAMPLE_RAW_DATA = {
    more: true,
    results: [
        {
            provider: 'aws',
            usd_cost_sum: [
                { date: '2022-08', value: random(100, 5000) },
                // { date: '2022-09', value: 0 },
                { date: '2022-10', value: random(100, 5000) },
                { date: '2022-11', value: random(100, 5000) },
            ],
        },
        {
            provider: 'google_cloud',
            usd_cost_sum: [
                { date: '2022-08', value: random(100, 5000) },
                { date: '2022-09', value: random(100, 5000) },
                { date: '2022-10', value: random(100, 5000) },
                { date: '2022-11', value: random(100, 5000) },
            ],
        },
        {
            provider: 'azure',
            usd_cost_sum: [
                { date: '2022-08', value: random(100, 5000) },
                { date: '2022-09', value: random(100, 5000) },
                { date: '2022-10', value: random(100, 5000) },
                { date: '2022-11', value: random(100, 5000) },
            ],
        },
    ],
};

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
    groupByLabel: computed<string>(() => {
        const groupBy = state.groupBy;
        return GROUP_BY_ITEM_MAP[groupBy]?.label ?? groupBy;
    }),
    chartType: computed(() => state.options.chart_type ?? CHART_TYPE.LINE),
    chartData: computed(() => getRefinedXYChartData(state.data, state.groupBy)),
    labels: computed(() => {
        if (!state.data) return [];
        return state.data.map((d) => d[state.groupBy]);
    }),
    tableFields: computed(() => [ // TODO: fill date fields
        { label: state.groupByLabel, name: state.groupBy },
    ]),
    dateRange: computed<DateRange>(() => {
        const range = props.size === WIDGET_SIZE.full ? 12 : 4;
        const end = state.settings.date_range.end;
        const start = dayjs.utc(end).subtract(range, 'month').format('YYYY-MM');
        return { start, end };
    }),
});

/* Api */
const fetchData = async () => {
    try {
        const { results, more } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({
            query: {
                granularity: state.widgetConfig.options?.granularity ?? GRANULARITY.MONTHLY,
                group_by: [state.groupBy],
                start: state.dateRange.start,
                end: state.dateRange.end,
                field_group: ['date'],
                fields: {
                    usd_cost_sum: {
                        key: 'usd_cost',
                        operator: 'sum',
                    },
                },
            },
        });
        // console.log(results);
    } catch (e) {
        ErrorHandler.handleError(e);
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

    state.labels.forEach((label) => {
        const seriesSettings = {
            name: label,
            valueYField: label,
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
        setXYSharedTooltipText(chart, tooltip, state.options.currency, props.currencyRates);
        series.set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
    if (legend) legend.data.setAll(chart.series.values);
};

const initWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    drawChart(state.chartData);
    state.loading = false;
};

const refreshWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    refreshRoot();
    drawChart(state.chartData);
    state.loading = false;
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
