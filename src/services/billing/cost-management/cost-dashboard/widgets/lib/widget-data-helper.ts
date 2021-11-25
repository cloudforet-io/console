import { ChartData } from '@/common/composables/dynamic-chart/type';
import { CHART_TYPE } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { TimeUnit } from '@amcharts/amcharts4/core';
import dayjs from 'dayjs';
import { mergePrevChartDataAndCurrChartData } from '@/services/billing/cost-management/cost-analysis/lib/converting-data-helper';
import { cloneDeep } from 'lodash';
import { CURRENCY } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';
import { convertUSDToCurrency } from '@/lib/helper/currency-helper';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { Period } from '@/services/billing/cost-management/cost-analysis/store/type';

const getAccumulatedData = (
    chartData: ChartData[],
    period: Period,
    timeUnit: TimeUnit,
): ChartData[] => {
    const accumulatedChartData = [] as ChartData[];
    let now = dayjs(period.start).clone();
    let accumulatedData: Record<string, number> = {};
    while (now.isSameOrBefore(dayjs(period.end), timeUnit)) {
        let eachChartData: ChartData = {};
        // eslint-disable-next-line no-loop-func
        const existData = chartData.find(d => now.isSame(d.date, timeUnit));
        accumulatedData = mergePrevChartDataAndCurrChartData(accumulatedData, existData);
        eachChartData = {
            date: now.toDate(),
            ...accumulatedData,
        };
        accumulatedChartData.push(eachChartData);
        now = now.add(1, timeUnit);
    }
    return accumulatedChartData;
};

const fillDefaultDataOfLastDay = (chartData: ChartData[], period: Period, timeUnit: TimeUnit): ChartData[] => {
    const convertedChartData = [...chartData];
    const dataOfLastDate = chartData.find(d => dayjs(period.end).isSame(d.date, timeUnit));
    if (!dataOfLastDate) {
        convertedChartData.push({
            date: dayjs(period.end).toDate(),
        });
    }
    return convertedChartData;
};


export const getQueryAppliedChartData = (
    chartData: ChartData[],
    period: Period,
    chartType: CHART_TYPE,
    granularity: GRANULARITY,
    timeUnit: TimeUnit,
): ChartData[] => {
    let results = cloneDeep(chartData);
    if (chartType !== CHART_TYPE.DONUT) {
        if (granularity === GRANULARITY.ACCUMULATED) {
            results = getAccumulatedData(chartData, period, timeUnit);
        } else {
            results = fillDefaultDataOfLastDay(chartData, period, timeUnit);
        }
    }
    return results;
};

export const getCurrencyAppliedChartData = (
    chartData: ChartData[],
    currency: CURRENCY,
    currencyRates: CurrencyRates,
): ChartData[] => chartData.map((dataObj) => {
    const results = {};
    Object.keys(dataObj).forEach((key) => {
        const data = dataObj[key];
        results[key] = typeof data === 'number' ? convertUSDToCurrency(
            data ?? 0,
            currency,
            currencyRates,
        ) : data;
    });
    return results;
});
