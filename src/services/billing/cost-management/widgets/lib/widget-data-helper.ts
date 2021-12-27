import dayjs from 'dayjs';
import { TimeUnit } from '@amcharts/amcharts4/core';

import { store } from '@/store';
import { CURRENCY } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';

import { convertUSDToCurrency } from '@/lib/helper/currency-helper';

import { GROUP_BY, GROUP_BY_ITEM_MAP } from '@/services/billing/cost-management/lib/config';
import { Period } from '@/services/billing/cost-management/type';
import {
    ChartData, Legend, PieChartData, PieChartRawData, XYChartData, XYChartRawData,
} from '@/services/billing/cost-management/widgets/type';


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

const _getLegendsFromGroupByNames = (groupByNames: string[], groupBy?: string): Legend[] => {
    let legends: Legend[] = [];
    if (groupBy) {
        const _providers = store.state.resource.provider.items;
        const _serviceAccounts = store.state.resource.serviceAccount.items;
        const _projects = store.state.resource.project.items;
        const _regions = store.state.resource.region.items;
        groupByNames.forEach((d) => {
            let _label = d;
            let _color = undefined as string | undefined;
            if (groupBy === GROUP_BY.PROJECT) {
                _label = _projects[d]?.label || d;
            } else if (groupBy === GROUP_BY.SERVICE_ACCOUNT) {
                _label = _serviceAccounts[d]?.label || d;
            } else if (groupBy === GROUP_BY.REGION) {
                _label = _regions[d]?.name || d;
            } else if (groupBy === GROUP_BY.PROVIDER) {
                _label = _providers[d]?.name || d;
                _color = _providers[d]?.color;
            }
            legends.push({
                name: d as string,
                label: _label as string,
                color: _color,
                disabled: false,
            });
        });
    } else {
        legends = [{ name: 'totalCost', label: 'Total Cost', disabled: false }];
    }
    return legends;
};


/**
 * @name getPieChartData
 * @description Convert raw data to PieChart data.
 * @example [{ provider: 'aws', usd_cost: 100 }, { provider: 'azure', usd_cost: 30 }]
 *       => [{ category: 'aws', value: 100 }, { category: 'azure', value: 30 }]
 * @usage SpcProjectWiseUsageSummary, CostByProvider
 */
export const getPieChartData = (rawData: PieChartRawData[], groupBy: string): PieChartData[] => rawData.map((d) => {
    let groupByName = d[groupBy];
    if (!groupByName) groupByName = `No ${GROUP_BY_ITEM_MAP[groupBy].label}`;
    return {
        category: groupByName,
        value: d.usd_cost,
    };
});

export const getPieChartDataAndLegends = (rawData: PieChartRawData[], groupBy: string): { chartData: PieChartData[]; legends: Legend[] } => {
    const chartData: PieChartData[] = getPieChartData(rawData, groupBy);
    const groupByNames = rawData.map(d => d[groupBy]);
    return {
        chartData,
        legends: _getLegendsFromGroupByNames(groupByNames, groupBy),
    };
};


/**
 * @name getXYChartData
 * @description Convert raw data to XYChart data.
 * @example [{ date: '2021-11-01', values: [{ provider: 'aws', usd_cost: 100 }] }, { date: '2021-11-02', values: [{ provider: 'aws', usd_cost: 300 }] }]
 *       => [{ date: '2021-11-01', aws: 100 }, { date: '2021-11-02', aws: 300 }]
 * @usage BudgetSummaryChart, LastMonthTotalSpend
 */
export const getXYChartData = (rawData: XYChartRawData[], groupBy?: string): XYChartData[] => rawData.map((d) => {
    const eachChartData: XYChartData = { date: d.date };
    if (groupBy) {
        d.values.forEach((value) => {
            eachChartData[groupBy] = value.usd_cost;
        });
    } else {
        d.values.forEach((value) => {
            eachChartData.totalCost = value.usd_cost;
        });
    }
    return eachChartData;
});


/**
 * @name getXYChartDataAndLegends
 * @description Get converted chart data and legends. If you don't need legends, use getXYChartData().
 * @usage CostAnalysisChart, CostTrendByProduct, CostTrendByProject
 */
export const getXYChartDataAndLegends = (rawData: XYChartRawData[], groupBy?: string): { chartData: XYChartData[]; legends: Legend[] } => {
    const chartData: XYChartData[] = [];
    const groupByNameSet = new Set<string>();

    rawData.forEach((d) => {
        const eachChartData: XYChartData = { date: d.date };
        if (groupBy) {
            d.values.forEach((value) => {
                let groupByName = value[groupBy];
                if (!groupByName) groupByName = `No ${GROUP_BY_ITEM_MAP[groupBy].label}`;
                eachChartData[groupByName] = value.usd_cost;
                groupByNameSet.add(groupByName);
            });
        } else {
            d.values.forEach((value) => {
                eachChartData.totalCost = value.usd_cost;
            });
        }
        chartData.push(eachChartData);
    });

    const groupByNames = [...groupByNameSet];
    return {
        chartData,
        legends: _getLegendsFromGroupByNames(groupByNames, groupBy),
    };
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
        ) : data;
    });
    return results;
});
