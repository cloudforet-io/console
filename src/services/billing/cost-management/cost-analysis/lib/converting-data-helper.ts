import { GROUP_BY_ITEM } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { ChartData, Legend } from '@/common/composables/dynamic-chart/type';
import { store } from '@/store';
import { GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import { commaFormatter, numberFormatter } from '@spaceone/console-core-lib';


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


export const mergePrevChartDataAndCurrChartData = (prevData: ChartData, currData?: ChartData): ChartData => {
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
                _label = _providers[d]?.label || d;
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
    } else {
        chartData = [{
            category: 'Total Cost',
            value: rawData[0]?.usd_cost || 0,
        }];
    }

    const groupByNames = [...groupByNameSet];
    return {
        chartData,
        legends: getLegendsFromGroupByNames(groupByNames, groupBy),
    };
};

export const getTableDataFromRawData = (rawData: TableRawData[], groupByItems: GroupByItem[]): TableData[] => {
    const tableData: TableData[] = [];
    rawData.forEach((eachRawData) => {
        const rowData: TableData = {};

        /* extract group by data (ex. { provider: 'aws', region_code: 'us-west-1' }) */
        if (groupByItems.length) {
            groupByItems.forEach((item) => {
                rowData[item.name] = eachRawData[item.name];
            });
        } else {
            rowData.total_cost = 'Total Cost';
        }

        /* extract data per each date (ex. { 2021-11-01: '29.4K', 2021-11-02: '8,962' } ) */
        eachRawData.values.forEach((value) => {
            rowData[value.date] = commaFormatter(numberFormatter(value.usd_cost));
        });
        tableData.push(rowData);
    });
    return tableData;
};
