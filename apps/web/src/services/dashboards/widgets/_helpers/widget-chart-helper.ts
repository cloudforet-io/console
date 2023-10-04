import type { IDateAxisSettings } from '@amcharts/amcharts5/xy';
import dayjs from 'dayjs';

import type { AllReferenceTypeInfo } from '@/store/reference/all-reference-store';

import type { DateRange } from '@/services/dashboards/config';
import type { CostGroupBy } from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import type {
    Legend,
} from '@/services/dashboards/widgets/type';


interface RawData {
    [key: string]: any;
}

/**
 * @name getXYChartLegends
 * @description Extract legends from raw data.
 */
export const getXYChartLegends = <T = Record<string, any>>(
    rawData?: T[],
    groupBy?: string,
    allReferenceTypeInfo?: AllReferenceTypeInfo,
    disableReferenceColor = false,
): Legend[] => {
    if (!rawData || !groupBy || !allReferenceTypeInfo) return [];
    const legends: Legend[] = [];
    rawData.forEach((d) => {
        let _name = d[groupBy];
        let _label = d[groupBy];
        let _color;
        const referenceTypeInfo = Object.values(allReferenceTypeInfo).find((info) => info.key === groupBy);
        if (_name && referenceTypeInfo) {
            const referenceMap = referenceTypeInfo.referenceMap;
            _label = referenceMap[_name]?.label ?? referenceMap[_name]?.name ?? _name;
            if (groupBy === COST_GROUP_BY.PROVIDER && !disableReferenceColor) {
                _color = referenceMap[_name]?.color;
            }
        } else if (!_name) {
            _name = `no_${groupBy}`;
            _label = 'Unknown';
        }
        legends.push({
            name: _name,
            label: _label,
            color: _color,
            disabled: false,
        });
    });
    return legends;
};

export const getPieChartLegends = (rawData: RawData[], groupBy?: string): Legend[] => {
    if (!rawData || !groupBy) return [];
    return rawData.map((d) => ({ name: d[groupBy], disabled: false }));
};

export const getDateAxisSettings = (dateRange: DateRange): Partial<IDateAxisSettings<any>> => {
    const start = dayjs.utc(dateRange.start);
    const end = dayjs.utc(dateRange.end).add(1, 'month'); // 1 month added because of `max` property bug
    return {
        min: start.valueOf(),
        max: end.valueOf(),
    };
};


type AppendedData<T> = T & {
    [groupBy: string]: string | any;
};
/**
 * @name getRefinedPieChartData
 * @description Convert raw data to XYDateChart data.
 * @example(before) [{ provider: 'aws', cost_sum: 100  }, { provider: 'google_cloud', cost_sum: 100  }]
 * @example(after) [{ provider: 'AWS', cost_sum: 100  }, { provider: 'Google Cloud', cost_sum: 100  }]
 */
export const getRefinedPieChartData = <T extends RawData = RawData>(
    rawData: T[],
    groupBy: CostGroupBy,
    allReferenceTypeInfo: AllReferenceTypeInfo,
): AppendedData<T>[] => {
    if (!rawData || !groupBy) return [];

    const chartData: AppendedData<T>[] = [];
    rawData.forEach((d) => {
        let _name = d[groupBy];
        const referenceTypeInfo = Object.values(allReferenceTypeInfo).find((info) => info.key === groupBy);
        if (_name && referenceTypeInfo) {
            const referenceMap = referenceTypeInfo.referenceMap;
            _name = referenceMap[_name]?.label ?? referenceMap[_name]?.name ?? _name;
        } else if (!_name) {
            _name = 'Unknown';
        }
        chartData.push({
            ...d,
            [groupBy]: _name,
        } as AppendedData<T>);
    });
    return chartData;
};

