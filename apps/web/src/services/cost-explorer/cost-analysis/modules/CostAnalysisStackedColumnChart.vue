<script lang="ts" setup>
import {
    nextTick, reactive, ref, watch,
} from 'vue';

import { color } from '@amcharts/amcharts5';
import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import {
    PDataLoader, PSkeleton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash';

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
import type { Granularity, Period } from '@/services/cost-explorer/type';
import { getDateAxisSettings } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';


interface Props {
    period: Period;
    currency: Currency;
    currencyRates: CurrencyRates;
    //
    loading: boolean;
    chart: null | any; // TODO: type
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

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);

const state = reactive({
    proxyChart: useProxyValue('chart', props, emit),
    usdChartData: [] as XYChartData[],
});

/* Util */
const drawChart = (period: Period) => {
    let timeUnit: TimeUnit = 'month';
    if (props.granularity === GRANULARITY.DAILY) timeUnit = 'day';
    else if (props.granularity === GRANULARITY.YEARLY) timeUnit = 'year';

    const usdChartData = cloneDeep(props.chartData);
    state.usdChartData = usdChartData;

    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(period));
    xAxis.get('baseInterval').timeUnit = timeUnit;
    yAxis.get('renderer').labels.template.adapters.add('text', (text) => {
        if (text) {
            const convertedText = text.replace(/,/g, '');
            return commaFormatter(numberFormatter(Number(convertedText)));
        }
        return text;
    });

    props.legends.forEach((l) => {
        const series = chartHelper.createXYColumnSeries(chart, {
            name: l.label as string,
            valueYField: l.name,
            stacked: true,
            stroke: undefined,
        });
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
            if (target?.dataItem?.dataContext) {
                let value = target.dataItem?.dataContext?.[l.name];
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

watch([() => chartContext.value, () => props.loading, () => props.period], async ([_chartContext, loading, period]) => {
    if (_chartContext && !loading && !isEmpty(period)) {
        chartHelper.refreshRoot();
        await nextTick();
        const chart = drawChart(period);
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
