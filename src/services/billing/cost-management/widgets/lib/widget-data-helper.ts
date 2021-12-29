import dayjs from 'dayjs';
import { TimeUnit } from '@amcharts/amcharts4/core';

import { store } from '@/store';
import { CURRENCY } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';

import { convertUSDToCurrency } from '@/lib/helper/currency-helper';

import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { Period } from '@/services/billing/cost-management/type';
import {
    ChartData, CostAnalyzeModel, Legend, PieChartData, XYChartData,
} from '@/services/billing/cost-management/widgets/type';
import { getTimeUnitByPeriod } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { DATE_FORMAT } from '@/services/billing/cost-management/widgets/lib/config';


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
 * @name getLegends
 * @description Extract legends from raw data.
 * @usage CostAnalysisChart, CostTrendByProduct|CostTrendByProject|CostTrendByProvider, SpcProjectWiseUsageSummary
 */
export const getLegends = (rawData: CostAnalyzeModel[], groupBy?: GROUP_BY): Legend[] => {
    if (groupBy) {
        const _providers = store.state.resource.provider.items;
        const _serviceAccounts = store.state.resource.serviceAccount.items;
        const _projects = store.state.resource.project.items;
        const _regions = store.state.resource.region.items;

        const legends: Legend[] = [];
        rawData.forEach((d) => {
            let _name = d[groupBy];
            let _label = d[groupBy];
            if (groupBy === GROUP_BY.PROJECT) {
                _label = _projects[_name]?.label || _name;
            } else if (groupBy === GROUP_BY.SERVICE_ACCOUNT) {
                _label = _serviceAccounts[_name]?.label || _name;
            } else if (groupBy === GROUP_BY.REGION) {
                _label = _regions[_name]?.name || _name;
            } else if (groupBy === GROUP_BY.PROVIDER) {
                _label = _providers[_name]?.name || _name;
            }
            if (!_name) {
                if (d.is_etc) {
                    _name = 'aggregation';
                    _label = 'Aggregation of the rest';
                } else {
                    _name = `no_${groupBy}`;
                    _label = 'Unknown';
                }
            }
            legends.push({
                name: _name,
                label: _label,
                disabled: false,
            });
        });
        return legends;
    }
    return [{ name: 'totalCost', label: 'Total Cost', disabled: false }];
};


/**
 * @name getPieChartData
 * @description Convert raw data to PieChart data.
 * @example [{ provider: 'aws', usd_cost: 100 }, { provider: 'azure', usd_cost: 30 }]
 *       => [{ category: 'aws', value: 100 }, { category: 'azure', value: 30 }]
 * @usage SpcProjectWiseUsageSummary, CostAnalysisChart
 */
export const getPieChartData = (rawData: CostAnalyzeModel[], groupBy?: GROUP_BY): PieChartData[] => {
    let chartData: PieChartData[] = [];
    if (groupBy) {
        rawData.forEach((d) => {
            let _category = d[groupBy];
            if (!_category) {
                if (d.is_etc) _category = 'aggregation';
                else _category = `no_${groupBy}`;
            }
            chartData.push({
                category: _category,
                value: (d.usd_cost > 0 ? d.usd_cost : 0) as number,
            });
        });
    } else if (rawData.length) {
        chartData = [{
            category: 'Total Cost',
            value: (rawData[0]?.usd_cost ?? 0) as number,
        }];
    }
    return chartData;
};


/**
 * @name getXYChartData
 * @description Convert raw data to XYChart data.
 * @example [{ date: '2021-11-01', aws: 100, azure: 300 }, { date: '2021-11-02', aws: 300, azure: 100 }]
 * @usage CostAnalysisChart, CostTrendByProduct|CostTrendByProject|CostTrendByProvider, SpcProjectWiseUsageSummary, LastMonthTotalSpend, BudgetSummaryChart
 */
export const getXYChartData = (rawData: CostAnalyzeModel[], granularity: GRANULARITY, period: Period, groupBy?: GROUP_BY): XYChartData[] => {
    const chartData: XYChartData[] = [];
    const timeUnit = getTimeUnitByPeriod(granularity, dayjs.utc(period.start), dayjs.utc(period.end));
    const dateFormat = DATE_FORMAT[timeUnit];

    let now = dayjs.utc(period.start).clone();
    while (now.isSameOrBefore(dayjs.utc(period.end), timeUnit)) {
        const _date = now.format(dateFormat);
        const chartDataByDate: XYChartData = { date: _date };
        rawData.forEach((d) => {
            if (groupBy) {
                let groupByName = d[groupBy];
                if (!groupByName) {
                    if (d.is_etc) groupByName = 'aggregation';
                    else groupByName = `no_${groupBy}`;
                }
                if (d.usd_cost[_date]) chartDataByDate[groupByName] = d.usd_cost[_date];
            } else if (d.usd_cost[_date]) chartDataByDate.totalCost = d.usd_cost[_date];
        });
        chartData.push(chartDataByDate);
        now = now.add(1, timeUnit);
    }
    return chartData;
};


/**
 * @name getStackedChartData
 * @description Get accumulated array of chart data. Chart data must have 'date' property.
 * @example [{ date: '2021-01', usd_cost: 10, limit: 100 }, { date: '2021-02', usd_cost: 10, limit: 0 }, { date: '2021-03', usd_cost: 10, limit: 100 }]
 *       => [{ date: '2021-01-01', usd_cost: 10, limit: 100 }, { date: '2021-02-01', usd_cost: 20, limit: 100 }, { date: '2021-03-01', usd_cost: 30, limit: 200 }]
 * @usage CostAnalysisDynamicWidget
 */
export const getStackedChartData = (chartData: XYChartData[], period: Period, timeUnit: TimeUnit): XYChartData[] => {
    const accumulatedChartData = [] as XYChartData[];
    let now = dayjs(period.start).clone();
    let accumulatedData: Record<string, number> = {};
    while (now.isSameOrBefore(dayjs(period.end), timeUnit)) {
        let eachChartData: XYChartData = { date: now.format('YYYY-MM-DD') };
        // eslint-disable-next-line no-loop-func
        const existData = chartData.find(d => now.isSame(d.date, timeUnit));
        accumulatedData = _mergePrevChartDataAndCurrChartData(accumulatedData, existData);
        eachChartData = {
            ...eachChartData,
            ...accumulatedData,
        };
        accumulatedChartData.push(eachChartData);
        now = now.add(1, timeUnit);
    }
    return accumulatedChartData;
};


/**
 * @name getCurrencyAppliedChartData
 * @description Set currency rate to chart data. If the value is a number, it's unconditionally multiplied by the currency rate.
 * @example [{ date: '2021-01', aws: 1, lineDash: '5,5' }, { date: '2021-02', aws: 10 }] : USD
 *       => [{ date: '2021-01', aws: 1200, lineDash: '5,5' }, { date: '2021-02', aws: 12000 }] : KRW
 * @usage CostAnalysisDynamicWidget, CostTrendByProduct, CostTrendByProject, BudgetSummaryChart, LastMonthTotalSpend
 */
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
        ).toFixed(2) : data;
    });
    return results;
});
