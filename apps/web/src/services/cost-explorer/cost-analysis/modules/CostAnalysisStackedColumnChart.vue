<script lang="ts" setup>
import {
    nextTick, reactive, ref, watch,
} from 'vue';

import { color } from '@amcharts/amcharts5';
import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import type * as am5xy from '@amcharts/amcharts5/xy';
import {
    PDataLoader, PSkeleton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { commaFormatter, numberFormatter } from '@cloudforet/core-lib';

import { CURRENCY } from '@/store/modules/settings/config';
import type { CurrencyRates, Currency } from '@/store/modules/settings/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import {
    getCurrencyAppliedChartData,
} from '@/services/cost-explorer/cost-analysis/lib/widget-data-helper';
import type {
    Legend, XYChartData,
} from '@/services/cost-explorer/cost-analysis/type';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { Granularity, Period } from '@/services/cost-explorer/type';


interface Props {
    period: Period;
    currency: Currency;
    currencyRates: CurrencyRates;
    //
    loading: boolean;
    chart: null | am5xy.XYChart;
    chartData: XYChartData[];
    legends: Legend[];
    granularity: Granularity;
}

const DATE_FIELD_NAME = 'date';

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    chart: null,
    chartData: () => ([]),
    legends: () => ([]),
    granularity: GRANULARITY.DAILY,
    period: () => ({}),
    currency: CURRENCY.USD,
    currencyRates: () => ({}) as CurrencyRates,
    printMode: false,
});
const emit = defineEmits<{(e: 'update:chart', value): void;
}>();

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);

const state = reactive({
    proxyChart: useProxyValue('chart', props, emit),
    usdChartData: [] as XYChartData[],
});

/* Util */
const drawChart = () => {
    let timeUnit: TimeUnit = 'month';
    if (props.granularity === GRANULARITY.DAILY) timeUnit = 'day';
    else if (props.granularity === GRANULARITY.YEARLY) timeUnit = 'year';

    const usdChartData = cloneDeep(props.chartData);
    state.usdChartData = usdChartData;

    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart({}, {
        min: dayjs.utc(costAnalysisPageState.period?.start).valueOf(),
        max: dayjs.utc(costAnalysisPageState.period?.end).add(1, timeUnit).valueOf(),
    });
    xAxis.get('baseInterval').timeUnit = timeUnit;
    yAxis.get('renderer').labels.template.adapters.add('text', (text) => {
        if (text) {
            const convertedText = text.replace(/,/g, '');
            return commaFormatter(numberFormatter(Number(convertedText)));
        }
        return text;
    });

    props.legends.forEach((legend) => {
        const seriesSettings: Partial<am5xy.IXYSeriesSettings> = {
            name: legend.label as string,
            valueYField: legend.name,
            stacked: true,
            stroke: undefined,
        };
        if (legend.color) seriesSettings.fill = chartHelper.color(legend.color);
        const series = chartHelper.createXYColumnSeries(chart, seriesSettings);
        chart.series.push(series);

        // set data processor
        let dateFormat = 'YYYY-MM-DD';
        if (timeUnit === 'month') dateFormat = 'YYYY-MM';
        else if (timeUnit === 'year') dateFormat = 'YYYY';
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat,
            dateFields: [DATE_FIELD_NAME],
        });

        // set data
        series.data.setAll(usdChartData);

        // set tooltip
        const tooltip = chartHelper.createTooltip();
        tooltip.label.setAll({
            fill: color(gray[900]),
            fontSize: 14,
        });
        const seriesColor = series.get('fill')?.toString();
        tooltip.label.adapters.add('text', (text, target) => {
            const dataContext = target?.dataItem?.dataContext;
            if (dataContext) {
                let value = dataContext[legend.name];
                value = currencyMoneyFormatter(value, props.currency, undefined, true);
                return `[${seriesColor}; fontSize: 10px]●[/] {name}: [bold]${value}[/]`;
            }
            return text;
        });
        series.set('tooltip', tooltip);


        const today = dayjs.utc();
        series.columns.template.adapters.add('fillOpacity', (fillOpacity, target) => {
            if (today.isSame(dayjs.utc(target.dataItem?.dataContext?.date), timeUnit)) {
                return 0.5;
            }
            return fillOpacity;
        });
    });
    return chart;
};

watch([() => chartContext.value, () => props.loading, () => props.chartData], async ([_chartContext, loading, chartData]) => {
    if (_chartContext && !loading && chartData.length) {
        chartHelper.refreshRoot();
        await nextTick();
        const chart = drawChart();
        emit('update:chart', chart);
    }
}, { immediate: false });

watch([() => props.currency, () => state.usdChartData], ([currency]) => {
    if (state.proxyChart) {
        state.proxyChart.data = getCurrencyAppliedChartData(state.usdChartData, currency, props.currencyRates);
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
        <div ref="chartContext"
             class="chart"
        />
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.cost-analysis-stacked-column-chart {
    height: 25rem;
    padding-bottom: 1rem;
    .chart {
        height: 100%;
    }
}
</style>
