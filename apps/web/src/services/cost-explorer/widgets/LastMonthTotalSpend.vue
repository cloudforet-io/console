<script lang="ts" setup>

import type { XYChart } from '@amcharts/amcharts4/charts';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import dayjs from 'dayjs';
import {
    onUnmounted, computed, reactive, watch, ref,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { CurrencyRates } from '@/store/modules/settings/type';

import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray, violet } from '@/styles/colors';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getConvertedFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { getXYChartData } from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import CostDashboardSimpleCardWidget
    from '@/services/cost-explorer/widgets/modules/CostDashboardSimpleCardWidget.vue';
import type { WidgetProps, XYChartData } from '@/services/cost-explorer/widgets/type';

const CATEGORY_KEY = 'date';
const VALUE_KEY = 'totalCost';

const props = withDefaults(defineProps<WidgetProps>(), {
    name: undefined,
    options: () => ({}),
    chartData: () => ([]),
    period: () => ({}),
    filters: () => ({}),
    currency: CURRENCY.USD,
    currencyRates: () => ({}) as CurrencyRates,
    printMode: false,
});
const emit = defineEmits<{(e: 'rendered'): void}>();
const { t } = useI18n();

const chartRef = ref<HTMLElement | null>(null);
const state = reactive({
    chart: null as XYChart | null,
    chartRegistry: {},
    loading: true,
    data: [] as XYChartData[],
    firstMonth: computed(() => dayjs.utc(props.period?.end).subtract(11, 'month')),
    lastMonth: computed(() => dayjs.utc(props.period?.end).subtract(1, 'month')),
    thisMonth: computed(() => dayjs.utc(props.period?.end)),
    lastMonthCost: computed(() => {
        const cost = state.data.find((d) => d.date === state.lastMonth.format('YYYY-MM'))?.totalCost || 0;
        return currencyMoneyFormatter(cost, props.currency, props.currencyRates, true, 10000000000);
    }),
    currencySymbol: computed(() => CURRENCY_SYMBOL[props.currency]),
    widgetLink: computed(() => {
        if (props.printMode) return undefined;
        return {
            name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
            query: {
                granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                period: objectToQueryString({ start: state.lastMonth.startOf('month'), end: state.lastMonth.endOf('month') }),
            },
        };
    }),
    noData: computed(() => state.data.find((d) => d.totalCost > 0) === undefined),
});

const disposeChart = (chartContext) => {
    if (state.chartRegistry[chartContext]) {
        state.chartRegistry[chartContext].dispose();
        state.chartRegistry[chartContext] = undefined;
    }
};

const drawChart = (chartContext) => {
    const createChart = () => {
        disposeChart(chartContext);
        state.chartRegistry[chartContext] = am4core.create(chartContext, am4charts.XYChart);
        return state.chartRegistry[chartContext];
    };
    const chart = createChart();
    state.chart = chart;
    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
    chart.events.on('ready', () => {
        emit('rendered');
    });

    chart.paddingBottom = 0;

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = CATEGORY_KEY;
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.grid.template.strokeOpacity = 0;
    categoryAxis.renderer.grid.template.disabled = true;
    categoryAxis.renderer.labels.template.fill = am4core.color(gray[400]);
    categoryAxis.fontSize = 12;

    categoryAxis.renderer.labels.template.adapter.add('text', (text, target) => {
        if (target.dataItem?.category === state.firstMonth.format('YYYY-MM')) {
            return state.firstMonth.format('MMM');
        }
        if (target.dataItem?.category === state.lastMonth.format('YYYY-MM')) {
            return state.lastMonth.format('MMM');
        }
        return '';
    });

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.labels.template.disabled = true;
    valueAxis.renderer.grid.template.strokeOpacity = 0;
    valueAxis.renderer.labels.template.fill = am4core.color(gray[400]);

    const series = chart.series.push(new am4charts.ColumnSeries());
    if (props.printMode) series.showOnInit = false;
    series.dataFields.valueY = VALUE_KEY;
    series.dataFields.categoryX = CATEGORY_KEY;
    series.columns.template.propertyFields.fill = 'color';
    series.columns.template.strokeOpacity = 0;
    series.columns.template.column.cornerRadiusTopLeft = 2;
    series.columns.template.column.cornerRadiusTopRight = 2;
    series.columns.template.width = am4core.percent(45);

    series.columns.template.adapter.add('fill', (fill, target) => {
        if (target.dataItem?.dataContext?.date === state.thisMonth.format('YYYY-MM')) {
            return am4core.color(violet[200]);
        }
        if (target.dataItem?.dataContext?.date === state.lastMonth.format('YYYY-MM')) {
            return am4core.color(violet[600]);
        }
        return fill;
    });
    chart.data = state.data;
};

const costQueryHelper = new QueryHelper();
const fetchData = async () => {
    costQueryHelper.setFilters(getConvertedFilter(props.filters));
    const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
        granularity: GRANULARITY.MONTHLY,
        start: state.firstMonth.format('YYYY-MM'),
        end: state.thisMonth.format('YYYY-MM'),
        ...costQueryHelper.apiQuery,
    });
    return results;
};

const getChartData = async () => {
    try {
        state.loading = true;
        const results = await fetchData();
        const _period = {
            start: state.firstMonth.format('YYYY-MM'),
            end: state.thisMonth.format('YYYY-MM'),
        };
        state.data = getXYChartData(results, GRANULARITY.MONTHLY, _period);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.data = [];
    } finally {
        state.loading = false;
    }
};

watch([() => props.period, () => props.filters], async () => {
    await getChartData();
    if (state.data.length === 0 || state.noData) emit('rendered');
}, { immediate: true });

watch([() => chartRef.value, () => state.loading], ([chartContext, loading]) => {
    if (chartContext && !loading) {
        drawChart(chartContext);
    }
}, { immediate: false });

onUnmounted(() => {
    if (state.chart) state.chart.dispose();
});

</script>

<template>
    <cost-dashboard-simple-card-widget
        class="last-month-total-spend"
        :title="name ? name : t('BILLING.COST_MANAGEMENT.DASHBOARD.LAST_MONTH_TOTAL_SPEND')"
        unit-type="CURRENCY"
        :loading="state.loading"
        :value="state.lastMonthCost"
        :currency-symbol="state.currencySymbol"
        :description="state.lastMonth.format('MMMM YYYY')"
        :show-divider="false"
        :widget-link="state.widgetLink"
        :no-data="state.noData"
    >
        <template #default>
            <div ref="chartRef"
                 class="chart"
            />
        </template>
    </cost-dashboard-simple-card-widget>
</template>

<style lang="postcss" scoped>
.last-month-total-spend {
    .chart {
        height: 5.125rem;
        margin-bottom: -1rem;
    }
}
</style>
