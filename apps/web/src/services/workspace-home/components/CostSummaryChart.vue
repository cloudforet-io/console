<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { LineSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { throttle } from 'lodash';

import { numberFormatter } from '@cloudforet/utils';


import type { Currency } from '@/store/modules/display/type';

import { green, coral } from '@/styles/colors';

import { getLatestMonth } from '@/services/cost-explorer/helpers/cost-report-month-helper';
import type { XYChartData } from '@/services/cost-explorer/types/cost-explorer-chart-type';

interface Props {
    period: { start: string; end: string };
    data: XYChartData[];
    currency: Currency|undefined;
}
const props = withDefaults(defineProps<Props>(), {
    data: () => ([]),
});

const chartContext = ref<HTMLElement|null>(null);

const state = reactive({
    chart: null as EChartsType | null,
    chartData: computed<XYChartData[]>(() => {
        const data = props.data ?? [];
        if (!data) return [];
        return data;
    }),
    // 데이터에 없는 달도 축에 남겨야 indexOf 가 항상 유효하고, 비어 있는 구간이 공백으로 드러난다.
    chartDateData: computed<string[]>(() => {
        const start = dayjs.utc(props.period?.start);
        const end = dayjs.utc(props.period?.end);
        // 유효하지 않은 period 로 while 이 끝나지 않는 것을 막는다.
        if (!start.isValid() || !end.isValid() || start.isAfter(end, 'month')) return [];
        const dates: string[] = [];
        let cursor = start;
        while (!cursor.isAfter(end, 'month')) {
            dates.push(cursor.format('YYYY-MM'));
            cursor = cursor.add(1, 'month');
        }
        return dates;
    }),
    chartValueData: computed<Array<number|null>>(() => state.chartDateData.map((date) => {
        const target = state.chartData.find((d) => d.date === date);
        return target?.value ?? null;
    })),
    // 축의 마지막 달(= 최신 월)이 아직 확정 전일 때만 구간 색을 나눈다.
    // 단색이면 빈 배열을 반환해 visualMap 자체를 걸지 않는다.
    // 한쪽이 열린 구간만 남으면 echarts 가 gradient stop 을 하나도 못 만들어 라인 렌더가 통째로 깨진다.
    chartPieces: computed(() => {
        const latestMonthIndex = state.chartDateData.indexOf(getLatestMonth());
        const latestMonthData = state.chartData.find((i) => i.date === getLatestMonth());
        if (latestMonthIndex > 0 && latestMonthData && !latestMonthData.is_confirmed) {
            return [
                {
                    lte: latestMonthIndex - 1,
                    color: green[700],
                },
                {
                    gt: latestMonthIndex - 1,
                    lte: latestMonthIndex,
                    color: coral[400],
                },
            ];
        }
        return [];
    }),
    chartOptions: computed<LineSeriesOption>(() => ({
        grid: {
            top: 20,
            right: 35,
            bottom: 0,
            left: 30,
            containLabel: true,
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                const target = Array.isArray(params) ? params[0] : params;
                if (!target) return '';
                // 데이터가 없는 달은 마커만 뜨고 값이 비어 보이므로, 카드와 동일하게 '-' 로 표기한다.
                const value = target.value === null || target.value === undefined
                    ? '-'
                    : numberFormatter(target.value) || '-';
                return `${target.axisValue}<br>${target.marker}${value}`;
            },
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: state.chartDateData,
            axisTick: {
                alignWithLabel: true,
            },
            nameTextStyle: {
                fontSize: 12,
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (val) => numberFormatter(val, { notation: 'compact' }),
            },
            splitNumber: 4,
        },
        ...(state.chartPieces.length ? {
            visualMap: {
                show: false,
                dimension: 0,
                pieces: state.chartPieces,
            },
        } : {}),
        series: [
            {
                data: state.chartValueData,
                type: 'line',
                ...(state.chartPieces.length ? {} : {
                    itemStyle: { color: green[700] },
                    lineStyle: { color: green[700] },
                }),
            },
        ],
    })),
});

useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 300));
/* Watcher */
watch([() => state.chartData, () => props.period, () => chartContext.value], ([,, chartCtx]) => {
    if (chartCtx) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
}, { immediate: true });
</script>

<template>
    <div class="cost-summary-chart">
        <div ref="chartContext"
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
