import dayjs from 'dayjs';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';

import { GRANULARITY } from '@/services/asset-inventory/constants/metric-explorer-constant';
import type {
    Legend, Operator, MetricDataAnalyzeResult, Granularity, Period,
    XYChartData,
} from '@/services/asset-inventory/types/metric-explorer-type';


export const getLegends = (rawData: AnalyzeResponse<MetricDataAnalyzeResult>, operator: Operator, groupBy?: string): Legend[] => {
    if (groupBy) {
        let _groupBy: string = groupBy;
        if (groupBy.includes('.')) {
            _groupBy = groupBy.split('.')[1]; // (ex. additional_info.Transfer In -> Transfer In)
        }
        const legends: Legend[] = [];
        const valueKey = `value_${operator}`;
        rawData.results?.forEach((d) => {
            if (d[valueKey]) {
                let _name = d[_groupBy];
                let _label = d[_groupBy];
                if (!_name) {
                    _name = `no_${_groupBy}`;
                    _label = 'Unknown';
                }
                legends.push({
                    name: _name,
                    label: _label,
                    disabled: false,
                });
            }
        });
        return legends;
    }
    if (rawData.results?.length) {
        return [{ name: 'total', label: 'Total Cost', disabled: false }];
    }
    return [];
};

export const getXYChartData = (rawData: AnalyzeResponse<MetricDataAnalyzeResult>, granularity: Granularity, period: Period, operator?: Operator, groupBy?: string): XYChartData[] => {
    if (!rawData.results?.length) return [];
    const chartData: XYChartData[] = [];
    const timeUnit = granularity === GRANULARITY.DAILY ? 'day' : 'month';
    const dateFormat = granularity === GRANULARITY.DAILY ? 'YYYY-MM-DD' : 'YYYY-MM';

    let _groupBy: string | undefined = groupBy;
    if (groupBy?.includes('.')) {
        _groupBy = groupBy.split('.')[1]; // (ex. additional_info.Transfer In -> Transfer In)
    }

    const valueKey = `value_${operator}`;
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
                chartDataByDate[groupByName] = d[valueKey]?.find((c) => c.date === _date)?.value || 0;
            } else {
                chartDataByDate.totalCost = d[valueKey]?.find((c) => c.date === _date)?.value || 0;
            }
        });
        chartData.push(chartDataByDate);
        now = now.add(1, timeUnit);
    }
    return chartData;
};
