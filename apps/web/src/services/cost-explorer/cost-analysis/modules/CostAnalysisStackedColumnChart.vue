<script lang="ts" setup>

import type { XYChart } from '@amcharts/amcharts4/charts';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { commaFormatter, numberFormatter } from '@cloudforet/core-lib';
import {
    PDataLoader, PSkeleton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import {
    nextTick, reactive, ref, watch,
} from 'vue';

import { CURRENCY } from '@/store/modules/settings/config';
import type { CurrencyRates } from '@/store/modules/settings/type';

import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getTimeUnitByPeriod } from '@/services/cost-explorer/lib/helper';
import type { Granularity } from '@/services/cost-explorer/type';
import {
    getStackedChartData, getCurrencyAppliedChartData,
} from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import type {
    Legend, XYChartData, WidgetProps,
} from '@/services/cost-explorer/widgets/type';

const CATEGORY_KEY = 'date';

interface Props extends WidgetProps {
    loading: boolean;
    chart: XYChart;
    chartData: XYChartData[];
    legends: Legend[];
    granularity: Granularity;
    stack: boolean;
}

interface DummyChartData extends XYChartData {
    dummy?: number;
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    chart: () => ({}) as XYChart,
    chartData: () => ([]),
    legends: () => ([]),
    granularity: GRANULARITY.DAILY,
    stack: false,
    period: () => ({}),
    currency: CURRENCY.USD,
    currencyRates: () => ({}) as CurrencyRates,
    printMode: false,
});
const emit = defineEmits<{(e: 'update:chart', value: XYChart): void;
    (e:'rendered'): void;
}>();

const chartRef = ref<HTMLElement | null>(null);
const state = reactive({
    proxyChart: useProxyValue('chart', props, emit),
    USDChartData: [] as XYChartData[],
    isChartDrawn: false,
});

/* util */
const _createCategoryAxis = (chart, timeUnit) => {
    const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    let dateFormat = 'M/D';
    if (timeUnit === 'month') dateFormat = 'MMM YYYY';
    else if (timeUnit === 'year') dateFormat = 'YYYY';

    dateAxis.dataFields.category = CATEGORY_KEY;
    dateAxis.renderer.minGridDistance = 35;
    dateAxis.fontSize = 12;
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.labels.template.fill = am4core.color(gray[400]);
    dateAxis.renderer.grid.template.strokeOpacity = 0;
    dateAxis.renderer.labels.template.adapter.add('text', (text, target) => dayjs.utc(target.dataItem.category).format(dateFormat));
};
const _createValueAxis = (chart) => {
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minWidth = 20;
    valueAxis.fontSize = 12;
    valueAxis.extraMax = 0.01;
    valueAxis.renderer.grid.template.strokeOpacity = 1;
    valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
    valueAxis.renderer.labels.template.fill = am4core.color(gray[400]);
    valueAxis.renderer.labels.template.adapter.add('text', (text, target) => {
        if (target.dataItem) {
            if (target.dataItem.value) return commaFormatter(numberFormatter(target.dataItem.value));
        }
        return text;
    });

    if (!props.legends.length) {
        valueAxis.min = 0;
        valueAxis.extraMax = 100;
    }
};

const _createSeries = (chart, legend, timeUnit) => {
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.showOnInit = !props.printMode;
    series.name = legend.label;
    series.dataFields.categoryX = CATEGORY_KEY;
    series.dataFields.valueY = legend.name;
    series.strokeWidth = 0;
    series.columns.template.width = am4core.percent(60);
    series.tooltip.label.fontSize = 14;
    series.stacked = true;
    if (legend.color) series.columns.template.fill = legend.color;
    series.columns.template.tooltipText = '{name}: [bold]{valueY}[/]';
    series.columns.template.adapter.add('tooltipText', (tooltipText, target) => {
        if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
            const currencyMoney = currencyMoneyFormatter(target.dataItem.valueY, props.currency, undefined, true);
            return `{name}: [bold]${currencyMoney}[/]`;
        }
        return tooltipText;
    });

    const today = dayjs.utc();
    series.columns.template.adapter.add('fillOpacity', (fillOpacity, target) => {
        if (today.isSame(dayjs.utc(target.dataItem?.dataContext?.date), timeUnit)) {
            return 0.5;
        }
        return fillOpacity;
    });
};
const drawChart = (chartContainer) => {
    state.isChartDrawn = false;
    const timeUnit = getTimeUnitByPeriod(props.granularity, dayjs.utc(props.period.start), dayjs.utc(props.period.end));

    let USDChartData = cloneDeep(props.chartData);
    if (props.stack) {
        USDChartData = getStackedChartData(props.chartData as XYChartData[], props.period, timeUnit);
    }
    state.USDChartData = USDChartData;

    const chart = am4core.create(chartContainer, am4charts.XYChart);
    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
    chart.events.on('ready', () => {
        state.isChartDrawn = true;
    });
    chart.paddingLeft = -5;
    chart.paddingBottom = -10;
    chart.data = USDChartData;

    _createCategoryAxis(chart, timeUnit);
    _createValueAxis(chart);

    if (props.legends.length) {
        props.legends.forEach((legend) => {
            _createSeries(chart, legend, timeUnit);
        });
    } else if (USDChartData.length) {
        const dummyChartData: DummyChartData[] = [...USDChartData];
        dummyChartData[0].dummy = 0;
        chart.data = dummyChartData;
        _createSeries(chart, { name: 'dummy', label: 'dummy' }, timeUnit);
    }

    const start = dayjs.utc(props.period.start);
    const end = dayjs.utc(props.period.end);
    const diff = end.diff(start, timeUnit);
    if (diff > 31) {
        (chart as XYChart).scrollbarX = new am4core.Scrollbar();
    }

    return chart;
};

watch([() => chartRef.value, () => props.loading], async ([chartContext, loading]) => {
    if (chartContext && !loading) {
        const chart = drawChart(chartContext);
        emit('update:chart', chart);
    }
}, { immediate: false });

watch([() => props.currency, () => state.USDChartData], ([currency]) => {
    if (state.proxyChart) {
        state.proxyChart.data = getCurrencyAppliedChartData(state.USDChartData, currency, props.currencyRates);
    }
});

watch(() => props.stack, () => {
    const chart = drawChart(chartRef.value);
    emit('update:chart', chart);
});

watch([() => state.isChartDrawn, () => props.loading], async ([isChartDrawn, loading]) => {
    if (isChartDrawn && !loading) {
        await nextTick();
        setTimeout(() => {
            emit('rendered');
        }, 500);
    }
});

</script>

<template>
    <p-data-loader :loading="loading"
                   class="cost-analysis-stacked-column-chart"
    >
        <template #loader>
            <p-skeleton height="100%" />
        </template>
        <div ref="chartRef"
             class="chart"
        />
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.cost-analysis-stacked-column-chart {
    height: 100%;
    .chart {
        height: 100%;
    }
}
</style>
