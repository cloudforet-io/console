<script lang="ts" setup>

import * as am4charts from '@amcharts/amcharts4/charts';
import type { XYChart } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { byteFormatter, commaFormatter, numberFormatter } from '@cloudforet/core-lib';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataLoader, PSkeleton } from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import bytes from 'bytes';
import dayjs from 'dayjs';
import { range } from 'lodash';
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useI18n } from 'vue-i18n';

import { CURRENCY } from '@/store/modules/settings/config';
import type { CurrencyRates } from '@/store/modules/settings/type';

import config from '@/lib/config';
import { objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import {
    gray, green, red, yellow,
} from '@/styles/colors';

import type { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getConvertedFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { Period } from '@/services/cost-explorer/type';
import {
    getTooltipText, getXYChartData,
} from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import CostDashboardCardWidgetLayout from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable from '@/services/cost-explorer/widgets/modules/CostDashboardDataTable.vue';
import type {
    ChartData, CostAnalyzeModel, Legend, TrafficWidgetTableData, WidgetProps,
} from '@/services/cost-explorer/widgets/type';

const GROUP_BY = 'usage_type';
const CATEGORY_KEY = 'date';
const TRANSFER_OUT_COLOR = red[400];
const TRANSFER_IN_COLOR = green[500];
const TRANSFER_ETC_COLOR = yellow[500];

interface Data extends CostAnalyzeModel {
    usage_quantity: number;
    usage_type: 'data-transfer.out'|'data-transfer.in'|'data-transfer.etc';
}
interface Field extends DataTableFieldType {
     tooltipText?: TranslateResult;
}
interface TableData extends TrafficWidgetTableData {
    month?: string;
}

const props = withDefaults(defineProps<WidgetProps<WidgetOptions>>(), {
    name: undefined,
    options: () => ({}) as WidgetOptions,
    currency: CURRENCY.USD,
    currencyRates: () => ({}) as CurrencyRates,
    period: () => ({}),
    filters: () => ({}),
    printMode: false,
});
const emit = defineEmits<{(e: 'rendered'): void}>();
const { t } = useI18n();

const { i18nDayjs } = useI18nDayjs();
const state = reactive({
    loading: false,
    widgetLink: computed(() => {
        if (props.printMode) return undefined;
        const _period = {
            start: dayjs.utc(props.period.end).subtract(5, 'month').format('YYYY-MM-01'),
            end: dayjs.utc(props.period.end).endOf('month').format('YYYY-MM-DD'),
        };
        return {
            name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
            params: {},
            query: {
                granularity: primitiveToQueryString(GRANULARITY.MONTHLY),
                period: objectToQueryString(_period),
                filters: objectToQueryString({ ...props.filters, provider: ['aws'], product: ['AWSDataTransfer'] }),
            },
        };
    }),
    //
    items: [] as Data[],
    chartRegistry: {},
    chart: null as XYChart | null,
    chartRef: null as HTMLElement | null,
    chartData: [] as ChartData[],
    legends: [
        {
            name: 'data-transfer.out',
            label: 'Transfer-Out',
            color: TRANSFER_OUT_COLOR,
        },
        {
            name: 'data-transfer.in',
            label: 'Transfer-In',
            color: TRANSFER_IN_COLOR,
        },
        {
            name: 'data-transfer.etc',
            label: 'Etc.',
            color: TRANSFER_ETC_COLOR,
        },
    ] as Legend[],
    fields: computed<Field[]>(() => [
        { name: 'month', label: 'Month' },
        {
            name: 'trafficOut',
            label: 'Transfer-Out',
            tooltipText: t('BILLING.COST_MANAGEMENT.DASHBOARD.TOOLTIP_AWS_DATA_COST_2'),
            children: [
                { name: 'trafficOutSize', type: 'size', invisible: true },
                { name: 'trafficOutCost', invisible: true },
            ],
        },
        {
            name: 'trafficIn',
            label: 'Transfer-In',
            tooltipText: t('BILLING.COST_MANAGEMENT.DASHBOARD.TOOLTIP_AWS_DATA_COST_3'),
            children: [
                { name: 'trafficInSize', type: 'size', invisible: true },
                { name: 'trafficInCost', invisible: true },
            ],
        },
        {
            name: 'trafficEtc',
            label: 'Etc.',
            tooltipText: t('BILLING.COST_MANAGEMENT.DASHBOARD.TOOLTIP_AWS_DATA_COST_4'),
            children: [
                { name: 'trafficEtcSize', type: 'size', invisible: true },
                { name: 'trafficEtcCost', invisible: true },
            ],
        },

    ]),
    tableItems: computed<TableData[]>(() => {
        const months = range(6).map((i) => i18nDayjs.value.utc(props.period.end)
            .subtract(i, 'month'));
        const transferIn = state.items.find((item) => item.usage_type === 'data-transfer.in');
        const transferOut = state.items.find((item) => item.usage_type === 'data-transfer.out');
        const transferEtc = state.items.find((item) => item.usage_type === 'data-transfer.etc');
        const tableItems = months.map((m, idx) => {
            const month = m.format('YYYY-MM');
            return ({
                month: m.format('MMMM YYYY') + (idx === 0 ? ' (MTD)' : ''),
                trafficInCost: transferIn?.usd_cost[month],
                trafficInSize: transferIn?.usage_quantity[month],
                trafficOutCost: transferOut?.usd_cost[month],
                trafficOutSize: transferOut?.usage_quantity[month],
                trafficEtcCost: transferEtc?.usd_cost[month],
                trafficEtcSize: transferEtc?.usage_quantity[month],
            });
        });
        return tableItems;
    }),
});

/* Util */
const createChartSeries = (chart, legend) => {
    const series = chart.series.push(new am4charts.LineSeries());
    if (props.printMode) series.showOnInit = false;
    series.name = legend.label;
    series.dataFields.dateX = CATEGORY_KEY;
    series.dataFields.valueY = legend.name;
    series.stroke = am4core.color(legend.color);
    series.fill = am4core.color(legend.color);
    series.strokeWidth = 2;
    series.tooltip.label.fontSize = 14;
    series.tooltip.getFillFromObject = false;
    series.tooltip.background.fill = am4core.color(legend.color);
    series.smoothing = 'monotoneX';

    series.adapter.add('tooltipText', (tooltipText, target) => {
        if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
            const quantity = target.tooltipDataItem.dataContext[legend.name];
            const formattedQuantity = quantity ? byteFormatter(quantity) : quantity;
            return getTooltipText('name', undefined, formattedQuantity);
        }
        return tooltipText;
    });

    if (legend.name !== 'dummy') {
        const bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.fill = am4core.color(legend.color);
        bullet.circle.radius = 3.5;
    }
};
const createChartLegend = (chart) => {
    chart.legend = new am4charts.Legend();
    chart.legend.position = 'bottom';
    chart.legend.contentAlign = 'left';
    chart.legend.fontSize = 12;
    chart.legend.labels.template.fill = am4core.color(gray[600]);
    chart.legend.itemContainers.template.clickable = false;
    chart.legend.itemContainers.template.focusable = false;
    chart.legend.itemContainers.template.hoverable = false;
    chart.legend.markers.template.width = 8;
    chart.legend.markers.template.height = 8;
    chart.legend.markers.template.children.getIndex(0).cornerRadius(12, 12, 12, 12);
};
const drawChart = (chartContext, chartData, legends) => {
    const chart: any = am4core.create(chartContext, am4charts.XYChart);
    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
    chart.events.on('ready', () => {
        emit('rendered');
    });
    chart.paddingLeft = -5;
    chart.paddingBottom = -10;
    chart.data = chartData;

    chart.dateFormatter.inputDateFormat = 'yyyy-MM';
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.baseInterval = {
        timeUnit: 'month',
        count: 1,
    };
    dateAxis.dateFormats.setKey('month', 'MMM');
    dateAxis.dataFields.category = CATEGORY_KEY;
    dateAxis.renderer.minGridDistance = 30;
    dateAxis.fontSize = 12;
    dateAxis.tooltip.disabled = true;
    dateAxis.renderer.grid.template.strokeOpacity = 1;
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.startLocation = 0.45;
    dateAxis.endLocation = 0.55;
    dateAxis.renderer.labels.template.fill = am4core.color(gray[600]);
    dateAxis.renderer.grid.template.strokeOpacity = 0;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.minWidth = 20;
    valueAxis.fontSize = 12;
    valueAxis.extraMax = 0.01;
    valueAxis.renderer.minGridDistance = 30;
    valueAxis.renderer.grid.template.strokeOpacity = 1;
    valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
    valueAxis.renderer.labels.template.fill = am4core.color(gray[600]);
    valueAxis.renderer.labels.template.adapter.add('text', (text, target) => {
        if (target.dataItem) {
            if (target.dataItem.value) return commaFormatter(numberFormatter(target.dataItem.value));
        }
        return text;
    });

    if (legends.length) {
        legends.forEach((legend) => {
            createChartSeries(chart, legend);
        });
    } else {
        const dummyChartData = [...chartData];
        dummyChartData[0].dummy = 0;
        chart.data = dummyChartData;
        valueAxis.min = 0;
        valueAxis.extraMax = 100;
        createChartSeries(chart, { name: 'dummy', label: 'dummy' });
    }

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.disabled = true;
    chart.cursor.lineY.disabled = true;
    chart.cursor.behavior = 'none';

    createChartLegend(chart);

    return chart;
};

/* Api */
const queryHelper = new QueryHelper();
const listData = async (period: Period, filters): Promise<Data[]> => {
    state.loading = true;

    queryHelper.setFilters([
        ...getConvertedFilter(filters),
        { k: 'provider', v: 'aws', o: '=' },
        { k: 'product', v: 'AWSDataTransfer', o: '=' },
    ]);
    try {
        const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
            include_usage_quantity: true,
            include_others: false,
            granularity: GRANULARITY.MONTHLY,
            group_by: ['usage_type'],
            start: dayjs.utc(period.end).subtract(5, 'month').format('YYYY-MM'),
            end: dayjs.utc(period.end).format('YYYY-MM'),
            ...queryHelper.apiQuery,
        });
        const convertedResults = results.map((d) => {
            const convertedUsageQuantity = {};
            Object.entries(d.usage_quantity).forEach(([date, quantity]) => {
                convertedUsageQuantity[date] = bytes.parse(`${quantity}GB`);
            });
            return {
                ...d,
                usage_quantity: convertedUsageQuantity,
            };
        });
        return convertedResults;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch([() => props.period, () => props.filters], async ([period, filters]) => {
    state.items = await listData(period, filters);
    if (state.items.length === 0) emit('rendered');

    const _period = {
        start: dayjs.utc((period as Period).end).subtract(5, 'month').format('YYYY-MM'),
        end: dayjs.utc((period as Period).end).format('YYYY-MM'),
    };
    state.chartData = getXYChartData(state.items, GRANULARITY.MONTHLY, _period, GROUP_BY, 'usage_quantity');
    state.chart = drawChart(state.chartRef, state.chartData, state.legends);
}, { immediate: true });

onUnmounted(() => {
    if (state.chart) state.chart.dispose();
});

</script>

<template>
    <cost-dashboard-card-widget-layout :title="name ? name : t('BILLING.COST_MANAGEMENT.DASHBOARD.AWS_DATA_TRANSFER_COST_TREND')"
                                       class="aws-data-transfer-cost-trend"
                                       :widget-link="state.widgetLink"
                                       :data-range="6"
                                       :print-mode="printMode"
    >
        <p-data-loader :loading="state.loading"
                       class="chart-wrapper"
        >
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef"
                 class="chart"
            />
        </p-data-loader>
        <div class="table-wrapper">
            <cost-dashboard-data-table :fields="state.fields"
                                       :items="state.tableItems"
                                       :loading="state.loading"
                                       :print-mode="printMode"
                                       :page-size="6"
                                       :currency-rates="currencyRates"
                                       :currency="currency"
                                       :show-index="false"
                                       :pagination-visible="false"
            />
        </div>
    </cost-dashboard-card-widget-layout>
</template>

<style lang="postcss" scoped>
.aws-data-transfer-cost-trend {
    .chart-wrapper {
        height: 11rem;
        .chart {
            height: 100%;
        }
    }
    .table-wrapper {
        margin-top: 1rem;
    }
}
</style>
