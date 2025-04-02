// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import dayjs from 'dayjs';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';

import type { ReferenceMap } from '@/store/reference/type';

import {
    gray, indigo, transparent, white,
} from '@/styles/colors';

import { CHART_TYPE, GRANULARITY } from '@/services/asset-inventory/constants/asset-analysis-constant';
import type {
    Legend, MetricDataAnalyzeResult, Granularity, Period,
    XYChartData, RealtimeChartData, ChartType,
} from '@/services/asset-inventory/types/asset-analysis-type';


const getTreemapChartColor = (idx: number) => {
    let backgroundColor;
    let fontColor;

    switch (true) {
    case [0].includes(idx):
        backgroundColor = indigo[700];
        fontColor = white;
        break;
    case [1].includes(idx):
        backgroundColor = indigo[500];
        fontColor = white;
        break;
    case [2].includes(idx):
        backgroundColor = indigo[400];
        fontColor = white;
        break;
    case [3].includes(idx):
        backgroundColor = indigo[300];
        fontColor = gray[900];
        break;
    case [4, 5, 6, 7].includes(idx):
        backgroundColor = indigo[300];
        fontColor = gray[900];
        break;
    default:
        backgroundColor = indigo[200];
        fontColor = transparent;
        break;
    }
    return [backgroundColor, fontColor];
};

export const getMetricChartLegends = (referenceMap: Record<string, ReferenceMap>, chartType: ChartType|string, rawData: AnalyzeResponse<MetricDataAnalyzeResult>, groupBy?: string): Legend[] => {
    if (groupBy) {
        let _groupBy: string = groupBy;
        if (groupBy.includes('.')) {
            _groupBy = groupBy.split('.')[1]; // (ex. additional_info.Transfer In -> Transfer In)
        }
        const legends: Legend[] = [];
        rawData.results?.forEach((d, idx) => {
            if (d.count) {
                let _name = d[_groupBy];
                let _label = referenceMap[_groupBy]?.[_name]?.label || d[_groupBy];
                const _referenceColor = referenceMap[_groupBy]?.[_name]?.color;
                if (!_name) {
                    _name = `no_${_groupBy}`;
                    _label = 'Unknown';
                }
                let _color;
                if (chartType === CHART_TYPE.TREEMAP) _color = getTreemapChartColor(idx)[0];
                legends.push({
                    name: _name,
                    label: _label,
                    disabled: false,
                    color: _referenceColor || _color,
                });
            }
        });
        return legends;
    }
    if (rawData.results?.length) {
        const legend: Legend = { name: 'totalCount', label: 'Total Count', disabled: false };
        if (chartType === CHART_TYPE.TREEMAP) {
            legend.color = getTreemapChartColor(0)[0];
        }
        return [legend];
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

    const today = dayjs.utc();
    let now = dayjs.utc(period.start).clone();
    while (now.isSameOrBefore(dayjs.utc(period.end), timeUnit)) {
        const _date = now.format(dateFormat);
        const chartDataByDate: XYChartData = { date: _date };
        // eslint-disable-next-line no-loop-func
        rawData.results.forEach((d) => {
            let val = d.count?.find((c) => c.date === _date)?.value;
            if (today.isSame(now, timeUnit) && val === undefined) {
                val = undefined;
            } else {
                val = val || 0;
            }
            if (_groupBy) {
                let groupByName = d[_groupBy];
                if (!groupByName) {
                    groupByName = `no_${_groupBy}`;
                }
                chartDataByDate[groupByName] = val;
            } else {
                chartDataByDate.totalCount = val;
            }
        });
        chartData.push(chartDataByDate);
        now = now.add(1, timeUnit);
    }
    return chartData;
};

export const getFilteredRealtimeData = (rawData: AnalyzeResponse<MetricDataAnalyzeResult>): AnalyzeResponse<MetricDataAnalyzeResult> => {
    if (!rawData.results?.length) return rawData;

    const _latestData = rawData.results[0];
    return {
        more: rawData.more,
        results: rawData.results.filter((d) => d.date === _latestData.date),
    };
};
export const getRefinedMetricRealtimeChartData = (referenceMap: Record<string, ReferenceMap>, rawData: AnalyzeResponse<MetricDataAnalyzeResult>, groupBy?: string): RealtimeChartData[] => {
    if (!rawData.results?.length) return [];
    const chartData: RealtimeChartData[] = [];

    let _groupBy: string = groupBy || '';
    if (groupBy?.includes('.')) {
        _groupBy = groupBy.split('.')[1]; // (ex. additional_info.Transfer In -> Transfer In)
    }

    rawData.results.forEach((d, idx) => {
        const [backgroundColor, fontColor] = getTreemapChartColor(idx);
        if (_groupBy) {
            const _name = d[_groupBy];
            const _referenceColor = referenceMap[_groupBy]?.[_name]?.color;
            chartData.push({
                category: referenceMap[_groupBy]?.[_name]?.label || d[_groupBy] || 'Unknown',
                value: d.count || undefined,
                colorSettings: _referenceColor ? {
                    fill: _referenceColor,
                } : {},
                background_color: referenceMap[_groupBy]?.[_name]?.color || backgroundColor,
                font_color: fontColor,
            });
        } else {
            chartData.push({
                category: 'Total Count',
                value: d.count || undefined,
                background_color: backgroundColor,
                font_color: fontColor,
            });
        }
    });
    return chartData;
};
