import type { TimeUnit } from '@amcharts/amcharts4/core';
import dayjs from 'dayjs';
import { cloneDeep, find, sortBy } from 'lodash';

import { store } from '@/store';

import type { Currency, CurrencyRates } from '@/store/modules/settings/type';

import { convertUSDToCurrency } from '@/lib/helper/currency-helper';

import type {
    ChartData, Legend, XYChartData,
} from '@/services/cost-explorer/cost-analysis/type';
import { GROUP_BY } from '@/services/cost-explorer/lib/config';
import { getTimeUnitByPeriod } from '@/services/cost-explorer/lib/helper';
import type {
    Period, Granularity, GroupBy, CostAnalyzeResponse,
} from '@/services/cost-explorer/type';


const DATE_FORMAT = Object.freeze({
    day: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY',
});


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
export const getLegends = <CostAnalyzeResult>(rawData: CostAnalyzeResponse<CostAnalyzeResult>, granularity: Granularity, groupBy?: GroupBy | string): Legend[] => {
    if (groupBy) {
        let _groupBy: string = groupBy;
        // Parsing to match api data (ex. tags.Name -> tags_Name)
        if (groupBy.includes('.')) {
            _groupBy = groupBy.replace('.', '_');
        }
        const _providers = store.getters['reference/providerItems'];
        const _serviceAccounts = store.getters['reference/serviceAccountItems'];
        const _projects = store.getters['reference/projectItems'];
        const _projectGroups = store.getters['reference/projectGroupItems'];
        const _regions = store.getters['reference/regionItems'];

        const legends: Legend[] = [];
        rawData.results.forEach((d) => {
            if (d.cost_sum) {
                let _name = d[_groupBy];
                let _label = d[_groupBy];
                let _color;
                if (_groupBy === GROUP_BY.PROJECT_GROUP) {
                    _label = _projectGroups[_name]?.label || _name;
                } else if (_groupBy === GROUP_BY.PROJECT) {
                    _label = _projects[_name]?.label || _name;
                } else if (_groupBy === GROUP_BY.SERVICE_ACCOUNT) {
                    _label = _serviceAccounts[_name]?.label || _name;
                } else if (_groupBy === GROUP_BY.REGION) {
                    _label = _regions[_name]?.name || _name;
                } else if (_groupBy === GROUP_BY.PROVIDER) {
                    _label = _providers[_name]?.name || _name;
                    _color = _providers[_name]?.color;
                }
                if (!_name) {
                    _name = `no_${_groupBy}`;
                    _label = 'Unknown';
                }
                legends.push({
                    name: _name,
                    label: _label,
                    disabled: false,
                    color: _color,
                });
            }
        });
        return legends;
    }
    if (rawData.results.length) {
        return [{ name: 'totalCost', label: 'Total Cost', disabled: false }];
    }
    return [];
};

/**
 * @name getReferenceLabel
 * @description Extract label from raw string.
 * @usage AWSCloudFrontCost
 * @example ('project-111111', 'project_id') => 'SpaceOne Dev Project'
 */
export const getReferenceLabel = (data: string, groupBy: GroupBy | string): string => {
    if (!data) return 'Unknown';
    const _providers = store.getters['reference/providerItems'];
    const _serviceAccounts = store.getters['reference/serviceAccountItems'];
    const _projects = store.getters['reference/projectItems'];
    const _projectGroups = store.getters['reference/projectGroupItems'];
    const _regions = store.getters['reference/regionItems'];
    if (groupBy === GROUP_BY.PROJECT_GROUP) return _projectGroups[data]?.label || data;
    if (groupBy === GROUP_BY.PROJECT) return _projects[data]?.label || data;
    if (groupBy === GROUP_BY.SERVICE_ACCOUNT) return _serviceAccounts[data]?.label || data;
    if (groupBy === GROUP_BY.REGION) return _regions[data]?.name || data;
    if (groupBy === GROUP_BY.PROVIDER) return _providers[data]?.name || data;
    return 'Unknown';
};

/**
 * @name getXYChartData
 * @description Convert raw data to XYChart data.
 * @example [{ date: '2021-11-01', aws: 100, azure: 300 }, { date: '2021-11-02', aws: 300, azure: 100 }]
 * @usage CostAnalysisChart, CostTrendByProduct|CostTrendByProject|CostTrendByProvider, SpcProjectWiseUsageSummary, LastMonthTotalSpend, BudgetSummaryChart
 */
