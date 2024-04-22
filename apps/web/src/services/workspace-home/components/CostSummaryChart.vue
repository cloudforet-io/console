<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';

import { PSkeleton } from '@spaceone/design-system';
import {
    cloneDeep, sortBy,
} from 'lodash';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';

import type { Currency } from '@/store/modules/settings/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import { green } from '@/styles/colors';

import type { Legend, XYChartData } from '@/services/cost-explorer/types/cost-explorer-chart-type';
import type { CostReportDataAnalyzeResult } from '@/services/cost-explorer/types/cost-report-data-type';
import { getRefinedXYChartData } from '@/services/dashboards/widgets/_helpers/widget-chart-data-helper';
import { getXYChartLegends } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';

interface Props {
    loading: boolean
    period: { start: string; end: string };
    data: AnalyzeResponse<CostReportDataAnalyzeResult>;
    currency: Currency|undefined;
}
const props = withDefaults(defineProps<Props>(), {
    loading: false,
    data: () => ({}),
});

const DATE_FIELD_NAME = 'date';

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

const state = reactive({
    legends: computed<Legend[]>(() => {
        const data = props.data?.results ?? [];
        const legends: Legend[] = getXYChartLegends(data[0].value_sum, DATE_FIELD_NAME);
        return sortBy<Legend>(legends, (m) => m.name);
    }),
    chartData: computed<XYChartData[]>(() => {
        const data = props.data?.results ?? [];
        if (!data) return [];

        const chartData: XYChartData[] = getRefinedXYChartData(data, {
            arrayDataKey: 'value_sum',
            categoryKey: DATE_FIELD_NAME,
            valueKey: 'value',
        });

        return sortBy<XYChartData>(chartData, (m) => m.date);
    }),
});

const drawChart = () => {
    chartHelper.refreshRoot();
    const { chart, xAxis } = chartHelper.createXYDateChart();

    // set base interval of xAxis
    xAxis.get('baseInterval').timeUnit = 'month';
    xAxis.get('dateFormats').month = 'YYYY-MM';
    xAxis.get('periodChangeDateFormats').month = 'YYYY-MM';

    // hide zoom button
    chart.zoomOutButton.set('forceHidden', true);

    // set cursor
    chart.get('cursor')?.lineX.setAll({
        visible: true,
    });

    // create series
    const series = chartHelper.createXYLineSeries(chart, {
        name: '',
        valueYField: 'value',
        stroke: chartHelper.color(green[700]),
        fill: chartHelper.color(green[700]),
    });

    // set data processor on series
    series.data.processor = chartHelper.createDataProcessor({
        dateFormat: 'YYYY-MM',
        dateFields: [DATE_FIELD_NAME],
    });

    // create tooltip and set on series
    const tooltip = chartHelper.createTooltip();
    const valueFormatter: ((value: any) => string)|undefined = (value) => currencyMoneyFormatter(value, { currency: props.currency }) ?? '';
    chartHelper.setXYSharedTooltipText(
        chart,
        tooltip,
        valueFormatter,
    );
    series.set('tooltip', tooltip);

    // set data on series
    chart.series.push(series);
    series.data.setAll(cloneDeep(state.chartData));

    // set series style
    series.fills.template.setAll({
        fillOpacity: 0.3,
        visible: true,
    });
    series.fills.template.set('fillGradient', chartHelper.createLinearGradient({
        stops: [{
            opacity: 0.3,
        }, {
            opacity: 0,
        }],
    }));
};

/* Watcher */
watch([() => props.loading, () => chartContext.value], async ([loading, _chartContext]) => {
    if (!loading && _chartContext && props.data?.results) {
        drawChart();
    }
}, { immediate: true });
</script>

<template>
    <div class="cost-summary-chart">
        <p-skeleton v-if="props.loading"
                    height="100%"
        />
        <div v-show="!props.loading"
             ref="chartContext"
             class="chart"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-summary-chart {
    height: 16.65rem;
    .chart {
        height: 100%;
        width: 100%;
    }
}
</style>
