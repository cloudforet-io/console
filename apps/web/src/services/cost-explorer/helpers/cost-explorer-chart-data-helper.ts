import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import dayjs from 'dayjs';

import { pinia } from '@/store/pinia';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { getPeriodByGranularity } from '@/services/cost-explorer/helpers/cost-explorer-period-helper';
import type { ChartData, XYChartData } from '@/services/cost-explorer/types/cost-explorer-chart-type';
import type {
    Period, Granularity,
} from '@/services/cost-explorer/types/cost-explorer-query-type';


useAllReferenceStore(pinia);

const DATE_FORMAT = Object.freeze({
    day: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY',
});
const getTimeUnitByGranularity = (granularity: Granularity): TimeUnit => {
    if (granularity === GRANULARITY.YEARLY) return 'year';
    if (granularity === GRANULARITY.MONTHLY) return 'month';
    return 'day';
};

/**
 * This function only merges numeric values, not string.
 * ({ date: '2021-11', aws: 100, azure: 100 }, { date: '2021-12', azure: 200 }) => { aws: 100, azure: 300 }
*/
const _mergePrevChartDataAndCurrChartData = (prevData: ChartData, currData?: ChartData): ChartData => {
    const mergedData: Record<string, number> = {};
    Object.entries({ ...prevData, ...currData }).forEach(([k, v]) => {
        if (typeof v === 'number') {
            if (currData && currData[k]) {
                mergedData[k] = currData[k] + (prevData[k] || 0);
            } else {
                mergedData[k] = prevData[k] || 0;
            }
        }
    });
    return mergedData;
};

/**
 * @name getStackedChartData
 * @description Get accumulated array of chart data. Chart data must have 'date' property.
 * @example [{ date: '2021-01', cost: 10, limit: 100 }, { date: '2021-02', cost: 10, limit: 0 }, { date: '2021-03', cost: 10, limit: 100 }]
 *       => [{ date: '2021-01-01', cost: 10, limit: 100 }, { date: '2021-02-01', cost: 20, limit: 100 }, { date: '2021-03-01', cost: 30, limit: 200 }]
 * @usage CostAnalysisDynamicWidget
 */
export const getStackedChartData = (chartData: XYChartData[], granularity: Granularity, period: Period): XYChartData[] => {
    const timeUnit = getTimeUnitByGranularity(granularity);
    const dateFormat = DATE_FORMAT[timeUnit];
    const _period = getPeriodByGranularity(granularity, period);

    const accumulatedChartData = [] as XYChartData[];
    let now = dayjs.utc(_period.start).clone();
    const today = dayjs.utc();
    let accumulatedData: Record<string, number> = {};
    while (now.isSameOrBefore(dayjs.utc(_period.end), timeUnit)) {
        let eachChartData: XYChartData = { date: now.format(dateFormat) };
        if (!now.isAfter(today, timeUnit)) {
            // eslint-disable-next-line no-loop-func
            const existData = chartData.find((d) => now.isSame(dayjs.utc(d.date), timeUnit));
            accumulatedData = _mergePrevChartDataAndCurrChartData(accumulatedData, existData);
            eachChartData = {
                ...eachChartData,
                ...accumulatedData,
            };
        }
        accumulatedChartData.push(eachChartData);
        now = now.add(1, timeUnit);
    }
    return accumulatedChartData;
};
