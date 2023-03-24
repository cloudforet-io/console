import type { TimeUnit } from '@amcharts/amcharts4/core';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';

import { store } from '@/store';

import type { Currency } from '@/store/modules/display/config';
import type { CurrencyRates } from '@/store/modules/display/type';

import { convertUSDToCurrency } from '@/lib/helper/currency-helper';

import type { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY, GROUP_BY, MORE_GROUP_BY } from '@/services/cost-explorer/lib/config';
import { getTimeUnitByPeriod } from '@/services/cost-explorer/lib/helper';
import type { Period, Granularity, GroupBy } from '@/services/cost-explorer/type';
import { DATE_FORMAT } from '@/services/cost-explorer/widgets/lib/config';
import type {
    ChartData,
    CostAnalyzeModel,
    Legend,
    PieChartData,
    XYChartData,
} from '@/services/cost-explorer/widgets/type';

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
export const getLegends = (rawData: CostAnalyzeModel[], granularity: Granularity, groupBy?: GroupBy | string): Legend[] => {
    if (groupBy) {
        let _groupBy: string = groupBy;
        // Parsing to match api data (ex. tags.Name -> tags_Name)
        if (groupBy.startsWith(MORE_GROUP_BY.TAGS) || groupBy.startsWith(MORE_GROUP_BY.ADDITIONAL_INFO)) {
            _groupBy = groupBy.replace('.', '_');
        }
        const _providers = store.getters['reference/providerItems'];
        const _serviceAccounts = store.getters['reference/serviceAccountItems'];
        const _projects = store.getters['reference/projectItems'];
        const _projectGroups = store.getters['reference/projectGroupItems'];
        const _regions = store.getters['reference/regionItems'];

        const legends: Legend[] = [];
        rawData.forEach((d) => {
            if (
                (granularity === GRANULARITY.ACCUMULATED && d.usd_cost > 0)
                || (granularity !== GRANULARITY.ACCUMULATED && Object.keys(d.usd_cost).length)
            ) {
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
                    if (d.is_others) {
                        _name = 'aggregation';
                        _label = 'Etc.';
                    } else {
                        _name = `no_${_groupBy}`;
                        _label = 'Unknown';
                    }
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
    if (rawData.length) {
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
 * @name getPieChartData
 * @description Convert raw data to PieChart data.
 * @example [{ provider: 'aws', usd_cost: 100 }, { provider: 'azure', usd_cost: 30 }]
 *       => [{ category: 'aws', value: 100 }, { category: 'azure', value: 30 }]
 * @usage SpcProjectWiseUsageSummary, CostAnalysisChart
 */
export const getPieChartData = (rawData: CostAnalyzeModel[], groupBy?: GroupBy | string): PieChartData[] => {
    let chartData: PieChartData[] = [];
    if (groupBy) {
        let _groupBy: string = groupBy;
        // Parsing to match api data (ex. tags.Name -> tags_Name)
        if (groupBy.startsWith(MORE_GROUP_BY.TAGS) || groupBy.startsWith(MORE_GROUP_BY.ADDITIONAL_INFO)) {
            _groupBy = groupBy.replace('.', '_');
        }
        rawData.forEach((d) => {
            let _category = d[_groupBy];
            let _color;
            if (!_category) {
                if (d.is_others) _category = 'Etc.';
                else _category = 'Unknown';
            }
            if (_groupBy === GROUP_BY.PROVIDER) {
                const _providers = store.getters['reference/providerItems'];
                _color = _providers[_category]?.color;
                _category = _providers[_category]?.label || _category;
            } else if (_groupBy === GROUP_BY.REGION) {
                const _regions = store.getters['reference/regionItems'];
                _category = _regions[_category]?.name || _category;
            } else if (_groupBy === GROUP_BY.PROJECT) {
                const _projects = store.getters['reference/projectItems'];
                _category = _projects[_category]?.label || _category;
            } else if (_groupBy === GROUP_BY.PROJECT_GROUP) {
                const _projectGroups = store.getters['reference/projectGroupItems'];
                _category = _projectGroups[_category]?.label || _category;
            } else if (_groupBy === GROUP_BY.SERVICE_ACCOUNT) {
                const _serviceAccounts = store.getters['reference/serviceAccountItems'];
                _category = _serviceAccounts[_category]?.name || _category;
            }
            if (d.usd_cost > 0) {
                chartData.push({
                    category: _category,
                    value: d.usd_cost as number,
                    color: _color,
                });
            }
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
export const getXYChartData = (rawData: CostAnalyzeModel[], granularity: Granularity, period: Period, groupBy?: GroupBy | string, valueKey = 'usd_cost'): XYChartData[] => {
    const chartData: XYChartData[] = [];
    const timeUnit = getTimeUnitByPeriod(granularity, dayjs.utc(period.start), dayjs.utc(period.end));
    const dateFormat = DATE_FORMAT[timeUnit];

    let _groupBy: string | undefined = groupBy;
    // Parsing to match api data (ex. tags.Name -> tags_Name)
    if (groupBy?.startsWith(MORE_GROUP_BY.TAGS) || groupBy?.startsWith(MORE_GROUP_BY.ADDITIONAL_INFO)) {
        _groupBy = groupBy.replace('.', '_');
    }

    let now = dayjs.utc(period.start).clone();
    while (now.isSameOrBefore(dayjs.utc(period.end), timeUnit)) {
        const _date = now.format(dateFormat);
        const chartDataByDate: XYChartData = { date: _date };
        rawData.forEach((d) => {
            if (_groupBy) {
                let groupByName = d[_groupBy];
                if (!groupByName) {
                    if (d.is_others) groupByName = 'aggregation';
                    else groupByName = `no_${_groupBy}`;
                }
                chartDataByDate[groupByName] = d[valueKey]?.[_date] ?? 0;
            } else {
                chartDataByDate.totalCost = d[valueKey]?.[_date] ?? 0;
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
 * @example [{ date: '2021-01', usd_cost: 10, limit: 100 }, { date: '2021-02', usd_cost: 10, limit: 0 }, { date: '2021-03', usd_cost: 10, limit: 100 }]
 *       => [{ date: '2021-01-01', usd_cost: 10, limit: 100 }, { date: '2021-02-01', usd_cost: 20, limit: 100 }, { date: '2021-03-01', usd_cost: 30, limit: 200 }]
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

const getWidgetDefaultOptions = async (widgetId?: string): Promise<WidgetOptions|undefined> => {
    try {
        const defaultWidgetList = await import('./defaultWidgetList.json');
        return defaultWidgetList.default.find((widget) => widget.widget_id === widgetId)?.options as WidgetOptions;
    } catch (e) {
        throw new Error('Failed to fetch default widget list');
    }
};

export const getWidgetOption = async (customOptions: WidgetOptions, widgetId?: string) => {
    try {
        const defaultOptions = await getWidgetDefaultOptions(widgetId);
        if (isEqual(defaultOptions, customOptions)) return defaultOptions;
        return customOptions;
    } catch (e) {
        throw new Error('Failed to get default options');
    }
};
