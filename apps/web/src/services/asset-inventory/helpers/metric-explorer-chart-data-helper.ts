import dayjs from 'dayjs';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';

import {
    gray, transparent, violet, white,
} from '@/styles/colors';

import { CHART_TYPE, GRANULARITY, STATIC_GROUP_BY } from '@/services/asset-inventory/constants/metric-explorer-constant';
import type {
    Legend, MetricDataAnalyzeResult, Granularity, Period,
    XYChartData, RealtimeChartData, ChartType, StaticGroupBy,
} from '@/services/asset-inventory/types/metric-explorer-type';


const getTreemapChartColor = (idx: number) => {
    let backgroundColor;
    let fontColor;

    switch (true) {
    case [0].includes(idx):
        backgroundColor = violet[700];
        fontColor = white;
        break;
    case [1].includes(idx):
        backgroundColor = violet[500];
        fontColor = white;
        break;
    case [2].includes(idx):
        backgroundColor = violet[400];
        fontColor = white;
        break;
    case [3].includes(idx):
        backgroundColor = violet[300];
        fontColor = gray[900];
        break;
    case [4, 5, 6, 7].includes(idx):
        backgroundColor = violet[300];
        fontColor = transparent;
        break;
    default:
        backgroundColor = violet[200];
        fontColor = transparent;
        break;
    }
    return [backgroundColor, fontColor];
};

export const getMetricChartLegends = (chartType: ChartType, rawData: AnalyzeResponse<MetricDataAnalyzeResult>, groupBy?: string): Legend[] => {
    if (groupBy) {
        let _groupBy: string = groupBy;
        if (groupBy.includes('.')) {
            _groupBy = groupBy.split('.')[1]; // (ex. additional_info.Transfer In -> Transfer In)
        }
        const legends: Legend[] = [];
        rawData.results?.forEach((d, idx) => {
            if (d.count) {
                let _name = d[_groupBy];
                let _label = d[_groupBy];
                if (!_name) {
                    _name = `no_${_groupBy}`;
                    _label = 'Unknown';
                }
                let _color;
                if (chartType === CHART_TYPE.TREEMAP) _color = getTreemapChartColor(idx)[0];
                else if (chartType === CHART_TYPE.COLUMN) _color = violet[400];
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
    if (rawData.results?.length) {
        return [{ name: 'totalCount', label: 'Total Count', disabled: false }];
    }
    return [];
};

export const getRefinedMetricXYChartData = (rawData: AnalyzeResponse<MetricDataAnalyzeResult>, granularity: Granularity, period: Period, groupBy?: string): XYChartData[] => {
    if (!rawData.results?.length) return [];
    const chartData: XYChartData[] = [];
    const timeUnit = granularity === GRANULARITY.DAILY ? 'day' : 'month';
    const dateFormat = granularity === GRANULARITY.DAILY ? 'YYYY-MM-DD' : 'YYYY-MM';

    let _groupBy: string | undefined = groupBy;
    if (groupBy?.includes('.')) {
        _groupBy = groupBy.split('.')[1]; // (ex. additional_info.Transfer In -> Transfer In)
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
                chartDataByDate[groupByName] = d.count?.find((c) => c.date === _date)?.value || 0;
            } else {
                chartDataByDate.totalCount = d.count?.find((c) => c.date === _date)?.value || 0;
            }
        });
        chartData.push(chartDataByDate);
        now = now.add(1, timeUnit);
    }
    return chartData;
};

export const getRefinedMetricRealtimeChartData = (rawData: AnalyzeResponse<MetricDataAnalyzeResult>, groupBy?: string): RealtimeChartData[] => {
    if (!rawData.results?.length) return [];
    const chartData: RealtimeChartData[] = [];

    let _groupBy: string = groupBy || '';
    if (groupBy?.includes('.')) {
        _groupBy = groupBy.split('.')[1]; // (ex. additional_info.Transfer In -> Transfer In)
    }

    rawData.results.forEach((d, idx) => {
        const [backgroundColor, fontColor] = getTreemapChartColor(idx);
        if (_groupBy) {
            chartData.push({
                category: d[_groupBy] || 'Unknown',
                value: d._total_count || 0,
                background_color: backgroundColor,
                font_color: fontColor,
            });
        } else {
            chartData.push({
                category: 'Total Count',
                value: d._total_count || 0,
                background_color: backgroundColor,
                font_color: fontColor,
            });
        }
    });
    return chartData;
};

export const getRefinedMetricDataAnalyzeQueryGroupBy = (groupBy?: string | StaticGroupBy): string[] => {
    if (!groupBy) return [];
    if (Object.values(STATIC_GROUP_BY).includes(groupBy)) return [groupBy];
    return [`labels.${groupBy}`];
};
