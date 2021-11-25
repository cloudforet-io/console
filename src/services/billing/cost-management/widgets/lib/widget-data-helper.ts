import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { TimeUnit } from '@amcharts/amcharts4/core';

import { commaFormatter, numberFormatter } from '@spaceone/console-core-lib';

import { store } from '@/store';
import { CURRENCY } from '@/store/modules/display/config';
import { CurrencyRates } from '@/store/modules/display/type';

import { convertUSDToCurrency } from '@/lib/helper/currency-helper';

import { GRANULARITY, GROUP_BY_ITEM } from '@/services/billing/cost-management/lib/config';
import { Period } from '@/services/billing/cost-management/cost-analysis/store/type';

import { CHART_TYPE } from '@/services/billing/cost-management/widgets/lib/config';
import { ChartData, Legend } from '@/services/billing/cost-management/widgets/type';


interface TableRawValue {
    date: string;
    usd_cost?: number;
}
interface TableRawData {
    values: TableRawValue[];
    [key: string]: any;
}
interface TableData {
    [key: string]: any;
}


interface XYChartRawValue {
    usd_cost: number;
    [key: string]: any;
}
interface XYChartRawData {
    values: XYChartRawValue[];
    [key: string]: any;
}


interface PieChartRawData {
    usd_cost: number;
    [key: string]: any;
}


const mergePrevChartDataAndCurrChartData = (prevData: ChartData, currData?: ChartData): ChartData => {
    const mergedData: Record<string, number> = {};
    Object.keys({ ...prevData, ...currData }).forEach((k) => {
        const prevValue = prevData[k] || 0;
        if (k !== 'date') {
            if (currData && currData[k]) {
                mergedData[k] = currData[k] + prevValue;
            } else {
                mergedData[k] = prevValue;
            }
        }
    });
    return mergedData;
};

export const getLegendsFromGroupByNames = (groupByNames: string[], groupBy?: GROUP_BY_ITEM): Legend[] => {
    let legends: Legend[] = [];
    if (groupBy) {
        const _providers = store.state.resource.provider.items;
        const _serviceAccounts = store.state.resource.serviceAccount.items;
        const _projects = store.state.resource.project.items;
        const _regions = store.state.resource.region.items;
        groupByNames.forEach((d) => {
            let _label = d;
            if (groupBy === GROUP_BY_ITEM.PROJECT) {
                _label = _projects[d]?.label || d;
            } else if (groupBy === GROUP_BY_ITEM.SERVICE_ACCOUNT) {
                _label = _serviceAccounts[d]?.label || d;
            } else if (groupBy === GROUP_BY_ITEM.REGION) {
                _label = _regions[d]?.name || d;
            } else if (groupBy === GROUP_BY_ITEM.PROVIDER) {
                _label = _providers[d]?.name || d;
            }
            legends.push({
                name: d as string,
                label: _label as string,
                disabled: false,
            });
        });
    } else {
        legends = [{ name: 'total_cost', label: 'Total Cost', disabled: false }];
    }
    return legends;
};

export const getXYChartDataAndLegends = (rawData: XYChartRawData[], groupBy?: GROUP_BY_ITEM): { chartData: ChartData[]; legends: Legend[] } => {
    const chartData: ChartData[] = [];
    const groupByNameSet = new Set<string>();

    rawData.forEach((d) => {
        const eachChartData: ChartData = { date: d.date };
        if (groupBy) {
            d.values.forEach((value) => {
                let groupByName = value[groupBy];
                if (!groupByName) groupByName = `No ${groupBy}`;
                eachChartData[groupByName] = value.usd_cost;
                groupByNameSet.add(groupByName);
            });
        } else {
            d.values.forEach((value) => {
                eachChartData.total_cost = value.usd_cost;
            });
        }
        chartData.push(eachChartData);
    });

    const groupByNames = [...groupByNameSet];
    return {
        chartData,
        legends: getLegendsFromGroupByNames(groupByNames, groupBy),
    };
};

/**
 * @name getPieChartDataAndLegends
 * @param rawData
 * @param groupBy
 */
export const getPieChartDataAndLegends = (rawData: PieChartRawData[], groupBy?: GROUP_BY_ITEM): { chartData: ChartData[]; legends: Legend[] } => {
    let chartData: ChartData[] = [];
    const groupByNameSet = new Set<string>();

    if (groupBy) {
        rawData.forEach((d) => {
            let groupByName = d[groupBy];
            if (!groupByName) groupByName = `No ${groupBy}`;
            chartData.push({
                category: groupByName,
                value: d.usd_cost,
            });
            groupByNameSet.add(groupByName);
        });
    } else if (rawData[0]?.usd_cost) {
        chartData = [{
            category: 'Total Cost',
            value: rawData[0].usd_cost,
        }];
    }

    const groupByNames = [...groupByNameSet];
    return {
        chartData,
        legends: getLegendsFromGroupByNames(groupByNames, groupBy),
    };
};


const getDefaultRowDataWithGroupBy = (groupBy: string[], tableRawData: TableRawData): TableData => {
    const rowData: TableData = {};
    /* extract group by data (ex. { provider: 'aws', region_code: 'us-west-1' }) */
    if (groupBy.length) {
        groupBy.forEach((name) => {
            rowData[name] = tableRawData[name];
        });
    } else {
        rowData.total_cost = 'Total Cost';
    }
    return rowData;
};

export const getTableDataFromRawData = (
    rawData: TableRawData[],
    groupBy: string[],
): TableData[] => rawData.map((eachRawData) => {
    const rowData = getDefaultRowDataWithGroupBy(groupBy, eachRawData);

    /* extract data per each date (ex. { 2021-11-01: '29.4K', 2021-11-02: '8,962' } ) */
    eachRawData.values.forEach((value) => {
        rowData[value.date] = commaFormatter(numberFormatter(value.usd_cost));
    });

    return rowData;
});


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