export const getXYChartData = <CostAnalyzeResult>(rawData: CostAnalyzeResponse<CostAnalyzeResult>, granularity: Granularity, period: Period, groupBy?: GroupBy | string): XYChartData[] => {
    const chartData: XYChartData[] = [];
    const timeUnit = getTimeUnitByPeriod(granularity, dayjs.utc(period.start), dayjs.utc(period.end));
    const dateFormat = DATE_FORMAT[timeUnit];

    let _groupBy: string | undefined = groupBy;
    // Parsing to match api data (ex. tags.Name -> tags_Name)
    if (groupBy?.includes('.')) {
        _groupBy = groupBy.replace('.', '_');
    }

    let now = dayjs.utc(period.start).clone();
    while (now.isSameOrBefore(dayjs.utc(period.end), timeUnit)) {
        const _date = now.format(dateFormat);
        const chartDataByDate: XYChartData = { date: _date };
        rawData.results.forEach((d) => {
            if (_groupBy) {
                let groupByName = d[_groupBy];
                if (!groupByName) {
                    groupByName = `no_${_groupBy}`;
                }
                chartDataByDate[groupByName] = d.cost_sum?.find((c) => c.date === _date)?.value || 0;
            } else {
                chartDataByDate.totalCost = d.cost_sum?.find((c) => c.date === _date)?.value || 0;
            }
        });
        chartData.push(chartDataByDate);
        now = now.add(1, timeUnit);
    }
    return chartData;
};

/**
 * @name getStackedChartData
 * @description Get accumulated array of chart data. Chart data must have 'date' property.
 * @example [{ date: '2021-01', cost: 10, limit: 100 }, { date: '2021-02', cost: 10, limit: 0 }, { date: '2021-03', cost: 10, limit: 100 }]
 *       => [{ date: '2021-01-01', cost: 10, limit: 100 }, { date: '2021-02-01', cost: 20, limit: 100 }, { date: '2021-03-01', cost: 30, limit: 200 }]
 * @usage CostAnalysisDynamicWidget
 */
export const getStackedChartData = (chartData: XYChartData[], period: Period, timeUnit: TimeUnit): XYChartData[] => {
    const accumulatedChartData = [] as XYChartData[];
    let now = dayjs.utc(period.start).clone();
    let accumulatedData: Record<string, number> = {};
    while (now.isSameOrBefore(dayjs.utc(period.end), timeUnit)) {
        let eachChartData: XYChartData = { date: now.format('YYYY-MM-DD') };
        // eslint-disable-next-line no-loop-func
        const existData = chartData.find((d) => now.isSame(dayjs.utc(d.date), timeUnit));
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
    currency: Currency,
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

export const getTooltipText = (categoryKey, valueKey, money, disablePercentage = true) => {
    if (disablePercentage) {
        return `{${categoryKey}}: [bold]${money}[/]`;
    }
    return `{${categoryKey}}: [bold]${money}[/] ({${valueKey}.percent.formatNumber('#.00')}%)`;
};

export const getRefinedChartTableData = <CostAnalyzeResult>(results: CostAnalyzeResult[], granularity: Granularity, period: Period) => {
    const timeUnit = getTimeUnitByPeriod(granularity, dayjs.utc(period.start), dayjs.utc(period.end));
    const dateFormat = DATE_FORMAT[timeUnit];

    const _results: CostAnalyzeResult[] = cloneDeep(results);
    const refinedTableData: CostAnalyzeResult[] = [];
    _results.forEach((d) => {
        let _costSum = cloneDeep(d.cost_sum);
        let now = dayjs.utc(period.start).clone();
        while (now.isSameOrBefore(dayjs.utc(period.end), timeUnit)) {
            if (!find(_costSum, { date: now.format(dateFormat) })) {
                _costSum?.push({ date: now.format(dateFormat), value: 0 });
            }
            now = now.add(1, timeUnit);
        }
        _costSum = sortBy(_costSum, ['date']);
        refinedTableData.push({ ...d, cost_sum: _costSum });
    });
    return refinedTableData;
};
